// Dossier Builder types — ported from EvHub-D (frontend/src/types/dossier.ts).
// Section→article links bind to the canonical Phase-1 Library (lib/library/data).

export type DossierStatus = 'draft' | 'in_review' | 'final' | 'archived';
export type SectionStatus = 'pending' | 'draft' | 'in_review' | 'final';
export type ContentType = 'text' | 'table' | 'visual';
export type ContentSource = 'ai' | 'human' | 'hybrid';

export interface DossierSummary {
  id: string;
  libraryId: string;
  libraryName: string;
  libraryIndication: string;
  libraryProduct: string;
  title: string;
  /** Portfolio label (e.g. 'Global', 'United Kingdom', 'Germany', 'Custom'). */
  region: string;
  /** Added in-session via "Add another" — reset on refresh. */
  transient: boolean;
  status: DossierStatus;
  sectionCount: number;
  completedSections: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DossierSection {
  id: string;
  dossierId: string;
  parentSectionId: string | null;
  /** e.g. '1', '1.1', '1.1.1', '1.1.1.2' — unique within a dossier */
  number: string;
  title: string;
  /** Markdown bullet list edited inline */
  guidanceNotes: string;
  status: SectionStatus;
  orderIndex: number;
  /** Computed from the dot-depth of number: '1' → 1, '1.1' → 2, '1.1.1' → 3, '1.1.1.1' → 4 */
  level: 1 | 2 | 3 | 4;
  children: DossierSection[];
  articleLinks: SectionArticleLink[];
  currentContent?: SectionContent;
  contentVersions?: SectionContent[];
  /** Sign-off toggles (Phase 5.7) — cumulative; default both false = AI draft. */
  signOff?: { humanVerified: boolean; gvdApproved: boolean };
  /**
   * Optional advisory banner shown above the section before live generation
   * (e.g. to pre-flag an evidence gap the writing agent should explicitly
   * address). Used by the Open-Angle Glaucoma demo's surgical-eligible
   * section to flag the funnel-inference caveat.
   */
  preGenerationNote?: string;
}

export interface SectionArticleLink {
  id: string;
  sectionId: string;
  libraryArticleId: string;
  articleNumber: number;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  pubmedUrl: string;
  // Key extracted fields supplied to the writing agent (abstract-only)
  primaryOutcomes?: string;
  patientPopulation?: string;
  interventions?: string;
  studyType?: string;
  category?: string[];
  /** Full abstract — passed to the writing agent for abstract-only grounding. */
  abstract?: string;
}

// ── Agent reasoning (returned by writing agent and stored with content) ───────

export interface ReferenceExtraction {
  article_number: number;
  key_findings: string;
}

export interface GuidanceCoverage {
  guidance_point: string;
  coverage: 'full' | 'partial' | 'none';
  supporting_refs: number[];
}

export interface AgentReasoning {
  reference_extractions: ReferenceExtraction[];
  guidance_coverage: GuidanceCoverage[];
  evidence_gaps: string[];
  consistency_notes: string;
  synthesis_approach: string;
}

/** SN statements + VS messages used as drafting inputs for a content version. */
export interface EvidenceInputs {
  /** Scientific Narrative statement ids (e.g. 'S7'). */
  snIds: string[];
  /** Payer Value Story message ids (e.g. 'V2'). */
  vsIds: string[];
}

/**
 * Visual representation stored underneath a `contentType: 'visual'` version
 * (Audit+Fix 2). The funnel kind holds a JSON spec rendered to SVG by the
 * dossier-owned renderer; the svg kind holds sanitised raw SVG markup. Either
 * way the SVG — never the JSON — is what the user sees, in draft and compiled.
 */
export interface FunnelLevelSpec {
  /** Tier label, e.g. "Diagnosed prevalence". */
  label: string;
  /** Quantity at this tier (population, %, etc.) — drives the trapezoid width. */
  value: number;
  /** Optional caption shown under the label, e.g. "≈ 3.5M (UK)". */
  note?: string;
}

export type VisualSpec =
  | { kind: 'funnel'; title?: string; levels: FunnelLevelSpec[] }
  | { kind: 'svg'; svg: string; title?: string };

export interface SectionContent {
  id: string;
  sectionId: string;
  content: string;
  contentType: ContentType;
  version: number;
  isCurrent: boolean;
  wordCount: number;
  source: ContentSource;
  agentReasoning?: AgentReasoning;
  /** SN/VS inputs that grounded this version (Phase 5.6). */
  evidenceInputs?: EvidenceInputs;
  /** Visual payload for `contentType: 'visual'` versions (Audit+Fix 2). */
  visual?: VisualSpec;
  createdAt: string;
}

export interface CreateDossierInput {
  title: string;
  libraryId: string;
}

export interface CreateSectionInput {
  dossierId: string;
  parentSectionId?: string;
  number: string;
  title: string;
  guidanceNotes?: string;
  orderIndex: number;
}
