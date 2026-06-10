'use client';

import * as Popover from '@radix-ui/react-popover';
import { ArrowLeft, ChevronDown, MessageSquareWarning, Hammer, FileText } from 'lucide-react';
import {
  OBJECTION_DOMAINS,
  OBJECTION_DOMAIN_BY_KEY,
  getObjectionsForDomain,
  totalHandlersForDomain,
  totalPublicationsForDomain,
  type ObjectionDomainKey,
} from '@/lib/objection-handling/data';
import ObjectionCard from './ObjectionCard';
import { cn } from '@/lib/cn';

interface Props {
  domainKey: ObjectionDomainKey;
  onChangeDomain: (key: ObjectionDomainKey) => void;
  onBack: () => void;
}

/**
 * Page 2 — banner + counts + list of objection cards. The first
 * objection expands by default; the rest open on click. The
 * breadcrumb's domain switcher is a Radix popover so users can jump
 * between domains without bouncing back to the grid.
 */
export default function DomainDetailPage({ domainKey, onChangeDomain, onBack }: Props) {
  const domain = OBJECTION_DOMAIN_BY_KEY[domainKey];
  const objections = getObjectionsForDomain(domainKey);
  const handlerCount = totalHandlersForDomain(domainKey);
  const pubCount = totalPublicationsForDomain(domainKey);
  const domainIndex = OBJECTION_DOMAINS.findIndex(d => d.key === domainKey);

  return (
    <div className="pl-8 pr-12 py-6 max-w-7xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-mono text-serif-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 hover:text-serif-foreground"
        >
          <ArrowLeft size={12} />
          Objections
        </button>
        <span>/</span>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-serif-foreground font-semibold normal-case tracking-normal inline-flex items-center gap-1"
            >
              {domain.name}
              <ChevronDown size={12} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={4}
              align="start"
              className="z-50 rounded-lg bg-white shadow-xl ring-1 ring-slate-200 p-1.5 min-w-[220px]"
            >
              {OBJECTION_DOMAINS.map(d => (
                <Popover.Close asChild key={d.key}>
                  <button
                    type="button"
                    onClick={() => onChangeDomain(d.key)}
                    className={cn(
                      'block w-full text-left px-3 py-1.5 rounded text-sm normal-case tracking-normal',
                      d.key === domainKey
                        ? 'bg-slate-100 font-semibold text-serif-foreground'
                        : 'text-serif-foreground hover:bg-slate-50',
                    )}
                  >
                    {d.name}
                  </button>
                </Popover.Close>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Banner */}
      <section
        className={cn(
          'rounded-2xl border border-slate-200/70 px-6 py-6 relative overflow-hidden',
          domain.banner_class,
        )}
      >
        <h1 className="font-playfair text-2xl text-slate-900 mb-2">
          {domainIndex + 1}. {domain.bannerTitle}
        </h1>
        <p className="text-sm leading-relaxed text-slate-800 max-w-4xl">{domain.overarching}</p>
      </section>

      {/* Counts */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-serif-foreground">
          Payer Objections
        </h2>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-mono">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded ring-1 ring-slate-200 bg-white text-serif-foreground">
            <MessageSquareWarning size={11} />
            <span className="font-semibold">{objections.length}</span> Objections
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded ring-1 ring-slate-200 bg-white text-serif-foreground">
            <Hammer size={11} />
            <span className="font-semibold">{handlerCount}</span> Handlers
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded ring-1 ring-slate-200 bg-white text-serif-foreground">
            <FileText size={11} />
            <span className="font-semibold">{pubCount}</span> Publications
          </span>
        </div>
      </div>

      {/* Objections */}
      <div className="space-y-3">
        {objections.map((o, i) => (
          <ObjectionCard key={o.id} objection={o} defaultExpanded={i === 0} />
        ))}
      </div>
    </div>
  );
}
