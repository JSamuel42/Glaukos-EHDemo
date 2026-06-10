'use client';

import { FUNNELS, getFunnel } from '@/lib/epidemiology/data';
import { Funnel } from './Funnel';
import { cn } from '@/lib/cn';

interface Props {
  primaryId: string;
  comparisonId: string | null;
  onChangePrimary: (id: string) => void;
  onChangeComparison: (id: string | null) => void;
}

/**
 * Top half of the Epidemiology page. Holds one funnel by default; a
 * second slides in beside it when the user adds a comparison. Each
 * funnel slot is interactable independently (percentages, exports,
 * pop-ups) — no shared edit state across slots.
 */
export function FunnelWorkspace({
  primaryId,
  comparisonId,
  onChangePrimary,
  onChangeComparison,
}: Props) {
  const primary = getFunnel(primaryId);
  const comparison = comparisonId ? getFunnel(comparisonId) : null;

  if (!primary) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-slate-500">
          Workspace
        </h2>
        <div className="flex items-center gap-2">
          {!comparison && (
            <button
              type="button"
              onClick={() => {
                // Default the comparison slot to the first funnel that
                // isn't already in the primary slot.
                const candidate = FUNNELS.find(f => f.id !== primaryId);
                if (candidate) onChangeComparison(candidate.id);
              }}
              className="text-xs px-3 py-1.5 rounded-md border text-[color:var(--evhub-mint)] border-[color:var(--evhub-mint)] hover:bg-[rgba(93,202,165,0.08)]"
            >
              + Add comparison
            </button>
          )}
          {comparison && (
            <button
              type="button"
              onClick={() => onChangeComparison(null)}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Close comparison
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'grid gap-8',
          comparison ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1',
        )}
      >
        <Funnel funnel={primary} onSwitchFunnel={onChangePrimary} />
        {comparison && (
          <Funnel
            funnel={comparison}
            onSwitchFunnel={id => onChangeComparison(id)}
          />
        )}
      </div>
    </section>
  );
}
