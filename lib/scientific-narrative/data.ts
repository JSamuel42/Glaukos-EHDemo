export type PillarKey = 'burden' | 'clinical-development' | 'efficacy' | 'patient-impact';

export interface ScientificStatement {
  id: string; // e.g., "S1", "S2"
  pillar: PillarKey;
  text: string;
  /** Empty for now; populated by the end-of-cluster article-linking pass. */
  supporting_articles: string[];
  placeholder_publication_count: number;
}

export interface PillarDef {
  key: PillarKey;
  /** Short name used on the Pillars page tiles. */
  name: string;
  /** Full name used in breadcrumbs and detail-page heading. Pillar 1
   *  intentionally has no 'Alnyx –' prefix (it's the burden context). */
  fullName: string;
  /** Pillar number (1-4). */
  number: number;
  /** 1-2 char code shown faintly on the gradient tile. */
  monogram: string;
  gradient_class: string;
  text_on_gradient_class: string;
  banner_class: string;
  strategicImperative: string;
  scientificPosition: string;
}

// 4 pillars
export const PILLARS: PillarDef[] = [
  {
    key: 'burden',
    name: 'Burden & Unmet Need',
    fullName: 'Burden & Unmet Need',
    number: 1,
    monogram: 'B',
    gradient_class: 'bg-gradient-to-br from-orange-100 via-rose-50 to-rose-100',
    text_on_gradient_class: 'text-orange-700/15',
    banner_class: 'bg-gradient-to-br from-orange-50 via-rose-50 to-rose-100',
    strategicImperative:
      'Highlight the impact of disease on patients and the dramatic consequences of relapsed/refractory multiple myeloma, and the unmet need that persists despite currently available treatments — the need for better outcomes for patients.',
    scientificPosition:
      'Despite advances in targeted therapy and immunotherapy, patients with triple-class-exposed (TCE) relapsed/refractory multiple myeloma continue to face poor prognoses due to emerging resistance and limited durable treatment options.',
  },
  {
    key: 'clinical-development',
    name: 'Clinical Development',
    fullName: 'Alnyx – Clinical Development',
    number: 2,
    monogram: 'CD',
    gradient_class: 'bg-gradient-to-br from-cyan-100 via-cyan-50 to-teal-50',
    text_on_gradient_class: 'text-cyan-700/15',
    banner_class: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100',
    strategicImperative:
      'Provide a mechanistic and pre-clinical rationale for targeting BCMA × CD3 bispecific T-cell engagement in relapsed/refractory multiple myeloma, and convey the reasons for differential clinical response.',
    scientificPosition:
      'Alnyx was developed to address resistance-driven disease progression through high-affinity simultaneous engagement of BCMA on malignant plasma cells and CD3 on cytotoxic T cells.',
  },
  {
    key: 'efficacy',
    name: 'Efficacy',
    fullName: 'Alnyx – Efficacy',
    number: 3,
    monogram: 'E',
    gradient_class: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50',
    text_on_gradient_class: 'text-emerald-700/15',
    banner_class: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
    strategicImperative:
      'Summarise the safety and efficacy of alphabetinib demonstrated in the pivotal Phase 2 trial in R/R Multiple Myeloma, convey the magnitude of clinical effect, holistic benefits, and manageable safety and tolerability profile.',
    scientificPosition:
      'Clinical trials have demonstrated that alphabetinib delivers meaningful, durable responses and improved outcomes in triple-class-exposed R/R Multiple Myeloma, with a well-characterised and manageable safety profile.',
  },
  {
    key: 'patient-impact',
    name: 'Patient Impact',
    fullName: 'Alnyx – Patient Impact',
    number: 4,
    monogram: 'PI',
    gradient_class: 'bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-50',
    text_on_gradient_class: 'text-purple-700/15',
    banner_class: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
    strategicImperative:
      'Provide a rationale for incorporating Alnyx into clinical practice as a new treatment paradigm to improve patient outcomes in R/R Multiple Myeloma.',
    scientificPosition:
      'By overcoming therapeutic resistance and achieving durable disease control, alphabetinib has the potential to transform patient outcomes and redefine standard care in triple-class-exposed R/R Multiple Myeloma.',
  },
];

export const PILLAR_BY_KEY: Record<PillarKey, PillarDef> = Object.fromEntries(
  PILLARS.map(p => [p.key, p]),
) as Record<PillarKey, PillarDef>;

// 14 statements clustered by pillar:
//   S1-S3 burden, S4-S6 clinical-development, S7-S10 efficacy, S11-S14 patient-impact
export const SCIENTIFIC_STATEMENTS: ScientificStatement[] = [
  // Pillar 1: Burden & Unmet Need
  {
    id: 'S1',
    pillar: 'burden',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Patients with advanced multiple myeloma often relapse after multiple lines of targeted therapy, facing limited effective options and declining quality of life.',
  },
  {
    id: 'S2',
    pillar: 'burden',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Advanced multiple myeloma remains a devastating malignancy with poor long-term survival once resistance to current regimens develops.',
  },
  {
    id: 'S3',
    pillar: 'burden',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'There is a critical need for therapies capable of overcoming resistance, restoring durable disease control, and extending survival.',
  },

  // Pillar 2: Clinical Development
  {
    id: 'S4',
    pillar: 'clinical-development',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: "Alnyx is a next-generation bispecific antibody engineered to simultaneously bind BCMA on multiple myeloma cells and CD3 on T cells, redirecting the patient's own immune response to the tumour.",
  },
  {
    id: 'S5',
    pillar: 'clinical-development',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Bispecific T-cell engagement bypasses the dependence on prior treatment classes (PIs, IMiDs, anti-CD38 mAbs), inducing apoptosis in tumour cells harbouring resistance mutations to those classes.',
  },
  {
    id: 'S6',
    pillar: 'clinical-development',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'The unique mechanism differs from CAR-T (which requires manufacturing and lymphodepletion) and from ADCs (which target a single antigen without immune redirection), offering the potential for profound, prolonged, and meaningful impact on outcomes.',
  },

  // Pillar 3: Efficacy
  {
    id: 'S7',
    pillar: 'efficacy',
    placeholder_publication_count: 4,
    supporting_articles: [],
    text: 'In the pivotal RESCUE-MM Phase 2 trial, alphabetinib achieved an overall response rate of 78.5% (95% CI: 71.2–84.6%) in heavily pre-treated TCE R/R MM patients.',
  },
  {
    id: 'S8',
    pillar: 'efficacy',
    placeholder_publication_count: 4,
    supporting_articles: [],
    text: 'RESCUE-MM showed deep and durable responses, with median progression-free survival of 12.4 months and duration of response of 16.2 months at the time of analysis.',
  },
  {
    id: 'S9',
    pillar: 'efficacy',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Clinical benefit was observed across subgroups, including patients with high-risk cytogenetics, extramedullary disease, and prior exposure to BCMA-directed therapies.',
  },
  {
    id: 'S10',
    pillar: 'efficacy',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Alnyx demonstrated a predictable, manageable safety profile with primarily low-grade cytokine release syndrome (85% Grade 1/2) resolving with standard intervention.',
  },

  // Pillar 4: Patient Impact
  {
    id: 'S11',
    pillar: 'patient-impact',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Alnyx offers a new treatment horizon for patients who have exhausted existing targeted therapies and immunotherapy classes.',
  },
  {
    id: 'S12',
    pillar: 'patient-impact',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Bispecific BCMA × CD3 engagement provides renewed disease control and the potential for improved quality of life through deep, durable responses.',
  },
  {
    id: 'S13',
    pillar: 'patient-impact',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'Clinicians can integrate Alnyx confidently, given its robust efficacy and tolerability observed in the pivotal Phase 2 study, with Phase 3 confirmation pending.',
  },
  {
    id: 'S14',
    pillar: 'patient-impact',
    placeholder_publication_count: 3,
    supporting_articles: [],
    text: 'By addressing resistance-driven progression in the TCE setting, Alnyx has the potential to redefine long-term outcomes in this aggressive malignancy.',
  },
];

// Helpers
export function getStatementsForPillar(pillar: PillarKey): ScientificStatement[] {
  return SCIENTIFIC_STATEMENTS.filter(s => s.pillar === pillar);
}

export function totalPublicationsForPillar(pillar: PillarKey): number {
  return getStatementsForPillar(pillar).reduce(
    (sum, s) => sum + s.placeholder_publication_count,
    0,
  );
}

export const STATEMENT_BY_ID: Record<string, ScientificStatement> = Object.fromEntries(
  SCIENTIFIC_STATEMENTS.map(s => [s.id, s]),
);

// Module-level branding
export const MODULE_TITLE = 'Alnyx — Scientific Communication Platform';
export const MODULE_DESCRIPTION =
  "Explore Alnyx's core narrative, objectives, scientific position, medical messages and supportive evidence for its use in relapsed/refractory multiple myeloma.";
