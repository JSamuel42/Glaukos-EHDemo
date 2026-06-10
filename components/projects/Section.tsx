'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ACTIVITIES, type Section as SectionKey } from '@/lib/projects/data';
import type { TimelineView } from '@/lib/projects/timeline';
import ActivityRow from './ActivityRow';

interface Props {
  section: SectionKey;
  view: TimelineView;
}

const SECTION_LABEL: Record<SectionKey, string> = {
  global: 'Global',
  local: 'Local',
};

/**
 * Collapsible band wrapping all rows in one section. Both Global and Local
 * sections render open by default — they're the page's primary content,
 * not a progressive-disclosure affordance. Collapse is for users who want
 * to focus on one scope at a time.
 */
export default function Section({ section, view }: Props) {
  const [open, setOpen] = useState(true);
  const items = ACTIVITIES.filter(a => a.section === section);

  return (
    <section className="rounded-lg border border-serif-border overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 bg-serif-muted/40 hover:bg-serif-muted/60 transition-colors text-left"
      >
        <ChevronDown
          size={14}
          className={cn(
            'text-serif-muted-foreground transition-transform',
            !open && '-rotate-90',
          )}
        />
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--evhub-navy)]">
          {SECTION_LABEL[section]}
        </h2>
        <span className="text-xs text-serif-muted-foreground">({items.length})</span>
      </button>

      {open && (
        <div className="divide-y divide-serif-border/60">
          {items.map(a => (
            <ActivityRow key={a.id} activity={a} view={view} />
          ))}
        </div>
      )}
    </section>
  );
}
