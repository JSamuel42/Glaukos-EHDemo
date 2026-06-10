'use client';

import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Search, FileText, Diamond, Download, X } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  DOMAINS,
  INDICATION_OPTIONS,
  PAYER_ISSUE_OPTIONS,
  OVERARCHING_MESSAGE,
  getMessagesForDomain,
  totalPublicationsForDomain,
  type DomainKey,
} from '@/lib/value-story/data';
import { cn } from '@/lib/cn';

interface Props {
  selectedIndication: string | null;
  selectedPayerIssues: Set<string>;
  onRemovePayerIssue: (id: string) => void;
  onClearIndication: () => void;
  onSelectDomain: (d: DomainKey) => void;
  onBack: () => void;
}

/**
 * Page 2 — gradient domain cards. Selected indication + payer issues
 * appear as removable purple pills under the banner; removing them is
 * cosmetic (the cards don't filter against the selector — Option A).
 */
export default function DomainsPage({
  selectedIndication,
  selectedPayerIssues,
  onRemovePayerIssue,
  onClearIndication,
  onSelectDomain,
  onBack,
}: Props) {
  const indicationLabel = useMemo(
    () => INDICATION_OPTIONS.find(o => o.id === selectedIndication)?.label,
    [selectedIndication],
  );

  const payerLabels = useMemo(
    () =>
      PAYER_ISSUE_OPTIONS.filter(o => selectedPayerIssues.has(o.id)).map(o => ({
        id: o.id,
        label: o.label,
      })),
    [selectedPayerIssues],
  );

  return (
    // pr-12 keeps the right edge clear of the chat panel rail; max-w-7xl
    // gives wide screens a comfortable centered measure without
    // letting cards spill across the full viewport.
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      {/* Banner */}
      <section
        className="rounded-2xl border border-slate-200/70 px-6 py-8 mb-5"
        style={{
          background:
            'linear-gradient(120deg, rgba(175,169,236,0.18) 0%, rgba(133,183,235,0.12) 50%, rgba(255,255,255,0.0) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-playfair text-3xl text-serif-foreground mb-3">
            Explore Value Stories
          </h1>
          <p className="text-sm leading-relaxed text-serif-foreground/85">
            {OVERARCHING_MESSAGE}
          </p>
          {/* Inert search */}
          <div className="relative max-w-xl mx-auto mt-5">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-serif-muted-foreground pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search for a Value Message..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)]"
              disabled
            />
          </div>
        </div>
      </section>

      {/* Filter chip bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wide font-mono font-semibold text-serif-muted-foreground hover:text-serif-foreground"
        >
          <ArrowLeft size={12} />
          Back
        </button>

        {indicationLabel && (
          <SelectionPill label={indicationLabel} onRemove={onClearIndication} />
        )}
        {payerLabels.map(p => (
          <SelectionPill
            key={p.id}
            label={p.label}
            onRemove={() => onRemovePayerIssue(p.id)}
          />
        ))}

        <div className="ml-auto">
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white opacity-80 cursor-not-allowed"
                  style={{ backgroundColor: '#D24E3D' }}
                >
                  <Download size={12} />
                  Download
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="left"
                  sideOffset={6}
                  className="z-50 px-3 py-2 rounded-md text-xs shadow-lg"
                  style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
                >
                  Download not available in demo
                  <Tooltip.Arrow style={{ fill: 'var(--evhub-navy)' }} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {DOMAINS.map(d => {
          const messageCount = getMessagesForDomain(d.key).length;
          const pubCount = totalPublicationsForDomain(d.key);
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelectDomain(d.key)}
              className={cn(
                'relative overflow-hidden rounded-2xl border border-slate-200/70 px-5 py-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 min-h-[200px]',
                d.gradient_class,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute bottom-2 right-3 font-playfair font-bold pointer-events-none select-none',
                  d.text_on_gradient_class,
                )}
                // Dialled-down watermark — half the previous footprint so the
                // monogram reads as background texture, not graphic element.
                style={{ fontSize: 72, lineHeight: 1 }}
              >
                {d.monogram}
              </span>
              <div className="relative">
                <h3 className="font-semibold text-lg text-slate-900 mb-4 leading-tight">
                  {d.name}
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="inline-flex items-center gap-1.5">
                    <Diamond size={11} className="text-slate-600" />
                    <span className="font-semibold">{messageCount}</span>
                    <span className="text-slate-600">Value Messages</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <FileText size={11} className="text-slate-600" />
                    <span className="font-semibold">{pubCount}</span>
                    <span className="text-slate-600">Publications</span>
                  </li>
                </ul>
                <ArrowRight
                  size={16}
                  className="mt-6 text-slate-600 transition-transform"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectionPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-[10px] uppercase tracking-wide font-mono font-semibold"
      style={{ backgroundColor: 'rgba(175,169,236,0.25)', color: '#3D3893' }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/40"
        aria-label={`Remove ${label}`}
      >
        <X size={10} />
      </button>
    </span>
  );
}
