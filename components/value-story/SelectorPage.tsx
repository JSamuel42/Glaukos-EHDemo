'use client';

import { X, ChevronRight } from 'lucide-react';
import {
  INDICATION_OPTIONS,
  PAYER_ISSUE_OPTIONS,
  LANDING_BANNER_OPENING,
  LANDING_SELECTOR_PROMPT,
} from '@/lib/value-story/data';
import AlnyxLogo from './AlnyxLogo';
import { cn } from '@/lib/cn';

interface Props {
  selectedIndication: string | null;
  setSelectedIndication: (id: string | null) => void;
  selectedPayerIssues: Set<string>;
  setSelectedPayerIssues: (s: Set<string>) => void;
  onContinue: () => void;
}

/**
 * Page 1 — cosmetic selector for indication + payer issue focus.
 * The selections are not used to filter content downstream (Option A);
 * the Continue button drives navigation to the Domains page.
 */
export default function SelectorPage({
  selectedIndication,
  setSelectedIndication,
  selectedPayerIssues,
  setSelectedPayerIssues,
  onContinue,
}: Props) {
  function togglePayerIssue(id: string) {
    const next = new Set(selectedPayerIssues);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPayerIssues(next);
  }

  return (
    <div className="px-8 py-7 max-w-5xl mx-auto">
      {/* Banner */}
      <section
        className="relative rounded-2xl overflow-hidden border border-slate-200/70 px-7 py-6 mb-7"
        style={{
          background:
            'linear-gradient(120deg, rgba(133,183,235,0.22) 0%, rgba(175,169,236,0.20) 60%, rgba(255,255,255,0.0) 100%)',
        }}
      >
        <button
          type="button"
          aria-label="Dismiss banner"
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition-colors"
          title="Decorative only"
        >
          <X size={16} />
        </button>
        <AlnyxLogo size={30} className="mb-3" />
        <p className="text-sm leading-relaxed text-serif-foreground max-w-3xl">
          {LANDING_BANNER_OPENING}
        </p>
      </section>

      {/* Prompt */}
      <p className="text-base text-slate-700 mb-6 max-w-3xl">{LANDING_SELECTOR_PROMPT}</p>

      {/* Indication focus */}
      <section className="mb-6">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-3">
          Indication Focus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INDICATION_OPTIONS.map(opt => {
            const active = selectedIndication === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedIndication(active ? null : opt.id)}
                aria-pressed={active}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-white text-left transition-all',
                  active
                    ? 'border-[color:var(--evhub-mint)] ring-2 ring-[rgba(93,202,165,0.30)] shadow-sm'
                    : 'border-serif-border hover:border-serif-muted-foreground/60',
                )}
              >
                <span className="text-sm text-serif-foreground">{opt.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-4 h-4 rounded-full border transition-colors',
                    active ? 'border-[color:var(--evhub-mint)]' : 'border-slate-300',
                  )}
                >
                  {active && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--evhub-mint)' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Payer issue focus */}
      <section className="mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-3">
          Payer issue focus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PAYER_ISSUE_OPTIONS.map(opt => {
            const active = selectedPayerIssues.has(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => togglePayerIssue(opt.id)}
                aria-pressed={active}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-white text-left transition-all',
                  active
                    ? 'border-[color:var(--evhub-mint)] ring-2 ring-[rgba(93,202,165,0.30)] shadow-sm'
                    : 'border-serif-border hover:border-serif-muted-foreground/60',
                )}
              >
                <span className="text-sm text-serif-foreground">{opt.label}</span>
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-4 h-4 rounded border transition-colors',
                    active
                      ? 'border-[color:var(--evhub-mint)]'
                      : 'border-slate-300',
                  )}
                  style={active ? { backgroundColor: 'var(--evhub-mint)' } : undefined}
                >
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5.2L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedIndication}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-semibold transition-all',
            selectedIndication
              ? 'hover:opacity-90 shadow-sm'
              : 'opacity-40 cursor-not-allowed',
          )}
          style={{ backgroundColor: 'var(--evhub-mint)' }}
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
