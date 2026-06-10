import type { StrengthLevel } from '@/lib/value-story/data';

export type ObjectionDomainKey =
  | 'disease-burden'
  | 'clinical-value'
  | 'clinical-differentiation'
  | 'economic-value';

export interface ObjectionDomainDef {
  key: ObjectionDomainKey;
  name: string;
  /** Longer descriptive title shown on the Page 2 banner. */
  bannerTitle: string;
  /** 1-letter watermark on the gradient card. */
  monogram: string;
  /** Tailwind classes for the card gradient. */
  gradient_class: string;
  /** Faint watermark colour-on-gradient (kept at /15 opacity per the Value Story pass). */
  text_on_gradient_class: string;
  /** Lighter gradient used on the Page 2 banner. */
  banner_class: string;
  overarching: string;
}

export interface Handler {
  /** Hierarchical ID, e.g. "1.4" → objection 1, handler 4. */
  id: string;
  text: string;
  /** Empty for now; populated by the end-of-cluster article-linking pass. */
  supporting_articles: string[];
  placeholder_publication_count: number;
}

export interface Objection {
  /** Module-prefixed ID, e.g. "OH7". */
  id: string;
  domain: ObjectionDomainKey;
  /** Short tag rendered next to the ID in the header. */
  tag: string;
  /** The objection in payer voice — the question we're countering. */
  payerVoice: string;
  strength: StrengthLevel;
  topLineResponse: string;
  /** Value Story message IDs the objection reinforces, e.g. ["D4"] or ["E2","E3"]. */
  reinforcedValueMessageIds: string[];
  /** Full text shown in the "Reinforce Core Value Messages" box. */
  reinforceText: string;
  handlers: Handler[];
}

// 4 domains
export const OBJECTION_DOMAINS: ObjectionDomainDef[] = [
  {
    key: 'disease-burden',
    name: 'Disease Burden',
    bannerTitle: 'Disease Overview & Treatment Landscape',
    monogram: 'D',
    gradient_class: 'bg-gradient-to-br from-orange-100 via-rose-50 to-rose-100',
    text_on_gradient_class: 'text-orange-700/15',
    banner_class: 'bg-gradient-to-br from-orange-50 via-rose-50 to-rose-100',
    overarching:
      'Depth of response, treatment duration, and remission time diminish with each line of MM therapy. Patients with heavily pre-treated TCE R/R MM have a poor prognosis, with PFS at 4 months and a median overall survival of only 12 months. There is no established standard of care in TCE R/R MM. Patients are either recycling failed therapies or experiencing access barriers to novel modalities, and are thus out of remaining options at that point in their care journey.',
  },
  {
    key: 'clinical-value',
    name: 'Clinical Value',
    bannerTitle: 'Clinical Value',
    monogram: 'C',
    gradient_class: 'bg-gradient-to-br from-cyan-100 via-cyan-50 to-teal-50',
    text_on_gradient_class: 'text-cyan-700/15',
    banner_class: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100',
    overarching:
      'Alnyx is a BCMA × CD3 bispecific antibody that offers rapid and durable responses and the potential to improve PFS and OS in heavily pre-treated MM patients, based on Phase 2 data.',
  },
  {
    key: 'clinical-differentiation',
    name: 'Clinical Differentiation',
    bannerTitle: 'Clinical Differentiation',
    monogram: 'X',
    gradient_class: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50',
    text_on_gradient_class: 'text-emerald-700/15',
    banner_class: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
    overarching:
      "Alnyx is a fixed-dose monotherapy given by subcutaneous injection with Q6W maintenance dosing after step-up. Phase 2 data and indirect treatment comparisons suggest Alnyx provides comparable or improved PFS relative to real-world physician's choice and competitor bispecifics, pending Phase 3 confirmation.",
  },
  {
    key: 'economic-value',
    name: 'Economic Value',
    bannerTitle: 'Economic Impact',
    monogram: 'E',
    gradient_class: 'bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-50',
    text_on_gradient_class: 'text-purple-700/15',
    banner_class: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
    overarching:
      'Reimbursement of Alnyx can provide cost offsets due to the displacement of therapies currently utilised for the treatment of TCE R/R MM and its convenient Q6W maintenance dosing schedule.',
  },
];

export const OBJECTION_DOMAIN_BY_KEY: Record<ObjectionDomainKey, ObjectionDomainDef> =
  Object.fromEntries(OBJECTION_DOMAINS.map(d => [d.key, d])) as Record<
    ObjectionDomainKey,
    ObjectionDomainDef
  >;

// 14 objections across 4 domains (3 + 4 + 3 + 4)
export const OBJECTIONS: Objection[] = [
  // ─── Domain 1: Disease Burden (3 objections) ───
  {
    id: 'OH1',
    domain: 'disease-burden',
    tag: 'Unmet Need',
    payerVoice:
      'There have already been novel therapies made available to patients in TCE R/R MM in the past year, including BCMA bispecific antibodies, so the unmet need has been addressed.',
    strength: 'strong',
    topLineResponse:
      'There is still an unmet need for additional treatment options for TCE patients, as current treatments pose certain barriers that are yet to be addressed.',
    reinforcedValueMessageIds: ['D4'],
    reinforceText:
      'Exposure or refractoriness to prior classes of therapy is the key driver of unmet need in MM, with patients experiencing substantial and often debilitating disease burden.',
    handlers: [
      {
        id: '1.1',
        text: 'There is still unmet need for a new therapy for TCE MM patients that provides robust efficacy and safety.',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
      {
        id: '1.2',
        text: 'There is a need for a new treatment option as newly developed CAR-Ts pose access barriers.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '1.3',
        text: 'Currently available BsAbs have convenience and tolerability challenges that are yet to be addressed.',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
      {
        id: '1.4',
        text: 'Alnyx is a ready-to-administer SC injection offering a convenient Q6W maintenance dosing schedule and a tolerable safety profile, based on Phase 2 data.',
        supporting_articles: [],
        placeholder_publication_count: 5,
      },
      {
        id: '1.5',
        text: 'Alnyx has been studied in a diverse patient population, including overall frailer patients, and can be an efficacious treatment option for many TCE MM patients (RESCUE-MM, n=142).',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
    ],
  },
  {
    id: 'OH2',
    domain: 'disease-burden',
    tag: 'Unmet Need',
    payerVoice:
      'In addition to new BCMA and BsAb agents, there are multiple existing therapeutic options available to TCE MM patients including pomalidomide and carfilzomib-based regimens.',
    strength: 'robust',
    topLineResponse:
      'There is still an unmet need for additional treatment options for TCE patients that provide better clinical outcomes than those seen with the mentioned treatments.',
    reinforcedValueMessageIds: ['D5'],
    reinforceText:
      'In many cases, relapsed/refractory MM patients must resort to recycling therapies, leaving unmet need for additional safe and efficacious treatments.',
    handlers: [
      {
        id: '2.1',
        text: 'A high proportion of TCE MM patients become refractory to common treatments, such as pomalidomide and carfilzomib, highlighting the need for novel therapies such as Alnyx.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '2.2',
        text: 'Even in refractory patients, treatments are often reused in later lines of therapy, without significantly benefitting overall patient survival.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },
  {
    id: 'OH3',
    domain: 'disease-burden',
    tag: 'Economic Burden',
    payerVoice:
      'There is little flexibility in payer budgets for another expensive R/R MM option that does not provide significant efficacy or safety benefits.',
    strength: 'emerging',
    topLineResponse:
      'There will be limited budget impact due to the small, targeted TCE MM patient population. Additionally, there is high unmet need for a novel therapy with meaningful benefit in outcomes, as current therapies are expensive and offer only moderate benefit.',
    reinforcedValueMessageIds: ['D1', 'E1'],
    reinforceText:
      "TCE R/R MM patients represent a small subset of the MM population, and Alnyx's treatment attributes are associated with evidence for savings in total cost of care.",
    handlers: [
      {
        id: '3.1',
        text: '[Germany example, need for market-specific data]: ~5% of patients in Germany with MM progress to TCE MM, limiting the population of those treated with Alnyx.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '3.2',
        text: 'Alnyx addresses the unmet need for TCE MM patients by providing significantly better efficacy outcomes (Phase 2 ORR 78.5%, PFS 12.4 months).',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '3.3',
        text: '[UK example, need for market-specific data]: Reimbursement of Alnyx can provide cost offsets, primarily via reduction of treatment cycling.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '3.4',
        text: 'In markets where TECVAYLI is available, Alnyx can provide savings through lower treatment costs and a less frequent dosing schedule (Q6W vs weekly/biweekly).',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },

  // ─── Domain 2: Clinical Value (4 objections) ───
  {
    id: 'OH4',
    domain: 'clinical-value',
    tag: 'Single-arm trial',
    payerVoice:
      "It is difficult to contextualise Alnyx's true benefit given the Phase 2 study design, lack of direct comparison, and immature OS data at this stage.",
    strength: 'emerging',
    topLineResponse:
      "Alnyx has been studied using an external control arm to contextualise its efficacy against TECVAYLI, BLENREP, XPOVIO, and physician's choice, using real-world database analysis.",
    reinforcedValueMessageIds: ['P2'],
    reinforceText:
      "Alnyx was associated with significantly longer PFS and OS than physician's choice based on real-world external control arm studies.",
    handlers: [
      {
        id: '4.1',
        text: 'There is no SoC for TCE MM with treatment options that patients are refractory to often being recycled, thus there is no ideal therapy for a comparator arm.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '4.2',
        text: "Alnyx Phase 2 results have been contextualised with a robust external control arm aiming to understand relative ORR, PFS, OS, and DoR compared to TECVAYLI, BLENREP, XPOVIO, and physician's choice using real-world database analysis.",
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
      {
        id: '4.3',
        text: 'Although OS data is not yet mature, patients on Alnyx have estimated mOS exceeding 21 months at the time of analysis, while patients on previous treatment options have OS expectations of approximately 12 months.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },
  {
    id: 'OH5',
    domain: 'clinical-value',
    tag: 'Trial Population',
    payerVoice:
      'Alnyx should be restricted to 5L+ patients as the trial population has a median of 5 lines of therapy.',
    strength: 'strong',
    topLineResponse:
      'Alnyx is appropriate for use in all TCE MM patients, supported by its proven efficacy and safety in TCE MM patients across lines of therapy.',
    reinforcedValueMessageIds: ['D5'],
    reinforceText:
      'In many cases, TCE MM patients must resort to recycling therapies, leaving unmet need for additional safe and efficacious treatments.',
    handlers: [
      {
        id: '5.1',
        text: 'TCE MM patients in earlier lines of therapy have limited options as newly developed CAR-Ts pose access barriers.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '5.2',
        text: 'Currently available BsAbs pose convenience and tolerability challenges that are yet to be addressed, highlighting an unmet need for patients in earlier lines of therapy.',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
      {
        id: '5.3',
        text: 'Refractory status has been shown to have more impact on outcomes for MM patients than line of treatment.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '5.4',
        text: 'ESMO guidelines contextualise usage by exposure in addition to lines of therapy.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '5.5',
        text: 'Alnyx leads to a strong response across different lines of therapy, including 2-3 LOT and ≥4 LOT.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },
  {
    id: 'OH6',
    domain: 'clinical-value',
    tag: 'Administration (inpatient monitoring)',
    payerVoice:
      'The requirement for patients treated with Alnyx to remain inpatient or within the proximity of a facility for monitoring during the first week of treatment (following step-up doses) incurs significant costs and healthcare resource utilisation.',
    strength: 'strong',
    topLineResponse:
      'Alnyx has a more convenient route of administration with less time required for monitoring within proximity of a healthcare facility, relative to CAR-T and other BsAbs.',
    reinforcedValueMessageIds: ['P3'],
    reinforceText:
      'Alnyx offers a more convenient administration than currently available treatments and easier treatment initiation, administered subcutaneously by HCPs.',
    handlers: [
      {
        id: '6.1',
        text: 'Alnyx requires monitoring for 48 hours within proximity of a healthcare facility after each of the two step-up doses, which is low relative to CAR-T or other BsAb therapies.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '6.2',
        text: "Alnyx's Q6W subcutaneous maintenance route of administration and low AEs relative to CAR-T contribute to cost-offsets, while AE management costs are similar to other BsAbs.",
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
    ],
  },
  {
    id: 'OH7',
    domain: 'clinical-value',
    tag: 'Administration (vs CAR-T)',
    payerVoice:
      "Alnyx continuous administration is less convenient than CAR-T's one-time infusion without providing additional safety or efficacy benefits.",
    strength: 'robust',
    topLineResponse:
      'Alnyx is a safe and convenient off-the-shelf fixed-dose SC outpatient injection that does not require specialised centres of excellence for utilisation and is eligible for patients with ECOG status 0-2.',
    reinforcedValueMessageIds: ['P4'],
    reinforceText:
      'Alnyx is ready to be administered as soon as it is prescribed, as opposed to other available therapies, which require 1-2 months of preparation and extended monitoring.',
    handlers: [
      {
        id: '7.1',
        text: 'Alnyx requires a shorter monitoring period upon treatment initiation relative to CAR-T.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '7.2',
        text: 'Alnyx has fewer access barriers relative to CAR-T and can be more widely available for patients with high unmet need.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '7.3',
        text: 'Alnyx has been studied in a diverse patient population, including frailer patients relative to CAR-T, and is an efficacious option in TCE MM.',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
      {
        id: '7.4',
        text: 'Alnyx is an off-the-shelf subcutaneous therapy with manageable administration-related safety events. With a convenient step-up regimen, CRS events were predictable with early onset, of short duration, and resolved with appropriate intervention.',
        supporting_articles: [],
        placeholder_publication_count: 4,
      },
    ],
  },

  // ─── Domain 3: Clinical Differentiation (3 objections) ───
  {
    id: 'OH8',
    domain: 'clinical-differentiation',
    tag: 'Clinical comparison to TECVAYLI',
    payerVoice: 'Alnyx lacks meaningful differentiation from TECVAYLI.',
    strength: 'emerging',
    topLineResponse:
      'Due to the lack of head-to-head studies, no conclusive comparisons between Alnyx and TECVAYLI can be drawn. However, Alnyx has independently demonstrated robust efficacy and safety across a diverse study population.',
    reinforcedValueMessageIds: ['P2'],
    reinforceText:
      "Alnyx was associated with significantly longer PFS than TECVAYLI and real-world physician's choice, based on a series of indirect treatment comparisons.",
    handlers: [
      {
        id: '8.1',
        text: 'Alnyx was associated with significantly better outcomes than TECVAYLI based on a series of indirect treatment comparisons.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '8.2',
        text: "While not directly compared, lower CRS rates were observed in Alnyx's clinical trial vs TECVAYLI's clinical trial.",
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '8.3',
        text: 'Alnyx has a convenient flat-dosing regimen with Q6W maintenance after step-up, while TECVAYLI has a complex weight-based dosing regimen including a 3-dose step-up; switching to Q2W administration in TECVAYLI occurs after a median time of 11.1 months.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },
  {
    id: 'OH9',
    domain: 'clinical-differentiation',
    tag: 'Clinical comparison to TALVEY',
    payerVoice: 'Alnyx does not present meaningful clinical benefits over TALVEY.',
    strength: 'emerging',
    topLineResponse:
      'Due to the lack of head-to-head studies, no conclusive comparisons between Alnyx and TALVEY can be drawn. However, Alnyx has independently demonstrated long-lasting safety and efficacy across a diverse study population.',
    reinforcedValueMessageIds: ['P3'],
    reinforceText:
      'Alnyx is an off-the-shelf, ready-to-use, fixed-dose monotherapy treatment administered subcutaneously by HCPs, with only two initial inpatient step-up doses.',
    handlers: [
      {
        id: '9.1',
        text: 'Patients treated with Alnyx had a median PFS of 12.4 months in Phase 2; patients treated with TALVEY had a median PFS of 7.5-11.9 months (0.4-0.8 mg/kg).',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '9.2',
        text: 'While not directly compared, treatment with Alnyx was characterised by a lower diversity of AEs with strong impact on living experience compared to TALVEY (which includes weight loss, dysgeusia, skin issues).',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '9.3',
        text: 'Alnyx has a convenient flat-dosing regimen, while TALVEY has a complex weight-based dosing regimen including a 3- to 4-dose step-up.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
    ],
  },
  {
    id: 'OH10',
    domain: 'clinical-differentiation',
    tag: 'Relative Dose Intensity',
    payerVoice:
      'Alnyx trials presented lower RDI than other MM therapies, which could impact overall patient survival and present a significant economic burden.',
    strength: 'aspirational',
    topLineResponse:
      'RDI does not have a significant impact on PFS or OS, and has been included as part of the primary treatment cost calculations.',
    reinforcedValueMessageIds: ['C2', 'E1'],
    reinforceText:
      'Alnyx provides patients with a deep and durable response, with treatment attributes associated with evidence for savings in total cost of care.',
    handlers: [
      {
        id: '10.1',
        text: 'RDI does not impact patient survival when defined as a binary variable at specified cut-off points, and the PFS and OS observed in RESCUE-MM have been achieved with the RDI observed in the trial.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '10.2',
        text: 'RDIs were included as part of the primary treatment cost calculations for both primary treatment and administration costs.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
    ],
  },

  // ─── Domain 4: Economic Value (4 objections) ───
  {
    id: 'OH11',
    domain: 'economic-value',
    tag: 'Wastage',
    payerVoice:
      "Wastage from Alnyx's initial step-up dose offsets the benefits of no wastage during the remainder of its administration.",
    strength: 'strong',
    topLineResponse:
      'Alnyx has lower wastage in the maintenance phase and overall, relative to TECVAYLI and TALVEY.',
    reinforcedValueMessageIds: ['E4'],
    reinforceText:
      'Alnyx is easier for pharmacists to manage due to the non-weight-based dosing, and as such has lower HCP utilisation and wastage.',
    handlers: [
      {
        id: '11.1',
        text: 'Alnyx requires two step-up doses upon which it is administered weekly; after the step-up phase, Alnyx transitions to Q6W maintenance dosing.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '11.2',
        text: 'With its fixed dose, Alnyx has lower wastage than TECVAYLI and TALVEY and similar or lower wastage compared to other weight-based therapies.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
    ],
  },
  {
    id: 'OH12',
    domain: 'economic-value',
    tag: 'Cost of AE management',
    payerVoice:
      'General cost and management of AEs associated with Alnyx are expected to be high, considering the high rates of Grade 3/4 neutropenia, Grade 3/4 thrombocytopenia, and incidence of CRS.',
    strength: 'emerging',
    topLineResponse:
      'The overall cost to manage Grade 3/4 AEs with Alnyx is similar to other BsAbs, but lower than CAR-Ts.',
    reinforcedValueMessageIds: ['E1'],
    reinforceText:
      'Alnyx delays disease progression, which has been shown to yield reductions in downstream management costs in R/R MM.',
    handlers: [
      {
        id: '12.1',
        text: 'For Grade 3/4 AEs which require intervention and are associated with high costs to manage, Alnyx has similar rates relative to other BsAb therapies and lower rates relative to CAR-Ts.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '12.2',
        text: 'Emergence of supportive care protocols and class familiarity will continue to reduce costs of CRS management over time.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
    ],
  },
  {
    id: 'OH13',
    domain: 'economic-value',
    tag: 'Cost of infection management',
    payerVoice:
      'The general cost and management of infections associated with Alnyx will be substantially higher than other BsAb and CAR-T therapies, considering the high rates.',
    strength: 'strong',
    topLineResponse:
      'The overall infection rates with Alnyx are comparable relative to other BsAb and CAR-T therapies, and infections can be effectively managed with established protocols.',
    reinforcedValueMessageIds: ['E1'],
    reinforceText:
      'Alnyx delays disease progression, which has been shown to yield reductions in downstream management costs in R/R MM.',
    handlers: [
      {
        id: '13.1',
        text: 'Baseline infection rates are high in MM, but during treatment Alnyx has a similar incidence compared to other common MM treatments.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '13.2',
        text: 'During RESCUE-MM, infections were successfully managed via administration of IVIG therapies for a limited time, not incurring significant costs.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '13.3',
        text: 'Treatment with IVIGs has been shown to reduce serious infections in MM patients treated with anti-BCMA BsAbs.',
        supporting_articles: [],
        placeholder_publication_count: 3,
      },
      {
        id: '13.4',
        text: 'New recommendations on infection management will further support AE management in MM patients receiving BsAb therapy.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
    ],
  },
  {
    id: 'OH14',
    domain: 'economic-value',
    tag: 'Cost-effectiveness',
    payerVoice:
      '[UK example, need for market-specific data] Alnyx does not meet the cost-effectiveness threshold of £30,000 per QALY.',
    strength: 'aspirational',
    topLineResponse:
      'Alnyx is expected to be cost-effective compared to ABECMA, CARVYKTI, and TECVAYLI. Compared to existing treatments, and considering its anticipated survival benefit, Alnyx can be a valuable treatment choice for TCE MM patients — subject to Phase 3 confirmation and HTA submission.',
    reinforcedValueMessageIds: ['E2', 'E3'],
    reinforceText:
      'With displacement of later-line medicines and subsequent severe complications, reimbursement for Alnyx can yield significant cost offsets; Alnyx has a manageable budget impact, with cost-saving potential versus alternative regimens.',
    handlers: [
      {
        id: '14.1',
        text: '[UK example, need for market-specific data]: Alnyx is expected to be cost-effective (£) compared to ABECMA, CARVYKTI, and TECVAYLI based on indirect treatment comparison modelling.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
      {
        id: '14.2',
        text: 'Alnyx offers potentially greater QALYs relative to existing therapies, primarily driven by improved PFS and reduced treatment-cycling burden.',
        supporting_articles: [],
        placeholder_publication_count: 2,
      },
    ],
  },
];

export const OBJECTION_BY_ID: Record<string, Objection> = Object.fromEntries(
  OBJECTIONS.map(o => [o.id, o]),
);

// Helpers
export function getObjectionsForDomain(domain: ObjectionDomainKey): Objection[] {
  return OBJECTIONS.filter(o => o.domain === domain);
}

export function totalHandlersForDomain(domain: ObjectionDomainKey): number {
  return getObjectionsForDomain(domain).reduce((sum, o) => sum + o.handlers.length, 0);
}

export function totalPublicationsForDomain(domain: ObjectionDomainKey): number {
  return getObjectionsForDomain(domain).reduce(
    (sum, o) =>
      sum + o.handlers.reduce((hs, h) => hs + h.placeholder_publication_count, 0),
    0,
  );
}
