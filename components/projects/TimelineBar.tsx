'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Activity } from '@/lib/projects/data';
import {
  RANGES,
  barPosition,
  formatMonthShort,
  type TimelineView,
} from '@/lib/projects/timeline';
import IEPPill from './IEPPill';

const STATUS_BAR_COLOR: Record<Activity['status'], string> = {
  'Planned':     'bg-slate-400',
  'In Progress': 'bg-[color:var(--evhub-mint)]',
  'Complete':    'bg-emerald-500',
};

const STATUS_LABEL_COLOR: Record<Activity['status'], string> = {
  'Planned':     'text-slate-700 bg-slate-100',
  'In Progress': 'text-emerald-800 bg-[rgba(93,202,165,0.18)]',
  'Complete':    'text-emerald-700 bg-emerald-50',
};

interface Props {
  activity: Activity;
  view: TimelineView;
}

/**
 * The coloured horizontal bar positioned over the activity's date range.
 * Hover reveals a tooltip with the full description, owner, dates, and
 * IEP pills. Activities extending beyond the visible window render with
 * a small `←` / `→` glyph at the clipped edge.
 */
export default function TimelineBar({ activity, view }: Props) {
  const [hover, setHover] = useState(false);
  const pos = barPosition(activity, RANGES[view]);

  if (!pos) {
    // Activity sits entirely outside the visible window — render a
    // placeholder row height so the grid stays aligned vertically.
    return <div className="h-5" />;
  }

  const dateLabel = `${formatMonthShort(activity.startMonth)} ${activity.startYear} – ${formatMonthShort(activity.endMonth)} ${activity.endYear}`;

  // Keep the tooltip from overflowing the right edge of the viewport — if
  // the bar starts past 70% across, anchor the tooltip to the right edge
  // of the bar instead of the left.
  const tooltipAnchorsRight = pos.leftPct > 55;

  return (
    <div className="relative h-5">
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all',
          STATUS_BAR_COLOR[activity.status],
          hover ? 'h-4 shadow-md ring-2 ring-white' : 'h-3',
        )}
        style={{
          left: `${pos.leftPct}%`,
          width: `${pos.widthPct}%`,
          minWidth: '8px',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {pos.clippedRight && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-1 text-[10px] text-serif-muted-foreground">
            →
          </span>
        )}
        {pos.clippedLeft && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 text-[10px] text-serif-muted-foreground">
            ←
          </span>
        )}
      </div>

      {hover && (
        <div
          className="absolute z-20 bottom-full mb-2 w-80 p-3 rounded-lg shadow-lg border border-serif-border bg-white text-xs text-serif-foreground pointer-events-none"
          style={
            tooltipAnchorsRight
              ? { right: `${100 - (pos.leftPct + pos.widthPct)}%` }
              : { left: `${pos.leftPct}%` }
          }
        >
          <div className="font-semibold text-[color:var(--evhub-navy)] text-sm mb-1">
            {activity.name}
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={cn(
                'inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide',
                STATUS_LABEL_COLOR[activity.status],
              )}
            >
              {activity.status}
            </span>
            <span className="text-serif-muted-foreground">{dateLabel}</span>
          </div>
          <div className="text-serif-muted-foreground mb-2 italic">{activity.owner}</div>
          <p className="leading-relaxed text-serif-foreground/90">{activity.outcomesFull}</p>
          {activity.iepLinkage.length > 0 && (
            <div className="mt-2 pt-2 border-t border-serif-border flex flex-wrap gap-1">
              {activity.iepLinkage.map(c => (
                <IEPPill key={c} code={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
