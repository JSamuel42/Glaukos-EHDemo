'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  OutlinePanel,
  SectionEditor,
  CompiledView,
  ContextManagerModal,
  DossierTagModal,
} from '@/components/dossier';
import DossierSeeder from '@/components/dossier/DossierSeeder';
import {
  getDossierSummary,
  getDossierSections,
  createSection,
  deleteSection,
  reorderSections,
  updateSection,
  updateDossier,
  linkArticle,
  unlinkArticle,
  flattenSectionTree,
} from '@/lib/dossier/store';
import type { DossierSection, DossierStatus, DossierSummary } from '@/lib/dossier/types';

// ── Status selector ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: DossierStatus; label: string }[] = [
  { value: 'draft',     label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'final',     label: 'Final' },
  { value: 'archived',  label: 'Archived' },
];

const STATUS_COLOURS: Record<DossierStatus, string> = {
  draft:     'var(--serif-muted-foreground)',
  in_review: '#BA7517',
  final:     '#0F6E56',
  archived:  '#A32D2D',
};

function StatusSelect({ value, onChange }: { value: DossierStatus; onChange: (v: DossierStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DossierStatus)}
      className="px-3 py-1.5 rounded-[6px] border text-xs font-mono font-medium bg-transparent focus:outline-none transition-colors appearance-auto"
      style={{ borderColor: 'var(--serif-border)', color: STATUS_COLOURS[value] }}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── DossierDetailContent ──────────────────────────────────────────────────────

function DossierDetailContent() {
  const params = useParams();
  const router = useRouter();
  const dossierId = typeof params.id === 'string' ? params.id : '';

  const [summary, setSummary] = useState<DossierSummary | null>(null);
  const [sections, setSections] = useState<DossierSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompiled, setShowCompiled] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const [tagModalSection, setTagModalSection] = useState<DossierSection | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  const reload = useCallback(() => {
    const s = getDossierSummary(dossierId);
    if (!s) { router.replace('/dossier-builder'); return; }
    setSummary(s);
    setSections(getDossierSections(dossierId));
  }, [dossierId, router]);

  useEffect(() => {
    // Hydrate from the localStorage store on mount / when the loader identity
    // changes (an external system, not render-derived state) — the cascading
    // render is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    setIsLoading(false);
  }, [reload]);

  // ── Outline handlers ────────────────────────────────────────────────────────

  function handleAddSection(parentId: string | null, number: string, title: string) {
    const flat = flattenSectionTree(sections);
    const siblings = flat.filter((s) => s.parentSectionId === parentId);
    const result = createSection({ dossierId, parentSectionId: parentId ?? undefined, number, title, orderIndex: siblings.length });
    if ('error' in result) { console.warn('createSection:', result.error); return; }
    reload();
    setSelectedSectionId(result.id);
  }

  function handleDeleteSection(sectionId: string) {
    deleteSection(dossierId, sectionId);
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
    reload();
  }

  function handleReorder(updates: { id: string; orderIndex: number }[]) {
    reorderSections(dossierId, updates);
    reload();
  }

  // ── Section editor handlers ─────────────────────────────────────────────────

  function handleGuidanceChange(sectionId: string, value: string) {
    updateSection(dossierId, sectionId, { guidanceNotes: value });
    // Don't reload (would reset editor content) — guidance is local state
  }

  function handleManageReferences(section: DossierSection) {
    setTagModalSection(section);
  }

  function handleSectionUpdate() {
    reload();
  }

  function handleUnlinkArticle(sectionId: string, libraryArticleId: string) {
    unlinkArticle(dossierId, sectionId, libraryArticleId);
    reload();
  }

  // ── Tag modal save ──────────────────────────────────────────────────────────

  async function handleTagSave(added: string[], removed: string[]) {
    if (!tagModalSection) return;
    for (const id of added) linkArticle(dossierId, tagModalSection.id, id);
    for (const id of removed) unlinkArticle(dossierId, tagModalSection.id, id);
    reload();
  }

  // ── Status ──────────────────────────────────────────────────────────────────

  function handleStatusChange(status: DossierStatus) {
    updateDossier(dossierId, { status });
    reload();
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const flat = flattenSectionTree(sections);

  const selectedSection = selectedSectionId
    ? flat.find((s) => s.id === selectedSectionId) ?? null
    : null;

  // Keep the tag modal in sync with the latest section data after a reload.
  const tagSectionLatest = tagModalSection
    ? flat.find((s) => s.id === tagModalSection.id) ?? null
    : null;

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-full py-32 text-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-playfair text-3xl text-serif-foreground">{summary.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--serif-muted-foreground)' }}>
              {summary.libraryName}
              {summary.libraryIndication ? ` · ${summary.libraryIndication}` : ''}
              {summary.libraryProduct ? ` (${summary.libraryProduct})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusSelect value={summary.status} onChange={handleStatusChange} />
            <button
              type="button"
              onClick={() => setShowContextManager(true)}
              className="px-4 py-1.5 rounded-[6px] text-xs font-mono font-medium transition-all hover:opacity-80 flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--serif-accent)',
                color: '#fff',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Context Manager
            </button>
          </div>
        </div>

        {/* View toggle: Draft | Compiled View */}
        <div className="flex items-center justify-between px-1 pb-3">
          <div
            className="flex items-center gap-0 rounded-[6px] border overflow-hidden"
            style={{ borderColor: 'var(--serif-border)' }}
          >
            <button
              type="button"
              onClick={() => setShowCompiled(false)}
              className="px-4 py-1.5 text-xs font-mono font-medium transition-all duration-150"
              style={{
                backgroundColor: !showCompiled ? 'var(--serif-accent)' : 'transparent',
                color: !showCompiled ? '#fff' : 'var(--serif-muted-foreground)',
                borderRight: '1px solid var(--serif-border)',
              }}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => setShowCompiled(true)}
              className="px-4 py-1.5 text-xs font-mono font-medium transition-all duration-150"
              style={{
                backgroundColor: showCompiled ? 'var(--serif-accent)' : 'transparent',
                color: showCompiled ? '#fff' : 'var(--serif-muted-foreground)',
              }}
            >
              Compiled View
            </button>
          </div>
        </div>

        <div
          className="flex overflow-hidden rounded-[8px] border"
          style={{ minHeight: '70vh', borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
        >
          <OutlinePanel
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onReorder={handleReorder}
            isOpen={isOutlineOpen}
            onToggle={() => setIsOutlineOpen((v) => !v)}
          />

          <SectionEditor
            section={selectedSection}
            dossierId={dossierId}
            dossierTitle={summary.title}
            allSections={sections}
            onGuidanceChange={handleGuidanceChange}
            onManageReferences={handleManageReferences}
            onSectionUpdate={handleSectionUpdate}
            onUnlinkArticle={handleUnlinkArticle}
          />
        </div>
      </div>

      {showCompiled && (
        <CompiledView
          dossier={summary}
          sections={sections}
          onClose={() => setShowCompiled(false)}
        />
      )}

      {showContextManager && (
        <ContextManagerModal
          dossierId={dossierId}
          onClose={() => setShowContextManager(false)}
        />
      )}

      {tagSectionLatest && (
        <DossierTagModal
          section={tagSectionLatest}
          onSave={handleTagSave}
          onClose={() => setTagModalSection(null)}
        />
      )}
    </>
  );
}

export default function DossierDetailPage() {
  return (
    <DossierSeeder>
      <DossierDetailContent />
    </DossierSeeder>
  );
}
