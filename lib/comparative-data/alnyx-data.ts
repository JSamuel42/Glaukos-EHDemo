// Alnyx (alphabetinib) — fictional bispecific BCMA × CD3 antibody for R/R MM.
// Pre-launch: Phase 2 data only. No regulatory approvals or HTA outcomes yet.
//
// All values here are EDITABLE — refine as the workshop progresses.

export interface AlnyxData {
  brandName: string
  inn: string
  modality: string
  modalityCategory: 'bispecific' | 'car-t' | 'adc'
  manufacturer: string
  developmentStage: 'phase-2' | 'phase-3' | 'pre-approval' | 'approved'
  indicationLabel: string
  dosingAndAdministration: {
    route: string
    dose: string
    schedule: string
    notes: string
  }
  regulatoryApprovals: []
  htaOutcomes: []
  pivotalStudies: AlnyxPivotalStudy[]
}

export interface AlnyxPivotalStudy {
  trialName: string
  phase: 'phase-1' | 'phase-1b/2' | 'phase-2' | 'phase-3'
  status: 'completed' | 'ongoing' | 'planned'
  startDate: string
  endDate: string | null
  trialType: string
  comparator: string | null
  population: string
  primaryEndpoint: string
  primaryResult: string
  secondaryEndpoints: { endpoint: string; result: string }[]
  outcome: string
  notes: string
}

export const ALNYX_DATA: AlnyxData = {
  brandName: 'Alnyx',
  inn: 'alphabetinib',
  modality: 'Bispecific BCMA × CD3 T-cell engager',
  modalityCategory: 'bispecific',
  manufacturer: 'NexGenvion Pharmaceuticals',
  developmentStage: 'phase-2',
  indicationLabel:
    'Relapsed/refractory multiple myeloma, ≥2 prior therapies, progression on last therapy',
  dosingAndAdministration: {
    route: 'Subcutaneous (SC)',
    dose: '200 mg',
    schedule: 'Every 6 weeks (Q6W) maintenance, after step-up dosing',
    notes:
      'Notably less frequent than competing bispecifics (weekly/biweekly schedules). Single in-clinic administration; no continuous infusion required.',
  },
  regulatoryApprovals: [],
  htaOutcomes: [],
  pivotalStudies: [
    {
      trialName: 'RESCUE-MM',
      phase: 'phase-2',
      status: 'completed',
      startDate: '2022-08-01',
      endDate: '2025-03-15',
      trialType: 'Open-label, single-arm, multicenter Phase 2',
      comparator: null,
      population:
        'Adults with R/R MM, ≥2 prior therapies including PI, IMiD, anti-CD38 mAb, with disease progression on last therapy. N=142.',
      primaryEndpoint: 'Overall response rate (ORR) by IMWG criteria',
      primaryResult: 'ORR 78.5% (95% CI: 71.2–84.6%)',
      secondaryEndpoints: [
        { endpoint: 'Complete response or better (≥CR)', result: '42.3% (95% CI: 34.4–50.6%)' },
        { endpoint: 'Progression-free survival (median)', result: '12.4 months (95% CI: 9.8–15.6)' },
        { endpoint: 'Duration of response (median)', result: '16.2 months (95% CI: 13.1–NE)' },
        { endpoint: 'Overall survival rate at 12 months', result: '81.2% (95% CI: 73.9–86.7%)' },
        {
          endpoint: 'Patient-reported outcomes (EORTC QLQ-C30)',
          result: 'Significant improvements in pain and disease symptoms vs baseline',
        },
      ],
      outcome:
        'Met primary endpoint with high overall response rate and durable responses in heavily pre-treated population. Basis for planned Phase 3 RCT (RESONATE-MM) and regulatory pre-submissions.',
      notes:
        'Subgroup analyses showed consistent efficacy across high-risk cytogenetics, extramedullary disease, and prior CAR-T exposure. Safety profile in line with bispecific class (CRS predominantly low-grade and manageable).',
    },
  ],
}
