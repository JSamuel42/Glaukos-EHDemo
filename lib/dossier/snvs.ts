/**
 * SN/VS → dossier integration helpers (Phase 5.6).
 *
 * Pure helpers shared by the SectionEditor: a suggested section↔SN-pillar /
 * section↔VS-domain mapping, and HTML builders for inserting an SN statement
 * or VS message into the Tiptap editor as editable text carrying provenance.
 *
 * SN and VS are READ-ONLY here — this module never mutates their content.
 */

import {
  PILLAR_BY_KEY,
  type PillarKey,
  type ScientificStatement,
} from '@/lib/scientific-narrative/data';
import {
  STRENGTH_LABEL,
  type DomainKey,
  type ValueMessage,
} from '@/lib/value-story/data';

/**
 * Suggested SN pillar(s) for a dossier section, by number/title keyword.
 * Clinical/scientific sections map to SN pillars. Author can override.
 */
export function suggestedPillarKeys(section: { number: string; title: string }): PillarKey[] {
  const t = section.title.toLowerCase();
  const n = section.number;
  const out = new Set<PillarKey>();
  if (/burden|unmet|disease|epidemiolog|prevalence|surgical-eligible/.test(t) || n.startsWith('1')) {
    out.add('burden');
  }
  if (/mechanism|device|istent|overview|innovation/.test(t)) out.add('clinical-development');
  if (/efficac|clinical value|outcome|treatment|iop|pressure/.test(t)) out.add('efficacy');
  if (/safety|adverse|tolerab|procedur/.test(t)) out.add('patient-impact');
  return [...out];
}

/**
 * Suggested VS domain(s) for a dossier section. Value/payer sections map to
 * VS domains. Author can override.
 */
export function suggestedDomainKeys(section: { number: string; title: string }): DomainKey[] {
  const t = section.title.toLowerCase();
  const out = new Set<DomainKey>();
  if (/unmet|burden|disease|need/.test(t)) out.add('unmet-need');
  if (/device|istent|overview|platform|landscape/.test(t)) out.add('platform-credibility');
  if (/value|efficac|clinical|patient|outcome|treatment/.test(t)) out.add('patient-value');
  if (/econom|cost|budget|resource/.test(t)) out.add('economic');
  return [...out];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Insert HTML for an SN statement: text + a muted pillar provenance suffix. */
export function snInsertHtml(statement: ScientificStatement): string {
  const pillar = PILLAR_BY_KEY[statement.pillar];
  const prov = `${statement.id} · ${pillar?.name ?? 'Scientific Narrative'}`;
  return `<p>${escapeHtml(statement.text)} <em style="color:var(--serif-muted-foreground)">(${escapeHtml(prov)})</em></p>`;
}

/**
 * A resolved provenance piece for a VS message source reference: either an
 * inline [#N] (the ref resolves to a linked Library article) or textual.
 */
export interface ResolvedRef {
  articleNumber?: number;
  label: string;
}

/**
 * Insert HTML for a VS message: headline-led substantiation + resolved
 * citations. Library-backed refs render as inline [#N]; non-Library refs
 * (Glaukos / inferential / push-only) render as a textual provenance note.
 * Strength is NOT included in the prose.
 */
export function vsInsertHtml(message: ValueMessage, refs: ResolvedRef[]): string {
  const inlineNums = refs.filter((r) => typeof r.articleNumber === 'number').map((r) => `[#${r.articleNumber}]`);
  const textual = refs.filter((r) => typeof r.articleNumber !== 'number').map((r) => r.label);
  const citationStr = inlineNums.join(' ');
  const textualStr = textual.length > 0
    ? ` <em style="color:var(--serif-muted-foreground)">(${escapeHtml(textual.join('; '))})</em>`
    : '';
  return `<p><strong>${escapeHtml(message.headline)}.</strong> ${escapeHtml(message.text)}${citationStr ? ' ' + citationStr : ''}${textualStr}</p>`;
}

/** Human-readable strength label (drafting aid only). */
export function strengthLabel(message: ValueMessage): string {
  return STRENGTH_LABEL[message.strength];
}
