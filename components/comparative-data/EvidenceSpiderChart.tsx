'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import { SPIDER_SCORES } from '@/lib/comparative-data/spider-scores';
import {
  DIMENSIONS,
  DIMENSION_LABEL,
  BEST_IN_CLASS,
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
import { cn } from '@/lib/cn';

const chartData = DIMENSIONS.map(dim => {
  const entry: Record<string, string | number> = { dimension: DIMENSION_LABEL[dim] };
  for (const product of ALL_PRODUCTS) {
    const scores = SPIDER_SCORES[product.brandName];
    if (scores) entry[product.brandName] = scores[dim];
  }
  return entry;
});

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

const DEFAULT_VISIBLE = new Set(['Alnyx', 'Tecvayli', 'Carvykti', 'Elrexfio']);

/* ── Tooltip — narrowed to the single product nearest the cursor ──────────
   Recharts hands the custom tooltip the full payload for the hovered
   dimension (one entry per visible product).  The user asked for the
   tooltip to surface only the product whose value lies closest to the
   cursor's radial distance from chart centre.  We approximate this by
   reading `coordinate` (mouse x/y in chart-pixel space) and `viewBox`
   (chart's inner bounding box) — recharts populates both — then pick the
   product whose normalised score (0-5) is closest to the cursor's
   normalised radius. */

interface TooltipDatum {
  name: string;
  value: number;
  color?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipDatum[];
  label?: string;
  coordinate?: { x: number; y: number };
  // Recharts injects the chart's viewBox under different keys depending on
  // version. Cover the common ones.
  viewBox?: {
    cx?: number;
    cy?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    outerRadius?: number;
  };
}

/** Radial window around the cursor (in 0-5 score units) within which a
 *  product is considered "under the cursor". Tight enough that pointing at
 *  the outer ring picks the high scorers, loose enough that products
 *  plotted at the same value all show together when their dots overlap. */
const OVERLAP_WINDOW = 0.5;

function NearestTooltip({ active, payload, label, coordinate, viewBox }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  let cursorNorm: number | null = null;
  if (coordinate && viewBox) {
    const cx =
      viewBox.cx ??
      (viewBox.x !== undefined && viewBox.width !== undefined
        ? viewBox.x + viewBox.width / 2
        : undefined);
    const cy =
      viewBox.cy ??
      (viewBox.y !== undefined && viewBox.height !== undefined
        ? viewBox.y + viewBox.height / 2
        : undefined);
    const outer =
      viewBox.outerRadius ??
      viewBox.radius ??
      (viewBox.width !== undefined && viewBox.height !== undefined
        ? Math.min(viewBox.width, viewBox.height) / 2
        : undefined);

    if (cx !== undefined && cy !== undefined && outer !== undefined && outer > 0) {
      const cursorR = Math.hypot(coordinate.x - cx, coordinate.y - cy);
      cursorNorm = Math.min(cursorR / outer, 1);
    }
  }

  // Pick all products whose dot lies within OVERLAP_WINDOW (in 0-5 space)
  // of the cursor's radial position. This means: pointing at the 4-ring
  // shows everyone whose value is ~3.5-4.5 — so overlapping dots all
  // appear together, while distant series stay out of the way.
  let shown: TooltipDatum[];
  if (cursorNorm !== null) {
    const cursorVal = cursorNorm * 5;
    shown = payload.filter(p => Math.abs(p.value - cursorVal) <= OVERLAP_WINDOW);
    // If the window happens to catch nothing (cursor sits in a gap), fall
    // back to the single nearest series so the tooltip isn't empty.
    if (shown.length === 0) {
      let nearest: TooltipDatum | null = null;
      let bestDelta = Infinity;
      for (const p of payload) {
        const d = Math.abs(p.value - cursorVal);
        if (d < bestDelta) {
          bestDelta = d;
          nearest = p;
        }
      }
      if (nearest) shown = [nearest];
    }
  } else {
    // Geometry not yet populated — show everything sorted by value desc.
    shown = [...payload];
  }
  shown = shown.slice().sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-md bg-white shadow-lg ring-1 ring-slate-200 px-2.5 py-1.5 text-[11px] min-w-[140px]">
      <div className="text-[10px] uppercase tracking-wide font-mono text-slate-500 mb-1">
        {label}
      </div>
      <ul className="space-y-0.5">
        {shown.map(p => (
          <li key={p.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="font-semibold" style={{ color: p.color }}>
              {p.name}
            </span>
            <span className="text-slate-600 font-mono ml-auto">{p.value}/5</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Best-in-class table ─────────────────────────────────────────────────
   One row per dimension. Column 1 is the dimension label; column 2 surfaces
   the BEST_IN_CLASS product for that dimension plus a short highlight
   sourced from the same per-dimension grid summary helpers used by the
   Evidence Grid tab. This view is global — selection toggles on the chart
   don't filter the table.                                                  */

/** Short labels for the narrow first column of the best-in-class table.
 *  Long names ("Indirect Treatment Comparison") get an acronym so the
 *  column can stay tight. */
const SHORT_DIM_LABEL: Record<Dimension, string> = {
  efficacy: 'Efficacy',
  safety: 'Safety',
  'dosing-admin': 'Dosing',
  hrqol: 'HRQoL',
  'real-world': 'RWE',
  itc: 'ITC',
  economic: 'HTA',
};

function bestInClassHighlight(dim: Dimension, productName: string): string {
  const product = ALL_PRODUCTS.find(p => p.brandName === productName);
  if (!product) return '—';
  switch (dim) {
    case 'efficacy': {
      const e = getEfficacySummary(product);
      const raw = e.primaryEndpointResult ?? '';
      if (raw) {
        // Prepend "ORR" if the raw result is a bare percentage. Pivotal
        // RRMM bispecific / CAR-T endpoints are ORR-based, so the demo
        // value is to label the unit explicitly rather than leave it bare.
        const alreadyLabelled = /ORR|PFS|OS|DoR|MRD/i.test(raw);
        return alreadyLabelled ? raw : `ORR ${raw}`;
      }
      return e.trialName ?? e.notes ?? '—';
    }
    case 'safety':
      return getSafetySummary(product).text;
    case 'dosing-admin': {
      const d = getDosingSummary(product);
      return `${d.route} · ${d.schedule}`;
    }
    case 'hrqol':
      return getHrqolSummary(product);
    case 'real-world':
      return getRwdSummary(product);
    case 'itc':
      return getItcSummary(product);
    case 'economic': {
      const h = getHtaSummary(product);
      if (h.total === 0) return 'No HTA decisions on record yet.';
      return `${h.recommended} recommended / ${h.restricted} with restrictions / ${h.notRecommended} not recommended (of ${h.total})`;
    }
  }
}

/** Fixed-width column template for the best-in-class table: a tight
 *  56px dimension column on the left and the highlight + product info
 *  filling the rest. */
const BIC_GRID = 'grid grid-cols-[56px_minmax(0,1fr)]';

function BestInClassTable() {
  return (
    <div className="xl:w-[320px] shrink-0 self-stretch">
      <div className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-slate-500 mb-2">
        Best in class by dimension
      </div>
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden text-xs">
        <div
          className={cn(
            BIC_GRID,
            'px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-[0.12em] font-mono text-slate-500',
          )}
        >
          <div>Dim.</div>
          <div>Leader & evidence highlight</div>
        </div>
        {DIMENSIONS.map((dim, i) => {
          const winner = BEST_IN_CLASS[dim];
          const colour = winner ? (PRODUCT_COLOURS[winner] ?? '#64748b') : '#94a3b8';
          return (
            <div
              key={dim}
              className={cn(
                BIC_GRID,
                'px-3 py-2 gap-x-3 items-start',
                i > 0 && 'border-t border-slate-100',
              )}
            >
              <div className="text-[11px] font-semibold text-slate-700 leading-tight pt-0.5">
                {SHORT_DIM_LABEL[dim]}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: colour }}
                >
                  {winner ?? '—'}
                </div>
                <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  {winner ? bestInClassHighlight(dim, winner) : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-slate-500 italic leading-snug">
        Reflects all products in the cohort; chart selection above does not
        narrow this table.
      </p>
    </div>
  );
}

export default function EvidenceSpiderChart() {
  const [visible, setVisible] = useState<Set<string>>(DEFAULT_VISIBLE);

  const toggleProduct = (name: string) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header: title + description on the left, product toggle row on the right */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
        <div>
          <h3
            className="font-playfair text-xl leading-tight"
            style={{ color: 'var(--serif-foreground)' }}
          >
            Evidence Profile
          </h3>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            Multi-dimensional comparison across key evidence domains
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-xl xl:justify-end">
          {ALL_PRODUCTS.map(p => {
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

      {/* Chart on the left, best-in-class table on the right */}
      <div className="flex flex-col xl:flex-row items-stretch gap-6">
        <div className="flex-1 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#475569' }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Tooltip content={<NearestTooltip />} />
              {ALL_PRODUCTS.filter(p => visible.has(p.brandName)).map(p => (
                <Radar
                  key={p.brandName}
                  name={p.brandName}
                  dataKey={p.brandName}
                  stroke={PRODUCT_COLOURS[p.brandName]}
                  fill={PRODUCT_COLOURS[p.brandName]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <BestInClassTable />
      </div>

      <p className="text-xs text-slate-500 italic">
        Scores reflect expert assessment of evidence strength across each dimension on a 0–5
        scale. Alnyx scores reflect Phase 2 data only.
      </p>
    </div>
  );
}
