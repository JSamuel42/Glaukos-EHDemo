'use client';

import { useMemo } from 'react';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import type { ProductEntry } from '@/lib/comparative-data/types';
import { TRIAL_MILESTONES } from '@/lib/comparative-data/trial-milestones';
import { cn } from '@/lib/cn';

/**
 * Product Milestones — stage-by-stage development → access pathway.
 *
 * Each product gets a row of five chevrons:
 *   Phase II  →  Phase III  →  FDA  →  EMA  →  Reimbursement
 *
 * Per-stage colour family:
 *   Phase II/III   → blue (P2 lighter, P3 deeper)
 *   FDA / EMA      → purple (FDA lighter, EMA deeper)
 *   Reimbursement  → green
 *
 * Per-stage state (rendered as a fill pattern, not a hue swap):
 *   complete       → solid stage colour
 *   ongoing        → diagonal stripes in the stage's pastel pair
 *   not initiated  → neutral grey
 */

const DEMO_TODAY = new Date('2026-05-14');

type StageId = 'phase-2' | 'phase-3' | 'fda' | 'ema' | 'reimbursement';
type StageStatus = 'complete' | 'ongoing' | 'not-initiated';

const STAGE_LABEL: Record<StageId, string> = {
  'phase-2': 'Phase II',
  'phase-3': 'Phase III',
  fda: 'FDA',
  ema: 'EMA',
  reimbursement: 'Reimbursement',
};

const STAGES: StageId[] = ['phase-2', 'phase-3', 'fda', 'ema', 'reimbursement'];

/** Reimbursement is "complete" once a product has logged decisions in at
 *  least this many HTA agencies; below that — but above zero — counts as
 *  ongoing. */
const REIMB_COMPLETE_THRESHOLD = 5;

/** Stage colour palette. `solid` is the full-strength complete-state
 *  fill; `stripeA`/`stripeB` form the ongoing-state diagonal pattern. */
const STAGE_PALETTE: Record<StageId, { solid: string; stripeA: string; stripeB: string }> = {
  'phase-2': { solid: '#60A5FA', stripeA: '#BFDBFE', stripeB: '#EFF6FF' }, // blue-400 / 200 / 50
  'phase-3': { solid: '#1D4ED8', stripeA: '#93C5FD', stripeB: '#DBEAFE' }, // blue-700 / 300 / 100
  fda:       { solid: '#A78BFA', stripeA: '#DDD6FE', stripeB: '#F5F3FF' }, // violet-400 / 200 / 50
  ema:       { solid: '#6D28D9', stripeA: '#C4B5FD', stripeB: '#EDE9FE' }, // violet-700 / 300 / 100
  reimbursement: { solid: '#10B981', stripeA: '#A7F3D0', stripeB: '#ECFDF5' }, // emerald-500 / 200 / 50
};

const NOT_INITIATED_FILL = '#E2E8F0'; // slate-200

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface StageState {
  status: StageStatus;
  /** Caption beneath the chevron when meaningful (trial name, approval
   *  month, HTA count). Empty for not-initiated. */
  caption?: string;
}

function computeStages(product: ProductEntry): Record<StageId, StageState> {
  // ── Phase 2 ─────────────────────────────────────────────────────────
  let phase2: StageState = { status: 'not-initiated' };
  if (product.isFictional && product.alnyxData) {
    const study = product.alnyxData.pivotalStudies[0];
    const end = parseDate(study?.endDate);
    if (study) {
      phase2 = end && end <= DEMO_TODAY
        ? { status: 'complete', caption: study.trialName }
        : { status: 'ongoing', caption: study.trialName };
    }
  } else {
    const p2 = (TRIAL_MILESTONES[product.brandName] ?? []).find(m => m.phase === 'phase-2');
    if (p2) {
      const d = parseDate(p2.primaryCompletionDate);
      phase2 = d && d <= DEMO_TODAY
        ? { status: 'complete', caption: p2.trialName }
        : { status: 'ongoing', caption: p2.trialName };
    }
  }

  // ── Phase 3 ─────────────────────────────────────────────────────────
  let phase3: StageState = { status: 'not-initiated' };
  const p3 = (TRIAL_MILESTONES[product.brandName] ?? []).find(m => m.phase === 'phase-3');
  if (p3) {
    const d = parseDate(p3.primaryCompletionDate);
    phase3 = d && d <= DEMO_TODAY
      ? { status: 'complete', caption: p3.trialName }
      : { status: 'ongoing', caption: p3.trialName };
  }

  // ── FDA ─────────────────────────────────────────────────────────────
  const fdaApproval = product.regulatoryApprovals.find(a =>
    a.agency.toUpperCase().startsWith('FDA'),
  );
  const fdaDate = parseDate(fdaApproval?.marketApprovalDate);
  let fda: StageState;
  if (fdaDate && fdaDate <= DEMO_TODAY) {
    fda = {
      status: 'complete',
      caption: fdaDate.toISOString().slice(0, 7),
    };
  } else if (phase3.status === 'complete') {
    // P3 read out but no approval yet — assume submission in regulatory
    // review. Reasonable demo proxy without explicit submission data.
    fda = { status: 'ongoing', caption: 'In review' };
  } else {
    fda = { status: 'not-initiated' };
  }

  // ── EMA ─────────────────────────────────────────────────────────────
  const emaApproval = product.regulatoryApprovals.find(a =>
    a.agency.toUpperCase().startsWith('EMA'),
  );
  const emaDate = parseDate(emaApproval?.marketApprovalDate);
  let ema: StageState;
  if (emaDate && emaDate <= DEMO_TODAY) {
    ema = { status: 'complete', caption: emaDate.toISOString().slice(0, 7) };
  } else if (phase3.status === 'complete') {
    ema = { status: 'ongoing', caption: 'In review' };
  } else {
    ema = { status: 'not-initiated' };
  }

  // ── Reimbursement ───────────────────────────────────────────────────
  const htaCount = product.htaOutcomes.filter(o => {
    const d = parseDate(o.assessmentDate) ?? parseDate(o.dateOfPublication);
    return d !== null && d <= DEMO_TODAY;
  }).length;
  let reimb: StageState;
  if (htaCount >= REIMB_COMPLETE_THRESHOLD) {
    reimb = { status: 'complete', caption: `${htaCount} HTAs` };
  } else if (htaCount > 0) {
    reimb = { status: 'ongoing', caption: `${htaCount} HTA${htaCount === 1 ? '' : 's'}` };
  } else {
    reimb = { status: 'not-initiated' };
  }

  return {
    'phase-2': phase2,
    'phase-3': phase3,
    fda,
    ema,
    reimbursement: reimb,
  };
}

/* ── Chevron rendering ────────────────────────────────────────────────── */

const NOTCH = 14; // px

function chevronClipPath(position: 'first' | 'middle' | 'last'): string {
  if (position === 'first') {
    return `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%)`;
  }
  if (position === 'last') {
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${NOTCH}px 50%)`;
  }
  return `polygon(0 0, calc(100% - ${NOTCH}px) 0, 100% 50%, calc(100% - ${NOTCH}px) 100%, 0 100%, ${NOTCH}px 50%)`;
}

function fillStyle(stage: StageId, status: StageStatus): React.CSSProperties {
  const palette = STAGE_PALETTE[stage];
  if (status === 'complete') return { backgroundColor: palette.solid };
  if (status === 'ongoing') {
    // Diagonal striped pattern alternating the stage's pastel pair.
    return {
      backgroundImage: `repeating-linear-gradient(45deg, ${palette.stripeA} 0 6px, ${palette.stripeB} 6px 12px)`,
      backgroundColor: palette.stripeB,
    };
  }
  return { backgroundColor: NOT_INITIATED_FILL };
}

function textColour(stage: StageId, status: StageStatus): string {
  if (status === 'complete') {
    // Lighter solids (Phase II, FDA) get a darker label so the text still
    // reads against the fill.
    if (stage === 'phase-2' || stage === 'fda' || stage === 'reimbursement') {
      return stage === 'reimbursement' ? '#FFFFFF' : '#1E3A8A';
    }
    return '#FFFFFF';
  }
  if (status === 'ongoing') return '#334155'; // slate-700
  return '#94A3B8'; // slate-400
}

interface ChevronProps {
  stage: StageId;
  state: StageState;
  position: 'first' | 'middle' | 'last';
}

function Chevron({ stage, state, position }: ChevronProps) {
  return (
    <div className="flex-1 flex flex-col items-stretch min-w-0">
      <div
        className="relative h-9 flex items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-center px-3"
        style={{
          clipPath: chevronClipPath(position),
          color: textColour(stage, state.status),
          marginLeft: position === 'first' ? 0 : -NOTCH / 2,
          ...fillStyle(stage, state.status),
        }}
      >
        <span
          className="block truncate"
          style={{
            paddingLeft: position === 'first' ? 0 : NOTCH / 2,
            paddingRight: position === 'last' ? 0 : NOTCH / 2,
          }}
        >
          {STAGE_LABEL[stage]}
        </span>
      </div>
      <div
        className="mt-1 text-[10px] text-slate-500 leading-tight truncate text-center px-2 min-h-[12px]"
        style={{
          paddingLeft: position === 'first' ? 0 : NOTCH / 2,
          paddingRight: position === 'last' ? 0 : NOTCH / 2,
        }}
      >
        {state.caption ?? ''}
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: ProductEntry }) {
  const stages = useMemo(() => computeStages(product), [product]);
  return (
    <div
      className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-4 py-3 border-b border-slate-100"
      style={
        product.isFictional ? { backgroundColor: 'rgba(8,56,96,0.04)' } : undefined
      }
    >
      <div className="px-2 pt-1">
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
              className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
              style={{
                backgroundColor: 'rgba(8,56,96,0.10)',
                color: 'var(--serif-accent)',
              }}
            >
              Pre-launch
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          {product.modalityCategory === 'car-t'
            ? 'CAR-T'
            : product.modalityCategory === 'adc'
              ? 'ADC'
              : 'Bispecific'}
        </span>
      </div>

      <div className="flex">
        {STAGES.map((s, i) => (
          <Chevron
            key={s}
            stage={s}
            state={stages[s]}
            position={i === 0 ? 'first' : i === STAGES.length - 1 ? 'last' : 'middle'}
          />
        ))}
      </div>
    </div>
  );
}

/** Small swatch used in the legend. Reuses the same fill logic as the
 *  chevrons so the legend stays in sync with what the bars actually show. */
function LegendSwatch({ status }: { status: StageStatus }) {
  // Use the Phase II palette as a representative for the legend swatches —
  // the legend explains state, not stage-colour. (Hue varies by stage in
  // the chart itself.)
  return (
    <span
      className="inline-block h-3 w-5 rounded-sm border border-slate-200"
      style={fillStyle('phase-2', status)}
    />
  );
}

export default function StageMilestones() {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3
          className="font-playfair text-xl leading-tight"
          style={{ color: 'var(--serif-foreground)' }}
        >
          Product milestones
        </h3>
        <p
          className="text-sm mt-0.5"
          style={{ color: 'var(--serif-muted-foreground)' }}
        >
          Where each product sits along the development → access pathway as of{' '}
          {DEMO_TODAY.toLocaleString('en-GB', { month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="rounded-lg border border-serif-border bg-white overflow-hidden">
        {ALL_PRODUCTS.map(p => (
          <ProductRow key={p.brandName} product={p} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <LegendSwatch status="complete" />
          Milestone complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendSwatch status="ongoing" />
          Ongoing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendSwatch status="not-initiated" />
          Not initiated
        </span>
        <span className="border-l border-slate-300 pl-3 ml-1 inline-flex items-center gap-3 text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: STAGE_PALETTE['phase-2'].solid }}
            />
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: STAGE_PALETTE['phase-3'].solid }}
            />
            Trials
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: STAGE_PALETTE.fda.solid }}
            />
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: STAGE_PALETTE.ema.solid }}
            />
            Regulatory
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: STAGE_PALETTE.reimbursement.solid }}
            />
            Reimbursement
          </span>
        </span>
      </div>
    </div>
  );
}
