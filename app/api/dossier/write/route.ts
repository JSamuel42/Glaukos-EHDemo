import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { ANTHROPIC_API_KEY } from '@/lib/env';
import { sanitizeSvg } from '@/lib/dossier/sanitizeSvg';
import type { VisualSpec } from '@/lib/dossier/types';

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

/** A turn in the Table/Visual clarification exchange (Audit+Fix 2). */
interface ClarifyTurn { role: 'assistant' | 'user'; text: string }

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
  /**
   * Audit+Fix 2 — request mode:
   *  - 'draft'   (default): stream text/table HTML (existing behaviour)
   *  - 'clarify': one conversational clarification turn for Table/Visual
   *  - 'visual':  produce a visual JSON spec (funnel) or sanitised raw SVG
   */
  mode?: 'draft' | 'clarify' | 'visual';
  /** Existing draft HTML, fed back in for a Revise (refine) pass. */
  reviseFrom?: string;
  /** Plain-text current draft — grounds Table/Visual clarification + generation. */
  textDraft?: string;
  /** Clarification transcript so far (mode 'clarify' / 'visual'). */
  messages?: ClarifyTurn[];
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

// ── Clarification + visual prompts (Audit+Fix 2) ─────────────────────────────

const SUPPORTED_VISUALS =
  'Supported visual types in this build: (1) a disease/patient funnel, and (2) simple SVG charts or diagrams (e.g. a basic bar chart or a labelled schematic). Forest plots, Kaplan–Meier curves, interactive charts, and image-based figures are NOT supported.';

const CLARIFY_TABLE_SYSTEM = `You are a scientific writing assistant helping a medical writer specify an evidence TABLE for a Global Value Dossier section, grounded ONLY on the section's existing text draft and its linked abstract-only references.

Your job in this turn is to ask ONE concise, focused clarifying question (not a list) to pin down the table: its columns, the rows/grouping, whether it needs a header, and the depth of content. If the writer has already given enough detail across the conversation, reply with a single short confirmation line beginning "READY:" that restates the agreed table shape in one sentence. Keep every reply under 50 words. Never write the table itself here. Do not invent evidence beyond the references.`;

const CLARIFY_VISUAL_SYSTEM = `You are a scientific writing assistant helping a medical writer specify a VISUAL for a Global Value Dossier section, grounded ONLY on the section's existing text draft and its linked abstract-only references.

${SUPPORTED_VISUALS}

Your job in this turn is to ask ONE concise clarifying question (not a list) to pin down the visual type and its scope/levels/labels. If the writer requests an UNSUPPORTED type, say plainly that it is not available in the current build and offer the supported alternatives — do not pretend to produce it. If enough detail has been gathered, reply with a single short line beginning "READY:" restating the agreed visual in one sentence. Keep every reply under 50 words. Never output JSON or SVG here. Do not invent evidence beyond the references.`;

const VISUAL_SYSTEM = `You are a scientific visualisation agent for a Global Value Dossier. Using ONLY the section's text draft and linked abstract-only references, produce ONE visual as a single JSON object and nothing else (no prose, no code fences).

${SUPPORTED_VISUALS}

Output exactly one JSON object in one of these two shapes:
- Funnel: {"introHtml":"<p>…short caption…</p>","visual":{"kind":"funnel","title":"…","levels":[{"label":"…","value":<number>,"note":"…optional…"}, …]}}
- Raw SVG: {"introHtml":"<p>…short caption…</p>","visual":{"kind":"svg","title":"…","svg":"<svg viewBox=…>…</svg>"}}

Rules:
- Prefer a funnel when the data describes a narrowing population/cascade; otherwise use a compact, self-contained SVG (no <script>, no external refs, no <foreignObject>).
- Values must be traceable to the references; if a tier is an inference, reflect that in its note. Do NOT fabricate precise numbers that aren't supported — round or qualify.
- introHtml is a 1–2 sentence caption only. The reader sees the rendered visual, never the JSON.
- If the requested visual is unsupported, return {"error":"unsupported","message":"<short explanation + supported alternatives>"} instead.`;

/** Compact grounding block shared by clarify + visual modes. */
function groundingBlock(body: WriteRequest): string {
  const refs = body.articles
    .map((a) => `[#${a.articleNumber}] ${a.title} — ${a.studyType || 'study'}; pop: ${a.patientPopulation || 'n/a'}; outcomes: ${a.primaryOutcomes || 'n/a'}`)
    .join('\n') || '(no articles linked)';
  return [
    `SECTION: ${body.sectionNumber} ${body.sectionTitle}`,
    '',
    'CURRENT TEXT DRAFT (ground truth for this visual/table):',
    (body.textDraft?.trim() || '(no text draft)').slice(0, 4000),
    '',
    `REFERENCES (${body.articles.length}, abstract-only):`,
    refs,
    body.additionalDirection?.trim() ? `\nINITIAL DIRECTION: ${body.additionalDirection.trim()}` : '',
  ].join('\n');
}

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
    body.reviseFrom?.trim()
      ? `EXISTING DRAFT TO REVISE (improve this in place per the direction above; preserve correct [#N] citations, do not introduce new claims):\n${body.reviseFrom.trim()}\n`
      : '',
    body.reviseFrom?.trim()
      ? 'TASK: Revise the existing draft above following the STRICT RULES, ADDITIONAL DIRECTION, and OUTPUT FORMAT.'
      : 'TASK: Draft the section content following the STRICT RULES and OUTPUT FORMAT above.',
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

/** Extract a JSON object from model output that may be fenced or padded. */
function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let text = (fenced ? fenced[1] : raw).trim();
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) text = text.slice(start, end + 1);
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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

  // ── Mode: clarify — one conversational clarification turn (Audit+Fix 2) ──────
  if (body.mode === 'clarify') {
    const kind = body.contentType === 'visual' ? 'visual' : 'table';
    if (!ANTHROPIC_API_KEY) {
      const stream = new ReadableStream({
        start(controller) {
          sse(controller, enc, {
            type: 'content',
            text: 'Live clarification needs the AI API key, which is not configured here. Type any direction below and press Generate to proceed with a best-effort draft.',
          });
          sse(controller, enc, { type: 'done' });
          controller.close();
        },
      });
      return new Response(stream, { headers: sseHeaders });
    }
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const system = kind === 'visual' ? CLARIFY_VISUAL_SYSTEM : CLARIFY_TABLE_SYSTEM;
    const convo: Anthropic.MessageParam[] = [
      { role: 'user', content: `${groundingBlock(body)}\n\nAsk your single clarifying question now (or reply "READY: …" if you already have enough).` },
      ...(body.messages ?? []).map((m) => ({ role: m.role, content: m.text })),
    ];
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sdkStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 300,
            system,
            messages: convo,
          });
          for await (const event of sdkStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              sse(controller, enc, { type: 'content', text: event.delta.text });
            }
          }
          sse(controller, enc, { type: 'done' });
          controller.close();
        } catch (err) {
          sse(controller, enc, { type: 'error', message: err instanceof Error ? err.message : 'Clarification failed' });
          controller.close();
        }
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  // ── Mode: visual — produce a visual JSON spec / sanitised SVG (Audit+Fix 2) ──
  if (body.mode === 'visual') {
    const jsonHeaders = { 'Content-Type': 'application/json' };
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'no_key',
          message: 'Live visual generation is unavailable because the AI API key is not configured. Pre-baked showcase visuals remain viewable.',
        }),
        { status: 200, headers: jsonHeaders },
      );
    }
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const convo: Anthropic.MessageParam[] = [
      { role: 'user', content: `${groundingBlock(body)}` },
      ...(body.messages ?? []).map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: 'Now produce the agreed visual as a single JSON object per the output format.' },
    ];
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: VISUAL_SYSTEM,
        messages: convo,
      });
      const raw = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
      const parsed = extractJson(raw);
      if (!parsed || typeof parsed !== 'object') {
        return new Response(JSON.stringify({ error: 'parse', message: 'The visual could not be generated. Try a different type or scope.' }), { status: 200, headers: jsonHeaders });
      }
      const obj = parsed as Record<string, unknown>;
      if (obj.error === 'unsupported') {
        return new Response(JSON.stringify({ error: 'unsupported', message: String(obj.message ?? 'That visual type is not supported in the current build.') }), { status: 200, headers: jsonHeaders });
      }
      const visual = obj.visual as VisualSpec | undefined;
      if (!visual || (visual.kind !== 'funnel' && visual.kind !== 'svg')) {
        return new Response(JSON.stringify({ error: 'parse', message: 'The visual could not be generated. Try a different type or scope.' }), { status: 200, headers: jsonHeaders });
      }
      const cleanVisual: VisualSpec =
        visual.kind === 'svg' ? { ...visual, svg: sanitizeSvg(visual.svg) } : visual;
      return new Response(JSON.stringify({ introHtml: String(obj.introHtml ?? ''), visual: cleanVisual }), { status: 200, headers: jsonHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'failed', message: err instanceof Error ? err.message : 'Visual generation failed' }), { status: 200, headers: jsonHeaders });
    }
  }

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
