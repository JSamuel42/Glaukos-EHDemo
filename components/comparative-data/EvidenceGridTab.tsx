'use client';

import { useState } from 'react';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import type { ProductEntry } from '@/lib/comparative-data/types';
import {
  ALNYX_STRENGTH_RATINGS,
  BEST_IN_CLASS,
  DIMENSIONS,
  DIMENSION_LABEL,
  type Dimension,
} from '@/lib/comparative-data/ratings';
import {
  getEfficacySummary,
  getSafetySummary,
  getDosingSummary,
  getHrqolSummary,
  getRwdSummary,
  getItcSummary,
  getHtaSummary,
} from '@/lib/comparative-data/grid-helpers';
import StrengthBadge from './StrengthBadge';
import BestInClassBadge from './BestInClassBadge';
import { cn } from '@/lib/cn';

const PRODUCT_ORDER = [
  'Alnyx',
  'Tecvayli',
  'Elrexfio',
  'Talvey',
  'Lynozyfic',
  'Carvykti',
  'Abecma',
  'Blenrep',
];

const PRODUCT_COLOURS: Record<string, string> = {
  Alnyx: '#B8860B',
  Tecvayli: '#3B82F6',
  Elrexfio: '#8B5CF6',
  Talvey: '#EC4899',
  Lynozyfic: '#F59E0B',
  Carvykti: '#EF4444',
  Abecma: '#10B981',
  Blenrep: '#6366F1',
};

const MODALITY_LABEL: Record<ProductEntry['modalityCategory'], string> = {
  bispecific: 'Bispecific',
  'car-t': 'CAR-T',
  adc: 'ADC',
};

// Override the dimension label for the grid's "Economic Value" row — in
// this tab the underlying column actually summarises HTA outcomes, so the
// renamed header reads truer to the data shown.
const GRID_DIMENSION_LABEL: Record<Dimension, string> = {
  ...DIMENSION_LABEL,
  economic: 'HTA outcomes',
};

export default function EvidenceGridTab() {
  // Visibility toggle for the table columns (matches the spider chart /
  // timeline chip-row pattern). Default to all products on for the deep-
  // dive view — users can switch off the products they're not comparing.
  const [visible, setVisible] = useState<Set<string>>(new Set(PRODUCT_ORDER));

  const toggleProduct = (name: string) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const orderedProducts = PRODUCT_ORDER.map(
    name => ALL_PRODUCTS.find(p => p.brandName === name)!,
  ).filter(Boolean);

  const shownProducts = orderedProducts.filter(p => visible.has(p.brandName));

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Product toggle row */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-2">
          Visible products ({visible.size} / {PRODUCT_ORDER.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {orderedProducts.map(p => {
            const isOn = visible.has(p.brandName);
            const colour = PRODUCT_COLOURS[p.brandName] ?? '#64748b';
            return (
              <button
                key={p.brandName}
                type="button"
                onClick={() => toggleProduct(p.brandName)}
                aria-pressed={isOn}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-md border transition-colors inline-flex items-center gap-1.5',
                  isOn
                    ? 'bg-white border-slate-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400',
                )}
                style={isOn ? { borderColor: colour, color: colour } : undefined}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: isOn ? colour : '#cbd5e1' }}
                />
                {p.brandName}
                {p.isFictional && <span className="text-[10px] opacity-70">·pre-launch</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center text-xs">
        <span className="font-medium text-slate-600">Alnyx vs cohort:</span>
        <StrengthBadge rating="strong" />
        <StrengthBadge rating="parity" />
        <StrengthBadge rating="weak" />
        <StrengthBadge rating="not-yet-assessed" />
        <span className="border-l border-slate-300 pl-4 flex items-center gap-2">
          <BestInClassBadge />
          <span className="text-slate-600">indicates leading competitor on a dimension</span>
        </span>
      </div>

      {shownProducts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 italic">
          No products selected. Toggle one or more product chips above.
        </div>
      )}

      {shownProducts.length > 0 && (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 border-r border-slate-200 min-w-[140px]">
                Dimension
              </th>
              {shownProducts.map((p) => (
                <th
                  key={p.brandName}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide min-w-[200px] border-r border-slate-200 last:border-r-0"
                  style={
                    p.isFictional
                      ? {
                          color: 'var(--serif-accent)',
                          backgroundColor: 'rgba(8,56,96,0.05)',
                        }
                      : { color: '#334155' }
                  }
                >
                  {p.brandName}
                  {p.isFictional ? (
                    <div
                      className="text-[10px] font-normal mt-0.5"
                      style={{ color: 'rgba(8,56,96,0.70)' }}
                    >
                      Pre-launch
                    </div>
                  ) : (
                    <div className="text-[10px] font-normal mt-0.5 text-slate-500 normal-case tracking-normal">
                      {MODALITY_LABEL[p.modalityCategory]}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((dimension) => (
              <DimensionRow
                key={dimension}
                dimension={dimension}
                products={shownProducts}
              />
            ))}
          </tbody>
        </table>
      </div>
      )}

      <p className="mt-4 text-xs text-slate-500 italic">
        Strength ratings on Alnyx are based on Phase 2 data and reflect expected positioning
        against the whole cohort, subject to Phase 3 confirmation. Best-in-class indicators are
        based on available evidence at the time of authoring.
      </p>
    </div>
  );
}

function DimensionRow({
  dimension,
  products,
}: {
  dimension: Dimension;
  products: ProductEntry[];
}) {
  return (
    <tr className="border-t border-slate-200">
      <th className="sticky left-0 z-10 bg-white px-4 py-4 text-left font-medium text-sm text-slate-800 border-r border-slate-200 align-top">
        {GRID_DIMENSION_LABEL[dimension]}
      </th>
      {products.map((p) => (
        <td
          key={p.brandName}
          className="px-4 py-4 align-top text-xs border-r border-slate-200 last:border-r-0"
          style={
            p.isFictional
              ? { backgroundColor: 'rgba(8,56,96,0.04)' }
              : undefined
          }
        >
          <DimensionCell dimension={dimension} product={p} />
        </td>
      ))}
    </tr>
  );
}

function DimensionCell({
  dimension,
  product,
}: {
  dimension: Dimension;
  product: ProductEntry;
}) {
  const isBestInClass = BEST_IN_CLASS[dimension] === product.brandName;
  const alnyxRating = product.isFictional ? ALNYX_STRENGTH_RATINGS[dimension] : null;

  return (
    <div className="space-y-2">
      {(alnyxRating || isBestInClass) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {alnyxRating && (
            <StrengthBadge rating={alnyxRating.rating} rationale={alnyxRating.rationale} />
          )}
          {isBestInClass && <BestInClassBadge />}
        </div>
      )}
      <DimensionContent dimension={dimension} product={product} />
    </div>
  );
}

function DimensionContent({
  dimension,
  product,
}: {
  dimension: Dimension;
  product: ProductEntry;
}) {
  switch (dimension) {
    case 'efficacy': {
      const e = getEfficacySummary(product);
      return (
        <div className="space-y-1 text-slate-700">
          {e.primaryEndpointResult && (
            <div className="font-medium text-slate-900 leading-tight">
              {e.primaryEndpointResult}
            </div>
          )}
          {e.relativeImprovement && (
            <div className="text-emerald-700 font-medium">{e.relativeImprovement}</div>
          )}
          {e.trialName && <div className="text-[11px] text-slate-500">{e.trialName}</div>}
          {e.notes && <div className="text-[11px] text-slate-500 italic">{e.notes}</div>}
          {!e.primaryEndpointResult && !e.relativeImprovement && (
            <div className="text-slate-400">—</div>
          )}
        </div>
      );
    }
    case 'safety':
      return (
        <div className="text-slate-700 leading-relaxed">{getSafetySummary(product).text}</div>
      );
    case 'dosing-admin': {
      const d = getDosingSummary(product);
      return (
        <div className="space-y-1 text-slate-700">
          <div>
            <span className="font-medium text-slate-900">{d.route}</span>
          </div>
          <div className="text-slate-700">{d.schedule}</div>
          {d.notes && <div className="text-[11px] text-slate-500 italic">{d.notes}</div>}
        </div>
      );
    }
    case 'hrqol':
      return (
        <div className="text-slate-700 leading-relaxed">{getHrqolSummary(product)}</div>
      );
    case 'real-world':
      return (
        <div className="text-slate-700 leading-relaxed">{getRwdSummary(product)}</div>
      );
    case 'itc':
      return (
        <div className="text-slate-700 leading-relaxed">{getItcSummary(product)}</div>
      );
    case 'economic': {
      const h = getHtaSummary(product);
      if (h.total === 0) {
        return <div className="text-slate-400 italic">No HTA assessments yet — pre-launch.</div>;
      }
      return (
        <div className="space-y-2">
          <div className="flex gap-2 text-[11px] flex-wrap">
            {h.recommended > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                ✓ {h.recommended} positive
              </span>
            )}
            {h.restricted > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                ⚠ {h.restricted} restricted
              </span>
            )}
            {h.notRecommended > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                ✗ {h.notRecommended} negative
              </span>
            )}
            {h.other > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                {h.other} other
              </span>
            )}
          </div>
          <details className="text-[11px] text-slate-600 cursor-pointer">
            <summary className="font-medium text-slate-700 hover:text-slate-900">
              View by agency ({h.total} assessments)
            </summary>
            <div className="mt-1 space-y-0.5 max-h-40 overflow-y-auto">
              {h.byAgency.map((a, i) => (
                <div key={i} className="text-[10px] text-slate-600">
                  <span className="font-medium">{a.agency}:</span>{' '}
                  {a.outcome.slice(0, 60)}
                  {a.outcome.length > 60 ? '…' : ''}
                </div>
              ))}
            </div>
          </details>
        </div>
      );
    }
    default:
      return null;
  }
}
