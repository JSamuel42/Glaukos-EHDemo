// EDITABLE: refine these ratings after seeing the Evidence Grid render.
//
// Two layers:
//   1. ALNYX_STRENGTH_RATINGS — Strong/Parity/Weak vs whole cohort per dimension
//   2. BEST_IN_CLASS — leading competitor per dimension
//
// Spider chart scores live in spider-scores.ts.

export type StrengthRating = 'strong' | 'parity' | 'weak' | 'not-yet-assessed'

export const DIMENSIONS = [
  'efficacy',
  'safety',
  'dosing-admin',
  'hrqol',
  'real-world',
  'itc',
  'economic',
] as const

export type Dimension = (typeof DIMENSIONS)[number]

export const DIMENSION_LABEL: Record<Dimension, string> = {
  efficacy: 'Efficacy',
  safety: 'Safety',
  'dosing-admin': 'Dosing & Admin',
  hrqol: 'HRQoL',
  'real-world': 'Real-world Evidence',
  itc: 'Indirect Treatment Comparison',
  economic: 'Economic Value',
}

export const ALNYX_STRENGTH_RATINGS: Record<
  Dimension,
  { rating: StrengthRating; rationale: string }
> = {
  efficacy: {
    rating: 'parity',
    rationale:
      'Phase 2 ORR 78.5% comparable to bispecific class; awaiting Phase 3 confirmation.',
  },
  safety: {
    rating: 'parity',
    rationale: 'Bispecific-class CRS/neurotoxicity profile, mostly low grade.',
  },
  'dosing-admin': {
    rating: 'strong',
    rationale:
      'SC Q6W maintenance is the least frequent in the bispecific class; only CAR-Ts (single infusion) more convenient.',
  },
  hrqol: {
    rating: 'parity',
    rationale:
      'Phase 2 PROs show pain and symptom improvements; comparable to peer evidence.',
  },
  'real-world': {
    rating: 'not-yet-assessed',
    rationale: 'Pre-launch; no RWD yet.',
  },
  itc: {
    rating: 'not-yet-assessed',
    rationale: 'Pre-launch; ITCs to be conducted alongside HTA submissions.',
  },
  economic: {
    rating: 'not-yet-assessed',
    rationale: 'Pre-launch; no HTA assessments yet.',
  },
}

// Best-in-class assignments per dimension (placeholder — refine after first render).
// One product per dimension. Alnyx CAN be best-in-class on dimensions where it leads.
export const BEST_IN_CLASS: Record<Dimension, string | null> = {
  efficacy: 'Carvykti',
  safety: 'Tecvayli',
  'dosing-admin': 'Carvykti',
  hrqol: 'Carvykti',
  'real-world': 'Tecvayli',
  itc: 'Tecvayli',
  economic: 'Tecvayli',
}
