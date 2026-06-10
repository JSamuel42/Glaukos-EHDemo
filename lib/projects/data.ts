export type ActivityStatus = 'Planned' | 'In Progress' | 'Complete';
export type Section = 'global' | 'local';

export interface Activity {
  id: string;
  section: Section;
  name: string;
  owner: string;
  status: ActivityStatus;
  startYear: number;
  startMonth: number; // 1-12
  endYear: number;
  endMonth: number; // 1-12
  outcomesHeadline: string;
  outcomesFull: string;
  /** Linkage to Integrated Evidence Plan codes — value-message IDs
   *  (E1, C2, P3, D1), Objection codes (OH3), Statement codes (S1), or
   *  the special "GVD" badge. Categories drive pill colour. */
  iepLinkage: string[];
}

export const ACTIVITIES: Activity[] = [
  // ───── GLOBAL ─────
  {
    id: 'g1',
    section: 'global',
    name: 'Post-approval IEP refresh',
    owner: 'Global HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 3,
    outcomesHeadline: 'Updated evidence roadmap aligned to approval strategy',
    outcomesFull:
      'Refresh the Integrated Evidence Plan following FDA approval, incorporating the final label, evolving regulatory feedback, HTA requirements, and priority evidence gaps. The output will provide a single cross-functional roadmap linking evidence activities to value messages, market needs, and launch-critical decisions.',
    iepLinkage: [],
  },
  {
    id: 'g2',
    section: 'global',
    name: 'Affiliate evidence needs assessment',
    owner: 'Global HEOR + Regional Market Access',
    status: 'In Progress',
    startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 4,
    outcomesHeadline: 'Prioritised evidence gaps across key affiliates',
    outcomesFull:
      'Capture evidence needs from priority affiliates, including comparator expectations, local epidemiology, treatment pathway uncertainty, budget impact requirements, and payer objections. Findings will be used to prioritise global evidence generation and avoid duplication of local studies.',
    iepLinkage: [],
  },
  {
    id: 'g3',
    section: 'global',
    name: 'Global Value Dossier update',
    owner: 'Global HEOR + Global Medical Affairs',
    status: 'In Progress',
    startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 5,
    outcomesHeadline: 'Updated value story for global reimbursement support',
    outcomesFull:
      'Update the GVD to reflect the FDA-approved label, latest pivotal trial publication, comparative evidence, economic messaging, and patient-centred value narrative. The output will serve as the core source document for affiliate reimbursement dossiers, payer materials, and launch evidence tools.',
    iepLinkage: ['GVD'],
  },
  {
    id: 'g4',
    section: 'global',
    name: 'MAIC versus Carvykti',
    owner: 'Global HEOR + Biostatistics',
    status: 'In Progress',
    startYear: 2026, startMonth: 2, endYear: 2026, endMonth: 12,
    outcomesHeadline: 'Comparative evidence versus key 3L+ comparator',
    outcomesFull:
      'Conduct a matching-adjusted indirect comparison against Carvykti in 3L+ relapsed/refractory multiple myeloma, subject to feasibility and data availability. The study will support comparative value messaging, HTA submissions, and payer discussions where direct head-to-head evidence is unavailable.',
    iepLinkage: ['C2', 'E2'],
  },
  {
    id: 'g5',
    section: 'global',
    name: 'Global cost-effectiveness model',
    owner: 'Global HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 6,
    outcomesHeadline: 'Core model for HTA market adaptation',
    outcomesFull:
      'Develop a global cost-effectiveness model incorporating survival, progression, treatment duration, adverse events, utilities, and downstream resource use. The model will provide the economic backbone for NICE, CADTH, PBAC, and other QALY-based HTA submissions.',
    iepLinkage: ['E1', 'E2'],
  },
  {
    id: 'g6',
    section: 'global',
    name: 'Global budget impact model',
    owner: 'Global HEOR + Global Market Access',
    status: 'In Progress',
    startYear: 2026, startMonth: 2, endYear: 2026, endMonth: 5,
    outcomesHeadline: 'Adaptable affordability model for payer planning',
    outcomesFull:
      'Develop a global budget impact model to estimate eligible population, uptake, treatment costs, monitoring, adverse event costs, and displacement of existing therapies. The model will support local payer affordability discussions and country-specific budget impact adaptations.',
    iepLinkage: ['E3', 'E4'],
  },
  {
    id: 'g7',
    section: 'global',
    name: 'Survival extrapolation validation',
    owner: 'Global HEOR + External Clinical Experts',
    status: 'In Progress',
    startYear: 2026, startMonth: 4, endYear: 2026, endMonth: 9,
    outcomesHeadline: 'Validated long-term survival assumptions for HTA',
    outcomesFull:
      'Validate survival extrapolation approaches for OS, PFS, and treatment duration using clinical expert input, statistical diagnostics, and external evidence. The output will strengthen economic model credibility and support responses to HTA scrutiny around immature survival data.',
    iepLinkage: ['C1', 'P1', 'E1'],
  },
  {
    id: 'g8',
    section: 'global',
    name: 'Patient preference evidence synthesis',
    owner: 'Global HEOR + Patient Engagement',
    status: 'Planned',
    startYear: 2026, startMonth: 7, endYear: 2027, endMonth: 2,
    outcomesHeadline: 'Patient-centred evidence for value messaging',
    outcomesFull:
      'Synthesize published evidence on patient preferences in RRMM, including trade-offs between efficacy, toxicity, treatment convenience, administration setting, and durability of response. Findings will support patient-centred value claims, payer narratives, and affiliate evidence materials.',
    iepLinkage: ['C3', 'P3', 'P4'],
  },

  // ───── LOCAL ─────
  {
    id: 'l1',
    section: 'local',
    name: 'US AMCP dossier update',
    owner: 'US HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 3,
    outcomesHeadline: 'Payer-ready US evidence package post-approval',
    outcomesFull:
      'Update the AMCP dossier to reflect the FDA-approved label, pivotal evidence, safety profile, place in therapy, economic evidence, and anticipated payer questions. The dossier will support US payer engagement, formulary reviews, and medical account team discussions.',
    iepLinkage: ['E1', 'E2', 'OH3'],
  },
  {
    id: 'l2',
    section: 'local',
    name: 'US payer BIM adaptation',
    owner: 'US HEOR + US Market Access',
    status: 'In Progress',
    startYear: 2026, startMonth: 2, endYear: 2026, endMonth: 5,
    outcomesHeadline: 'US-specific affordability evidence for payers',
    outcomesFull:
      'Adapt the global budget impact model for US commercial and managed care payer needs, including US costs, uptake assumptions, eligible population, treatment mix, and plan-level scenarios. The output will support formulary discussions and payer objection handling around affordability.',
    iepLinkage: ['E3', 'E4', 'OH6'],
  },
  {
    id: 'l3',
    section: 'local',
    name: 'US Medicare population analysis',
    owner: 'US HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 4, endYear: 2026, endMonth: 8,
    outcomesHeadline: 'Medicare-specific population and cost impact insights',
    outcomesFull:
      'Assess the size, characteristics, treatment patterns, and potential cost impact of the Medicare-relevant RRMM population. The analysis will support payer discussions where older, heavily pre-treated patients represent a major component of expected use.',
    iepLinkage: ['E3', 'OH7'],
  },
  {
    id: 'l4',
    section: 'local',
    name: 'Germany subgroup analysis',
    owner: 'Germany HEOR + Global Biostatistics',
    status: 'In Progress',
    startYear: 2026, startMonth: 3, endYear: 2026, endMonth: 7,
    outcomesHeadline: 'Subgroup evidence for added-benefit assessment',
    outcomesFull:
      'Develop subgroup evidence aligned to German AMNOG requirements, including prior therapy, refractory status, cytogenetic risk, age, and other clinically relevant characteristics. Outputs will support added-benefit arguments and strengthen the evidence package for relevant patient subpopulations.',
    iepLinkage: ['C1', 'C2'],
  },
  {
    id: 'l5',
    section: 'local',
    name: 'AMNOG submission package',
    owner: 'Germany Market Access + Germany HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 3, endYear: 2026, endMonth: 8,
    outcomesHeadline: 'German added-benefit dossier inputs finalised',
    outcomesFull:
      'Prepare the AMNOG evidence package, including clinical benefit, comparator justification, patient-relevant outcomes, subgroup evidence, safety, and target population inputs. The package will support German reimbursement assessment and early price negotiation positioning.',
    iepLinkage: ['C1', 'C2', 'E1'],
  },
  {
    id: 'l6',
    section: 'local',
    name: 'UK CE model adaptation',
    owner: 'UK HEOR + Global HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 2, endYear: 2026, endMonth: 7,
    outcomesHeadline: 'NICE-ready cost-effectiveness model adaptation',
    outcomesFull:
      'Adapt the global cost-effectiveness model to the UK setting, incorporating NHS costs, NICE-preferred assumptions, utilities, comparator pathways, subsequent therapies, and survival extrapolation scenarios. The output will form the central economic evidence for NICE appraisal.',
    iepLinkage: ['E1', 'E2', 'C1'],
  },
  {
    id: 'l7',
    section: 'local',
    name: 'NICE submission support',
    owner: 'UK Market Access + UK HEOR',
    status: 'Planned',
    startYear: 2026, startMonth: 8, endYear: 2027, endMonth: 3,
    outcomesHeadline: 'Submission and committee readiness support',
    outcomesFull:
      'Support preparation of the NICE submission, evidence critique responses, committee briefing materials, and scenario analyses. The project will ensure clinical, economic, and patient evidence are presented coherently and are ready for likely Evidence Review Group challenges.',
    iepLinkage: ['E1', 'E2', 'OH3'],
  },
  {
    id: 'l8',
    section: 'local',
    name: 'Canada model adaptation',
    owner: 'Canada HEOR + Global HEOR',
    status: 'In Progress',
    startYear: 2026, startMonth: 5, endYear: 2026, endMonth: 11,
    outcomesHeadline: 'CDA-AMC-ready economic model and evidence package',
    outcomesFull:
      'Adapt the global cost-effectiveness and budget impact models for the Canadian setting, including local comparators, costs, utilities, epidemiology, and public payer assumptions. The output will support CDA-AMC submission and provincial payer discussions.',
    iepLinkage: ['E1', 'E2', 'E3'],
  },
  {
    id: 'l9',
    section: 'local',
    name: 'Japan subgroup bridging evidence',
    owner: 'Japan HEOR + Japan Medical Affairs',
    status: 'Planned',
    startYear: 2026, startMonth: 7, endYear: 2026, endMonth: 12,
    outcomesHeadline: 'Local relevance of global evidence established',
    outcomesFull:
      'Assess applicability of global trial evidence to Japanese patients, including subgroup outcomes, safety, treatment patterns, and clinical practice relevance. The output will support local regulatory, reimbursement, and medical communication needs.',
    iepLinkage: ['C1', 'P1'],
  },
  {
    id: 'l10',
    section: 'local',
    name: 'China RRMM epidemiology study',
    owner: 'China HEOR',
    status: 'Planned',
    startYear: 2026, startMonth: 7, endYear: 2027, endMonth: 3,
    outcomesHeadline: 'Eligible population and patient-flow estimates defined',
    outcomesFull:
      'Generate China-specific estimates for RRMM epidemiology, line-of-therapy distribution, eligible population, and patient flow through the treatment pathway. The study will inform access planning, budget impact modelling, and future reimbursement strategy.',
    iepLinkage: ['E3', 'P1'],
  },
  {
    id: 'l11',
    section: 'local',
    name: 'China treatment pathway validation',
    owner: 'China Medical Affairs + China HEOR',
    status: 'Planned',
    startYear: 2027, startMonth: 4, endYear: 2027, endMonth: 8,
    outcomesHeadline: 'Local pathway and comparator assumptions validated',
    outcomesFull:
      'Validate China-specific RRMM treatment pathways, sequencing, comparator relevance, and likely place in therapy through KOL engagement. Outputs will strengthen local evidence assumptions and support future budget impact and reimbursement planning.',
    iepLinkage: ['C1', 'D1'],
  },
  {
    id: 'l12',
    section: 'local',
    name: 'Australia PBAC model adaptation',
    owner: 'Australia HEOR + Global HEOR',
    status: 'Planned',
    startYear: 2026, startMonth: 10, endYear: 2027, endMonth: 5,
    outcomesHeadline: 'PBAC-ready model aligned to local requirements',
    outcomesFull:
      'Adapt the global economic model for Australian PBAC requirements, including local costs, comparator pathways, utilities, survival assumptions, and uncertainty analyses. The output will support reimbursement submission and pricing discussions in Australia.',
    iepLinkage: ['E1', 'E2', 'E3'],
  },
];
