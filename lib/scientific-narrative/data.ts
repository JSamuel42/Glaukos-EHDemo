export type PillarKey = 'burden' | 'clinical-development' | 'efficacy' | 'patient-impact';

export interface ScientificStatement {
  id: string; // e.g., "S1", "S2"
  pillar: PillarKey;
  text: string;
  /** Lead statement opens each pillar; the rest are support. */
  role: 'lead' | 'support';
  /** Empty for now; populated by the Phase 6 article-linking pass. */
  supporting_articles: string[];
  placeholder_publication_count: number;
}

export interface PillarDef {
  key: PillarKey;
  /** Short name used on the Pillars page tiles. */
  name: string;
  /** Full name used in breadcrumbs and detail-page heading. Pillar 1
   *  intentionally has no product prefix (it's the disease context). */
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

// 4 pillars — iStent infinite scientific narrative.
export const PILLARS: PillarDef[] = [
  {
    key: 'burden',
    name: 'Disease & Unmet Need',
    fullName: 'Disease & Unmet Need',
    number: 1,
    monogram: 'DU',
    gradient_class: 'bg-gradient-to-br from-orange-100 via-rose-50 to-rose-100',
    text_on_gradient_class: 'text-orange-700/15',
    banner_class: 'bg-gradient-to-br from-orange-50 via-rose-50 to-rose-100',
    strategicImperative:
      'Establish the uncontrolled, surgical-eligible open-angle glaucoma population and the narrow corridor between failed therapy and invasive filtration or tube surgery.',
    scientificPosition:
      'A defined open-angle glaucoma population stays uncontrolled despite maximum tolerated medical therapy and prior glaucoma surgery.',
  },
  {
    key: 'clinical-development',
    name: 'Mechanism & Innovation',
    fullName: 'iStent infinite – Mechanism & Innovation',
    number: 2,
    monogram: 'MI',
    gradient_class: 'bg-gradient-to-br from-cyan-100 via-cyan-50 to-teal-50',
    text_on_gradient_class: 'text-cyan-700/15',
    banner_class: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100',
    strategicImperative:
      'Convey how iStent infinite restores physiologic aqueous outflow as the first standalone micro-invasive implantable option in its indication.',
    scientificPosition:
      'iStent infinite restores physiologic aqueous outflow via three trabecular micro-bypass stents, implanted standalone.',
  },
  {
    key: 'efficacy',
    name: 'Clinical Efficacy',
    fullName: 'iStent infinite – Clinical Efficacy',
    number: 3,
    monogram: 'CE',
    gradient_class: 'bg-gradient-to-br from-emerald-100 via-emerald-50 to-green-50',
    text_on_gradient_class: 'text-emerald-700/15',
    banner_class: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
    strategicImperative:
      'Summarise the magnitude and durability of intraocular pressure reduction in a failed-prior-therapy population, as demonstrated in the pivotal trial.',
    scientificPosition:
      'Approximately 76% of a failed-prior-therapy open-angle glaucoma population met the responder endpoint at 12 months.',
  },
  {
    key: 'patient-impact',
    name: 'Safety & Procedural Profile',
    fullName: 'iStent infinite – Safety & Procedural Profile',
    number: 4,
    monogram: 'SP',
    gradient_class: 'bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-50',
    text_on_gradient_class: 'text-purple-700/15',
    banner_class: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
    strategicImperative:
      'Convey the favourable safety profile and the procedural advantages of an angle-based, options-preserving approach within a stepwise interventional pathway.',
    scientificPosition:
      'Favourable safety: no explants, infection, device-related interventions, or hypotony in the pivotal trial.',
  },
];

export const PILLAR_BY_KEY: Record<PillarKey, PillarDef> = Object.fromEntries(
  PILLARS.map(p => [p.key, p]),
) as Record<PillarKey, PillarDef>;

// 14 statements clustered by pillar (S1/S4/S7/S11 = lead):
//   S1-S3 Disease & Unmet Need, S4-S6 Mechanism & Innovation,
//   S7-S10 Clinical Efficacy, S11-S14 Safety & Procedural Profile
export const SCIENTIFIC_STATEMENTS: ScientificStatement[] = [
  // Pillar 1 — Disease & Unmet Need
  {
    id: 'S1', pillar: 'burden', role: 'lead', placeholder_publication_count: 3, supporting_articles: [],
    text: 'A defined open-angle glaucoma population stays uncontrolled despite maximum tolerated medical therapy and prior glaucoma surgery.',
  },
  {
    id: 'S2', pillar: 'burden', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: 'For these patients, the corridor between failed therapy and invasive filtration/tube surgery has historically been narrow.',
  },
  {
    id: 'S3', pillar: 'burden', role: 'support', placeholder_publication_count: 3, supporting_articles: [],
    text: 'Persistent elevated intraocular pressure drives ongoing, irreversible optic nerve damage — durable IOP control is the central goal.',
  },

  // Pillar 2 — Mechanism & Innovation
  {
    id: 'S4', pillar: 'clinical-development', role: 'lead', placeholder_publication_count: 2, supporting_articles: [],
    text: 'iStent infinite restores physiologic aqueous outflow via three trabecular micro-bypass stents, implanted standalone.',
  },
  {
    id: 'S5', pillar: 'clinical-development', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: "Stents create multiple arcs of outflow across Schlemm's canal while occupying a minimal fraction of it, preserving natural anatomy.",
  },
  {
    id: 'S6', pillar: 'clinical-development', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: 'First standalone micro-invasive implantable option in its indication — extends interventional glaucoma to later-stage, refractory disease.',
  },

  // Pillar 3 — Clinical Efficacy
  {
    id: 'S7', pillar: 'efficacy', role: 'lead', placeholder_publication_count: 2, supporting_articles: [],
    text: 'Approximately 76% of a failed-prior-therapy open-angle glaucoma population met the responder endpoint at 12 months.',
  },
  {
    id: 'S8', pillar: 'efficacy', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: 'Mean diurnal intraocular pressure fell 5.9 mmHg from a medicated baseline of ~23.4 mmHg at month 12.',
  },
  {
    id: 'S9', pillar: 'efficacy', role: 'support', placeholder_publication_count: 1, supporting_articles: [],
    text: 'Responses were achieved on the same or fewer intraocular-pressure-lowering medication classes.',
  },
  {
    id: 'S10', pillar: 'efficacy', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: '53% achieved a ≥30% intraocular pressure reduction without additional surgical intervention.',
  },

  // Pillar 4 — Safety & Procedural Profile
  {
    id: 'S11', pillar: 'patient-impact', role: 'lead', placeholder_publication_count: 2, supporting_articles: [],
    text: 'Favourable safety: no explants, infection, device-related interventions, or hypotony in the pivotal trial.',
  },
  {
    id: 'S12', pillar: 'patient-impact', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: 'A micro-invasive, angle-based approach minimises tissue disruption versus filtration or tube surgery.',
  },
  {
    id: 'S13', pillar: 'patient-impact', role: 'support', placeholder_publication_count: 1, supporting_articles: [],
    text: 'Standalone implantation preserves future surgical options — supporting a stepwise interventional pathway.',
  },
  {
    id: 'S14', pillar: 'patient-impact', role: 'support', placeholder_publication_count: 2, supporting_articles: [],
    text: 'Backed by a two-decade iStent evidence legacy across the trabecular micro-bypass platform.',
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
export const MODULE_TITLE = 'iStent infinite — Scientific Communication Platform';
export const MODULE_DESCRIPTION =
  "Explore iStent infinite's core narrative, scientific position, and supporting evidence for standalone use in adults with open-angle glaucoma uncontrolled by prior medical and surgical therapy.";
