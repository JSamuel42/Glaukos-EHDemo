/**
 * dossierStore — in-memory dossier data store (DEMO_MODE, no DB).
 *
 * Phase 5.5: the store is a module-level array, seeded from the pre-baked
 * portfolio (Global / UK / Germany) and held in memory for the session. It
 * survives client-side navigation but is LOSSY ON REFRESH — a hard reload
 * re-evaluates this module and re-seeds, discarding added dossiers and edits.
 * `resetDossiers()` restores the pre-baked portfolio on demand.
 *
 * Section→article links bind to the canonical Phase-1 Library (lib/library/data
 * ARTICLES). No second library is introduced.
 */

import type {
  DossierSummary,
  DossierSection,
  SectionArticleLink,
  SectionContent,
  AgentReasoning,
  ContentType,
  ContentSource,
  CreateDossierInput,
  CreateSectionInput,
  SectionStatus,
  DossierStatus,
} from '@/lib/dossier/types';
import { ARTICLES, type Article } from '@/lib/library/data';

/** Dossier id of the Global dossier — the adapt-from-Global source. */
export const GLOBAL_DOSSIER_ID = 'demo-dossier-istent-oag';

/** The single canonical Library this demo's dossiers reference. */
export const CANONICAL_LIBRARY = {
  id: 'demo-library-oag',
  name: 'Open-Angle Glaucoma — Epidemiology & Burden Library',
  indication: 'Open-Angle Glaucoma',
  product: 'iStent infinite (Glaukos)',
} as const;

// Canonical-article lookups. articleNumber = 1-based index in ARTICLES order
// (matches the demo dossier's article-number references).
const ARTICLE_BY_ID = new Map<string, Article>(ARTICLES.map((a) => [a.id, a]));
const ARTICLE_NUMBER_BY_ID = new Map<string, number>(ARTICLES.map((a, i) => [a.id, i + 1]));

/** Resolve a canonical article id (or pmid) to its Article. */
export function resolveArticle(libraryArticleId: string): Article | undefined {
  const direct = ARTICLE_BY_ID.get(libraryArticleId);
  if (direct) return direct;
  return ARTICLES.find((a) => a.pmid === libraryArticleId);
}

// ── Internal storage types ────────────────────────────────────────────────────

export interface StoredArticleLink {
  id: string;
  sectionId: string;
  libraryArticleId: string;
  addedAt: string;
}

export interface StoredContentVersion {
  id: string;
  sectionId: string;
  content: string;
  contentType: ContentType;
  version: number;
  isCurrent: boolean;
  wordCount: number;
  source: ContentSource;
  agentReasoning?: AgentReasoning;
  createdAt: string;
}

export interface StoredSection {
  id: string;
  dossierId: string;
  parentSectionId: string | null;
  number: string;
  title: string;
  guidanceNotes: string;
  status: SectionStatus;
  orderIndex: number;
  articleLinks: StoredArticleLink[];
  contentVersions: StoredContentVersion[];
  /** Preserved from the demo seed; surfaces the pre-generation caveat banner. */
  preGenerationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredDossier {
  id: string;
  libraryId: string;
  title: string;
  /** Portfolio label shown on the landing card (e.g. 'Global', 'United Kingdom'). */
  region: string;
  /** Added in-session via "Add another" — reset on refresh (cosmetic flag). */
  transient?: boolean;
  status: DossierStatus;
  createdAt: string;
  updatedAt: string;
  sections: StoredSection[];
}

// ── In-memory store (DEMO_MODE, lossy on refresh) ──────────────────────────────

/** Module-level session store. Re-seeded on module load (hard refresh). */
let STORE: StoredDossier[] = [];
let seeded = false;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/**
 * Seed the portfolio once per session. Subsequent calls are no-ops unless
 * `force` is set (used by resetDossiers). Deep-clones the seeds so in-session
 * edits never mutate the module constants.
 */
export function seedDossiers(seeds: StoredDossier[], force = false): void {
  if (seeded && !force) return;
  STORE = seeds.map((d) => clone(d));
  seeded = true;
}

/** Restore the pre-baked portfolio, discarding added dossiers + edits. */
export function resetDossiers(seeds: StoredDossier[]): void {
  seedDossiers(seeds, true);
}

export function isSeeded(): boolean {
  return seeded;
}

export function readAllDossiers(): StoredDossier[] {
  return STORE;
}

export function writeAllDossiers(dossiers: StoredDossier[]): void {
  STORE = dossiers;
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Compute section level from its number (dot count + 1). */
export function computeLevel(number: string): 1 | 2 | 3 | 4 {
  return Math.min(number.split('.').length, 4) as 1 | 2 | 3 | 4;
}

/** Enrich a stored link into a full SectionArticleLink from the canonical Library. */
function enrichLink(l: StoredArticleLink, fallbackIdx: number): SectionArticleLink {
  const a = resolveArticle(l.libraryArticleId);
  return {
    id: l.id,
    sectionId: l.sectionId,
    libraryArticleId: l.libraryArticleId,
    articleNumber: a ? (ARTICLE_NUMBER_BY_ID.get(a.id) ?? fallbackIdx + 1) : fallbackIdx + 1,
    title: a?.title ?? '',
    authors: a?.authors ? a.authors.split(',').map((s) => s.trim()).filter(Boolean) : [],
    journal: a?.journal ?? '',
    pubDate: a?.pub_date ?? '',
    pubmedUrl: a?.pub_link ?? (a?.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` : ''),
    primaryOutcomes: a?.outcomes ?? undefined,
    patientPopulation: a?.population ?? undefined,
    interventions: a?.interventions ?? undefined,
    studyType: a?.study_type ?? undefined,
    category: a?.categories?.map((c) => c.category) ?? undefined,
    abstract: a?.abstract ?? undefined,
  };
}

/** Build a nested DossierSection tree from a flat list of StoredSections. */
export function buildSectionTree(sections: StoredSection[]): DossierSection[] {
  function toNode(s: StoredSection): DossierSection {
    const children = sections
      .filter((c) => c.parentSectionId === s.id)
      .sort((a, b) => a.orderIndex - b.orderIndex || a.number.localeCompare(b.number, undefined, { numeric: true }))
      .map(toNode);
    const versions = (s.contentVersions ?? []).sort((a, b) => b.version - a.version);
    const currentContent = versions.find((v) => v.isCurrent) as SectionContent | undefined;
    return {
      id: s.id,
      dossierId: s.dossierId,
      parentSectionId: s.parentSectionId,
      number: s.number,
      title: s.title,
      guidanceNotes: s.guidanceNotes,
      status: s.status,
      orderIndex: s.orderIndex,
      level: computeLevel(s.number),
      children,
      articleLinks: s.articleLinks.map((l, idx) => enrichLink(l, idx)),
      currentContent,
      contentVersions: versions as SectionContent[],
      preGenerationNote: s.preGenerationNote,
    };
  }

  return sections
    .filter((s) => s.parentSectionId === null)
    .sort((a, b) => a.orderIndex - b.orderIndex || a.number.localeCompare(b.number, undefined, { numeric: true }))
    .map(toNode);
}

/** Flatten a tree of DossierSection into a linear ordered list. */
export function flattenSectionTree(tree: DossierSection[]): DossierSection[] {
  const result: DossierSection[] = [];
  function walk(nodes: DossierSection[]) {
    for (const n of nodes) {
      result.push(n);
      walk(n.children);
    }
  }
  walk(tree);
  return result;
}

/** Enrich a StoredDossier into a DossierSummary (joins canonical library info). */
function toSummary(d: StoredDossier): DossierSummary {
  const completedSections = d.sections.filter((s) => s.status !== 'pending').length;
  return {
    id: d.id,
    libraryId: d.libraryId,
    libraryName: CANONICAL_LIBRARY.name,
    libraryIndication: CANONICAL_LIBRARY.indication,
    libraryProduct: CANONICAL_LIBRARY.product,
    title: d.title,
    region: d.region,
    transient: d.transient ?? false,
    status: d.status,
    sectionCount: d.sections.length,
    completedSections,
    createdBy: 'You',
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Dossier CRUD ──────────────────────────────────────────────────────────────

export function listDossiers(libraryId?: string): DossierSummary[] {
  const all = readAllDossiers();
  const filtered = libraryId ? all.filter((d) => d.libraryId === libraryId) : all;
  return filtered.map(toSummary);
}

export function getDossier(id: string): StoredDossier | undefined {
  return readAllDossiers().find((d) => d.id === id);
}

export function getDossierSummary(id: string): DossierSummary | undefined {
  const d = getDossier(id);
  return d ? toSummary(d) : undefined;
}

export function getDossierSections(id: string): DossierSection[] {
  const d = getDossier(id);
  if (!d) return [];
  return buildSectionTree(d.sections);
}

export function createDossier(input: CreateDossierInput): StoredDossier {
  const now = new Date().toISOString();
  const dossier: StoredDossier = {
    id: genId('dos'),
    libraryId: input.libraryId,
    title: input.title.trim(),
    region: 'Custom',
    transient: true,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    sections: [],
  };
  const all = readAllDossiers();
  all.push(dossier);
  writeAllDossiers(all);
  return dossier;
}

/**
 * Add-another: create a new in-session dossier by copying the Global
 * dossier's structure AND content forward (a snapshot — not a live link).
 * Transient: discarded on refresh. New section/link/version ids are minted
 * so the clone is fully independent of Global.
 */
export function createDossierFromGlobal(title: string): StoredDossier | undefined {
  const global = getDossier(GLOBAL_DOSSIER_ID);
  if (!global) return undefined;
  const now = new Date().toISOString();
  const newId = genId('dos');
  const idMap = new Map<string, string>();
  // First pass: mint new section ids so parent refs can be remapped.
  global.sections.forEach((s) => idMap.set(s.id, genId('sec')));
  const sections: StoredSection[] = global.sections.map((s) => ({
    ...clone(s),
    id: idMap.get(s.id)!,
    dossierId: newId,
    parentSectionId: s.parentSectionId ? (idMap.get(s.parentSectionId) ?? null) : null,
    articleLinks: s.articleLinks.map((l) => ({
      ...clone(l),
      id: genId('sal'),
      sectionId: idMap.get(s.id)!,
    })),
    contentVersions: s.contentVersions.map((v) => ({
      ...clone(v),
      id: genId('cv'),
      sectionId: idMap.get(s.id)!,
    })),
    createdAt: now,
    updatedAt: now,
  }));
  const dossier: StoredDossier = {
    id: newId,
    libraryId: global.libraryId,
    title: title.trim() || 'New dossier',
    region: 'Custom',
    transient: true,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    sections,
  };
  const all = readAllDossiers();
  all.push(dossier);
  writeAllDossiers(all);
  return dossier;
}

/**
 * Adapt-from-Global: copy the Global dossier's current content for the
 * section that shares this section's `number` forward into the target
 * section as a new version (snapshot, source 'hybrid'). Returns the section
 * number copied, or undefined if Global has no content for it.
 */
export function adaptFromGlobal(targetDossierId: string, sectionId: string): string | undefined {
  if (targetDossierId === GLOBAL_DOSSIER_ID) return undefined;
  const target = getDossier(targetDossierId);
  const global = getDossier(GLOBAL_DOSSIER_ID);
  if (!target || !global) return undefined;
  const section = target.sections.find((s) => s.id === sectionId);
  if (!section) return undefined;
  const globalSection = global.sections.find((s) => s.number === section.number);
  if (!globalSection) return undefined;
  const globalCurrent = (globalSection.contentVersions ?? []).find((v) => v.isCurrent);
  if (!globalCurrent) return undefined;

  saveContentVersion(targetDossierId, sectionId, {
    content: globalCurrent.content,
    contentType: globalCurrent.contentType,
    wordCount: globalCurrent.wordCount,
    source: 'hybrid',
    agentReasoning: globalCurrent.agentReasoning,
  });
  return section.number;
}

/** Section numbers in the Global dossier that currently have content. */
export function globalSectionsWithContent(): Set<string> {
  const global = getDossier(GLOBAL_DOSSIER_ID);
  if (!global) return new Set();
  const out = new Set<string>();
  for (const s of global.sections) {
    if ((s.contentVersions ?? []).some((v) => v.isCurrent)) out.add(s.number);
  }
  return out;
}

export function updateDossier(
  id: string,
  patch: Partial<Pick<StoredDossier, 'title' | 'status'>>,
): StoredDossier | undefined {
  const all = readAllDossiers();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeAllDossiers(all);
  return all[idx];
}

// ── Section CRUD ──────────────────────────────────────────────────────────────

const SECTION_NUMBER_RE = /^\d+(\.\d+){0,3}$/;

export function createSection(input: CreateSectionInput): StoredSection | { error: string } {
  if (!SECTION_NUMBER_RE.test(input.number.trim())) {
    return { error: 'Invalid section number. Must match N, N.N, N.N.N, or N.N.N.N' };
  }
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === input.dossierId);
  if (dIdx === -1) return { error: 'Dossier not found' };

  if (all[dIdx].sections.some((s) => s.number === input.number.trim())) {
    return { error: `Section number "${input.number}" already exists in this dossier` };
  }

  const now = new Date().toISOString();
  const section: StoredSection = {
    id: genId('sec'),
    dossierId: input.dossierId,
    parentSectionId: input.parentSectionId ?? null,
    number: input.number.trim(),
    title: input.title.trim(),
    guidanceNotes: input.guidanceNotes ?? '',
    status: 'pending',
    orderIndex: input.orderIndex,
    articleLinks: [],
    contentVersions: [],
    createdAt: now,
    updatedAt: now,
  };
  all[dIdx].sections.push(section);
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
  return section;
}

export function updateSection(
  dossierId: string,
  sectionId: string,
  patch: Partial<Pick<StoredSection, 'title' | 'guidanceNotes' | 'status' | 'orderIndex' | 'parentSectionId'>>,
): StoredSection | undefined {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return undefined;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return undefined;
  const now = new Date().toISOString();
  all[dIdx].sections[sIdx] = { ...all[dIdx].sections[sIdx], ...patch, updatedAt: now };
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
  return all[dIdx].sections[sIdx];
}

export function deleteSection(dossierId: string, sectionId: string): boolean {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return false;

  const toDelete = new Set<string>();
  function collect(id: string) {
    toDelete.add(id);
    all[dIdx].sections.filter((s) => s.parentSectionId === id).forEach((s) => collect(s.id));
  }
  collect(sectionId);

  const before = all[dIdx].sections.length;
  all[dIdx].sections = all[dIdx].sections.filter((s) => !toDelete.has(s.id));
  if (all[dIdx].sections.length === before) return false;
  all[dIdx].updatedAt = new Date().toISOString();
  writeAllDossiers(all);
  return true;
}

export function reorderSections(
  dossierId: string,
  updates: { id: string; orderIndex: number }[],
): void {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return;
  const now = new Date().toISOString();
  for (const u of updates) {
    const sIdx = all[dIdx].sections.findIndex((s) => s.id === u.id);
    if (sIdx !== -1) {
      all[dIdx].sections[sIdx].orderIndex = u.orderIndex;
      all[dIdx].sections[sIdx].updatedAt = now;
    }
  }
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
}

// ── Article links ─────────────────────────────────────────────────────────────

export function linkArticle(
  dossierId: string,
  sectionId: string,
  libraryArticleId: string,
): StoredArticleLink | undefined {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return undefined;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return undefined;

  if (all[dIdx].sections[sIdx].articleLinks.some((l) => l.libraryArticleId === libraryArticleId)) {
    return all[dIdx].sections[sIdx].articleLinks.find((l) => l.libraryArticleId === libraryArticleId);
  }

  const link: StoredArticleLink = {
    id: genId('sal'),
    sectionId,
    libraryArticleId,
    addedAt: new Date().toISOString(),
  };
  all[dIdx].sections[sIdx].articleLinks.push(link);
  all[dIdx].updatedAt = new Date().toISOString();
  writeAllDossiers(all);
  return link;
}

export function unlinkArticle(dossierId: string, sectionId: string, libraryArticleId: string): boolean {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return false;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return false;
  const before = all[dIdx].sections[sIdx].articleLinks.length;
  all[dIdx].sections[sIdx].articleLinks = all[dIdx].sections[sIdx].articleLinks.filter(
    (l) => l.libraryArticleId !== libraryArticleId,
  );
  if (all[dIdx].sections[sIdx].articleLinks.length === before) return false;
  all[dIdx].updatedAt = new Date().toISOString();
  writeAllDossiers(all);
  return true;
}

// ── Content version management ────────────────────────────────────────────────

const MAX_VERSIONS = 3;

function genContentId(): string {
  return `cv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface SaveContentInput {
  content: string;
  contentType: ContentType;
  wordCount: number;
  source: ContentSource;
  agentReasoning?: AgentReasoning;
}

/** Save a new content version (max 3). Returns the new version entry. */
export function saveContentVersion(
  dossierId: string,
  sectionId: string,
  input: SaveContentInput,
): StoredContentVersion | undefined {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return undefined;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return undefined;

  let versions = all[dIdx].sections[sIdx].contentVersions ?? [];

  if (versions.length >= MAX_VERSIONS) {
    versions.sort((a, b) => a.version - b.version);
    versions.shift();
    versions = versions.map((v, i) => ({ ...v, version: i + 1 }));
  }

  versions = versions.map((v) => ({ ...v, isCurrent: false }));

  const newVersion = versions.length + 1;
  const newEntry: StoredContentVersion = {
    id: genContentId(),
    sectionId,
    content: input.content,
    contentType: input.contentType,
    version: newVersion,
    isCurrent: true,
    wordCount: input.wordCount,
    source: input.source,
    agentReasoning: input.agentReasoning,
    createdAt: new Date().toISOString(),
  };

  versions.push(newEntry);
  const now = new Date().toISOString();
  all[dIdx].sections[sIdx].contentVersions = versions;
  // Generating content moves a pending section into draft.
  if (all[dIdx].sections[sIdx].status === 'pending') {
    all[dIdx].sections[sIdx].status = 'draft';
  }
  all[dIdx].sections[sIdx].updatedAt = now;
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
  return newEntry;
}

/** Get all content versions for a section (newest first). */
export function getContentVersions(dossierId: string, sectionId: string): StoredContentVersion[] {
  const d = getDossier(dossierId);
  if (!d) return [];
  const sec = d.sections.find((s) => s.id === sectionId);
  if (!sec) return [];
  return (sec.contentVersions ?? []).sort((a, b) => b.version - a.version);
}

/** Restore a specific version as current. Does NOT create a new version. */
export function restoreContentVersion(
  dossierId: string,
  sectionId: string,
  contentId: string,
): StoredContentVersion | undefined {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return undefined;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return undefined;

  const versions = all[dIdx].sections[sIdx].contentVersions ?? [];
  const target = versions.find((v) => v.id === contentId);
  if (!target) return undefined;

  all[dIdx].sections[sIdx].contentVersions = versions.map((v) => ({
    ...v,
    isCurrent: v.id === contentId,
  }));
  const now = new Date().toISOString();
  all[dIdx].sections[sIdx].updatedAt = now;
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
  return target;
}

/** Update the content of the current version (hybrid edits). */
export function updateCurrentContent(
  dossierId: string,
  sectionId: string,
  content: string,
  wordCount: number,
): void {
  const all = readAllDossiers();
  const dIdx = all.findIndex((d) => d.id === dossierId);
  if (dIdx === -1) return;
  const sIdx = all[dIdx].sections.findIndex((s) => s.id === sectionId);
  if (sIdx === -1) return;

  const versions = all[dIdx].sections[sIdx].contentVersions ?? [];
  const curIdx = versions.findIndex((v) => v.isCurrent);
  if (curIdx === -1) return;

  const cv = versions[curIdx];
  all[dIdx].sections[sIdx].contentVersions[curIdx] = {
    ...cv,
    content,
    wordCount,
    source: cv.source === 'ai' ? 'hybrid' : cv.source,
  };
  const now = new Date().toISOString();
  all[dIdx].sections[sIdx].updatedAt = now;
  all[dIdx].updatedAt = now;
  writeAllDossiers(all);
}

/** Returns the section numbers that a given article is linked to across all sections of a dossier. */
export function getArticleSectionNumbers(dossierId: string, libraryArticleId: string): string[] {
  const d = getDossier(dossierId);
  if (!d) return [];
  return d.sections
    .filter((s) => s.articleLinks.some((l) => l.libraryArticleId === libraryArticleId))
    .map((s) => s.number)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
