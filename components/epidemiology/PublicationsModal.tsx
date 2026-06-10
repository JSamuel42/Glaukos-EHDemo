'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ARTICLES } from '@/lib/library/data';
import type { Funnel } from '@/lib/epidemiology/data';
import type { ComputedLevel } from '@/lib/epidemiology/calc';
import { cn } from '@/lib/cn';

type Rating = 'low' | 'med' | 'high' | null;

interface Props {
  funnel: Funnel;
  level: ComputedLevel;
  onClose: () => void;
}

/**
 * Tagged-publications modal. All controls (rating, shortlist, applied %,
 * comment, delete) are local state and intentionally non-persistent —
 * the modal's subtitle calls this out so demo viewers don't expect a
 * Save button to actually save anything.
 */
export function PublicationsModal({ funnel, level, onClose }: Props) {
  // Resolve full Library articles by ID. Tagging is curated per
  // country/level in lib/epidemiology/data.ts; most combinations are
  // empty and fall through to the empty-state copy below.
  const pubs = level.pubIds
    .map(id => ARTICLES.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Record<string, boolean>>({});

  const visible = pubs.filter(p => !removed[p.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                {funnel.countryFullName} · {level.name}
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--evhub-navy)] mt-1">
                Tagged publications
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Review evidence, grade quality, and shortlist for final estimate.
                <span className="text-slate-400"> (Inputs are placeholder for demo.)</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {visible.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No publications currently tagged to this level.
              <div className="text-xs mt-1 text-slate-300">
                Tagging is curated per country and level for the demo.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map(p => (
                <article key={p.id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--evhub-navy)]">
                        {p.id}
                      </div>
                      <div className="text-sm text-slate-700 mt-0.5 leading-snug">
                        {p.title ?? p.id}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {p.pub_date ?? '—'} · {p.study_type ?? p.study_design ?? '—'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemoved(r => ({ ...r, [p.id]: true }))}
                      className="text-xs text-slate-400 hover:text-rose-600 shrink-0"
                      title="Remove from this level (local only)"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 italic mt-2">
                    Extracted data for this level would appear here. (Placeholder.)
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-[auto_auto_auto_minmax(0,1fr)] gap-3 items-center">
                    {/* Rating */}
                    <div className="flex gap-1">
                      {(['low', 'med', 'high'] as const).map(r => {
                        const active = ratings[p.id] === r;
                        const activeStyle =
                          r === 'low'
                            ? 'bg-rose-100 text-rose-700'
                            : r === 'med'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-700';
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              setRatings(s => ({ ...s, [p.id]: s[p.id] === r ? null : r }))
                            }
                            className={cn(
                              'text-[10px] px-2 py-1 rounded uppercase font-semibold tracking-wide transition-colors',
                              active
                                ? activeStyle
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100',
                            )}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>

                    {/* Shortlist */}
                    <label className="text-xs text-slate-600 flex items-center gap-1.5 select-none">
                      <input
                        type="checkbox"
                        checked={shortlisted[p.id] ?? false}
                        onChange={e =>
                          setShortlisted(s => ({ ...s, [p.id]: e.target.checked }))
                        }
                      />
                      Shortlist
                    </label>

                    {/* Applied % */}
                    <div className="text-xs flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="—"
                        value={applied[p.id] ?? ''}
                        onChange={e =>
                          setApplied(s => ({ ...s, [p.id]: e.target.value }))
                        }
                        className="w-16 border border-slate-200 rounded px-1.5 py-0.5"
                      />
                      <span className="text-slate-500">% applied</span>
                    </div>

                    {/* Comment */}
                    <input
                      type="text"
                      placeholder="Comment for future reference…"
                      value={comments[p.id] ?? ''}
                      onChange={e =>
                        setComments(s => ({ ...s, [p.id]: e.target.value }))
                      }
                      className="text-xs border border-slate-200 rounded px-2 py-1 w-full"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-md text-white"
            style={{ backgroundColor: 'var(--evhub-mint)' }}
            title="Placeholder for demo — no-op"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
