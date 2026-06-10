export interface RegulatoryApproval {
  agency: string
  indicationName: string
  therapyArea: string
  labelPopulation: string
  marketApprovalDate: string
  specificIndication: string
}

export interface HtaOutcome {
  htaAgency: string
  therapyArea: string
  indicationName: string
  assessedLabelPopulation: string
  assesmentType?: string
  dateOfPublication: string
  assessmentDate?: string
  assessmentOutcome: string
  assessmentCount?: string
  recommendedLineOfTreatment?: string
  recommendedPopulation?: string
  reasonForRecommendation?: string
  typeOfEconomicModelSubmitted?: string
  reimbursementOutcome?: string
  reimbursementDecisionDate?: string
  icerValues?: string
  priceToBeReducedToBecomeCostEffetive?: string
  costEffective?: string
  economicComparator?: string
  comments?: string
  htaDocumentUrl?: string | null
  [key: string]: unknown
}

export interface PivotalStudy {
  indicationName: string
  indicatedPopulation?: string
  targetPopulations?: string
  trialType?: string
  comparator?: string | null
  trialDesignPrimaryEndpoint?: string
  trialDesignSecondaryEndpoint?: string
  trialDesignControlArm?: string
  trialResultsInvestigationalArm?: string
  trialResultsComparatorArm?: string | null
  trialOutcome?: string
  relativeImprovement?: string | null
  relativeImprovementPercentage?: string
  [key: string]: unknown
}

export interface ProductEntry {
  brandName: string
  isFictional: boolean
  modalityCategory: 'bispecific' | 'car-t' | 'adc'
  regulatoryApprovals: RegulatoryApproval[]
  htaOutcomes: HtaOutcome[]
  pivotalStudies: PivotalStudy[]
  alnyxData?: import('./alnyx-data').AlnyxData
}
