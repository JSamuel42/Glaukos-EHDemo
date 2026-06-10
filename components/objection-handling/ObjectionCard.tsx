'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Quote } from 'lucide-react';
import {
  type Objection,
  type ObjectionDomainKey,
} from '@/lib/objection-handling/data';
import StrengthIndicator from '@/components/shared/StrengthIndicator';
import { SupportingArticles } from '@/components/citations/SupportingArticles';
import ReinforceMessagePopover from './ReinforceMessagePopover';
import HandlerCard from './HandlerCard';

interface Props {
  objection: Objection;
  defaultExpanded?: boolean;
}

// Domain-keyed pill colours for the handler IDs. Kept here so the
// objection card is self-contained — the colour palette tracks the
// gradient choices in data.ts.
const HANDLER_PILL_COLORS: Record<ObjectionDomainKey, string> = {
  'disease-burden': 'bg-rose-100 text-rose-700',
  'clinical-value': 'bg-cyan-100 text-cyan-700',
  'clinical-differentiation': 'bg-emerald-100 text-emerald-700',
  'economic-value': 'bg-purple-100 text-purple-700',
};

/**
 * Collapsible objection card. Collapsed header shows ID + tag + payer
 * voice + strength indicator. Expanded body shows Top Line Response
 * and the cross-module Reinforce panel side-by-side, then the list of
 * handler rows under an "Emphasise N Publications" header.
 */
export default function ObjectionCard({ objection, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const handlerPillColor = HANDLER_PILL_COLORS[objection.domain];
  const totalPublications = objection.handlers.reduce(
    (s, h) => s + h.placeholder_publication_count,
    0,
  );

  return (
    <article className="rounded-xl border border-serif-border bg-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full px-5 py-4 flex items-start gap-4 hover:bg-slate-50/60 transition-colors text-left"
      >
        <span className="shrink-0 mt-1 text-serif-muted-foreground">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-sm font-semibold text-serif-foreground">
              {objection.id} <span className="text-serif-muted-foreground">:</span>{' '}
              {objection.tag}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Quote
              size={14}
              className="shrink-0 mt-0.5 text-serif-muted-foreground/70"
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-serif-foreground italic">
              {objection.payerVoice}
            </p>
          </div>
        </div>
        <div className="hidden md:flex shrink-0 pt-1">
          <StrengthIndicator level={objection.strength} />
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-serif-border pt-4 space-y-4 bg-slate-50/30">
          {/* Strength on mobile (header hides it under md) */}
          <div className="md:hidden">
            <StrengthIndicator level={objection.strength} showLegend />
          </div>

          {/* Top Line Response + Reinforce, with a directional chevron between
              them on md+ to make the handoff explicit (response → reinforced
              value messages). On mobile the boxes stack and the chevron is
              hidden — vertical order conveys flow on its own. */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-0">
            <div className="flex-1 rounded-md bg-emerald-50 border border-emerald-200 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 mb-1.5">
                Top Line Response
              </div>
              <p className="text-sm leading-relaxed text-serif-foreground">
                {objection.topLineResponse}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center px-3 shrink-0">
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm ring-1 ring-slate-200"
                style={{
                  background:
                    'linear-gradient(120deg, rgba(16,185,129,0.18), rgba(168,139,250,0.20))',
                }}
              >
                <ChevronRight size={16} strokeWidth={2.5} className="text-slate-700" />
              </span>
            </div>
            <ReinforceMessagePopover
              messageIds={objection.reinforcedValueMessageIds}
              reinforceText={objection.reinforceText}
            />
          </div>

          {/* Emphasise / handlers */}
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <h3 className="text-sm font-semibold text-serif-foreground">Emphasise</h3>
              <span className="text-[11px] uppercase tracking-wide font-mono text-serif-muted-foreground">
                {objection.handlers.length} Handlers · {totalPublications} Publications
              </span>
            </div>
            <div className="space-y-1.5">
              {objection.handlers.map(h => (
                <HandlerCard key={h.id} handler={h} domainColor={handlerPillColor} />
              ))}
            </div>
          </div>

          {/* Publication-side linkages keyed against the top-level OH ID
              (sub-handler citations aren't supported yet). Rendered in
              the same placeholder-box visual style as the per-handler
              lists, but with no dashed placeholder fill — the objection
              itself has no placeholder_publication_count, so this block
              shows only when a live reference exists. */}
          <SupportingArticles
            module="objection-handler"
            messageId={objection.id}
          />
        </div>
      )}
    </article>
  );
}
