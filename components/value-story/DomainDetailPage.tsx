'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Diamond,
  Circle,
} from 'lucide-react';
import {
  DOMAINS,
  DOMAIN_BY_KEY,
  getMessagesForDomain,
  totalPublicationsForDomain,
  type DomainKey,
  type ValueMessage,
} from '@/lib/value-story/data';
import StrengthIndicator from '@/components/shared/StrengthIndicator';
import { SupportingArticles } from '@/components/citations/SupportingArticles';
import { cn } from '@/lib/cn';

interface Props {
  domainKey: DomainKey;
  onChangeDomain: (key: DomainKey) => void;
  onBack: () => void;
}

// Domain-keyed accent colours for the message-ID square + headline.
const DOMAIN_ACCENT: Record<DomainKey, { bg: string; fg: string }> = {
  burden: { bg: '#F4A067', fg: '#FFFFFF' },
  clinical: { bg: '#5DA4DE', fg: '#FFFFFF' },
  patient: { bg: '#A98BD8', fg: '#FFFFFF' },
  economic: { bg: '#5DCAA5', fg: '#FFFFFF' },
};

/**
 * Page 3 — domain overarching statement + expandable value-message cards.
 * Breadcrumb hosts a dropdown to switch domains without returning to the
 * grid. Each message expands to reveal an "article linking pending"
 * placeholder until the cluster-final linking pass populates real refs.
 */
export default function DomainDetailPage({ domainKey, onChangeDomain, onBack }: Props) {
  const domain = DOMAIN_BY_KEY[domainKey];
  const messages = getMessagesForDomain(domainKey);
  const pubCount = totalPublicationsForDomain(domainKey);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  return (
    // pr-12 keeps the right edge clear of the chat panel; max-w-7xl
    // centres the column on wide screens for a comfortable measure.
    <div className="pl-8 pr-12 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wide font-mono text-serif-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 hover:text-serif-foreground"
        >
          <ArrowLeft size={12} />
          Value Messages
        </button>
        <span>/</span>
        <DomainDropdown current={domainKey} onChange={onChangeDomain} />
      </div>

      {/* Domain header card */}
      <section
        className={cn(
          'rounded-2xl border border-slate-200/70 px-6 py-6 mb-6',
          domain.gradient_class,
        )}
      >
        <h2 className="font-playfair text-2xl text-slate-900 mb-2">{domain.name}</h2>
        <p className="text-sm leading-relaxed text-slate-800 max-w-4xl">
          {domain.overarching}
        </p>
      </section>

      {/* Messages section */}
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-playfair text-xl text-serif-foreground">Value Messages</h3>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide font-mono text-serif-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Diamond size={11} />
            <span className="font-semibold text-serif-foreground">{messages.length}</span>
            Messages
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText size={11} />
            <span className="font-semibold text-serif-foreground">{pubCount}</span>
            Publications
          </span>
          <span className="inline-flex items-center gap-1 text-serif-muted-foreground/70">
            <Circle size={9} className="fill-current" />0 New
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {messages.map(m => (
          <MessageCard
            key={m.id}
            message={m}
            expanded={expanded.has(m.id)}
            onToggle={() => toggle(m.id)}
            accent={DOMAIN_ACCENT[domainKey]}
          />
        ))}
      </div>
    </div>
  );
}

function MessageCard({
  message,
  expanded,
  onToggle,
  accent,
}: {
  message: ValueMessage;
  expanded: boolean;
  onToggle: () => void;
  accent: { bg: string; fg: string };
}) {
  return (
    <article className="rounded-lg border border-serif-border bg-white overflow-hidden transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-md text-sm font-bold font-mono"
          style={{ backgroundColor: accent.bg, color: accent.fg }}
        >
          {message.id}
        </span>
        <p className="flex-1 text-sm leading-relaxed text-serif-foreground">
          {message.text}
        </p>
        <div className="hidden md:flex items-center shrink-0 pl-3">
          <StrengthIndicator level={message.strength} />
        </div>
        <span className="shrink-0 ml-2 text-serif-muted-foreground">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-serif-border bg-slate-50/40">
          {/* Strength is hidden in the row header on mobile — surface it here too */}
          <div className="md:hidden mb-3">
            <StrengthIndicator level={message.strength} showLegend />
          </div>

          <h4 className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-2">
            {message.placeholder_publication_count} Publications
          </h4>

          {/* See StatementCard for the rationale — same merge of live
              publication-side linkages + dashed-placeholder fill so a
              partially-linked message stays visually balanced. */}
          <SupportingArticles
            module="value-message"
            messageId={message.id}
            placeholderCount={message.placeholder_publication_count}
          />
        </div>
      )}
    </article>
  );
}

function DomainDropdown({
  current,
  onChange,
}: {
  current: DomainKey;
  onChange: (k: DomainKey) => void;
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
        {DOMAIN_BY_KEY[current].name}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 min-w-[220px] rounded-md border border-serif-border bg-white shadow-lg overflow-hidden">
          {DOMAINS.map(d => (
            <button
              key={d.key}
              type="button"
              onClick={() => {
                onChange(d.key);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm normal-case tracking-normal',
                d.key === current
                  ? 'bg-slate-50 font-semibold text-serif-foreground'
                  : 'text-serif-foreground hover:bg-slate-50',
              )}
            >
              <span>{d.name}</span>
              {d.key === current && (
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
