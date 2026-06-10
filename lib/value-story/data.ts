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

export type DomainKey = 'burden' | 'clinical' | 'patient' | 'economic';

export interface ValueMessage {
  id: string; // e.g., "D1", "C2"
  domain: DomainKey;
  text: string;
  strength: StrengthLevel;
  /** Placeholder count shown until the end-of-cluster article linking pass. */
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

// 4 domains
export const DOMAINS: DomainDef[] = [
  {
    key: 'burden',
    name: 'Burden & Unmet Need',
    monogram: 'D',
    gradient_class: 'bg-gradient-to-br from-orange-100 via-orange-50 to-red-50',
    text_on_gradient_class: 'text-orange-700/15',
    overarching:
      'R/RMM worsens survival and quality of life due to symptom burden and treatment toxicities. Existing therapies have efficacy and access limitations, highlighting the need for better options.',
  },
  {
    key: 'clinical',
    name: 'Clinical Value',
    monogram: 'C',
    gradient_class: 'bg-gradient-to-br from-blue-100 via-blue-50 to-sky-50',
    text_on_gradient_class: 'text-blue-700/15',
    overarching:
      'Alnyx offers deep, durable responses in relapsed and refractory multiple myeloma, improving symptoms, pain, and overall well-being. With a predictable, manageable safety profile, it provides a well-tolerated, effective option for patients.',
  },
  {
    key: 'patient',
    name: 'Patient Impact',
    monogram: 'P',
    gradient_class: 'bg-gradient-to-br from-purple-100 via-purple-50 to-fuchsia-50',
    text_on_gradient_class: 'text-purple-700/15',
    overarching:
      "Alnyx outperforms physician's choice with higher response rates, longer survival, and improved progression-free outcomes. Its convenient, ready-to-use subcutaneous administration enables faster treatment initiation, offering a more accessible and efficient option compared to existing therapies requiring prolonged preparation and monitoring.",
  },
  {
    key: 'economic',
    name: 'Economic Value',
    monogram: 'E',
    gradient_class: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50',
    text_on_gradient_class: 'text-emerald-700/15',
    overarching:
      'Alnyx offers a cost-effective treatment for relapsed and refractory multiple myeloma, reducing overall healthcare costs by displacing expensive later-line therapies and complications. Its optimised use with non-invasive testing further minimises budget impact, delivering significant economic value in reimbursement models.',
  },
];

// 18 value messages
export const VALUE_MESSAGES: ValueMessage[] = [
  // Burden & Unmet Need (5)
  {
    id: 'D1',
    domain: 'burden',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: 'Multiple myeloma (MM) is a plasma cell malignancy with an incidence of 5.3 per 100,000 globally, accounting for ~10% of hematologic malignancies.',
    supporting_articles: [],
  },
  {
    id: 'D2',
    domain: 'burden',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: 'Current standard of care options provide suboptimal efficacy and tolerability, substantial delay in onset of action, as well as limited HRQoL benefits.',
    supporting_articles: [],
  },
  {
    id: 'D3',
    domain: 'burden',
    strength: 'strong',
    placeholder_publication_count: 3,
    text: 'Many patients fail to achieve remission with existing therapies which can result in treatment resistance and is associated with a significant increase in humanistic burden, morbidity and costs.',
    supporting_articles: [],
  },
  {
    id: 'D4',
    domain: 'burden',
    strength: 'emerging',
    placeholder_publication_count: 3,
    text: 'Exposure or refractoriness to prior classes of therapy is the key driver of unmet need in MM, with patients experiencing substantial and often debilitating disease burden.',
    supporting_articles: [],
  },
  {
    id: 'D5',
    domain: 'burden',
    strength: 'aspirational',
    placeholder_publication_count: 3,
    text: 'In many cases, relapsed/refractory MM patients must resort to recycling therapies, leaving unmet need for additional safe and efficacious treatments.',
    supporting_articles: [],
  },

  // Clinical Value (5)
  {
    id: 'C1',
    domain: 'clinical',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: 'Alnyx is indicated for the treatment of adult patients with relapsed and refractory multiple myeloma, who have received at least two prior therapies, and have demonstrated disease progression on the last therapy.',
    supporting_articles: [],
  },
  {
    id: 'C2',
    domain: 'clinical',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: 'In R/R MM patients who have no prior targeted therapy exposure, Alnyx provides patients with a deep and durable response, with majority had ongoing responses at 16 months.',
    supporting_articles: [],
  },
  {
    id: 'C3',
    domain: 'clinical',
    strength: 'strong',
    placeholder_publication_count: 3,
    text: 'Patients treated with Alnyx reported significant reductions in pain and multiple myeloma disease symptoms based on the disease-specific and general patient reported outcomes tools.',
    supporting_articles: [],
  },
  {
    id: 'C4',
    domain: 'clinical',
    strength: 'emerging',
    placeholder_publication_count: 3,
    text: 'Patients treated with Alnyx reported rapid improvements in their overall disease state, demonstrated by favourable patient global impression of change outcomes.',
    supporting_articles: [],
  },
  {
    id: 'C5',
    domain: 'clinical',
    strength: 'aspirational',
    placeholder_publication_count: 3,
    text: "Alnyx's safety profile was predictable, key immuno- and neuro- safety events were mostly low grade (85% grade 1/2) and manageable with appropriate intervention; majority (91%) occurring with early onset.",
    supporting_articles: [],
  },

  // Patient Impact (4)
  {
    id: 'P1',
    domain: 'patient',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: "Alnyx was associated with significantly higher overall response rate than physician's choice based on a real-world external control arm study.",
    supporting_articles: [],
  },
  {
    id: 'P2',
    domain: 'patient',
    strength: 'strong',
    placeholder_publication_count: 3,
    text: "Alnyx was associated with significantly longer progression-free survival and overall survival than physician's choice based on two real-world external control arm studies.",
    supporting_articles: [],
  },
  {
    id: 'P3',
    domain: 'patient',
    strength: 'emerging',
    placeholder_publication_count: 3,
    text: 'Alnyx offers a more convenient administration than currently available treatments and easier treatment initiation, administered subcutaneously by HCPs.',
    supporting_articles: [],
  },
  {
    id: 'P4',
    domain: 'patient',
    strength: 'aspirational',
    placeholder_publication_count: 3,
    text: 'Alnyx is ready to be administered as soon as it is prescribed, as opposed to other available therapies, which require 1-2 months of preparation and extended monitoring.',
    supporting_articles: [],
  },

  // Economic Value (4)
  {
    id: 'E1',
    domain: 'economic',
    strength: 'robust',
    placeholder_publication_count: 3,
    text: 'Alnyx delays disease progression, which has been shown to yield reductions in downstream management costs in R/R MM.',
    supporting_articles: [],
  },
  {
    id: 'E2',
    domain: 'economic',
    strength: 'strong',
    placeholder_publication_count: 3,
    text: 'With the displacement of later-line medicines and subsequent severe complications, reimbursement for Alnyx can yield significant cost offsets.',
    supporting_articles: [],
  },
  {
    id: 'E3',
    domain: 'economic',
    strength: 'emerging',
    placeholder_publication_count: 3,
    text: 'Alnyx has a manageable budget impact, with cost-saving potential versus alternative regimens.',
    supporting_articles: [],
  },
  {
    id: 'E4',
    domain: 'economic',
    strength: 'aspirational',
    placeholder_publication_count: 3,
    text: 'Alnyx is easier for pharmacists to manage due to the non-weight-based dosing, and as such has lower HCP utilisation and wastage.',
    supporting_articles: [],
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
  { id: '3l-plus-rrmm', label: '3L+ relapsed / refractory multiple myeloma' },
  { id: 'alk-ros1-nsclc', label: 'Refractory ALK+/ROS1+ NSCLC' },
];

export const PAYER_ISSUE_OPTIONS: PayerIssueOption[] = [
  { id: 'overarching', label: 'Overarching value story' },
  { id: 'budget', label: 'Budget sensitive' },
  { id: 'generic-entry', label: 'Generic competitor entry' },
  { id: 'differentiation', label: 'Differentiation vs branded competitors' },
  { id: 'formulary', label: 'Formulary positioning' },
  { id: 'durability', label: 'Durability of response' },
];

// Banner content
export const LANDING_BANNER_OPENING =
  'A breakthrough in the treatment of advanced relapsed / refractory multiple myeloma, with proven efficacy in targeting and reducing disease progression. Alnyx empowers patients and healthcare providers with an innovative therapy that prioritises both survival and quality of life.';

export const LANDING_SELECTOR_PROMPT =
  'Select tailored PVPs for emphasis and more comprehensive data on messages to support pressing issues';

export const OVERARCHING_MESSAGE =
  'Alnyx (alphabetinib) represents a breakthrough in the treatment of relapsed and refractory multiple myeloma, offering renewed hope for patients who have exhausted other options. With proven efficacy in targeting and reducing disease progression, Alnyx empowers patients and healthcare providers with an innovative therapy that prioritises both survival and quality of life.';

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
