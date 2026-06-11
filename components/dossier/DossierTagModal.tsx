'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DossierSection } from '@/lib/dossier/types';
import { ARTICLES } from '@/lib/library/data';

// ── DossierTagModal — canonical-Library article picker for ONE section ─────────
//
// Adapted from EvHub-D's section-tagging modal. In Glaukos the relationship is
// inverted: instead of tagging one article into many sections, the SectionEditor
// opens this modal to pick which canonical Library articles are linked to the
// CURRENT section. On Save it diffs and calls onSave(added, removed) with the
// libraryArticleIds (= ARTICLES[i].id).

interface Props {
  /** The section whose references are being managed. */
  section: DossierSection;
  /** Called with the diff of library article ids to add / remove. */
  onSave: (added: string[], removed: string[]) => Promise<void> | void;
  onClose: () => void;
}

export function DossierTagModal({ section, onSave, onClose }: Props) {
  // Articles currently linked to this section (by canonical library id).
  const linkedIds = useMemo(
    () => section.articleLinks.map((l) => l.libraryArticleId),
    [section.articleLinks],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set(linkedIds));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Re-sync local selection when the incoming linkedIds prop changes (an
    // external input, not render-derived state) — the cascading render is
    // intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set(linkedIds));
  }, [linkedIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(
    () =>
      ARTICLES.map((a, i) => ({
        id: a.id,
        n: i + 1,
        title: a.title || a.id,
        journal: a.journal || '',
        year: a.pub_year ?? '',
      })),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.journal.toLowerCase().includes(q) ||
        String(r.n) === q,
    );
  }, [rows, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setError('');
    const original = new Set(linkedIds);
    const added = [...selected].filter((id) => !original.has(id));
    const removed = [...original].filter((id) => !selected.has(id));
    try {
      await onSave(added, removed);
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  const totalLinked = selected.size;
  const isDirty =
    selected.size !== linkedIds.length ||
    linkedIds.some((id) => !selected.has(id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-modal-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-lg rounded-[8px] overflow-hidden shadow-serif-lg flex flex-col"
        style={{
          maxHeight: '80vh',
          backgroundColor: 'var(--serif-card)',
          borderTop: '2px solid var(--serif-accent)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--serif-border)' }}
        >
          <div>
            <h2
              id="tag-modal-title"
              className="font-playfair text-xl font-normal"
              style={{ color: 'var(--serif-foreground)' }}
            >
              Link references
            </h2>
            <p className="text-xs mt-0.5 truncate max-w-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
              {section.number} · {section.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-xl hover:bg-serif-muted transition-all duration-150 flex-shrink-0 ml-4"
            aria-label="Close"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--serif-border)' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter articles by title, journal, or number…"
            className="w-full px-3 py-2 rounded-[6px] border text-sm bg-transparent focus:outline-none transition-colors"
            style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-foreground)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
          />
        </div>

        {/* Article checklist */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
                No matching articles.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filtered.map((r) => {
                const isChecked = selected.has(r.id);
                return (
                  <label
                    key={r.id}
                    className="flex items-start gap-3 px-6 py-2 cursor-pointer transition-colors hover:bg-[rgba(8,56,96,0.04)]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(r.id)}
                      className="w-3.5 h-3.5 rounded-[2px] accent-[var(--serif-accent)] flex-shrink-0 mt-0.5"
                    />
                    <span
                      className="font-mono text-[10px] tabular-nums flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--serif-accent)', minWidth: '2rem' }}
                    >
                      [{r.n}]
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-xs leading-snug block" style={{ color: 'var(--serif-foreground)' }}>
                        {r.title}
                      </span>
                      {(r.journal || r.year) && (
                        <span className="font-mono text-[10px] mt-0.5 block" style={{ color: 'var(--serif-muted-foreground)' }}>
                          {r.journal}{r.journal && r.year ? ' · ' : ''}{r.year}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'var(--serif-border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>
            {totalLinked > 0
              ? `${totalLinked} reference${totalLinked !== 1 ? 's' : ''} selected`
              : 'No references selected'}
          </span>

          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs" style={{ color: '#A32D2D' }}>{error}</span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[6px] text-sm transition-all duration-150"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="px-5 py-2 rounded-[6px] text-sm font-medium text-white transition-all duration-150 disabled:opacity-40"
              style={{ backgroundColor: 'var(--serif-accent)' }}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
