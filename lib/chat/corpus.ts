import libraryCorpus from '@/data/library/corpus.json';
import { GVD_CORPUS } from '@/lib/askgvd/data';
import dochubCorpus from '@/data/dochub/corpus.json';
import {
  VALUE_MESSAGES,
  DOMAINS,
  OVERARCHING_MESSAGE,
} from '@/lib/value-story/data';
import {
  OBJECTIONS,
  OBJECTION_DOMAINS,
} from '@/lib/objection-handling/data';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import {
  ALNYX_STRENGTH_RATINGS,
  BEST_IN_CLASS,
  DIMENSIONS,
  DIMENSION_LABEL,
} from '@/lib/comparative-data/ratings';
import { SPIDER_SCORES } from '@/lib/comparative-data/spider-scores';
import {
  PILLARS,
  SCIENTIFIC_STATEMENTS,
} from '@/lib/scientific-narrative/data';
import type { ModuleKey } from '@/lib/modules';

export interface CorpusEntry {
  id: string;
  moduleKey: ModuleKey;
  title: string;
  text: string;
  subtitle?: string;
}

interface RawLibraryEntry {
  id: string;
  title: string;
  subtitle: string;
  text: string;
}

// Library corpus: 119 publications, full abstracts. Keyed by Article ID
// (e.g. "Mateos, 2025a"). Loaded into the system prompt via attachedItemIds
// when the user has selected rows in the Library table.
const LIBRARY_ENTRIES: CorpusEntry[] = Object.values(
  libraryCorpus as Record<string, RawLibraryEntry>,
).map(e => ({
  id: e.id,
  moduleKey: 'library' as ModuleKey,
  title: e.title,
  subtitle: e.subtitle,
  text: e.text,
}));

const ALL_ENTRIES: CorpusEntry[] = [...LIBRARY_ENTRIES];

const ENTRIES_BY_ID: Record<string, CorpusEntry> = Object.fromEntries(
  ALL_ENTRIES.map(e => [e.id, e]),
);

export const CORPUS: CorpusEntry[] = ALL_ENTRIES;

export function getCorpusEntries(ids: string[]): CorpusEntry[] {
  return ids.map(id => ENTRIES_BY_ID[id]).filter(Boolean);
}

/**
 * Returns the entire module's content packed for the system prompt. Used by
 * modules where the chat grounds against everything (e.g. Ask GVD's whole
 * document) rather than a per-row selection. Returns null when the module
 * has no whole-corpus mode.
 */
export function getModuleCorpus(moduleKey: ModuleKey): string | null {
  if (moduleKey === 'ask-gvd') {
    return buildGvdCorpusText();
  }
  if (moduleKey === 'document-hub') {
    return buildDocHubCorpusText();
  }
  if (moduleKey === 'payer-value-story') {
    return buildValueStoryCorpusText();
  }
  if (moduleKey === 'objection-handling') {
    return buildObjectionHandlingCorpusText();
  }
  if (moduleKey === 'comparative-data') {
    return buildComparativeDataCorpusText();
  }
  if (moduleKey === 'scientific-narrative') {
    return buildScientificNarrativeCorpusText();
  }
  return null;
}

/**
 * Packs the 4 pillars + 14 scientific statements into a markdown corpus
 * for the triage chat. Tiny — ~4-6k tokens — so the whole thing rides in
 * the system prompt every turn. Each statement is bolded by its ID so
 * the model can mirror the **S7** citation format easily.
 */
function buildScientificNarrativeCorpusText(): string {
  const parts: string[] = ['# Alnyx Scientific Narrative Corpus — R/R MM', ''];

  for (const pillar of PILLARS) {
    parts.push(`## Pillar ${pillar.number}: ${pillar.fullName}`);
    parts.push(`Strategic Imperative & Objective: ${pillar.strategicImperative}`);
    parts.push(`Scientific Position: ${pillar.scientificPosition}`);
    parts.push('Statements:');
    const statements = SCIENTIFIC_STATEMENTS.filter(s => s.pillar === pillar.key);
    for (const s of statements) {
      parts.push(`  - **${s.id}**: ${s.text}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Packs the comparative-data product cohort + ratings into a markdown
 * corpus for the analytical chat. Ported from EvHub-D's corpus loader
 * unchanged in structure — only the import paths and the `getModuleCorpus`
 * branch wiring differ. For each product: regulatory + HTA outcomes,
 * pivotal trial, spider scores; then Alnyx strength ratings + best-in-class.
 */
function buildComparativeDataCorpusText(): string {
  const parts: string[] = [];

  parts.push('# Comparative Data Corpus — R/R MM 4L+ TCE\n');
  parts.push('## Product cohort\n');

  for (const product of ALL_PRODUCTS) {
    parts.push(
      `### ${product.brandName}${product.isFictional ? ' [FICTIONAL — pre-launch]' : ''}`,
    );
    parts.push(`- Modality: ${product.modalityCategory}`);

    if (product.isFictional && product.alnyxData) {
      const a = product.alnyxData;
      parts.push(`- INN: ${a.inn}`);
      parts.push(`- Mechanism: ${a.modality}`);
      parts.push(`- Manufacturer: ${a.manufacturer}`);
      parts.push(
        `- Development stage: ${a.developmentStage} (NO regulatory approvals, NO HTA assessments)`,
      );
      parts.push(`- Indication label (proposed): ${a.indicationLabel}`);
      parts.push(
        `- Dosing: ${a.dosingAndAdministration.route} ${a.dosingAndAdministration.dose} ${a.dosingAndAdministration.schedule}`,
      );
      parts.push(`- Dosing notes: ${a.dosingAndAdministration.notes}`);
      const study = a.pivotalStudies[0];
      if (study) {
        parts.push(`- Pivotal trial: ${study.trialName} — ${study.phase}, ${study.trialType}`);
        parts.push(`  - Population: ${study.population}`);
        parts.push(`  - Primary endpoint: ${study.primaryEndpoint}`);
        parts.push(`  - Result: ${study.primaryResult}`);
        for (const s of study.secondaryEndpoints) {
          parts.push(`  - ${s.endpoint}: ${s.result}`);
        }
        parts.push(`  - Outcome: ${study.outcome}`);
      }
    } else {
      const reg = product.regulatoryApprovals;
      if (reg.length > 0) {
        const agencies = Array.from(new Set(reg.map(r => r.agency)));
        const fda = reg.find(r => r.agency === 'FDA');
        const ema = reg.find(r => r.agency === 'EMA');
        parts.push(`- Regulatory approvals: ${reg.length} across ${agencies.length} agencies`);
        if (fda) {
          parts.push(
            `  - FDA: ${fda.marketApprovalDate} — ${(fda.labelPopulation || fda.specificIndication || '').slice(0, 150)}`,
          );
        }
        if (ema) {
          parts.push(
            `  - EMA: ${ema.marketApprovalDate} — ${(ema.labelPopulation || ema.specificIndication || '').slice(0, 150)}`,
          );
        }
      }

      const hta = product.htaOutcomes;
      if (hta.length > 0) {
        let recommended = 0;
        let restricted = 0;
        let notRecommended = 0;
        let other = 0;
        for (const o of hta) {
          const oc = (o.assessmentOutcome ?? '').toLowerCase();
          if (
            oc.includes('not recommended') ||
            oc.includes('not reimbursed') ||
            oc.includes('terminated') ||
            oc.includes('smr insufficient')
          ) {
            notRecommended++;
          } else if (
            oc.includes('with restrictions') ||
            oc.includes('restrictions to label')
          ) {
            restricted++;
          } else if (
            oc.includes('recommended') ||
            oc.includes('considerable') ||
            oc.includes('important added') ||
            oc.includes('asmr i') ||
            oc.includes('asmr ii') ||
            oc.includes('asmr iii') ||
            oc.includes('asmr iv') ||
            oc.includes('positive') ||
            oc.includes('list c')
          ) {
            recommended++;
          } else {
            other++;
          }
        }
        parts.push(
          `- HTA assessments: ${hta.length} total — ${recommended} positive, ${restricted} restricted, ${notRecommended} negative, ${other} other`,
        );

        const notable = ['NICE', 'HAS', 'G-BA', 'CDA-AMC', 'PBAC', 'AIFA', 'SMC', 'TLV'];
        for (const agency of notable) {
          const found = hta.find(o => o.htaAgency === agency);
          if (found) {
            const reason =
              (found.reasonForRecommendation as string | undefined) ??
              (found.comments as string | undefined) ??
              '';
            parts.push(
              `  - ${agency}: ${found.assessmentOutcome ?? 'unknown'}${reason ? ` — ${reason.slice(0, 200)}` : ''}`,
            );
          }
        }
      }

      const ps = product.pivotalStudies;
      if (ps.length > 0) {
        const main = ps.find(s => s.relativeImprovementPercentage) ?? ps[0];
        parts.push(`- Pivotal trial: ${main.trialType ?? 'unspecified'}`);
        if (main.comparator) parts.push(`  - Comparator: ${main.comparator}`);
        if (main.trialResultsInvestigationalArm) {
          parts.push(
            `  - Result (investigational): ${String(main.trialResultsInvestigationalArm).slice(0, 200)}`,
          );
        }
        if (main.trialResultsComparatorArm) {
          parts.push(
            `  - Result (comparator): ${String(main.trialResultsComparatorArm).slice(0, 200)}`,
          );
        }
        if (main.relativeImprovementPercentage) {
          parts.push(`  - Relative improvement: ${main.relativeImprovementPercentage}`);
        }
        if (main.trialOutcome) {
          parts.push(`  - Trial outcome: ${String(main.trialOutcome).slice(0, 200)}`);
        }
      }
    }

    const scores = SPIDER_SCORES[product.brandName];
    if (scores) {
      const formatted = DIMENSIONS.map(d => `${DIMENSION_LABEL[d]}: ${scores[d]}/5`).join(
        ' | ',
      );
      parts.push(`- Spider scores (0-5): ${formatted}`);
    }

    parts.push('');
  }

  parts.push('## Alnyx strength ratings (vs whole cohort)\n');
  for (const d of DIMENSIONS) {
    const r = ALNYX_STRENGTH_RATINGS[d];
    parts.push(`- ${DIMENSION_LABEL[d]}: **${r.rating}** — ${r.rationale}`);
  }
  parts.push('');

  parts.push('## Best in class per dimension (competitor)\n');
  for (const d of DIMENSIONS) {
    const bic = BEST_IN_CLASS[d];
    parts.push(`- ${DIMENSION_LABEL[d]}: ${bic ?? '(none designated)'}`);
  }
  parts.push('');

  parts.push('## Modality reference\n');
  parts.push(
    '- Bispecifics: weekly/biweekly SC dosing; CRS and ICANS profiles; continuous therapy until progression. Tecvayli most mature, others newer.',
  );
  parts.push(
    '- CAR-Ts: one-time IV infusion; manufacturing lead time; CRS and neurotoxicity; best efficacy in this setting per Phase 3 data; constrained access by treatment centre.',
  );
  parts.push(
    '- ADC (Blenrep): IV every 3 weeks; ocular toxicity profile; withdrawn from US/EU markets in 2022 but data and HTA precedent remain relevant.',
  );
  parts.push('');

  return parts.join('\n');
}

/**
 * Packs the 14 Objection Handling entries (across 4 domains) into a
 * markdown corpus for the triage chat — each domain block lists every
 * objection with its payer voice, strength, top-line response,
 * cross-references to Value Story messages, and full handler list.
 * Total: ~6-10k tokens.
 */
function buildObjectionHandlingCorpusText(): string {
  const parts: string[] = ['# Alnyx Objection Handling Corpus — R/R MM', ''];

  for (const domain of OBJECTION_DOMAINS) {
    parts.push(`## Domain: ${domain.name}`);
    parts.push(`Overarching: ${domain.overarching}`);
    parts.push('');

    const objs = OBJECTIONS.filter(o => o.domain === domain.key);
    for (const o of objs) {
      parts.push(`### ${o.id} : ${o.tag} (Strength: ${o.strength})`);
      parts.push(`Payer objection: "${o.payerVoice}"`);
      parts.push(`Top-line response: ${o.topLineResponse}`);
      parts.push(
        `Reinforces Value Story messages: ${o.reinforcedValueMessageIds.join(', ') || '—'}`,
      );
      parts.push(`Reinforce text: ${o.reinforceText}`);
      parts.push('Handlers:');
      for (const h of o.handlers) {
        parts.push(`  - ${h.id}: ${h.text}`);
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}

/**
 * Packs the 18 Value Story messages (across 4 domains) into a markdown
 * corpus for the triage chat. Tiny — ~3-5k tokens — so the whole thing
 * sits in the system prompt every turn. Each message is bolded by its
 * ID so the model can mirror the **C2** citation format easily.
 */
function buildValueStoryCorpusText(): string {
  const parts: string[] = ['# Alnyx (alphabetinib) Value Story — R/R MM', ''];
  parts.push('## Overarching message');
  parts.push(OVERARCHING_MESSAGE);
  parts.push('');
  for (const domain of DOMAINS) {
    parts.push(`## Domain: ${domain.name}`);
    parts.push(`Overarching: ${domain.overarching}`);
    parts.push('');
    const messages = VALUE_MESSAGES.filter(m => m.domain === domain.key);
    for (const m of messages) {
      parts.push(`- **${m.id}** (Strength: ${m.strength}): ${m.text}`);
    }
    parts.push('');
  }
  return parts.join('\n');
}

interface RawDocHubEntry {
  id: string;
  product: string | null;
  geography: string | null;
  title: string;
  description: string;
  type: string | null;
  tag: string | null;
  agency: string | null;
  date: string | null;
  has_summary: boolean;
  summary: string | null;
}

/**
 * Packs the Document Hub catalogue (24 docs) into a markdown corpus for the
 * discovery chat. Metadata is provided for every doc; the detailed summary
 * is only attached for the ~6 docs that have one — the chat is instructed
 * to speak substantively about those and only descriptively about the rest.
 */
function buildDocHubCorpusText(): string {
  const entries = (dochubCorpus as { entries: RawDocHubEntry[] }).entries;
  const summarised = entries.filter(e => e.has_summary).length;

  const parts: string[] = [
    '# Document Hub catalogue',
    `Total documents: ${entries.length}`,
    `Documents with detailed summary: ${summarised}`,
    '',
  ];

  for (const e of entries) {
    const dateStr = e.date ? e.date.slice(0, 10) : 'date unknown';
    parts.push(`## ${e.title}`);
    parts.push(`- ID: ${e.id}`);
    parts.push(`- Product: ${e.product ?? '—'}`);
    parts.push(`- Geography: ${e.geography ?? '—'}`);
    parts.push(`- Date: ${dateStr}`);
    parts.push(
      `- Type: ${e.type ?? '—'} | Tag: ${e.tag ?? '—'} | Agency: ${e.agency ?? '—'}`,
    );
    parts.push(`- Description: ${e.description}`);
    if (e.has_summary && e.summary) {
      parts.push(`- Detailed summary: ${e.summary}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

function buildGvdCorpusText(): string {
  const parts: string[] = [
    `# ${GVD_CORPUS.document_title}`,
    `Total pages: ${GVD_CORPUS.total_pages}`,
    '',
  ];
  for (const section of GVD_CORPUS.sections) {
    if (!section.text || section.text.length < 30) continue;
    parts.push(`## Section ${section.number}: ${section.title}`);
    parts.push(`(Page ${section.page_start})`);
    parts.push(section.text);
    parts.push('');
  }
  return parts.join('\n');
}
