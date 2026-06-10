'use client';

import { cn } from '@/lib/cn';
import type { TimelineView } from '@/lib/projects/timeline';

interface Props {
  view: TimelineView;
  onChange: (v: TimelineView) => void;
}

/**
 * Pill toggle for the timeline visible range. Defaults to 1 year (the
 * "current focus" lens); 2 years reveals everything including activities
 * spilling into 2027.
 */
export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full bg-serif-muted p-1 text-sm">
      {(['1yr', '2yr'] as const).map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          className={cn(
            'px-4 py-1.5 rounded-full font-medium transition-colors',
            view === v
              ? 'bg-white text-[color:var(--evhub-navy)] shadow-sm'
              : 'text-serif-muted-foreground hover:text-[color:var(--evhub-navy)]',
          )}
        >
          {v === '1yr' ? '1 year' : '2 years'}
        </button>
      ))}
    </div>
  );
}
