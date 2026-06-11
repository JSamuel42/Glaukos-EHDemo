export type StrengthLevel = 'aspirational' | 'emerging' | 'strong' | 'robust';

export const STRENGTH_LEVELS: StrengthLevel[] = [
  'aspirational',
  'emerging',
  'strong',
  'robust',
];

export const STRENGTH_LABEL: Record<StrengthLevel, string> = {
  aspirational: 'Aspirational',
  emerging: 'Emerging',
  strong: 'Strong',
  robust: 'Robust',
};

// Domains: Unmet Need → Platform Credibility → Patient Value → Economic (U/P/V/E).
export type DomainKey = 'unmet-need' | 'platform-credibility' | 'patient-value' | 'economic';

/**
 * Source reference attached to a value message for Phase 6 citation
 * deep-linking. `pubmed` refs carry a PMID/DOI (and, where the article is in
 * the canonical Library, an `articleId` so the chip can deep-link to the
 * Library row); `glaukos` refs are company-reported; `inferential` refs flag
 * claims without direct trial/economic evidence.
 */
export interface SourceRef {
  label: string;
  type: 'pubmed' | 'glaukos' | 'inferential';
  pmid?: string;
  doi?: string;
  /** Canonical Library Article id, when the source is in the Library. */
  articleId?: string;
}

export interface ValueMessage {
  id: string; // e.g., "U1", "V2"
  domain: DomainKey;
  /** Short headline shown in bold on the message card. */
  headline: string;
  /** Substantiation — the supporting claim under the headline. */
  text: string;
  strength: StrengthLevel;
  /** Source references for Phase 6 citation deep-linking. */
  sourceRefs: SourceRef[];
  /** Placeholder count shown until the Phase 6 article linking pass. */
  placeholder_publication_count: number;
  /** Empty for now; populated with Library Article IDs at the linking pass. */
  supporting_articles: string[];
}

export interface DomainDef {
  key: DomainKey;
  name: string;
  /** 1-letter code displayed faintly on the gradient card. */
  monogram: string;
  /** Tailwind classes for the card background gradient. */
  gradient_class: string;
  /** Tailwind class for the monogram colour-on-gradient. */
  text_on_gradient_class: string;
  overarching: string;
}

// Pivotal-trial reference, reused across efficacy/safety messages.
const SARKISIAN: SourceRef = {
  label: 'Sarkisian et al., J Glaucoma 2023 (PMID 36260288)',
  type: 'pubmed',
  pmid: '36260288',
  doi: '10.1097/IJG.0000000000002141',
  articleId: 'Sarkisian, 2022',
};

// 4 domains (U/P/V/E order)
export const DOMAINS: DomainDef[] = [
  {
    key: 'unmet-need',
    name: 'Unmet Need',
    monogram: 'U',
    gradient_class: 'bg-gradient-to-br from-orange-100 via-orange-50 to-red-50',
    text_on_gradient_class: 'text-orange-700/15',
    overarching:
      'Refractory open-angle glaucoma persists after maximum tolerated medical therapy and prior surgery, with few standalone options before invasive filtration or tube surgery — and continued elevated intraocular pressure risks progressive, irreversible vision loss.',
  },
  {
    key: 'platform-credibility',
    name: 'Platform Credibility',
    monogram: 'P',
    gradient_class: 'bg-gradient-to-br from-blue-100 via-blue-50 to-sky-50',
    text_on_gradient_class: 'text-blue-700/15',
    overarching:
      'iStent infinite is built on the iStent trabecular micro-bypass franchise — a roughly two-decade evidence legacy from the company that established interventional glaucoma (Glaukos company-reported).',
  },
  {
    key: 'patient-value',
    name: 'Patient Value',
    monogram: 'V',
    gradient_class: 'bg-gradient-to-br from-purple-100 via-purple-50 to-fuchsia-50',
    text_on_gradient_class: 'text-purple-700/15',
    overarching:
      'In a failed-prior-therapy population, iStent infinite delivered meaningful intraocular pressure reduction on the same or fewer medications, with a favourable safety profile that preserves future surgical options.',
  },
  {
    key: 'economic',
    name: 'Economic Value',
    monogram: 'E',
    gradient_class: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50',
    text_on_gradient_class: 'text-emerald-700/15',
    overarching:
      'By deferring more invasive, higher-complication surgery and easing the chronic medication load, iStent infinite has the potential to reduce downstream resource use — inferential, pending direct economic evidence.',
  },
];

// 13 value messages: U1-U3, P1-P2, V1-V5, E1-E3
export const VALUE_MESSAGES: ValueMessage[] = [
  // 1 · Unmet Need
  {
    id: 'U1', domain: 'unmet-need', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Where the options run out',
    text: 'Refractory open-angle glaucoma persists after medications and surgery, with few standalone alternatives before invasive surgery.',
    sourceRefs: [{ label: 'iStent infinite indication & MIGS landscape (Glaukos)', type: 'glaukos' }],
  },
  {
    id: 'U2', domain: 'unmet-need', strength: 'robust', placeholder_publication_count: 2, supporting_articles: [],
    headline: 'Uncontrolled pressure, irreversible loss',
    text: 'Continued elevated intraocular pressure risks progressive, irreversible vision loss.',
    sourceRefs: [
      { label: 'King et al., Ophthalmology 2024 (TAGS)', type: 'pubmed', pmid: '38199528', articleId: 'King, 2024' },
      { label: 'Shin et al., Sci Rep 2024', type: 'pubmed', pmid: '38177211', articleId: 'Shin, 2024' },
    ],
  },
  {
    id: 'U3', domain: 'unmet-need', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'A clearly defined patient',
    text: 'The failed-prior-therapy population maps directly to the surgical-eligible funnel tier.',
    sourceRefs: [{ label: 'Surgical-eligible funnel tier (Glaukos)', type: 'glaukos' }],
  },

  // 2 · Platform Credibility
  {
    id: 'P1', domain: 'platform-credibility', strength: 'robust', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Two decades of evidence',
    text: 'A roughly 20-year iStent legacy, 300+ publications, and 3M+ devices implanted (Glaukos-reported).',
    sourceRefs: [{ label: 'iStent platform legacy (Glaukos, company-reported)', type: 'glaukos' }],
  },
  {
    id: 'P2', domain: 'platform-credibility', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Built by the pioneers of MIGS',
    text: 'Glaukos established interventional glaucoma and extends it to standalone, later-stage care.',
    sourceRefs: [{ label: 'Glaukos — pioneers of MIGS (company-reported)', type: 'glaukos' }],
  },

  // 3 · Patient Value (Clinical + Humanistic)
  {
    id: 'V1', domain: 'patient-value', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: "Meaningful reduction where it's hardest",
    text: '~5.9 mmHg mean diurnal IOP reduction at month 12 in a failed-prior-therapy population.',
    sourceRefs: [SARKISIAN],
  },
  {
    id: 'V2', domain: 'patient-value', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Three in four respond',
    text: '~76% met the responder endpoint at 12 months.',
    sourceRefs: [SARKISIAN],
  },
  {
    id: 'V3', domain: 'patient-value', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Control without adding burden',
    text: 'Achieved on the same or fewer intraocular-pressure-lowering medication classes.',
    sourceRefs: [SARKISIAN],
  },
  {
    id: 'V4', domain: 'patient-value', strength: 'emerging', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Fewer drops, simpler days',
    text: 'Potential to ease chronic drop/adherence burden and support quality of life.',
    sourceRefs: [{ label: 'Illustrative, case-level — not a trial endpoint', type: 'inferential' }],
  },
  {
    id: 'V5', domain: 'patient-value', strength: 'strong', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'A safety profile that holds up',
    text: 'No explants, infection, device-related interventions, or hypotony — while preserving future options.',
    sourceRefs: [SARKISIAN],
  },

  // 4 · Economic Value
  {
    id: 'E1', domain: 'economic', strength: 'emerging', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Deferring the costlier path',
    text: 'Potential to delay or avoid more invasive, higher-complication filtration/tube surgery.',
    sourceRefs: [{ label: 'Inferential — no direct economic evidence in the pivotal trial', type: 'inferential' }],
  },
  {
    id: 'E2', domain: 'economic', strength: 'emerging', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Lightening the medication load',
    text: 'Same or fewer medication classes may reduce ongoing pharmacy burden.',
    sourceRefs: [
      { label: 'Newman-Casey et al., Ophthalmology 2020 (adherence cost-utility)', type: 'pubmed', pmid: '31767436', articleId: 'Newman-Casey, 2019' },
    ],
  },
  {
    id: 'E3', domain: 'economic', strength: 'aspirational', placeholder_publication_count: 1, supporting_articles: [],
    headline: 'Fewer complications downstream',
    text: 'Favourable safety may translate to reduced complication-related resource use.',
    sourceRefs: [{ label: 'Inferential — no direct economic evidence', type: 'inferential' }],
  },
];

export interface IndicationOption {
  id: string;
  label: string;
}

export interface PayerIssueOption {
  id: string;
  label: string;
}

export const INDICATION_OPTIONS: IndicationOption[] = [
  { id: 'cross', label: 'Cross-indication' },
  { id: 'oag-surgical', label: 'Open-angle glaucoma — surgical-eligible' },
  { id: 'oag-uncontrolled', label: 'Uncontrolled OAG on maximum medical therapy' },
];

export const PAYER_ISSUE_OPTIONS: PayerIssueOption[] = [
  { id: 'overarching', label: 'Overarching value story' },
  { id: 'budget', label: 'Budget sensitive' },
  { id: 'unmet-need', label: 'Unmet need / positioning' },
  { id: 'differentiation', label: 'Differentiation vs alternatives' },
  { id: 'formulary', label: 'Coverage / pathway positioning' },
  { id: 'durability', label: 'Durability of IOP control' },
];

// Banner content
export const LANDING_BANNER_OPENING =
  'iStent infinite is a standalone, micro-invasive trabecular micro-bypass option for adults with open-angle glaucoma uncontrolled by prior medical and surgical therapy — restoring physiologic aqueous outflow to deliver durable intraocular pressure control.';

export const LANDING_SELECTOR_PROMPT =
  'Select tailored value messages for emphasis and more comprehensive data on the messages that support pressing payer issues.';

export const OVERARCHING_MESSAGE =
  'iStent infinite extends interventional glaucoma to later-stage, refractory disease: a standalone micro-invasive implant that lowers intraocular pressure on the same or fewer medications, with a favourable safety profile that preserves future surgical options.';

// Helpers
export function getMessagesForDomain(domain: DomainKey): ValueMessage[] {
  return VALUE_MESSAGES.filter(m => m.domain === domain);
}

export function getDomain(key: DomainKey): DomainDef {
  return DOMAINS.find(d => d.key === key)!;
}

export const DOMAIN_BY_KEY: Record<DomainKey, DomainDef> = Object.fromEntries(
  DOMAINS.map(d => [d.key, d]),
) as Record<DomainKey, DomainDef>;

export function totalPublicationsForDomain(domain: DomainKey): number {
  return getMessagesForDomain(domain).reduce(
    (sum, m) => sum + m.placeholder_publication_count,
    0,
  );
}
