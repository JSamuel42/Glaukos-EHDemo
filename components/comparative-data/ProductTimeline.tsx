'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import type {
  ProductEntry,
  RegulatoryApproval,
  HtaOutcome,
} from '@/lib/comparative-data/types';
import {
  TRIAL_MILESTONES,
  TRIAL_MILESTONE_CUTOFF_YEAR,
} from '@/lib/comparative-data/trial-milestones';
import { cn } from '@/lib/cn';

// Event categories for the timeline. Three semantic groups (per the brief):
// trial completion, regulatory approval, HTA outcome. HTA subdivides into
// positive / restricted / negative for the click-popover content.
type MarkerType =
  | 'phase-2-completion'
  | 'phase-3-completion'
  | 'regulatory-approval'
  | 'hta-positive'
  | 'hta-restricted'
  | 'hta-negative'
  | 'hta-other';

interface TimelineMarker {
  date: Date;
  type: MarkerType;
  /** Short label shown on hover */
  label: string;
  /** Country (HTA) or agency (Regulatory) for the popover */
  region: string;
  /** Detail line in the popover */
  detail: string;
}

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

// Three products visible by default per the brief. Mix: the pre-launch
// product + the most mature competitor + best-in-class CAR-T.
const DEFAULT_VISIBLE = new Set(['Alnyx', 'Tecvayli', 'Carvykti']);

// Map HTA agency codes to the country they cover, so click-popovers can
// surface the country plainly. Falls back to the agency code if unknown.
const AGENCY_TO_COUNTRY: Record<string, string> = {
  AEMPS: 'Spain',
  AIFA: 'Italy',
  AOTMIT: 'Poland',
  'CDA-AMC': 'Canada',
  CHUIKYO: 'Japan',
  DMC: 'Denmark',
  FIMEA: 'Finland',
  'G-BA': 'Germany',
  HAS: 'France',
  ICER: 'United States',
  INAMI: 'Belgium',
  IQWIG: 'Germany',
  MoH: 'National',
  NCPE: 'Ireland',
  NHI: 'Taiwan',
  NICE: 'England',
  NMA: 'Norway',
  'NT-COUNCIL': 'New Zealand',
  PBAC: 'Australia',
  SMC: 'Scotland',
  TLV: 'Sweden',
  ZINL: 'Netherlands',
};

function agencyToCountry(agency: string | null | undefined): string {
  if (!agency) return '—';
  return AGENCY_TO_COUNTRY[agency] ?? agency;
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function categoriseHtaOutcome(outcome: string | undefined | null): MarkerType {
  if (!outcome) return 'hta-other';
  const o = outcome.toLowerCase();
  if (
    o.includes('not recommended') ||
    o.includes('not reimbursed') ||
    o.includes('terminated') ||
    o.includes('smr insufficient')
  ) {
    return 'hta-negative';
  }
  if (o.includes('with restrictions') || o.includes('restrictions to label')) {
    return 'hta-restricted';
  }
  if (
    o.includes('no additional benefit') ||
    o.includes('non-quantifiable') ||
    o.includes('asmr v') ||
    o.includes('wait') ||
    o === 'na' ||
    o.includes('not available')
  ) {
    return 'hta-other';
  }
  if (
    o.includes('recommended') ||
    o.includes('positive') ||
    o.includes('list c') ||
    o.includes('asmr i') ||
    o.includes('asmr ii') ||
    o.includes('asmr iii') ||
    o.includes('asmr iv') ||
    o.includes('similar efficacy')
  ) {
    return 'hta-positive';
  }
  return 'hta-other';
}

function categoryShortLabel(t: MarkerType): string {
  switch (t) {
    case 'hta-positive':
      return 'Positive recommendation';
    case 'hta-restricted':
      return 'Restricted reimbursement';
    case 'hta-negative':
      return 'Not recommended';
    case 'hta-other':
      return 'Other HTA outcome';
    default:
      return '';
  }
}

// Regulatory agencies → jurisdictions (for the popover region line).
const REG_AGENCY_TO_REGION: Record<string, string> = {
  FDA: 'United States',
  EMA: 'European Union',
  PMDA: 'Japan',
  NMPA: 'China',
  'Health Canada': 'Canada',
  TGA: 'Australia',
  MHRA: 'United Kingdom',
};

function regulatoryMarker(a: RegulatoryApproval): TimelineMarker | null {
  const date = parseDate(a.marketApprovalDate);
  if (!date) return null;
  const region = REG_AGENCY_TO_REGION[a.agency] ?? a.agency;
  return {
    date,
    type: 'regulatory-approval',
    label: `${a.agency} approval`,
    region,
    detail: `${a.marketApprovalDate} — ${a.labelPopulation ?? a.specificIndication ?? ''}`,
  };
}

function htaMarker(h: HtaOutcome): TimelineMarker | null {
  const date = parseDate(h.assessmentDate) ?? parseDate(h.dateOfPublication);
  if (!date) return null;
  if (date.getFullYear() < 1990) return null;
  const type = categoriseHtaOutcome(h.assessmentOutcome);
  const country = agencyToCountry(h.htaAgency);
  return {
    date,
    type,
    label: `${h.htaAgency} · ${country}`,
    region: country,
    detail: `${categoryShortLabel(type)} — ${h.assessmentOutcome ?? '—'}`,
  };
}

function getMarkersForProduct(product: ProductEntry): TimelineMarker[] {
  const markers: TimelineMarker[] = [];

  // Trial completions
  if (product.isFictional && product.alnyxData) {
    const study = product.alnyxData.pivotalStudies[0];
    const date = parseDate(study?.endDate);
    if (date) {
      markers.push({
        date,
        type: 'phase-2-completion',
        label: `${study.trialName} (Phase 2) completion`,
        region: study.trialName,
        detail: study.primaryResult,
      });
    }
  } else {
    const trialMilestones = TRIAL_MILESTONES[product.brandName] ?? [];
    for (const m of trialMilestones) {
      const date = parseDate(m.primaryCompletionDate);
      if (!date) continue;
      if (date.getFullYear() < TRIAL_MILESTONE_CUTOFF_YEAR) continue;
      markers.push({
        date,
        type: m.phase === 'phase-2' ? 'phase-2-completion' : 'phase-3-completion',
        label: `${m.trialName} (${m.phase === 'phase-2' ? 'Phase 2' : 'Phase 3'})`,
        region: m.trialName,
        detail: `Primary completion ${m.primaryCompletionDate}`,
      });
    }
  }

  // Regulatory approvals
  for (const a of product.regulatoryApprovals) {
    const m = regulatoryMarker(a);
    if (m) markers.push(m);
  }
  // HTA outcomes
  for (const h of product.htaOutcomes) {
    const m = htaMarker(h);
    if (m) markers.push(m);
  }
  return markers;
}

function getDateRange(visible: Set<string>): { minYear: number; maxYear: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const p of ALL_PRODUCTS) {
    if (!visible.has(p.brandName)) continue;
    for (const m of getMarkersForProduct(p)) {
      const y = m.date.getFullYear();
      if (y < min) min = y;
      if (y > max) max = y;
    }
  }
  if (min === Infinity || max === -Infinity) {
    // No visible markers — fall back to a stable demo range.
    return { minYear: 2019, maxYear: new Date().getFullYear() + 1 };
  }
  return { minYear: Math.floor(min) - 1, maxYear: Math.ceil(max) + 1 };
}

// Shapes per event category (per the brief):
//   - Trial completion → diamond
//   - Regulatory approval → circle
//   - HTA outcome → square (colour-coded by category)
const MARKER_STYLE: Record<
  MarkerType,
  { color: string; shape: 'circle' | 'square' | 'diamond' | 'triangle'; size: number }
> = {
  'phase-2-completion': { color: '#B8860B', shape: 'diamond', size: 12 },
  'phase-3-completion': { color: '#7C2D12', shape: 'diamond', size: 14 },
  'regulatory-approval': { color: '#2563eb', shape: 'circle', size: 12 },
  'hta-positive': { color: '#10b981', shape: 'square', size: 11 },
  'hta-restricted': { color: '#f59e0b', shape: 'square', size: 11 },
  'hta-negative': { color: '#ef4444', shape: 'square', size: 11 },
  'hta-other': { color: '#94a3b8', shape: 'square', size: 10 },
};

interface MarkerProps {
  marker: TimelineMarker;
  leftPct: number;
  index: number;
  productName: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

function Marker({ marker, leftPct, index, productName, openId, setOpenId }: MarkerProps) {
  const id = `${productName}-${marker.date.toISOString()}-${index}`;
  const isOpen = openId === id;
  const style = MARKER_STYLE[marker.type];
  const shapeClass =
    style.shape === 'circle' ? 'rounded-full' : style.shape === 'diamond' ? 'rotate-45' : 'rounded-sm';

  return (
    <span className="absolute top-1/2 -translate-y-1/2" style={{ left: `${leftPct}%` }}>
      <button
        type="button"
        title={`${marker.label} · ${marker.date.toISOString().slice(0, 10)}`}
        aria-label={`${marker.label}, ${marker.date.toISOString().slice(0, 10)}`}
        onClick={e => {
          e.stopPropagation();
          setOpenId(isOpen ? null : id);
        }}
        className={cn(
          '-translate-x-1/2 -translate-y-1/2 absolute hover:ring-2 hover:ring-slate-300 hover:z-10 transition-shadow cursor-pointer',
          shapeClass,
        )}
        style={{
          width: style.size,
          height: style.size,
          background: style.color,
        }}
      />
      {isOpen && (
        <div
          className="absolute z-30 bottom-full left-0 mb-2 min-w-[200px] max-w-[260px] -translate-x-1/2 rounded-md bg-white shadow-lg ring-1 ring-slate-200 p-2.5 text-left"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-[10px] uppercase tracking-wide font-mono font-semibold text-slate-500 mb-1">
            {marker.region}
          </div>
          <div className="text-xs font-semibold text-slate-800 leading-snug">{marker.label}</div>
          <div className="text-[11px] text-slate-600 leading-snug mt-1">{marker.detail}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            {marker.date.toISOString().slice(0, 10)}
          </div>
        </div>
      )}
    </span>
  );
}

function TimelineAxis({ minYear, maxYear }: { minYear: number; maxYear: number }) {
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);
  return (
    <div className="relative h-6 border-t border-slate-200">
      {years.map(y => {
        const leftPct = ((y - minYear) / (maxYear - minYear)) * 100;
        return (
          <div
            key={y}
            className="absolute top-0 -translate-x-1/2 text-[10px] font-mono text-slate-500 pt-1"
            style={{ left: `${leftPct}%` }}
          >
            <div className="h-1.5 w-px bg-slate-300 mx-auto -mt-1" />
            {y}
          </div>
        );
      })}
    </div>
  );
}

function GridLines({ minYear, maxYear }: { minYear: number; maxYear: number }) {
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);
  return (
    <>
      {years.map(y => {
        const leftPct = ((y - minYear) / (maxYear - minYear)) * 100;
        return (
          <div
            key={y}
            className="absolute top-0 bottom-0 w-px bg-slate-100"
            style={{ left: `${leftPct}%` }}
          />
        );
      })}
    </>
  );
}

/**
 * Product Timeline — three semantic event categories (trial completion,
 * regulatory approval, HTA outcome) plotted per product, with a product
 * chip strip to toggle visibility. Markers open a click-popover with
 * country/agency + outcome category, keeping the chart legible.
 */
export default function ProductTimeline() {
  const [visible, setVisible] = useState<Set<string>>(DEFAULT_VISIBLE);
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close any open popover when the user clicks outside the timeline area.
  useEffect(() => {
    if (!openId) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpenId(null);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openId]);

  const { minYear, maxYear } = useMemo(() => getDateRange(visible), [visible]);

  const rows = useMemo(
    () =>
      ALL_PRODUCTS.filter(p => visible.has(p.brandName)).map(product => ({
        product,
        markers: getMarkersForProduct(product),
      })),
    [visible],
  );

  function toggleProduct(name: string) {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="w-full" ref={ref}>
      {/* Header: title + subtitle on left, product chip toggles on right */}
      <div className="mb-4 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
        <div>
          <h3
            className="font-playfair text-xl leading-tight"
            style={{ color: 'var(--serif-foreground)' }}
          >
            Product Timeline
          </h3>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            Major milestones and outcomes across markets
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

      {/* Top axis */}
      <div className="flex">
        <div className="w-40 shrink-0" />
        <div className="flex-1">
          <TimelineAxis minYear={minYear} maxYear={maxYear} />
        </div>
      </div>

      {/* Rows (only for visible products) */}
      <div className="mt-1">
        {rows.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No products selected. Toggle one or more product chips above.
          </div>
        )}
        {rows.map(({ product, markers }) => (
          <div
            key={product.brandName}
            className="flex items-stretch border-b border-slate-100"
            style={
              product.isFictional ? { backgroundColor: 'rgba(8,56,96,0.04)' } : undefined
            }
          >
            <div className="w-40 shrink-0 flex flex-col justify-center px-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: product.isFictional ? 'var(--serif-accent)' : '#1e293b',
                  }}
                >
                  {product.brandName}
                </span>
                {product.isFictional && (
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: 'rgba(8,56,96,0.10)',
                      color: 'var(--serif-accent)',
                    }}
                  >
                    Pre-launch
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                {product.modalityCategory === 'car-t'
                  ? 'CAR-T'
                  : product.modalityCategory === 'adc'
                    ? 'ADC'
                    : 'Bispecific'}
              </span>
            </div>
            <div className="flex-1 relative h-14">
              <GridLines minYear={minYear} maxYear={maxYear} />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200" />
              {markers.map((m, i) => {
                const leftPct =
                  ((m.date.getFullYear() + m.date.getMonth() / 12 - minYear) /
                    (maxYear - minYear)) *
                  100;
                return (
                  <Marker
                    key={`${m.region}-${m.date.toISOString()}-${i}`}
                    marker={m}
                    leftPct={leftPct}
                    index={i}
                    productName={product.brandName}
                    openId={openId}
                    setOpenId={setOpenId}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom axis */}
      {rows.length > 0 && (
        <div className="flex">
          <div className="w-40 shrink-0" />
          <div className="flex-1">
            <TimelineAxis minYear={minYear} maxYear={maxYear} />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        <LegendItem color="#B8860B" shape="diamond" size={12} label="Phase 2 completion" />
        <LegendItem color="#7C2D12" shape="diamond" size={14} label="Phase 3 completion" />
        <LegendItem color="#2563eb" shape="circle" size={12} label="Regulatory approval" />
        <LegendItem color="#10b981" shape="square" size={11} label="HTA: Positive recommendation" />
        <LegendItem color="#f59e0b" shape="square" size={11} label="HTA: Restricted reimbursement" />
        <LegendItem color="#ef4444" shape="square" size={11} label="HTA: Not recommended" />
        <LegendItem color="#94a3b8" shape="square" size={10} label="HTA: Other" />
      </div>
      <p className="mt-2 text-[11px] text-slate-500 italic">
        Click any marker for country/agency and outcome detail.
      </p>
    </div>
  );
}

function LegendItem({
  color,
  shape,
  size,
  label,
}: {
  color: string;
  shape: 'circle' | 'square' | 'diamond';
  size: number;
  label: string;
}) {
  const baseStyle = {
    width: size,
    height: size,
    background: color,
  } as React.CSSProperties;
  return (
    <span className="inline-flex items-center gap-1.5">
      {shape === 'circle' && <span style={baseStyle} className="rounded-full" />}
      {shape === 'square' && <span style={baseStyle} className="rounded-sm" />}
      {shape === 'diamond' && <span style={baseStyle} className="rotate-45 inline-block" />}
      <span>{label}</span>
    </span>
  );
}
