'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Diamond, FileText } from 'lucide-react';
import {
  PILLARS,
  PILLAR_BY_KEY,
  getStatementsForPillar,
  totalPublicationsForPillar,
  type PillarKey,
} from '@/lib/scientific-narrative/data';
import StatementCard from './StatementCard';
import { cn } from '@/lib/cn';

interface Props {
  pillarKey: PillarKey;
  onChangePillar: (key: PillarKey) => void;
  onBack: () => void;
}

/**
 * Page 2 — pillar banner (Strategic Imperative + Scientific Position
 * rendered as two translucent white cards inside the gradient) followed
 * by the list of scientific statement cards. Breadcrumb hosts a Radix-
 * style click-outside dropdown for switching pillars without going back.
 */
export default function PillarDetailPage({ pillarKey, onChangePillar, onBack }: Props) {
  const pillar = PILLAR_BY_KEY[pillarKey];
  const statements = getStatementsForPillar(pillarKey);
  const pubCount = totalPublicationsForPillar(pillarKey);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-mono text-serif-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 hover:text-serif-foreground"
        >
          <ArrowLeft size={12} />
          Scientific Narrative
        </button>
        <span>/</span>
        <PillarDropdown current={pillarKey} onChange={onChangePillar} />
      </div>

      {/* Banner with two translucent statement cards */}
      <section
        className={cn(
          'rounded-2xl border border-slate-200/70 px-6 py-6 overflow-hidden',
          pillar.banner_class,
        )}
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-600 mb-2">
          Pillar {String(pillar.number).padStart(2, '0')}
        </div>
        <h2 className="font-playfair text-2xl text-slate-900 mb-5 leading-tight">
          {pillar.fullName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/65 backdrop-blur-sm rounded-lg p-4 ring-1 ring-white/40">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-slate-700 mb-2">
              Strategic Imperative &amp; Objective
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">
              {pillar.strategicImperative}
            </p>
          </div>
          <div className="bg-white/65 backdrop-blur-sm rounded-lg p-4 ring-1 ring-white/40">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold text-slate-700 mb-2">
              Scientific Position
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{pillar.scientificPosition}</p>
          </div>
        </div>
      </section>

      {/* Counts row */}
      <div className="flex items-baseline justify-between">
        <h3 className="font-playfair text-xl text-serif-foreground">Scientific Statements</h3>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide font-mono text-serif-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Diamond size={11} />
            <span className="font-semibold text-serif-foreground">{statements.length}</span>
            Statements
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText size={11} />
            <span className="font-semibold text-serif-foreground">{pubCount}</span>
            Publications
          </span>
        </div>
      </div>

      {/* Statement cards */}
      <div className="space-y-2">
        {statements.map(s => (
          <StatementCard key={s.id} statement={s} />
        ))}
      </div>
    </div>
  );
}

function PillarDropdown({
  current,
  onChange,
}: {
  current: PillarKey;
  onChange: (k: PillarKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 text-serif-foreground font-semibold normal-case tracking-normal hover:opacity-80"
      >
        {PILLAR_BY_KEY[current].fullName}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 min-w-[260px] rounded-md border border-serif-border bg-white shadow-lg overflow-hidden">
          {PILLARS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                onChange(p.key);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm normal-case tracking-normal',
                p.key === current
                  ? 'bg-slate-50 font-semibold text-serif-foreground'
                  : 'text-serif-foreground hover:bg-slate-50',
              )}
            >
              <span>{p.fullName}</span>
              {p.key === current && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--evhub-mint)' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
