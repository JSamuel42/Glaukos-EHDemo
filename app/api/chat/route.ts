import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { ANTHROPIC_API_KEY, assertChatEnv, assertServerEnv } from '@/lib/env';
import type { ChatRequestBody } from '@/lib/chat/types';
import { getChatConfig } from '@/lib/chat/module-registry';
import { getCorpusEntries, getModuleCorpus } from '@/lib/chat/corpus';
import type { ModuleKey } from '@/lib/modules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VALID_MODULE_KEYS: ModuleKey[] = [
  'library', 'projects', 'scientific-narrative', 'payer-value-story',
  'objection-handling', 'comparative-data', 'ask-gvd', 'document-hub',
  'epidemiology', 'literature-reviews', 'dossier-builder',
];

const GUARDRAILS = `

You are operating inside a demo of the Evidence Hub platform. Keep responses concise (typically 1–3 short paragraphs unless asked for more). Do not invent specific statistics, study results, or citations not present in the context provided. If you don't have information on something, say so plainly rather than speculating.`;

/**
 * Builds the system prompt for a chat turn.
 *
 * The system prompt is composed of:
 *   - The module's role/persona text (from MODULE_CHAT_CONFIG)
 *   - For whole-corpus modules (Ask GVD), the full corpus injected into the
 *     ${corpusMetadata} placeholder in the role text
 *   - For attachment-supporting modules (Library, Document Hub), the
 *     attached items' corpus entries appended as an <attached_items> block
 *   - Behavioural reminders driven by config flags:
 *       * citation format (article_id / section_page)
 *       * next-action suggestion
 *       * clarifying-question suppression for suggested-question entry points
 *       * cross-module context-shift acknowledgement
 *   - Generic guardrails
 *
 * Caching: the whole assembled text is cache-marked. For a given module +
 * attachment-set + previousModuleKey + isSuggestedQuestion combination,
 * follow-up turns read from cache (~10% of fresh token cost).
 */
function buildSystem(
  moduleKey: ModuleKey,
  attachedItemIds: string[],
  isSuggestedQuestion: boolean,
  previousModuleKey: ModuleKey | undefined,
): Anthropic.TextBlockParam[] {
  const config = getChatConfig(moduleKey);
  let prompt = config.systemPrompt;

  // Whole-corpus injection (Ask GVD): the role prompt contains
  // ${corpusMetadata} as a placeholder. Fill it with the module's full text.
  const moduleCorpus = getModuleCorpus(moduleKey);
  if (prompt.includes('${corpusMetadata}')) {
    prompt = prompt.replace('${corpusMetadata}', moduleCorpus ?? '(No module corpus loaded.)');
  }

  // Per-attachment grounding (Library, Document Hub)
  if (config.supportsAttachments && attachedItemIds.length > 0) {
    const entries = getCorpusEntries(attachedItemIds);
    if (entries.length > 0) {
      const attachedBlock = entries
        .map(
          (e, i) =>
            `<item index="${i + 1}" id="${e.id}" title="${e.title}">\n${e.text}\n</item>`,
        )
        .join('\n\n');
      prompt += `\n\nThe user has attached the following items. Ground your answer strictly in their content. If the question cannot be answered from these items, say so.\n\n<attached_items>\n${attachedBlock}\n</attached_items>`;
    }
  }

  // Module context shift — acknowledge that the user moved from another
  // module mid-conversation. Per spec, the acknowledgement is in prose, not
  // a system-prompt-visible separator.
  if (previousModuleKey && previousModuleKey !== moduleKey) {
    prompt += `\n\nCONTEXT SHIFT: The user has just navigated from the "${previousModuleKey}" module to "${moduleKey}". Briefly acknowledge this in your response if relevant to conversational continuity — e.g., "I see you've moved from the Library to Ask GVD. I can continue our earlier thread or focus on this GVD." Keep the acknowledgement short and natural; don't belabor it.`;
  }

  // Suggested-question entry point — suppress clarifying questions because
  // the user clicked a pre-formulated, well-scoped prompt.
  if (isSuggestedQuestion) {
    prompt += `\n\nNOTE: This user message originated from a clickable suggested-question card. Answer it directly without asking clarifying questions — the user has chosen a well-scoped question intentionally.`;
  } else if (config.clarifyBeforeAnswering === 'when_ambiguous') {
    prompt += `\n\nCLARIFY MODE: If the user's question is broad or ambiguous, ask a single concise clarifying question before answering. If the question is specific and well-scoped, answer it directly. Clarifying questions don't need citations.`;
  } else if (config.clarifyBeforeAnswering === 'always') {
    prompt += `\n\nCLARIFY MODE: Always ask a clarifying question before answering, unless the user explicitly says "answer directly" or similar.`;
  }

  // Citation reminder
  if (config.enableCitations) {
    if (config.citationFormat === 'section_page') {
      prompt += `\n\nCITATIONS: Inline-cite substantive claims drawn from the document in the format (Section X.Y.Z, p. N). Place citations at the end of the relevant sentence or clause; don't bunch them at the end of the response. Clarifying questions don't need citations.`;
    } else if (config.citationFormat === 'article_id') {
      prompt += `\n\nCITATIONS: When drawing on a specific publication, cite it inline by its Article ID (e.g., "Mateos, 2025a"). Place citations next to the claim they support, not bunched at the end.`;
    } else if (config.citationFormat === 'document_title') {
      prompt += `\n\nCITATIONS: When referencing a document, include its title in bold and its document ID in square brackets, e.g. **Alnyx — CDA-AMC Initial assessment** [doc-009]. The user sees document IDs in the table, so this format lets them scan back to the matching row. Place citations next to the claim they support — don't bunch them at the end.`;
    } else if (config.citationFormat === 'value_message_id') {
      prompt += `\n\nCITATIONS: Cite value messages by their ID in bold (e.g. **C2**, **D4**, **E1**). When mentioning a message, include a brief snippet of its text so the user knows what it covers without leaving the chat.`;
    } else if (config.citationFormat === 'objection_id') {
      prompt += `\n\nCITATIONS: Cite objections by their ID in bold (e.g. **OH7**). When highlighting a specific handler, cite as **7.4** (handler 4 under OH7). Include the strength rating naturally where relevant, e.g. "**OH7** (Robust) addresses this directly."`;
    } else if (config.citationFormat === 'statement_id') {
      prompt += `\n\nCITATIONS: Cite scientific statements by their ID in bold (e.g. **S7**). Include a brief snippet of the statement text so the user knows what it covers without leaving the chat.`;
    }
  }

  // Next-step buttons — structured-block convention. The UI parses a
  // trailing `**Choose next step:**` block at end-of-message and renders the
  // bullet options as clickable pills below the prose. Same marker handles
  // both substantive-answer next steps and clarifying-question intents.
  if (config.suggestNextActions) {
    prompt += `

NEXT-STEP BUTTONS

After every substantive response, ALWAYS end your message with a next-step block in this exact format:

**Choose next step:**
- [Short action-oriented option, 4–8 words]
- [Short action-oriented option, 4–8 words]
- [Short action-oriented option, 4–8 words]

Rules for the block:
- Offer 2–4 options. Each should be a meaningful in-module next action the user is likely to want.
- Phrase options as user actions ("Show me X", "Drill into Y", "Compare A and B"). Not as questions.
- Keep each option short — roughly 4–8 words. Concise is better than complete.
- Do NOT include cross-module navigation in options. If a different module is genuinely the better answer, mention it in the prose above; don't make it a button.
- Do NOT write any text after the block. The block is the end of your message.

If your module is configured to clarify and the user's question is genuinely ambiguous, use the SAME block format — put the clarifying question in the prose above, and use the options to represent the user's possible intents:

**Choose next step:**
- [Possible intent 1, 4–8 words]
- [Possible intent 2, 4–8 words]
- [Possible intent 3, 4–8 words]

In that case, the prose is the question; the options are the user's possible clarifications.`;
  }

  prompt += GUARDRAILS;

  return [
    {
      type: 'text',
      text: prompt,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function demoUnavailableStream(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: message })}\n\n`));
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    assertServerEnv();
  } catch {
    // assertServerEnv only warns, never throws — so this is a safety net only
  }
  try {
    assertChatEnv();
  } catch {
    return demoUnavailableStream(
      'AI chat is not available in this environment — the API key is not configured. ' +
      'All other features of the Evidence Hub demo work without it.',
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!VALID_MODULE_KEYS.includes(body.moduleKey)) {
    return new Response(JSON.stringify({ error: 'Invalid moduleKey' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const system = buildSystem(
    body.moduleKey,
    body.attachedItemIds ?? [],
    body.isSuggestedQuestion ?? false,
    body.previousModuleKey,
  );

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const sdkStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1536,
          system,
          messages: body.messages.map(m => ({ role: m.role, content: m.content })),
        });

        // Track cache-related usage from the message_start event so we can
        // log it after the stream completes. Useful in dev to verify the
        // ephemeral cache is engaging on follow-up turns in a module; gated
        // off in production so server logs stay quiet.
        let cacheUsage: {
          input_tokens?: number;
          cache_creation_input_tokens?: number | null;
          cache_read_input_tokens?: number | null;
        } | null = null;

        for await (const event of sdkStream) {
          if (event.type === 'message_start') {
            cacheUsage = event.message.usage;
          } else if (
            event.type === 'content_block_delta'
            && event.delta.type === 'text_delta'
          ) {
            const payload = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();

        if (process.env.NODE_ENV !== 'production' && cacheUsage) {
          console.log('[chat] cache:', {
            module: body.moduleKey,
            write: cacheUsage.cache_creation_input_tokens ?? 0,
            read: cacheUsage.cache_read_input_tokens ?? 0,
            uncached: cacheUsage.input_tokens ?? 0,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
