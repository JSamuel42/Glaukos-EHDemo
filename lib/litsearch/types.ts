// Literature Reviews (Lit Search) types — ported from EvHub-D.
// The Glaukos demo drives these from static, pre-baked data (no DB, no live
// PubMed); the shapes are preserved so the ported components run unchanged.

export type PicoType = 'P' | 'I' | 'C' | 'O'
export type SpiderType = 'S' | 'PI' | 'D' | 'E' | 'R'
export type Framework = 'PICO' | 'SPIDER'
export type BooleanOp = 'AND' | 'OR' | 'NOT'
export type BetweenBlockOp = 'AND' | 'OR'
export type ScreeningDecision = 'include' | 'exclude' | 'pending'

export type BatchSize = 25 | 50 | 100 | 'all'

export type ClarificationResponseType = 'yes_no_other' | 'multi_select_other' | 'free_text'

export interface ClarificationQuestion {
  id: string
  question: string
  responseType: ClarificationResponseType
  options?: string[]
  selectedOptions: string[]
  otherText: string
  submitted: boolean
}

export interface BuildingBlockTerm {
  id: string
  text: string
  operator: BooleanOp
}

export interface BuildingBlock {
  type: PicoType | SpiderType
  label: string
  terms: BuildingBlockTerm[]
  blockOperator: BetweenBlockOp
}

export interface HighlightTerm {
  id: string
  text: string
  picoType: PicoType | SpiderType
}

export interface InclusionCriterion {
  parameterId: string
  parameterLabel: string
  inclusionText: string
  exclusionText: string
  exclusionReason: string
}

export interface SearchFilters {
  dateFrom?: string
  dateTo?: string
  language: 'english' | 'all'
}

export interface ClarificationMessage {
  role: 'ai' | 'user'
  text: string
  timestamp: string
}

export interface SearchResult {
  pmid: string
  title: string
  authors: string[]
  journal: string
  pubDate: string
  abstract: string
  doi?: string
  pubmedUrl: string
}

export interface CriteriaCheck {
  parameterId: string
  parameterLabel: string
  met: boolean
  failReason?: string
}

export interface ScreeningResult {
  pmid: string
  decision: ScreeningDecision
  confidence: number
  simplifiedReason: string
  justification: string
  criteriaChecks: CriteriaCheck[]
  overridden: boolean
  userDecision?: ScreeningDecision
  userReason?: string
  aiDecision: ScreeningDecision
  aiConfidence: number
}

export interface ConfidenceThresholds {
  high: number
  moderate: number
}

export interface SavedSearch {
  id: string
  name: string
  researchQuestion: string
  queryString: string
  framework: Framework
  blocks: BuildingBlock[]
  criteria: InclusionCriterion[]
  filters: SearchFilters
  highlightTerms: HighlightTerm[]
  resultCount: number | null
  createdAt: string
  lastRunAt: string | null
  createdBy: string
}

export interface LitSearchState {
  researchQuestion: string
  clarificationMessages: ClarificationMessage[]
  clarificationQuestions: ClarificationQuestion[]
  isRefiningQuery: boolean
  scopeConfirmed: boolean
  scopeSummary: string
  framework: Framework
  blocks: BuildingBlock[]
  highlightTerms: HighlightTerm[]
  criteria: InclusionCriterion[]
  filters: SearchFilters
  totalHits: number
  retrievedPmids: string[]
  screenedPmids: string[]
  batchSize: BatchSize
  showBatchPrompt: boolean
  demoLimited: boolean
  results: SearchResult[]
  screenings: Record<string, ScreeningResult>
  isSearching: boolean
  isScreening: boolean
  screeningProgress: { done: number; total: number }
  overrideCount: number
  confidenceThresholds: ConfidenceThresholds
  activeTab: 'builder' | 'results'
  resultsTab: 'included' | 'excluded' | 'all'
  modalArticle: SearchResult | null
}
