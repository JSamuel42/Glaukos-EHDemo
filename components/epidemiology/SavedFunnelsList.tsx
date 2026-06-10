'use client';

import { FUNNELS, COUNTRY_FLAGS } from '@/lib/epidemiology/data';
import { computeFunnel, formatAbsolute } from '@/lib/epidemiology/calc';
import { cn } from '@/lib/cn';

interface Props {
  primaryId: string;
  comparisonId: string | null;
  onView: (id: string) => void;
  onCompare: (id: string) => void;
}

/**
 * Bottom half of the Epidemiology page — saved funnels table.
 *
 * View loads the row into the primary workspace slot; Compare loads it
 * into the comparison slot. The currently-active rows are flagged with
 * a coloured background and their respective action button is disabled
 * so the user can't no-op themselves into an obvious dead-click.
 */
export function SavedFunnelsList({ primaryId, comparisonId, onView, onCompare }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 overflow-auto">
      <h2 className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-slate-500 mb-3">
        Saved funnels ({FUNNELS.length})
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-3 font-semibold">Funnel</th>
            <th className="py-2 pr-3 font-semibold">Country</th>
            <th className="py-2 pr-3 font-semibold">Target population</th>
            <th className="py-2 pr-3 font-semibold">Last saved</th>
            <th className="py-2 pr-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {FUNNELS.map(f => {
            const computed = computeFunnel(f);
            const target = computed[computed.length - 1];
            const isPrimary = f.id === primaryId;
            const isComparison = f.id === comparisonId;
            return (
              <tr
                key={f.id}
                className={cn(
                  'border-b border-slate-100',
                  isPrimary
                    ? 'bg-[rgba(93,202,165,0.06)]'
                    : isComparison
                      ? 'bg-emerald-50/60'
                      : 'hover:bg-slate-50',
                )}
              >
                <td className="py-2.5 pr-3 font-medium text-[color:var(--evhub-navy)]">
                  {f.name}
                </td>
                <td className="py-2.5 pr-3 text-slate-700">
                  <span className="mr-1.5">{COUNTRY_FLAGS[f.country]}</span>
                  {f.countryFullName}
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-slate-700">
                  {formatAbsolute(target.absolute)}
                </td>
                <td className="py-2.5 pr-3 text-slate-500 text-xs font-mono tabular-nums">
                  {f.lastSaved}
                </td>
                <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onView(f.id)}
                    disabled={isPrimary}
                    className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed mr-1"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onCompare(f.id)}
                    disabled={isPrimary || isComparison}
                    className="text-xs px-2 py-1 rounded border text-[color:var(--evhub-mint)] border-[color:var(--evhub-mint)] hover:bg-[rgba(93,202,165,0.08)] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Compare
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
