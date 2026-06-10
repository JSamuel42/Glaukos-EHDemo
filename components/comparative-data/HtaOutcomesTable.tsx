'use client';

import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import { getHtaSummary, type HtaOutcomeCounts } from '@/lib/comparative-data/grid-helpers';
import { cn } from '@/lib/cn';

/**
 * Standalone HTA outcomes table for the Timelines tab — mirrors the last
 * row of the Evidence Grid (which the user called out as "HTA outcomes").
 * One column per product, one row per outcome bucket plus a per-agency
 * breakdown row. Surfacing this here saves the user a tab-switch when
 * interrogating the reimbursement chevron's gradient.
 */

interface SummaryRowProps {
  label: string;
  values: (HtaOutcomeCounts | null)[];
  pick: (s: HtaOutcomeCounts) => number;
  /** Cell tint for the count colour. */
  tone?: 'positive' | 'restricted' | 'negative' | 'neutral';
}

function SummaryRow({ label, values, pick, tone = 'neutral' }: SummaryRowProps) {
  const toneClass: Record<NonNullable<SummaryRowProps['tone']>, string> = {
    positive: 'text-emerald-700',
    restricted: 'text-amber-700',
    negative: 'text-rose-700',
    neutral: 'text-slate-700',
  };
  return (
    <tr className="border-t border-slate-200">
      <th className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left text-xs font-medium text-slate-700 border-r border-slate-200 align-top">
        {label}
      </th>
      {values.map((v, i) => (
        <td
          key={i}
          className="px-3 py-2.5 text-center text-sm font-mono border-r border-slate-200 last:border-r-0"
        >
          {!v || v.total === 0 ? (
            <span className="text-slate-300">—</span>
          ) : (
            <span className={toneClass[tone]}>{pick(v)}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default function HtaOutcomesTable() {
  const summaries = ALL_PRODUCTS.map(p => ({
    product: p,
    summary: p.isFictional ? null : getHtaSummary(p),
  }));

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3
          className="font-playfair text-lg leading-tight"
          style={{ color: 'var(--serif-foreground)' }}
        >
          HTA outcomes
        </h3>
        <p
          className="text-sm mt-0.5"
          style={{ color: 'var(--serif-muted-foreground)' }}
        >
          Decisions logged per product across HTA agencies
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-700 border-r border-slate-200 min-w-[160px]">
                Metric
              </th>
              {summaries.map(({ product }) => (
                <th
                  key={product.brandName}
                  className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide min-w-[100px] border-r border-slate-200 last:border-r-0"
                  style={
                    product.isFictional
                      ? {
                          color: 'var(--serif-accent)',
                          backgroundColor: 'rgba(8,56,96,0.05)',
                        }
                      : { color: '#334155' }
                  }
                >
                  {product.brandName}
                  {product.isFictional ? (
                    <div
                      className="text-[10px] font-normal mt-0.5"
                      style={{ color: 'rgba(8,56,96,0.70)' }}
                    >
                      Pre-launch
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SummaryRow
              label="Total decisions"
              values={summaries.map(s => s.summary)}
              pick={s => s.total}
              tone="neutral"
            />
            <SummaryRow
              label="Recommended / positive"
              values={summaries.map(s => s.summary)}
              pick={s => s.recommended}
              tone="positive"
            />
            <SummaryRow
              label="With restrictions"
              values={summaries.map(s => s.summary)}
              pick={s => s.restricted}
              tone="restricted"
            />
            <SummaryRow
              label="Not recommended"
              values={summaries.map(s => s.summary)}
              pick={s => s.notRecommended}
              tone="negative"
            />
            <SummaryRow
              label="Other / pending"
              values={summaries.map(s => s.summary)}
              pick={s => s.other}
              tone="neutral"
            />
            <tr className="border-t border-slate-200">
              <th className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left text-xs font-medium text-slate-700 border-r border-slate-200 align-top">
                Agencies on record
              </th>
              {summaries.map(({ product, summary }) => (
                <td
                  key={product.brandName}
                  className={cn(
                    'px-3 py-2.5 text-[11px] text-slate-600 align-top border-r border-slate-200 last:border-r-0 leading-snug',
                  )}
                >
                  {!summary || summary.byAgency.length === 0 ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Array.from(new Set(summary.byAgency.map(a => a.agency)))
                        .sort()
                        .map(ag => (
                          <span
                            key={ag}
                            className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]"
                          >
                            {ag}
                          </span>
                        ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-500 italic">
        Pre-launch products have no HTA decisions on record.
      </p>
    </div>
  );
}
