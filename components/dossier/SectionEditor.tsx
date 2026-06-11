'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import type {
  DossierSection,
  SectionContent,
  SectionStatus,
  AgentReasoning,
  GuidanceCoverage,
} from '@/lib/dossier/types';
import {
  saveContentVersion,
  getContentVersions,
  restoreContentVersion,
  updateCurrentContent,
} from '@/lib/dossier/store';
import { contextKey } from '@/lib/dossier/seed';

// ── Constants ─────────────────────────────────────────────────────────────────

const SAVE_DEBOUNCE_MS = 1200;
const GUIDANCE_DEBOUNCE_MS = 800;

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_META: Record<SectionStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: 'var(--serif-muted)',         color: 'var(--serif-muted-foreground)' },
  draft:     { label: 'Draft',     bg: 'rgba(186,117,23,0.12)',      color: '#BA7517' },
  in_review: { label: 'In review', bg: 'rgba(24,95,165,0.12)',       color: '#185FA5' },
  final:     { label: 'Final',     bg: 'rgba(15,110,86,0.12)',       color: '#0F6E56' },
};

function StatusBadge({ status }: { status: SectionStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="font-mono text-[9px] font-medium tracking-[0.1em] uppercase px-2 py-0.5 rounded-[3px] inline-block"
      style={{ backgroundColor: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

// ── Toolbar button ────────────────────────────────────────────────────────────

interface TbtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function Tbtn({ onClick, active, title, children, disabled }: TbtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="min-h-[44px] min-w-[36px] px-2 flex items-center justify-center rounded-[4px] text-xs font-mono transition-all duration-100 disabled:opacity-30"
      style={{
        backgroundColor: active ? 'rgba(8,56,96,0.12)' : 'transparent',
        color: active ? 'var(--serif-accent)' : 'var(--serif-muted-foreground)',
      }}
    >
      {children}
    </button>
  );
}

function TbtnSep() {
  return <div className="w-px h-5 self-center" style={{ backgroundColor: 'var(--serif-border)' }} />;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Coverage badge ────────────────────────────────────────────────────────────

function CoverageBadge({ coverage }: { coverage: GuidanceCoverage['coverage'] }) {
  const styles = {
    full:    { bg: 'rgba(15,110,86,0.12)', color: '#0F6E56', label: 'Full' },
    partial: { bg: 'rgba(186,117,23,0.12)', color: '#BA7517', label: 'Partial' },
    none:    { bg: 'rgba(163,45,45,0.1)', color: '#A32D2D', label: 'None' },
  }[coverage];
  return (
    <span
      className="font-mono text-[9px] font-medium tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-[3px] whitespace-nowrap"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {styles.label}
    </span>
  );
}

// ── Reasoning panel ───────────────────────────────────────────────────────────

interface ReasoningPanelProps {
  reasoning: AgentReasoning;
  versionCount: number;
  guidanceCount: number;
}

function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  const fullCount = reasoning.guidance_coverage.filter((g) => g.coverage === 'full').length;
  const total = reasoning.guidance_coverage.length;
  const refCount = reasoning.reference_extractions.length;
  const [open, setOpen] = useState(false);

  const summary = `${refCount} ref${refCount !== 1 ? 's' : ''} · ${fullCount}/${total} guidance points covered`;

  return (
    <div
      className="flex-shrink-0"
      style={{ borderTop: '1px solid var(--serif-border)', backgroundColor: 'rgba(29,158,117,0.04)' }}
    >
      {/* Toggle strip */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[rgba(29,158,117,0.04)]"
      >
        <span className="text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
          {open ? '▾' : '▸'}
        </span>
        <span className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase" style={{ color: 'var(--serif-muted-foreground)' }}>
          Agent reasoning &amp; evidence coverage
        </span>
        <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--serif-muted-foreground)', opacity: 0.7 }}>
          {summary}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Reference extractions */}
          {reasoning.reference_extractions.length > 0 && (
            <div>
              <p className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--serif-muted-foreground)' }}>
                Reference extractions
              </p>
              <div className="flex flex-col gap-1.5">
                {reasoning.reference_extractions.map((r) => (
                  <div
                    key={r.article_number}
                    className="flex gap-2 rounded-[4px] p-2"
                    style={{ backgroundColor: 'rgba(8,56,96,0.05)' }}
                  >
                    <span className="font-mono text-[10px] font-medium flex-shrink-0 w-7" style={{ color: 'var(--serif-accent)' }}>
                      #{r.article_number}
                    </span>
                    <span className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--serif-foreground)' }}>
                      {r.key_findings}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidance coverage */}
          {reasoning.guidance_coverage.length > 0 && (
            <div>
              <p className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--serif-muted-foreground)' }}>
                Guidance coverage
              </p>
              <div className="flex flex-col gap-1">
                {reasoning.guidance_coverage.map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-1 font-mono text-[10px] leading-snug" style={{ color: 'var(--serif-foreground)' }}>
                      {g.guidance_point}
                    </span>
                    <CoverageBadge coverage={g.coverage} />
                    {g.supporting_refs.length > 0 && (
                      <span className="font-mono text-[9px] flex-shrink-0" style={{ color: 'var(--serif-muted-foreground)' }}>
                        [{g.supporting_refs.map((n) => `#${n}`).join(', ')}]
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence gaps */}
          {reasoning.evidence_gaps.length > 0 && (
            <div>
              <p className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: '#A32D2D' }}>
                Evidence gaps
              </p>
              <ul className="flex flex-col gap-1">
                {reasoning.evidence_gaps.map((g, i) => (
                  <li key={i} className="font-mono text-[10px] leading-snug" style={{ color: 'var(--serif-foreground)' }}>
                    • {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Synthesis notes */}
          {(reasoning.synthesis_approach || reasoning.consistency_notes) && (
            <div>
              <p className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--serif-muted-foreground)' }}>
                Synthesis notes
              </p>
              {reasoning.synthesis_approach && (
                <p className="font-mono text-[10px] leading-relaxed mb-1" style={{ color: 'var(--serif-foreground)' }}>
                  {reasoning.synthesis_approach}
                </p>
              )}
              {reasoning.consistency_notes && (
                <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'var(--serif-muted-foreground)' }}>
                  {reasoning.consistency_notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-12">
      <svg aria-hidden="true" className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--serif-muted-foreground)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <p className="font-mono text-[11px] tracking-[0.08em] uppercase" style={{ color: 'var(--serif-muted-foreground)' }}>
        Select a section to begin
      </p>
      <p className="text-xs max-w-xs" style={{ color: 'var(--serif-muted-foreground)', opacity: 0.6 }}>
        Choose a section from the outline on the left to view and edit its content.
      </p>
    </div>
  );
}

// ── SectionEditor ─────────────────────────────────────────────────────────────

interface SectionEditorProps {
  section: DossierSection | null;
  dossierId: string;
  dossierTitle: string;
  allSections: DossierSection[];
  onGuidanceChange: (sectionId: string, value: string) => void;
  onManageReferences: (section: DossierSection) => void;
  onSectionUpdate: (section: DossierSection) => void;
  onUnlinkArticle: (sectionId: string, libraryArticleId: string) => void;
}

export function SectionEditor({
  section,
  dossierId,
  dossierTitle,
  allSections,
  onGuidanceChange,
  onManageReferences,
  onSectionUpdate,
  onUnlinkArticle,
}: SectionEditorProps) {
  // ── Guidance state ──────────────────────────────────────────────────────────
  const [guidance, setGuidance] = useState('');
  const guidanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Content / version state ─────────────────────────────────────────────────
  const [contentVersions, setContentVersions] = useState<SectionContent[]>([]);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

  // ── Generation state ────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generationError, setGenerationError] = useState('');

  // ── Direction / reasoning ───────────────────────────────────────────────────
  const [additionalDirection, setAdditionalDirection] = useState('');
  const [reasoningData, setReasoningData] = useState<AgentReasoning | null>(null);

  // ── Editor save debounce ref ────────────────────────────────────────────────
  const editorSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Tiptap editor ───────────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Generate content using the buttons below, or start writing…' }),
      CharacterCount,
      Typography,
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[200px] p-4',
        style: [
          'font-family: var(--font-source-sans, "Source Sans 3", sans-serif)',
          'line-height: 1.75',
          'color: var(--serif-foreground)',
          'font-size: 14px',
        ].join('; '),
      },
    },
    onUpdate: ({ editor: ed }) => {
      // Only debounce save if we're viewing the current version
      if (viewingVersionId !== null) return; // read-only viewing old version
      if (editorSaveTimerRef.current) clearTimeout(editorSaveTimerRef.current);
      editorSaveTimerRef.current = setTimeout(() => {
        if (!section) return;
        const html = ed.getHTML();
        const words = ed.storage.characterCount?.words() ?? 0;
        updateCurrentContent(dossierId, section.id, html, words);
      }, SAVE_DEBOUNCE_MS);
    },
  });

  // ── Reload content when section changes ─────────────────────────────────────
  useEffect(() => {
    if (!section) {
      editor?.commands.clearContent();
      setContentVersions([]);
      setViewingVersionId(null);
      setReasoningData(null);
      return;
    }
    setGuidance(section.guidanceNotes ?? '');

    const versions = getContentVersions(dossierId, section.id) as SectionContent[];
    setContentVersions(versions);
    setViewingVersionId(null);

    const current = versions.find((v) => v.isCurrent);
    if (current && editor) {
      editor.commands.setContent(current.content);
    } else if (editor) {
      editor.commands.clearContent();
    }
    setReasoningData(current?.agentReasoning ?? null);
    setGenerationError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id]);

  // ── Update editor editable when viewing mode changes ────────────────────────
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(viewingVersionId === null);
  }, [editor, viewingVersionId]);

  // ── Guidance change with debounce ────────────────────────────────────────────
  function handleGuidanceChange(value: string) {
    setGuidance(value);
    if (guidanceTimerRef.current) clearTimeout(guidanceTimerRef.current);
    guidanceTimerRef.current = setTimeout(() => {
      if (section) onGuidanceChange(section.id, value);
    }, GUIDANCE_DEBOUNCE_MS);
  }

  // ── Switch version tab ───────────────────────────────────────────────────────
  function handleViewVersion(v: SectionContent) {
    const isCurrent = v.isCurrent;
    setViewingVersionId(isCurrent ? null : v.id);
    editor?.commands.setContent(v.content);
    setReasoningData(v.agentReasoning ?? null);
  }

  // ── Restore version ──────────────────────────────────────────────────────────
  function handleRestoreVersion() {
    if (!section || !viewingVersionId) return;
    const confirmed = window.confirm(`Restore this version? It will become the current version.`);
    if (!confirmed) return;
    restoreContentVersion(dossierId, section.id, viewingVersionId);
    const versions = getContentVersions(dossierId, section.id) as SectionContent[];
    setContentVersions(versions);
    setViewingVersionId(null);
    const current = versions.find((v) => v.isCurrent);
    if (current && editor) editor.commands.setContent(current.content);
  }

  // ── Generate content (SSE streaming) ──────────────────────────────────────────
  const generate = useCallback(async (contentType: 'text' | 'table' | 'visual') => {
    if (!section || isGenerating) return;
    if (section.articleLinks.length === 0) return;

    setIsGenerating(true);
    setGenerationError('');
    setGenerationProgress(`Extracting evidence from ${section.articleLinks.length} reference${section.articleLinks.length !== 1 ? 's' : ''}…`);

    // Build flattened sibling context (all sections except this one).
    const siblingContexts = allSections
      .flatMap(function flat(s: DossierSection): DossierSection[] { return [s, ...s.children.flatMap(flat)]; })
      .filter((s) => s.id !== section.id)
      .map((s) => ({ number: s.number, title: s.title, status: s.status }));

    // Writing context from the Context Manager (if any).
    let writingContext: unknown = undefined;
    try {
      const raw = localStorage.getItem(contextKey(dossierId));
      if (raw) writingContext = JSON.parse(raw);
    } catch { /* ignore */ }

    const payload = {
      sectionId: section.id,
      sectionNumber: section.number,
      sectionTitle: section.title,
      guidanceNotes: guidance,
      contentType,
      additionalDirection: additionalDirection.trim() || undefined,
      dossierTitle,
      articles: section.articleLinks.map((l) => ({
        articleNumber: l.articleNumber,
        title: l.title,
        authors: l.authors,
        journal: l.journal,
        pubDate: l.pubDate,
        studyType: l.studyType,
        patientPopulation: l.patientPopulation,
        interventions: l.interventions,
        primaryOutcomes: l.primaryOutcomes,
        category: l.category,
        abstract: l.abstract,
      })),
      siblingContexts,
      writingContext,
    };

    let buffer = '';            // accumulated streamed HTML content
    let wordCount = 0;
    let agentReasoning: AgentReasoning | null = null;

    try {
      const res = await fetch('/api/dossier/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        setGenerationError('Generation failed: the writing service is unavailable.');
        return;
      }

      setGenerationProgress('Synthesising evidence…');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) sseBuffer += decoder.decode(value, { stream: true });

        // Split on event boundaries.
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() ?? '';

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith('data:')) continue;
          const json = line.slice(line.indexOf('data:') + 5).trim();
          if (!json) continue;

          let msg: { type: string; text?: string; wordCount?: number; agentReasoning?: AgentReasoning | null; message?: string };
          try {
            msg = JSON.parse(json);
          } catch {
            continue;
          }

          if (msg.type === 'content' && msg.text) {
            buffer += msg.text;
            // Live-update the editor with streaming prose.
            editor?.commands.setContent(buffer);
          } else if (msg.type === 'reasoning') {
            if (typeof msg.wordCount === 'number') wordCount = msg.wordCount;
            agentReasoning = msg.agentReasoning ?? null;
          } else if (msg.type === 'error') {
            setGenerationError(`Generation failed: ${msg.message ?? 'unknown error'}`);
            return;
          } else if (msg.type === 'done') {
            // Finalise below after the loop.
            done = true;
          }
        }
      }

      // Finalise — persist the accumulated content as a new version.
      if (!wordCount) {
        wordCount = buffer.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      }

      const saved = saveContentVersion(dossierId, section.id, {
        content: buffer,
        contentType,
        wordCount,
        source: 'ai',
        agentReasoning: agentReasoning ?? undefined,
      });

      if (saved) {
        const versions = getContentVersions(dossierId, section.id) as SectionContent[];
        setContentVersions(versions);
        setViewingVersionId(null);
        editor?.commands.setContent(buffer);
        setReasoningData(agentReasoning);
        onSectionUpdate(section);
      }
    } catch {
      setGenerationError('Generation failed: API unavailable. Please check your connection.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  }, [section, isGenerating, allSections, guidance, additionalDirection, dossierId, dossierTitle, editor, onSectionUpdate]);

  // ── Manual save ─────────────────────────────────────────────────────────────

  function handleManualSave() {
    if (!section || !editor || isViewingOld) return;
    const html = editor.getHTML();
    const words = editor.storage.characterCount?.words() ?? 0;
    const saved = saveContentVersion(dossierId, section.id, {
      content: html,
      contentType: 'text',
      wordCount: words,
      source: 'human',
      agentReasoning: undefined,
    });
    if (saved) {
      const versions = getContentVersions(dossierId, section.id) as SectionContent[];
      setContentVersions(versions);
      setViewingVersionId(null);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const currentVersion = contentVersions.find((v) => v.isCurrent);
  const wordCount = currentVersion?.wordCount ?? 0;
  const viewingVersion = viewingVersionId ? contentVersions.find((v) => v.id === viewingVersionId) : null;
  const isViewingOld = viewingVersionId !== null;
  const noArticles = (section?.articleLinks.length ?? 0) === 0;

  if (!section) return <EmptyState />;

  // Version tabs: show newest first. Label: current one = "Current", others = "v{N}"
  // Sort by version desc
  const sortedVersions = [...contentVersions].sort((a, b) => b.version - a.version);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sticky section header */}
      <div
        className="flex items-start justify-between gap-4 px-8 py-5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--serif-border)' }}
      >
        <div>
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className="font-mono text-sm font-medium tabular-nums flex-shrink-0" style={{ color: 'var(--serif-accent)' }}>
              {section.number}
            </span>
            <h2 className="font-playfair text-2xl font-normal leading-snug" style={{ color: 'var(--serif-foreground)' }}>
              {section.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={section.status} />
            {wordCount > 0 && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
                {wordCount} words
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT COLUMN — Guidance + References */}
        <div
          className="flex flex-col overflow-y-auto flex-shrink-0"
          style={{
            width: '38%',
            minWidth: '280px',
            borderRight: '1px solid var(--serif-border)',
            padding: '20px',
            gap: '20px',
          }}
        >
          {/* Pre-generation advisory note */}
          {section.preGenerationNote && (
            <div
              className="rounded-[6px] px-3 py-2.5 text-xs leading-relaxed"
              style={{ backgroundColor: 'rgba(186,117,23,0.1)', color: '#8A560F', border: '1px solid rgba(186,117,23,0.25)' }}
            >
              {section.preGenerationNote}
            </div>
          )}

          {/* Guidance notes */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase" style={{ color: 'var(--serif-muted-foreground)' }}>
              Guidance notes
            </label>
            <div
              className="rounded-[6px] border"
              style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-muted)' }}
            >
              <textarea
                value={guidance}
                onChange={(e) => handleGuidanceChange(e.target.value)}
                rows={6}
                placeholder="Add bullet-point guidance for this section…"
                className="w-full px-3 py-2.5 rounded-[6px] text-sm bg-transparent focus:outline-none resize-y leading-relaxed"
                style={{ color: 'var(--serif-foreground)' }}
              />
            </div>
          </div>

          {/* Linked references */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase" style={{ color: 'var(--serif-muted-foreground)' }}>
                References
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-[3px] font-mono text-[9px]"
                  style={{ backgroundColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
                >
                  {section.articleLinks.length}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onManageReferences(section)}
                className="font-mono text-[9px] tracking-[0.08em] uppercase transition-opacity hover:opacity-70"
                style={{ color: 'var(--serif-accent)' }}
              >
                Add references
              </button>
            </div>

            {section.articleLinks.length === 0 ? (
              <div
                className="rounded-[6px] border border-dashed px-3 py-4 text-center"
                style={{ borderColor: 'var(--serif-border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>
                  No references linked.{' '}
                  <button
                    type="button"
                    className="hover:underline"
                    style={{ color: 'var(--serif-accent)' }}
                    onClick={() => onManageReferences(section)}
                  >
                    Add references
                  </button>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0" style={{ borderColor: 'var(--serif-border)' }}>
                {section.articleLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-start gap-2 py-2 border-b last:border-0"
                    style={{ borderColor: 'var(--serif-border)' }}
                  >
                    <span className="font-mono text-[10px] font-medium flex-shrink-0 w-7 mt-0.5" style={{ color: 'var(--serif-accent)' }}>
                      #{link.articleNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug line-clamp-1" style={{ color: 'var(--serif-foreground)' }}>
                        {link.pubmedUrl ? (
                          <a href={link.pubmedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {link.title || '—'}
                          </a>
                        ) : (link.title || '—')}
                      </p>
                      {link.journal && (
                        <p className="font-mono text-[10px] mt-0.5 truncate" style={{ color: 'var(--serif-muted-foreground)' }}>
                          {link.journal}{link.pubDate ? ` · ${link.pubDate}` : ''}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      title="Unlink reference"
                      onClick={() => onUnlinkArticle(section.id, link.libraryArticleId)}
                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[10px] rounded-[2px] transition-colors hover:bg-[rgba(163,45,45,0.1)] mt-0.5"
                      style={{ color: 'var(--serif-muted-foreground)' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Editor */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col">

            {/* Version tabs */}
            {sortedVersions.length > 0 && (
              <div
                className="flex items-center gap-0 border-b flex-shrink-0 px-4 pt-1"
                style={{ borderColor: 'var(--serif-border)' }}
              >
                {/* Current tab (newest) */}
                {sortedVersions.map((v, i) => {
                  const isActive = i === 0
                    ? viewingVersionId === null
                    : viewingVersionId === v.id;
                  const label = i === 0 ? 'Current' : `v${v.version}`;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleViewVersion(v)}
                      className="px-3 py-2 text-xs font-mono transition-colors border-b-2"
                      style={{
                        borderBottomColor: isActive ? 'var(--serif-accent)' : 'transparent',
                        color: isActive ? 'var(--serif-accent)' : 'var(--serif-muted-foreground)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}

                {/* Restore button */}
                {isViewingOld && viewingVersion && (
                  <button
                    type="button"
                    onClick={handleRestoreVersion}
                    className="ml-auto mr-2 font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1 rounded-[4px] border transition-all hover:opacity-80"
                    style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-accent)' }}
                  >
                    Restore v{viewingVersion.version}
                  </button>
                )}
              </div>
            )}

            {/* Toolbar */}
            {editor && (
              <div
                className="flex items-center gap-0.5 px-2 flex-shrink-0 border-b"
                style={{
                  backgroundColor: 'var(--serif-muted)',
                  borderColor: 'var(--serif-border)',
                  minHeight: '44px',
                }}
              >
                <Tbtn
                  title="Bold"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive('bold')}
                  disabled={isViewingOld}
                >
                  <strong>B</strong>
                </Tbtn>
                <Tbtn
                  title="Italic"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive('italic')}
                  disabled={isViewingOld}
                >
                  <em>I</em>
                </Tbtn>
                <TbtnSep />
                <Tbtn
                  title="Heading 2"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor.isActive('heading', { level: 2 })}
                  disabled={isViewingOld}
                >
                  H2
                </Tbtn>
                <Tbtn
                  title="Heading 3"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  active={editor.isActive('heading', { level: 3 })}
                  disabled={isViewingOld}
                >
                  H3
                </Tbtn>
                <TbtnSep />
                <Tbtn
                  title="Bullet list"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  active={editor.isActive('bulletList')}
                  disabled={isViewingOld}
                >
                  ≡
                </Tbtn>
                <Tbtn
                  title="Ordered list"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  active={editor.isActive('orderedList')}
                  disabled={isViewingOld}
                >
                  1.
                </Tbtn>
                <TbtnSep />
                <Tbtn
                  title="Undo"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={isViewingOld || !editor.can().undo()}
                >
                  ↩
                </Tbtn>
                <Tbtn
                  title="Redo"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={isViewingOld || !editor.can().redo()}
                >
                  ↪
                </Tbtn>

                {isViewingOld && (
                  <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
                    View only — restore to edit
                  </span>
                )}
              </div>
            )}

            {/* Editor content */}
            <div
              className="flex-1"
              style={{ backgroundColor: 'var(--serif-card)' }}
            >
              <style>{`
                .prose-editor [data-placeholder]::before {
                  content: attr(data-placeholder);
                  color: var(--serif-muted-foreground);
                  opacity: 0.5;
                  pointer-events: none;
                  position: absolute;
                }
                .prose-editor p { margin-bottom: 0.75em; }
                .prose-editor h2 { font-family: var(--font-playfair, "Playfair Display", serif); font-size: 1.25rem; font-weight: 400; margin-bottom: 0.5em; margin-top: 1em; }
                .prose-editor h3 { font-family: var(--font-playfair, "Playfair Display", serif); font-size: 1.1rem; font-weight: 400; margin-bottom: 0.4em; margin-top: 0.8em; }
                .prose-editor ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.75em; }
                .prose-editor ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.75em; }
                .prose-editor li { margin-bottom: 0.25em; }
                .prose-editor table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                .prose-editor th, .prose-editor td { border: 1px solid var(--serif-border); padding: 6px 10px; text-align: left; font-size: 13px; }
                .prose-editor th { background: var(--serif-muted); font-weight: 600; }
              `}</style>
              <EditorContent editor={editor} />
            </div>

            {/* Direction input */}
            <div
              className="flex-shrink-0 px-4 pt-3 pb-2 border-t"
              style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
            >
              <label className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase block mb-1.5" style={{ color: 'var(--serif-muted-foreground)' }}>
                Additional direction
              </label>
              <textarea
                value={additionalDirection}
                onChange={(e) => setAdditionalDirection(e.target.value)}
                rows={2}
                placeholder="Add further instructions to refine the generated content… e.g. 'Focus on Phase III data only' or 'Add a table comparing study populations'"
                className="w-full px-3 py-2 rounded-[6px] border text-xs bg-transparent focus:outline-none resize-none leading-relaxed"
                style={{
                  borderColor: 'var(--serif-border)',
                  color: 'var(--serif-foreground)',
                  backgroundColor: 'var(--serif-muted)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
              />
            </div>

            {/* Generate + Save row */}
            <div
              className="flex items-center gap-2 px-4 py-3 flex-shrink-0 border-t"
              style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span className="text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
                    {generationProgress}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  {/* Non-interactive "Generate:" label */}
                  <span
                    className="font-mono text-xs font-medium tracking-[0.08em] flex-shrink-0"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    Generate:
                  </span>
                  <button
                    type="button"
                    onClick={() => generate('text')}
                    disabled={isGenerating || noArticles}
                    title={noArticles ? 'Link references first' : 'Generate prose text'}
                    className="px-3.5 py-2 rounded-[6px] text-xs font-medium font-mono text-white transition-all duration-150 disabled:opacity-40"
                    style={{ backgroundColor: 'var(--serif-accent)' }}
                  >
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => generate('table')}
                    disabled={isGenerating || noArticles}
                    title={noArticles ? 'Link references first' : 'Generate evidence table'}
                    className="px-3.5 py-2 rounded-[6px] text-xs font-medium font-mono transition-all duration-150 border disabled:opacity-40"
                    style={{
                      borderColor: 'var(--serif-border)',
                      color: 'var(--serif-foreground)',
                    }}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => generate('visual')}
                    disabled={isGenerating || noArticles}
                    title={noArticles ? 'Link references first' : 'Generate visual summary'}
                    className="px-3.5 py-2 rounded-[6px] text-xs font-medium font-mono transition-all duration-150 border disabled:opacity-40"
                    style={{
                      borderColor: 'var(--serif-border)',
                      color: 'var(--serif-foreground)',
                    }}
                  >
                    Visual
                  </button>

                  {/* Save button — right side */}
                  <button
                    type="button"
                    onClick={handleManualSave}
                    disabled={isViewingOld || !editor}
                    title="Save current content as a new version"
                    className="ml-auto px-4 py-2 rounded-[6px] text-xs font-medium font-mono border transition-all duration-150 disabled:opacity-40 flex items-center gap-1.5"
                    style={{
                      borderColor: 'var(--serif-accent)',
                      color: 'var(--serif-accent)',
                      backgroundColor: 'rgba(8,56,96,0.05)',
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3h13A1.5 1.5 0 0122 4.5v15A1.5 1.5 0 0120.5 21h-17A1.5 1.5 0 012 19.5v-12z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21v-6a1 1 0 011-1h6a1 1 0 011 1v6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4h10V3" />
                    </svg>
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Inline generation error */}
            {generationError && !isGenerating && (
              <div
                className="flex-shrink-0 px-4 py-2 text-xs"
                style={{ color: '#A32D2D', backgroundColor: 'rgba(163,45,45,0.06)', borderTop: '1px solid var(--serif-border)' }}
              >
                {generationError}
              </div>
            )}
          </div>

          {/* Reasoning panel */}
          {reasoningData && (
            <ReasoningPanel
              reasoning={reasoningData}
              versionCount={contentVersions.length}
              guidanceCount={(reasoningData.guidance_coverage ?? []).length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
