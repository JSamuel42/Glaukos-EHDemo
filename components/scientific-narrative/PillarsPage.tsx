'use client';

import { ArrowRight, Diamond, FileText } from 'lucide-react';
import {
  PILLARS,
  getStatementsForPillar,
  totalPublicationsForPillar,
  MODULE_TITLE,
  MODULE_DESCRIPTION,
  type PillarKey,
} from '@/lib/scientific-narrative/data';
import { cn } from '@/lib/cn';

interface Props {
  onSelectPillar: (key: PillarKey) => void;
}

/**
 * Page 1 — module title card + the 4 pillar gradient tiles. No selector
 * page upstream (unlike Value Story); entry lands here.
 */
export default function PillarsPage({ onSelectPillar }: Props) {
  return (
    <div className="space-y-6">
      {/* Title card */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 p-8">
        <h1 className="font-playfair text-3xl text-serif-foreground mb-3 leading-tight">
          {MODULE_TITLE}
        </h1>
        <p className="text-base text-slate-700 leading-relaxed max-w-3xl">
          {MODULE_DESCRIPTION}
        </p>
      </section>

      {/* Pillar tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PILLARS.map(pillar => {
          const statements = getStatementsForPillar(pillar.key);
          const pubCount = totalPublicationsForPillar(pillar.key);
          return (
            <button
              key={pillar.key}
              type="button"
              onClick={() => onSelectPillar(pillar.key)}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-slate-200/70 px-5 py-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 min-h-[220px]',
                pillar.gradient_class,
              )}
            >
              {/* Faint monogram watermark, bottom-right */}
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-2 right-3 font-playfair font-bold pointer-events-none select-none',
                  pillar.text_on_gradient_class,
                )}
                style={{ fontSize: 72, lineHeight: 1 }}
              >
                {pillar.monogram}
              </span>

              <div className="relative">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 mb-2">
                  Pillar {String(pillar.number).padStart(2, '0')}
                </div>
                <h2 className="font-playfair text-xl text-slate-900 mb-4 leading-tight">
                  {pillar.name}
                </h2>

                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="inline-flex items-center gap-1.5">
                    <Diamond size={11} className="text-slate-600" />
                    <span className="font-semibold">{statements.length}</span>
                    <span className="text-slate-600">
                      {statements.length === 1 ? 'Statement' : 'Statements'}
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileText size={11} className="text-slate-600" />
                    <span className="font-semibold">{pubCount}</span>
                    <span className="text-slate-600">Publications</span>
                  </li>
                </ul>

                <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-slate-900 group-hover:translate-x-0.5">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
