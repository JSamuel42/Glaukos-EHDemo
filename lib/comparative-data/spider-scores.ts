import type { Dimension } from './ratings'

// Spider chart scores: 0–5 scale per product per dimension.
// Placeholder values — refine after rendering.

export const SPIDER_SCORES: Record<string, Record<Dimension, number>> = {
  Alnyx: {
    efficacy: 3.5,
    safety: 3,
    'dosing-admin': 4.5,
    hrqol: 3,
    'real-world': 1,
    itc: 1,
    economic: 1,
  },
  Tecvayli: {
    efficacy: 4,
    safety: 4,
    'dosing-admin': 2.5,
    hrqol: 3.5,
    'real-world': 4,
    itc: 4,
    economic: 3.5,
  },
  Elrexfio: {
    efficacy: 4,
    safety: 3.5,
    'dosing-admin': 2.5,
    hrqol: 3,
    'real-world': 3,
    itc: 3,
    economic: 3,
  },
  Talvey: {
    efficacy: 3.5,
    safety: 3,
    'dosing-admin': 2.5,
    hrqol: 3,
    'real-world': 2.5,
    itc: 2.5,
    economic: 2.5,
  },
  Lynozyfic: {
    efficacy: 3.5,
    safety: 3.5,
    'dosing-admin': 2.5,
    hrqol: 2.5,
    'real-world': 2,
    itc: 2,
    economic: 2,
  },
  Carvykti: {
    efficacy: 5,
    safety: 3,
    'dosing-admin': 5,
    hrqol: 4,
    'real-world': 3.5,
    itc: 4,
    economic: 3,
  },
  Abecma: {
    efficacy: 4,
    safety: 3,
    'dosing-admin': 5,
    hrqol: 3.5,
    'real-world': 3,
    itc: 3.5,
    economic: 2.5,
  },
  Blenrep: {
    efficacy: 3,
    safety: 2.5,
    'dosing-admin': 3.5,
    hrqol: 2.5,
    'real-world': 2.5,
    itc: 2.5,
    economic: 2,
  },
}

export function getSpiderScores(brandName: string): Record<Dimension, number> | null {
  return SPIDER_SCORES[brandName] ?? null
}
