/**
 * Open-Angle Glaucoma L1→L5 patient funnels for six demo markets, ending at
 * the surgical-eligible (MIGS) population — the iStent infinite indication.
 *
 * Each funnel cascades from total adults aged 40+ down the disease funnel:
 *   General prevalence → Diagnosed → Treated → Uncontrolled / advanced →
 *   Surgical-eligible (MIGS).
 * The tier labels align with the Library's funnel tags (L2 general prevalence,
 * L3 diagnosed, L4 treated/uncontrolled, L5 surgical-eligible) so the
 * Epidemiology funnel, the Library, and the dossier tell one consistent story.
 *
 * DATA NOTE: per the source evidence base (abstract-only), per-country
 * conversion rates and the surgical-eligible (MIGS) proportion are NOT directly
 * reported in the literature — the dossier itself flags this gap. The
 * percentages below are therefore ILLUSTRATIVE, literature-informed demo
 * estimates (e.g. higher undiagnosed fractions in Japan and India), not
 * published figures. General-prevalence anchors draw on the tagged Library
 * evidence (global incidence, European ~2.6%, US diagnosed ~2.9% of ≥65,
 * Northeast-Asia myopic OAG). They are per-country and editable in the workspace.
 */

export type Country = 'US' | 'UK' | 'DE' | 'FR' | 'JP' | 'IN';

export interface FunnelLevel {
  id: string;
  name: string;
  description: string;
  /** % applied to the level above. Level 0 is anchored to topLevelAbsolute
   *  and uses 100 as a sentinel. */
  percentage: number;
  /** Final level — renders in mint to call out the surgical-eligible (iStent infinite) target. */
  isTarget?: boolean;
  /** Library Article IDs tagged to this level. Resolved at render-time
   *  against ARTICLES from /lib/library/data.ts. */
  pubIds: string[];
}

export interface Funnel {
  id: string;
  name: string;
  country: Country;
  countryFullName: string;
  ageGroup: 'Total' | 'Adults' | 'Children' | 'Elderly';
  topLevelAbsolute: number;
  /** ISO date — illustrative, no persistence behind it. */
  lastSaved: string;
  levels: FunnelLevel[];
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  US: '🇺🇸',
  UK: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  IN: '🇮🇳',
};

// Library Article IDs tagged at each funnel tier (shared across markets — the
// underlying evidence is global/regional, classified by funnel level).
const PUBS = {
  overview: ['Jayaram, 2023'],
  prevalence: ['Shan, 2024', 'Gallo Afflitto, 2022', 'Founti, 2021', 'Jeong, 2021'],
  diagnosed: ['Tseng, 2023', 'Downs, 2024', 'Aspberg, 2021'],
  treated: ['Phu, 2021', 'Newman-Casey, 2019'],
  uncontrolled: ['King, 2024', 'Kastner, 2019', 'Nayyar, 2022', 'Shin, 2024', 'Seresirikachorn, 2025'],
  surgical: ['Bicket, 2021', 'Voykov, 2025', 'Loon, 2024', 'Swaminathan, 2024', 'Panarelli, 2023', 'Governatori, 2024', 'Sandhu, 2021'],
} as const;

/** Per-country conversion percentages down the OAG funnel. */
interface FunnelRates {
  /** General OAG prevalence as % of adults 40+. */
  prevalence: number;
  /** Diagnosed as % of prevalent (the rest are undiagnosed). */
  diagnosed: number;
  /** Treated as % of diagnosed (on IOP-lowering therapy). */
  treated: number;
  /** Uncontrolled / advanced despite therapy, as % of treated. */
  uncontrolled: number;
  /** Surgical-eligible (MIGS) as % of uncontrolled. */
  surgical: number;
}

/** Build the 6-tier OAG funnel for a market from its conversion rates. */
function glaucomaLevels(r: FunnelRates): FunnelLevel[] {
  return [
    {
      id: 'l0',
      name: 'Total Adult Population (40+)',
      description: 'Adults aged 40 and over — the at-risk denominator',
      percentage: 100, // sentinel — anchor lives on topLevelAbsolute
      pubIds: [...PUBS.overview],
    },
    {
      id: 'l1',
      name: 'General Prevalence of OAG',
      description: 'L2 · open-angle glaucoma across the population (diagnosed + undiagnosed)',
      percentage: r.prevalence,
      pubIds: [...PUBS.prevalence],
    },
    {
      id: 'l2',
      name: 'Diagnosed OAG',
      description: 'L3 · identified within the healthcare system (large undiagnosed fraction excluded)',
      percentage: r.diagnosed,
      pubIds: [...PUBS.diagnosed],
    },
    {
      id: 'l3',
      name: 'Treated',
      description: 'L4 · receiving IOP-lowering therapy',
      percentage: r.treated,
      pubIds: [...PUBS.treated],
    },
    {
      id: 'l4',
      name: 'Uncontrolled / Advanced',
      description: 'L4 · progressing or not at target IOP despite therapy',
      percentage: r.uncontrolled,
      pubIds: [...PUBS.uncontrolled],
    },
    {
      id: 'l5',
      name: 'Surgical-Eligible (MIGS)',
      description: 'L5 · candidates for minimally invasive glaucoma surgery — iStent infinite target',
      percentage: r.surgical,
      isTarget: true,
      pubIds: [...PUBS.surgical],
    },
  ];
}

export const FUNNELS: Funnel[] = [
  {
    id: 'us-oag',
    name: 'OAG Surgical Funnel — United States',
    country: 'US',
    countryFullName: 'United States',
    ageGroup: 'Adults',
    topLevelAbsolute: 170_000_000,
    lastSaved: '2026-05-30',
    levels: glaucomaLevels({ prevalence: 2.3, diagnosed: 60, treated: 88, uncontrolled: 38, surgical: 38 }),
  },
  {
    id: 'uk-oag',
    name: 'OAG Surgical Funnel — United Kingdom',
    country: 'UK',
    countryFullName: 'United Kingdom',
    ageGroup: 'Adults',
    topLevelAbsolute: 32_000_000,
    lastSaved: '2026-05-28',
    levels: glaucomaLevels({ prevalence: 2.0, diagnosed: 63, treated: 90, uncontrolled: 40, surgical: 35 }),
  },
  {
    id: 'de-oag',
    name: 'OAG Surgical Funnel — Germany',
    country: 'DE',
    countryFullName: 'Germany',
    ageGroup: 'Adults',
    topLevelAbsolute: 45_000_000,
    lastSaved: '2026-05-26',
    levels: glaucomaLevels({ prevalence: 1.9, diagnosed: 60, treated: 88, uncontrolled: 40, surgical: 36 }),
  },
  {
    id: 'fr-oag',
    name: 'OAG Surgical Funnel — France',
    country: 'FR',
    countryFullName: 'France',
    ageGroup: 'Adults',
    topLevelAbsolute: 33_000_000,
    lastSaved: '2026-05-24',
    levels: glaucomaLevels({ prevalence: 2.1, diagnosed: 58, treated: 86, uncontrolled: 42, surgical: 34 }),
  },
  {
    id: 'jp-oag',
    name: 'OAG Surgical Funnel — Japan',
    country: 'JP',
    countryFullName: 'Japan',
    ageGroup: 'Adults',
    topLevelAbsolute: 70_000_000,
    lastSaved: '2026-05-22',
    // Japan: notably higher OAG/NTG prevalence but a large undiagnosed fraction.
    levels: glaucomaLevels({ prevalence: 3.9, diagnosed: 30, treated: 85, uncontrolled: 45, surgical: 32 }),
  },
  {
    id: 'in-oag',
    name: 'OAG Surgical Funnel — India',
    country: 'IN',
    countryFullName: 'India',
    ageGroup: 'Adults',
    topLevelAbsolute: 430_000_000,
    lastSaved: '2026-05-20',
    // India: very high undiagnosed fraction and lower treatment access.
    levels: glaucomaLevels({ prevalence: 2.7, diagnosed: 25, treated: 70, uncontrolled: 50, surgical: 30 }),
  },
];

export function getFunnel(id: string): Funnel | undefined {
  return FUNNELS.find(f => f.id === id);
}
