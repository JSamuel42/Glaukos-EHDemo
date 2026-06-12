import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { ANTHROPIC_API_KEY } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ── Request shape ───────────────────────────────────────────────────────────

interface ArticleRef {
  articleNumber: number;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  studyType?: string;
  patientPopulation?: string;
  interventions?: string;
  primaryOutcomes?: string;
  category?: string[];
  abstract?: string;
}

interface SiblingContext { number: string; title: string; status: string }

/** Scientific Narrative statement supplied as an internal synthesis input. */
interface SnInput { id: string; pillar: string; text: string }
/** Payer Value Story message supplied as an internal synthesis input. */
interface VsInput { id: string; domain: string; headline: string; text: string; strength: string }

interface WriteRequest {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  guidanceNotes: string;
  contentType: 'text' | 'table' | 'visual';
  additionalDirection?: string;
  articles: ArticleRef[];
  dossierTitle: string;
  siblingContexts?: SiblingContext[];
  /** Optional writing context from the Context Manager. */
  writingContext?: { gvdDescription?: string; writingStyle?: string; valueStory?: string };
  /** Phase 5.6: internal synthesis inputs (read-only drafting aids). */
  snStatements?: SnInput[];
  vsMessages?: VsInput[];
}

// ── System prompt — verbatim STRICT RULES / STYLE; output format adapted for
//    streaming (prose first, then a JSON reasoning block after a delimiter). ──

const REASONING_DELIMITER = '===REASONING===';

const SYSTEM_PROMPT = `You are a scientific writing agent specialized in developing Global Value Dossiers (GVD) and Core Value Dossiers (CVD) for healthcare products.

Your role is to generate structured, evidence-based draft content for specific sections of a dossier using ONLY the provided references and guidance notes.

STRICT RULES:
- Do NOT introduce external knowledge or assumptions not present in the provided references.
- Do NOT infer beyond what is explicitly supported in the references.
- Every claim must be traceable to at least one provided reference.
- Use formal, objective, non-promotional scientific language.
- Attribute evidence using inline citations in the format [#N] where N is the article number.
- If evidence is limited for any guidance point, state this explicitly: "Limited evidence is available regarding [topic]."
- Do NOT speculate or generalize to fill evidence gaps.
- Maintain alignment with the section objective and guidance notes.
- Avoid redundancy with other sections listed under "Sibling sections context".
- Do NOT anticipate or reference content belonging to other sections.
- The references provided are ABSTRACT-ONLY extractions; do not assume access to full-text figures or tables.

WRITING STYLE:
- Concise, structured, and synthesis-focused — not copy-paste summaries.
- Use paraphrasing, not verbatim extraction from references.
- Maintain logical flow: context → evidence → interpretation.
- Avoid superlatives: no "breakthrough", "game-changing", "unprecedented", "best-in-class".
- Avoid unsupported comparative language.
- Tone: scientific, balanced, evidence-led, suitable for payer and HTA audiences.

OUTPUT PRINCIPLES:
- Accuracy over completeness.
- Transparency over persuasion.
- Clarity over verbosity.

REQUIRED OUTPUT FORMAT — output in exactly two parts:
1. First, the section content as an HTML string with inline [#N] citations. Output ONLY the HTML (e.g. <p>…</p>), with no preamble, no code fences, and no commentary.
2. Then, on a new line, output the exact delimiter ${REASONING_DELIMITER} followed by a single JSON object:
{
  "word_count": <integer>,
  "agent_reasoning": {
    "reference_extractions": [ { "article_number": N, "key_findings": "<1-2 sentence summary>" } ],
    "guidance_coverage": [ { "guidance_point": "<bullet text>", "coverage": "full|partial|none", "supporting_refs": [N] } ],
    "evidence_gaps": ["<description>"],
    "consistency_notes": "<notes>",
    "synthesis_approach": "<brief description>"
  }
}`;

function buildUserPrompt(body: WriteRequest): string {
  const siblings = (body.siblingContexts ?? [])
    .map((s) => `${s.number} ${s.title} [${s.status}]`)
    .join('\n') || '(none)';

  const refs = body.articles.map((a) => [
    `[#${a.articleNumber}] ${a.title}`,
    `Authors: ${a.authors.join(', ') || 'not specified'}`,
    `Journal: ${a.journal || 'not specified'} (${a.pubDate || 'not specified'})`,
    `Study type: ${a.studyType || 'not specified'}`,
    `Patient population: ${a.patientPopulation || 'not specified'}`,
    `Interventions: ${a.interventions || 'not specified'}`,
    `Primary outcomes: ${a.primaryOutcomes || 'not specified'}`,
    `Category: ${a.category?.join(', ') || 'not specified'}`,
    `Abstract: ${a.abstract || 'not specified'}`,
  ].join('\n')).join('\n---\n');

  const ctx = body.writingContext;
  const ctxBlock = ctx && (ctx.gvdDescription || ctx.writingStyle || ctx.valueStory)
    ? [
        '',
        'DOSSIER WRITING CONTEXT:',
        ctx.gvdDescription ? `Description: ${ctx.gvdDescription}` : '',
        ctx.writingStyle ? `Writing style: ${ctx.writingStyle}` : '',
        ctx.valueStory ? `Value story: ${ctx.valueStory}` : '',
      ].filter(Boolean).join('\n')
    : '';

  // Internal synthesis inputs (Scientific Narrative + Payer Value Story).
  const sn = body.snStatements ?? [];
  const vs = body.vsMessages ?? [];
  const snVsBlock = (sn.length > 0 || vs.length > 0)
    ? [
        '',
        'INTERNAL SYNTHESIS INPUTS — Scientific Narrative & Payer Value Story:',
        'These are the team\'s own approved narrative artifacts, provided as drafting aids to shape framing and emphasis. They are NOT external evidence: do not cite them with [#N], and do not state strength ratings in the prose. Substantive clinical/economic claims must still trace to the numbered REFERENCES above (abstract-only).',
        ...(sn.length > 0 ? ['Scientific Narrative statements:', ...sn.map((s) => `- ${s.id} (${s.pillar}): ${s.text}`)] : []),
        ...(vs.length > 0 ? ['Payer Value Story messages:', ...vs.map((m) => `- ${m.id} (${m.domain}, strength: ${m.strength}) — ${m.headline}: ${m.text}`)] : []),
      ].join('\n')
    : '';

  let prompt = [
    `DOSSIER: ${body.dossierTitle}`,
    ctxBlock,
    '',
    `SECTION: ${body.sectionNumber} ${body.sectionTitle}`,
    '',
    'GUIDANCE NOTES:',
    body.guidanceNotes || '(none provided)',
    '',
    'SIBLING SECTIONS CONTEXT (do not duplicate this content):',
    siblings,
    '',
    `REFERENCES (${body.articles.length} articles):`,
    refs || '(no articles linked)',
    snVsBlock,
    '',
    'ADDITIONAL DIRECTION FROM USER:',
    body.additionalDirection?.trim() || 'None provided.',
    '',
    'TASK: Draft the section content following the STRICT RULES and OUTPUT FORMAT above.',
  ].filter((l) => l !== '').join('\n');

  if (body.contentType === 'table') {
    prompt += '\n\nOUTPUT FORMAT: Generate the content (part 1) as an HTML table, not prose paragraphs. The table must have a clear header row and use [#N] citations in the relevant cells.';
  } else if (body.contentType === 'visual') {
    prompt += '\n\nOUTPUT FORMAT: Generate the content (part 1) as a structured data summary suitable for visualisation — a brief prose introduction followed by a JSON array (inside the HTML) that could be rendered as a bar chart or forest plot.';
  }
  return prompt;
}

function sse(controller: ReadableStreamDefaultController, enc: TextEncoder, obj: unknown) {
  controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
}

function parseReasoning(raw: string): { wordCount?: number; agentReasoning?: unknown } {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const text = (fenced ? fenced[1] : raw).trim();
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return { wordCount: parsed.word_count as number | undefined, agentReasoning: parsed.agent_reasoning };
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  let body: WriteRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const enc = new TextEncoder();
  const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  // Graceful fallback — no key configured. Stream a clear, non-fabricated note.
  if (!ANTHROPIC_API_KEY) {
    const stream = new ReadableStream({
      start(controller) {
        const msg = '<p><em>Live generation is unavailable in this environment because the AI API key is not configured. Linked references and guidance notes are shown below; pre-baked sections of this dossier remain fully viewable.</em></p>';
        sse(controller, enc, { type: 'content', text: msg });
        sse(controller, enc, {
          type: 'reasoning',
          wordCount: 0,
          agentReasoning: {
            reference_extractions: [],
            guidance_coverage: [],
            evidence_gaps: ['AI generation unavailable — API key not configured.'],
            consistency_notes: '',
            synthesis_approach: 'No synthesis performed (offline demo fallback).',
          },
        });
        sse(controller, enc, { type: 'done' });
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const userMessage = buildUserPrompt(body);

  const stream = new ReadableStream({
    async start(controller) {
      let full = '';
      let emitted = 0;          // length of content already streamed to client
      let delimiterHit = false;
      const HOLDBACK = REASONING_DELIMITER.length;

      try {
        const sdkStream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        });

        for await (const event of sdkStream) {
          if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue;
          full += event.delta.text;

          if (!delimiterHit) {
            const idx = full.indexOf(REASONING_DELIMITER);
            if (idx !== -1) {
              // Flush content up to the delimiter, then stop streaming content.
              const remaining = full.slice(emitted, idx);
              if (remaining) sse(controller, enc, { type: 'content', text: remaining });
              emitted = idx;
              delimiterHit = true;
            } else {
              // Stream all but the last HOLDBACK chars (avoid splitting the delimiter).
              const safeEnd = Math.max(emitted, full.length - HOLDBACK);
              if (safeEnd > emitted) {
                sse(controller, enc, { type: 'content', text: full.slice(emitted, safeEnd) });
                emitted = safeEnd;
              }
            }
          }
        }

        const delimIdx = full.indexOf(REASONING_DELIMITER);
        if (delimIdx === -1) {
          // Model never emitted the delimiter — treat the whole output as content.
          if (full.length > emitted) sse(controller, enc, { type: 'content', text: full.slice(emitted) });
          const wc = full.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
          sse(controller, enc, { type: 'reasoning', wordCount: wc, agentReasoning: null });
        } else {
          const contentPart = full.slice(0, delimIdx);
          if (contentPart.length > emitted) sse(controller, enc, { type: 'content', text: contentPart.slice(emitted) });
          const reasoningRaw = full.slice(delimIdx + REASONING_DELIMITER.length);
          const { wordCount, agentReasoning } = parseReasoning(reasoningRaw);
          const wc = wordCount ?? contentPart.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
          sse(controller, enc, { type: 'reasoning', wordCount: wc, agentReasoning: agentReasoning ?? null });
        }

        sse(controller, enc, { type: 'done' });
        controller.close();
      } catch (err) {
        sse(controller, enc, { type: 'error', message: err instanceof Error ? err.message : 'Generation failed' });
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders });
}
