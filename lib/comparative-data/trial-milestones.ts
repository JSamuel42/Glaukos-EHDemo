// Phase 2 / Phase 3 trial completion dates for the 7 real R/R MM competitor
// products. The Nuro ingest (data/comparative-data/products-nuro.json) didn't
// capture temporal fields on pivotalStudies, so these are hand-coded from
// public ClinicalTrials.gov primary completion dates as of late 2025. Demo
// fidelity rather than peer-reviewed precision — happy to refine if the
// underlying NCT records shift.
//
// Cutoff: only events from 2019 onward are surfaced on the timeline (per the
// product request: "If any of these events have occurred after 2019,
// indicate them.")

export interface TrialMilestone {
  trialName: string;
  phase: 'phase-2' | 'phase-3';
  /** ISO date of primary completion. */
  primaryCompletionDate: string;
}

export const TRIAL_MILESTONES: Record<string, TrialMilestone[]> = {
  Tecvayli: [
    { trialName: 'MajesTEC-1', phase: 'phase-2', primaryCompletionDate: '2022-03-16' },
    { trialName: 'MajesTEC-3', phase: 'phase-3', primaryCompletionDate: '2025-04-30' },
  ],
  Elrexfio: [
    { trialName: 'MagnetisMM-3', phase: 'phase-2', primaryCompletionDate: '2023-03-29' },
    { trialName: 'MagnetisMM-5', phase: 'phase-3', primaryCompletionDate: '2025-06-30' },
  ],
  Talvey: [
    { trialName: 'MonumenTAL-1', phase: 'phase-2', primaryCompletionDate: '2022-08-15' },
    { trialName: 'MonumenTAL-3', phase: 'phase-3', primaryCompletionDate: '2026-03-31' },
  ],
  Lynozyfic: [
    { trialName: 'LINKER-MM1', phase: 'phase-2', primaryCompletionDate: '2024-03-25' },
    { trialName: 'LINKER-MM3', phase: 'phase-3', primaryCompletionDate: '2027-06-30' },
  ],
  Carvykti: [
    { trialName: 'CARTITUDE-1', phase: 'phase-2', primaryCompletionDate: '2021-09-01' },
    { trialName: 'CARTITUDE-4', phase: 'phase-3', primaryCompletionDate: '2023-11-01' },
  ],
  Abecma: [
    { trialName: 'KarMMa', phase: 'phase-2', primaryCompletionDate: '2020-04-04' },
    { trialName: 'KarMMa-3', phase: 'phase-3', primaryCompletionDate: '2022-07-29' },
  ],
  Blenrep: [
    { trialName: 'DREAMM-2', phase: 'phase-2', primaryCompletionDate: '2020-03-31' },
    { trialName: 'DREAMM-3', phase: 'phase-3', primaryCompletionDate: '2022-09-08' },
  ],
};

export const TRIAL_MILESTONE_CUTOFF_YEAR = 2019;
