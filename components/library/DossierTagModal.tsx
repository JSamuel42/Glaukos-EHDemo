'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DossierSection } from '@/lib/dossier/types';

/**
 * DossierTagModal — admin-mode control to tag a Library publication into one
 * or more sections of a dossier. Ported from EvHub-D's modal and adapted to
 * the Glaukos in-memory dossier store: the checkbox tree is built from
 * getDossierSections(dossierId); Save diffs the selection into add/remove
 * lists that the caller applies via linkArticle / unlinkArticle.
 */

interface Props {
  /** The article being tagged. */
  article: { id: string; title: string; number?: number };
  /** Region/label of the dossier being tagged (e.g. 'Global', 'UK'). */
  dossierLabel: string;
  /** Flat-then-nested section tree for this dossier. */
  sections: DossierSection[];
  /** Section IDs the article is currently linked to in this dossier. */
  linkedSectionIds: string[];
  /** Apply the diff. Resolves once the store has been updated. */
  onSave: (added: string[], removed: string[]) => void;
  onClose: () => void;
}

/** Group flat sections by their top-level (level-1) ancestor. */
function groupByTopLevel(sections: DossierSection[]): Map<string, DossierSection[]> {
  const map = new Map<string, DossierSection[]>();
  function walk(node: DossierSection, rootId: string) {
    if (!map.has(rootId)) map.set(rootId, []);
    map.get(rootId)!.push(node);
    for (const child of node.children) walk(child, rootId);
  }
  for (const root of sections) {
    if (root.level === 1) walk(root, root.id);
  }
  return map;
}

function flattenTree(sections: DossierSection[]): DossierSection[] {
  const out: DossierSection[] = [];
  function walk(nodes: DossierSection[]) {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  }
  walk(sections);
  return out;
}

export default function DossierTagModal({
  article,
  dossierLabel,
  sections,
  linkedSectionIds,
  onSave,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedSectionIds));

  useEffect(() => {
    setSelected(new Set(linkedSectionIds));
  }, [linkedSectionIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const flat = useMemo(() => flattenTree(sections), [sections]);
  const grouped = useMemo(() => groupByTopLevel(sections), [sections]);
  const rootSections = useMemo(() => sections.filter(s => s.level === 1), [sections]);

  function toggle(sectionId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }

  function handleSave() {
    const original = new Set(linkedSectionIds);
    const added = [...selected].filter(id => !original.has(id));
    const removed = [...original].filter(id => !selected.has(id));
    onSave(added, removed);
    onClose();
  }

  const isDirty =
    selected.size !== linkedSectionIds.length ||
    linkedSectionIds.some(id => !selected.has(id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-modal-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-lg rounded-lg overflow-hidden shadow-xl flex flex-col bg-white"
        style={{ maxHeight: '80vh', borderTop: '3px solid var(--evhub-mint)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-serif-border flex-shrink-0">
          <div className="min-w-0">
            <h2 id="tag-modal-title" className="font-playfair text-xl text-serif-foreground">
              Tag to {dossierLabel} dossier
            </h2>
            <p className="text-xs mt-0.5 truncate max-w-sm text-serif-muted-foreground">
              {article.number ? `#${article.number} · ` : ''}
              {article.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-xl text-serif-muted-foreground hover:bg-serif-muted transition-colors flex-shrink-0 ml-4"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto">
          {flat.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-serif-muted-foreground">
                No sections exist in this dossier yet.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {rootSections.map(root => {
                const subs = grouped.get(root.id) ?? [];
                return (
                  <div key={root.id} className="mb-1">
                    <div className="px-6 py-1.5 flex items-center gap-2 sticky top-0 z-10 bg-white">
                      <span
                        className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(8,56,96,0.1)', color: 'var(--evhub-navy)' }}
                      >
                        {root.number}
                      </span>
                      <span className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase truncate text-serif-muted-foreground">
                        {root.title}
                      </span>
                    </div>

                    {subs.map(sec => {
                      const isChecked = selected.has(sec.id);
                      const indent = (sec.level - 1) * 16;
                      return (
                        <label
                          key={sec.id}
                          className="flex items-center gap-3 px-6 py-2 cursor-pointer transition-colors hover:bg-[rgba(8,56,96,0.04)]"
                          style={{ paddingLeft: `${24 + indent}px` }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(sec.id)}
                            className="w-3.5 h-3.5 accent-[color:var(--evhub-mint)] flex-shrink-0"
                          />
                          <span
                            className="font-mono text-[10px] tabular-nums flex-shrink-0"
                            style={{ color: 'var(--evhub-navy)', minWidth: '2.5rem' }}
                          >
                            {sec.number}
                          </span>
                          <span className="text-xs flex-1 leading-snug text-serif-foreground">
                            {sec.title}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-serif-border flex-shrink-0">
          <span className="text-xs text-serif-muted-foreground">
            {selected.size > 0
              ? `${selected.size} section${selected.size !== 1 ? 's' : ''} selected`
              : 'No sections selected'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-serif-muted-foreground hover:text-serif-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="px-5 py-2 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--evhub-navy)' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
