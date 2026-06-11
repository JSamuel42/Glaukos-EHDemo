'use client';

import { useRef, useState } from 'react';
import type { DossierSection, SectionStatus } from '@/lib/dossier/types';
import { computeLevel } from '@/lib/dossier/store';

// ── Status dot ────────────────────────────────────────────────────────────────

function statusColour(status: SectionStatus): string {
  switch (status) {
    case 'pending':   return 'var(--serif-border)';
    case 'draft':     return '#BA7517';
    case 'in_review': return '#185FA5';
    case 'final':     return '#0F6E56';
  }
}

function StatusDot({ status }: { status: SectionStatus }) {
  return (
    <span
      title={status}
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: statusColour(status),
        flexShrink: 0,
      }}
    />
  );
}

// ── Add section inline form ───────────────────────────────────────────────────

interface AddSectionFormProps {
  parentSection: DossierSection | null;
  siblingCount: number;
  onConfirm: (number: string, title: string, parentId: string | null) => void;
  onCancel: () => void;
}

function AddSectionForm({ parentSection, siblingCount, onConfirm, onCancel }: AddSectionFormProps) {
  const suggestedNumber = parentSection
    ? `${parentSection.number}.${siblingCount + 1}`
    : `${siblingCount + 1}`;

  const [num, setNum] = useState(suggestedNumber);
  const [title, setTitle] = useState('');
  const SECTION_RE = /^\d+(\.\d+){0,3}$/;
  const valid = SECTION_RE.test(num.trim()) && title.trim().length > 0;

  return (
    <div
      className="mt-1 mb-2 mx-2 p-3 rounded-[6px] border flex flex-col gap-2"
      style={{ borderColor: 'var(--serif-accent)', backgroundColor: 'rgba(8,56,96,0.04)' }}
    >
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="1.1"
          className="w-16 px-2 py-1 rounded-[4px] border text-xs font-mono bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-foreground)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onConfirm(num.trim(), title.trim(), parentSection?.id ?? null);
            if (e.key === 'Escape') onCancel();
          }}
          placeholder="Section title"
          className="flex-1 px-2 py-1 rounded-[4px] border text-xs bg-transparent focus:outline-none"
          style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-foreground)' }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
        />
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => valid && onConfirm(num.trim(), title.trim(), parentSection?.id ?? null)}
          disabled={!valid}
          className="px-3 py-0.5 rounded-[4px] text-[11px] font-medium text-white transition-all disabled:opacity-40"
          style={{ backgroundColor: 'var(--serif-accent)' }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-0.5 rounded-[4px] text-[11px] transition-all"
          style={{ color: 'var(--serif-muted-foreground)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Recursive tree item ───────────────────────────────────────────────────────

interface TreeItemProps {
  section: DossierSection;
  allSections: DossierSection[];  // flattened — for sibling count
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parent: DossierSection) => void;
  onDelete: (id: string) => void;
  addingUnder: string | null;
  siblingCount: number;
  dragState: { draggingId: string | null; overId: string | null };
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
}

function SectionTreeItem({
  section,
  selectedSectionId,
  onSelect,
  onAddChild,
  onDelete,
  addingUnder,
  dragState,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: TreeItemProps) {
  const [hovered, setHovered] = useState(false);
  const level = computeLevel(section.number);
  const isSelected = selectedSectionId === section.id;
  const isDragging = dragState.draggingId === section.id;
  const isOver    = dragState.overId === section.id;

  const indentPx = (level - 1) * 16;
  const canAddChild = level < 4;

  return (
    <div>
      <div
        draggable
        onDragStart={() => onDragStart(section.id)}
        onDragOver={(e) => { e.preventDefault(); onDragOver(section.id); }}
        onDragEnd={onDragEnd}
        onDrop={(e) => { e.preventDefault(); onDrop(section.id); }}
        onClick={() => onSelect(section.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer select-none transition-colors duration-100"
        style={{
          paddingLeft: `${12 + indentPx}px`,
          borderLeft: isSelected ? '2px solid var(--serif-accent)' : '2px solid transparent',
          backgroundColor: isSelected
            ? 'rgba(8,56,96,0.08)'
            : isOver
            ? 'rgba(8,56,96,0.04)'
            : hovered
            ? 'rgba(8,56,96,0.03)'
            : 'transparent',
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        {/* Drag handle */}
        <span
          className="flex-shrink-0 text-[14px] leading-none transition-opacity"
          style={{
            color: 'var(--serif-border)',
            opacity: hovered ? 1 : 0,
            cursor: 'grab',
          }}
          aria-hidden="true"
        >
          ⠿
        </span>

        {/* Section number */}
        <span
          className="font-mono text-[10px] font-medium flex-shrink-0 w-12 tabular-nums"
          style={{ color: 'var(--serif-accent)' }}
        >
          {section.number}
        </span>

        {/* Title */}
        <span
          className="flex-1 text-xs truncate"
          style={{ color: 'var(--serif-foreground)' }}
        >
          {section.title}
        </span>

        {/* Status dot + action buttons */}
        <span className="flex items-center gap-1 flex-shrink-0">
          <StatusDot status={section.status} />
          {hovered && (
            <>
              {canAddChild && (
                <button
                  type="button"
                  title="Add child section"
                  onClick={(e) => { e.stopPropagation(); onAddChild(section); }}
                  className="w-4 h-4 flex items-center justify-center rounded-[2px] transition-colors hover:bg-[rgba(8,56,96,0.15)] text-[10px] font-mono leading-none"
                  style={{ color: 'var(--serif-accent)' }}
                >
                  +
                </button>
              )}
              <button
                type="button"
                title="Delete section"
                onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
                className="w-4 h-4 flex items-center justify-center rounded-[2px] transition-colors hover:bg-[rgba(163,45,45,0.1)] text-[10px] leading-none"
                style={{ color: 'var(--serif-muted-foreground)' }}
              >
                ×
              </button>
            </>
          )}
        </span>
      </div>

      {/* Add child form */}
      {addingUnder === section.id && (
        <div style={{ paddingLeft: `${indentPx + 16}px` }}>
          {/* Rendered by parent — see OutlinePanel */}
        </div>
      )}

      {/* Recursive children */}
      {section.children.map((child) => (
        <SectionTreeItem
          key={child.id}
          section={child}
          allSections={[]}
          selectedSectionId={selectedSectionId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
          addingUnder={addingUnder}
          siblingCount={section.children.length}
          dragState={dragState}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

// ── OutlinePanel ──────────────────────────────────────────────────────────────

interface OutlinePanelProps {
  sections: DossierSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: (parentId: string | null, number: string, title: string) => void;
  onDeleteSection: (id: string) => void;
  onReorder: (updates: { id: string; orderIndex: number }[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function OutlinePanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onReorder,
  isOpen,
  onToggle,
}: OutlinePanelProps) {
  // Add-section form state
  const [addingUnder, setAddingUnder] = useState<DossierSection | null | 'root'>(null);
  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Flatten tree for utility
  function flatten(tree: DossierSection[]): DossierSection[] {
    const out: DossierSection[] = [];
    function walk(nodes: DossierSection[]) {
      for (const n of nodes) { out.push(n); walk(n.children); }
    }
    walk(tree);
    return out;
  }
  const flat = flatten(sections);

  // Drag handlers — reorder siblings only
  function handleDragStart(id: string) { setDraggingId(id); }
  function handleDragOver(id: string)  { if (id !== draggingId) setOverId(id); }
  function handleDragEnd()             { setDraggingId(null); setOverId(null); }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) { handleDragEnd(); return; }
    const dragging = flat.find((s) => s.id === draggingId);
    const target   = flat.find((s) => s.id === targetId);
    if (!dragging || !target) { handleDragEnd(); return; }
    // Only reorder within same parent
    if (dragging.parentSectionId !== target.parentSectionId) { handleDragEnd(); return; }
    const siblings = flat
      .filter((s) => s.parentSectionId === dragging.parentSectionId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const fromIdx = siblings.findIndex((s) => s.id === draggingId);
    const toIdx   = siblings.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) { handleDragEnd(); return; }
    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates = reordered.map((s, i) => ({ id: s.id, orderIndex: i }));
    onReorder(updates);
    handleDragEnd();
  }

  const rootSectionCount = sections.length;

  // ── Collapsed strip ─────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div
        ref={panelRef}
        className="flex flex-col items-center py-4 gap-3 cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
        style={{
          width: '48px',
          borderRight: '1px solid var(--serif-border)',
          backgroundColor: 'var(--serif-muted)',
        }}
        onClick={onToggle}
        role="button"
        aria-label="Expand content outline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--serif-accent)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span
          className="font-mono text-[9px] font-medium tracking-[0.14em] uppercase"
          style={{ writingMode: 'vertical-rl', color: 'var(--serif-muted-foreground)' }}
        >
          Outline
        </span>
      </div>
    );
  }

  // ── Expanded ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      className="flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        width: '280px',
        minWidth: '180px',
        maxWidth: '480px',
        resize: 'horizontal',
        borderRight: '1px solid var(--serif-border)',
        backgroundColor: 'var(--serif-muted)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: 'var(--serif-border)' }}
      >
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggle} aria-label="Collapse outline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'var(--serif-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase" style={{ color: 'var(--serif-accent)' }}>
            Content outline
          </span>
        </div>
        <button
          type="button"
          title="Add root section"
          onClick={() => setAddingUnder('root')}
          className="w-6 h-6 flex items-center justify-center rounded-[4px] transition-colors"
          style={{ color: 'var(--serif-accent)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Section tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {sections.length === 0 && addingUnder !== 'root' && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>
              No sections yet
            </p>
            <button
              type="button"
              onClick={() => setAddingUnder('root')}
              className="mt-2 text-xs hover:underline transition-colors"
              style={{ color: 'var(--serif-accent)' }}
            >
              Add first section
            </button>
          </div>
        )}

        {/* Root add form */}
        {addingUnder === 'root' && (
          <AddSectionForm
            parentSection={null}
            siblingCount={rootSectionCount}
            onConfirm={(num, title, parentId) => {
              onAddSection(parentId, num, title);
              setAddingUnder(null);
            }}
            onCancel={() => setAddingUnder(null)}
          />
        )}

        {sections.map((sec) => (
          <div key={sec.id}>
            <SectionTreeItem
              section={sec}
              allSections={flat}
              selectedSectionId={selectedSectionId}
              onSelect={onSelectSection}
              onAddChild={(parent) => setAddingUnder(parent)}
              onDelete={onDeleteSection}
              addingUnder={typeof addingUnder === 'object' && addingUnder ? addingUnder.id : null}
              siblingCount={rootSectionCount}
              dragState={{ draggingId, overId }}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
            />
            {/* Child add form — shown directly after the parent section */}
            {typeof addingUnder === 'object' && addingUnder && addingUnder.id === sec.id && (
              <AddSectionForm
                parentSection={sec}
                siblingCount={sec.children.length}
                onConfirm={(num, title, parentId) => {
                  onAddSection(parentId, num, title);
                  setAddingUnder(null);
                }}
                onCancel={() => setAddingUnder(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
