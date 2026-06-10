'use client';

import { ArrowRight, MessageSquareWarning, Hammer, FileText } from 'lucide-react';
import {
  OBJECTION_DOMAINS,
  getObjectionsForDomain,
  totalHandlersForDomain,
  totalPublicationsForDomain,
  type ObjectionDomainKey,
} from '@/lib/objection-handling/data';
import { cn } from '@/lib/cn';

interface Props {
  onSelectDomain: (key: ObjectionDomainKey) => void;
}

/**
 * Page 1 — landing grid for Objection Handling. Mirrors Value Story's
 * domains page in shape (4 gradient cards, faint monogram in the
 * bottom-right) but skips the selector preface — entry lands here.
 */
export default function DomainsPage({ onSelectDomain }: Props) {
  return (
    // pl-8 pr-12 mirrors the Value Story right-gutter pattern so cards
    // stay clear of the chat panel rail.
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-playfair text-3xl text-serif-foreground">Objection Handling</h1>
        <p className="text-sm text-serif-muted-foreground mt-1.5 max-w-2xl">
          Anticipated payer objections by domain, with field-ready handlers and supporting
          publications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {OBJECTION_DOMAINS.map((domain, idx) => {
          const objections = getObjectionsForDomain(domain.key);
          const handlerCount = totalHandlersForDomain(domain.key);
          const pubCount = totalPublicationsForDomain(domain.key);

          return (
            <button
              key={domain.key}
              type="button"
              onClick={() => onSelectDomain(domain.key)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-slate-200/70 px-5 py-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 min-h-[220px]',
                domain.gradient_class,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-2 right-3 font-playfair font-bold pointer-events-none select-none',
                  domain.text_on_gradient_class,
                )}
                style={{ fontSize: 72, lineHeight: 1 }}
              >
                {domain.monogram}
              </span>
              <div className="relative">
                <div className="text-[11px] uppercase tracking-[0.18em] font-mono font-semibold text-slate-500 mb-2">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h2 className="font-semibold text-lg text-slate-900 mb-4 leading-tight">
                  {domain.name}
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="inline-flex items-center gap-1.5">
                    <MessageSquareWarning size={11} className="text-slate-600" />
                    <span className="font-semibold">{objections.length}</span>
                    <span className="text-slate-600">
                      {objections.length === 1 ? 'Objection' : 'Objections'}
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Hammer size={11} className="text-slate-600" />
                    <span className="font-semibold">{handlerCount}</span>
                    <span className="text-slate-600">Handlers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileText size={11} className="text-slate-600" />
                    <span className="font-semibold">{pubCount}</span>
                    <span className="text-slate-600">Publications</span>
                  </li>
                </ul>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-slate-800 group-hover:translate-x-0.5 transition-transform">
                  Explore
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
