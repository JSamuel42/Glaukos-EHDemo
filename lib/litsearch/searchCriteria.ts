import { InclusionCriterion } from '@/lib/litsearch/types'

export const DEFAULT_CRITERIA: InclusionCriterion[] = [
  { parameterId: 'population',    parameterLabel: 'Population',           inclusionText: '', exclusionText: '',                                     exclusionReason: 'Wrong population' },
  { parameterId: 'intervention',  parameterLabel: 'Intervention',         inclusionText: '', exclusionText: '',                                     exclusionReason: 'Wrong intervention' },
  { parameterId: 'comparison',    parameterLabel: 'Comparison / Context', inclusionText: '', exclusionText: '',                                     exclusionReason: 'Wrong comparator / context' },
  { parameterId: 'outcomes',      parameterLabel: 'Outcomes',             inclusionText: '', exclusionText: '',                                     exclusionReason: 'No validated endpoints' },
  { parameterId: 'study_design',  parameterLabel: 'Study design',         inclusionText: '', exclusionText: '',                                     exclusionReason: 'Wrong study design' },
  { parameterId: 'geography',     parameterLabel: 'Geography',            inclusionText: '', exclusionText: 'Studies not reporting country-specific data', exclusionReason: 'No country-specific reporting' },
  { parameterId: 'language',      parameterLabel: 'Language',             inclusionText: 'English', exclusionText: 'Non-English publications',     exclusionReason: 'Wrong language' },
  { parameterId: 'timeframe',     parameterLabel: 'Timeframe',            inclusionText: '', exclusionText: '',                                     exclusionReason: 'Outside timeframe' },
]

export const EXCLUSION_REASON_OPTIONS = [
  'Wrong population','Wrong intervention','Wrong comparator / context',
  'No validated endpoints','Wrong study design','Animal / in vitro study',
  'No country-specific reporting','Wrong language','Outside timeframe',
  'Irrelevant to topic','Scoping / review only',
]
