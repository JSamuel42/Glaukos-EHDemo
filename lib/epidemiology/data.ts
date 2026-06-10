/**
 * Pre-built 4L+ MM target population funnels for five demo markets.
 * Every funnel uses the same 7-level pathway (Adult Population →
 * Diagnosed Prevalence → 1L eligible → 2L → 3L → 4L → Heavily
 * Pretreated 4L+ target). Only the top-level absolute (country adult
 * population) and the Diagnosed Prevalence percentage differ per
 * country; everything below is shared so the funnels read as
 * comparable across markets.
 *
 * Publication tagging is deliberately sparse — US and Germany have a
 * couple of tagged Library Article IDs at specific levels, the rest
 * are empty so the demo can show both populated and empty-state
 * publication pop-ups.
 */

export type Country = 'US' | 'UK' | 'DE' | 'FR' | 'JP';

export interface FunnelLevel {
  id: string;
  name: string;
  description: string;
  /** % applied to the level above. Level 0 is anchored to topLevelAbsolute
   *  and uses 100 as a sentinel. Diagnosed Prevalence (l1) takes a fraction
   *  of total adult population (e.g. 0.062% in the US). */
  percentage: number;
  /** Final level — renders in mint to call out the Alnyx target population. */
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
};

/**
 * Standard 4L MM funnel template. `pubOverrides` lets each country
 * sparingly tag publications to specific levels. The top-level
 * Diagnosed Prevalence % is overridden per country at the FUNNELS
 * call-site because rates differ markedly across markets.
 */
function fourLMMLevels(pubOverrides: Record<string, string[]> = {}): FunnelLevel[] {
  return [
    {
      id: 'l0',
      name: 'Total Adult Population',
      description: 'Adults aged 18+',
      percentage: 100, // sentinel — anchor lives on topLevelAbsolute
      pubIds: pubOverrides.l0 ?? [],
    },
    {
      id: 'l1',
      name: 'Diagnosed Prevalence of MM',
      description: 'All stages — point prevalence',
      percentage: 0.062, // overridden per country
      pubIds: pubOverrides.l1 ?? [],
    },
    {
      id: 'l2',
      name: 'Eligible for Systemic 1L Therapy',
      description: 'After diagnosis, fit for active treatment',
      percentage: 87,
      pubIds: pubOverrides.l2 ?? [],
    },
    {
      id: 'l3',
      name: 'Progressed / Refractory to 1L',
      description: 'Progression on or after first-line therapy',
      percentage: 82,
      pubIds: pubOverrides.l3 ?? [],
    },
    {
      id: 'l4',
      name: 'Progressed / Refractory to 2L',
      description: 'Progression on or after second-line therapy',
      percentage: 73,
      pubIds: pubOverrides.l4 ?? [],
    },
    {
      id: 'l5',
      name: 'Progressed / Refractory to 3L',
      description: 'Progression on or after third-line therapy',
      percentage: 64,
      pubIds: pubOverrides.l5 ?? [],
    },
    {
      id: 'l6',
      name: 'Heavily Pretreated (4L+ MM)',
      description: 'Target population for Alnyx',
      percentage: 52,
      isTarget: true,
      pubIds: pubOverrides.l6 ?? [],
    },
  ];
}

/** Apply a per-country override to the Diagnosed Prevalence (l1) %. */
function withPrevalence(levels: FunnelLevel[], prevalencePct: number): FunnelLevel[] {
  return levels.map(l => (l.id === 'l1' ? { ...l, percentage: prevalencePct } : l));
}

export const FUNNELS: Funnel[] = [
  {
    id: 'us-4lmm',
    name: '4L+ MM — United States',
    country: 'US',
    countryFullName: 'United States',
    ageGroup: 'Adults',
    topLevelAbsolute: 258_300_000,
    lastSaved: '2026-04-22',
    levels: withPrevalence(
      fourLMMLevels({
        l1: ['Ailawadhi, 2024b'],
        l6: ['Wang, 2022', 'Ahmed, 2023', 'Kumar, 2023'],
      }),
      0.062,
    ),
  },
  {
    id: 'uk-4lmm',
    name: '4L+ MM — United Kingdom',
    country: 'UK',
    countryFullName: 'United Kingdom',
    ageGroup: 'Adults',
    topLevelAbsolute: 53_100_000,
    lastSaved: '2026-05-03',
    levels: withPrevalence(fourLMMLevels(), 0.041),
  },
  {
    id: 'de-4lmm',
    name: '4L+ MM — Germany',
    country: 'DE',
    countryFullName: 'Germany',
    ageGroup: 'Adults',
    topLevelAbsolute: 70_200_000,
    lastSaved: '2026-05-08',
    levels: withPrevalence(
      fourLMMLevels({
        l1: ['Sager, 2025'],
      }),
      0.043,
    ),
  },
  {
    id: 'fr-4lmm',
    name: '4L+ MM — France',
    country: 'FR',
    countryFullName: 'France',
    ageGroup: 'Adults',
    topLevelAbsolute: 52_400_000,
    lastSaved: '2026-04-30',
    levels: withPrevalence(fourLMMLevels(), 0.046),
  },
  {
    id: 'jp-4lmm',
    name: '4L+ MM — Japan',
    country: 'JP',
    countryFullName: 'Japan',
    ageGroup: 'Adults',
    topLevelAbsolute: 104_500_000,
    lastSaved: '2026-04-15',
    levels: withPrevalence(fourLMMLevels(), 0.028),
  },
];

export function getFunnel(id: string): Funnel | undefined {
  return FUNNELS.find(f => f.id === id);
}
