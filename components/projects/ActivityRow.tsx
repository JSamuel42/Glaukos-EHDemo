import { cn } from '@/lib/cn';
import type { Activity } from '@/lib/projects/data';
import type { TimelineView } from '@/lib/projects/timeline';
import TimelineBar from './TimelineBar';
import IEPPill from './IEPPill';
import ClampedText from './ClampedText';
import { ROW_GRID } from './grid';

interface Props {
  activity: Activity;
  view: TimelineView;
}

/**
 * One activity row — 4 data columns + the timeline bar cell.
 * Columns 1-3 wrap to 2 lines via line-clamp; ClampedText shows a custom
 * hover tooltip only when the content is actually truncated. The native
 * `title` attribute is intentionally avoided — its ~500ms browser delay
 * makes it feel unresponsive in a demo context.
 */
export default function ActivityRow({ activity, view }: Props) {
  return (
    <div
      className={cn(
        ROW_GRID,
        'items-center py-4 hover:bg-serif-muted/40 transition-colors',
      )}
    >
      <div className="px-2 text-sm font-medium text-[color:var(--evhub-navy)] leading-snug">
        <ClampedText text={activity.name} clampClass="line-clamp-2" />
      </div>

      <div className="px-2 text-xs text-serif-muted-foreground leading-snug">
        <ClampedText text={activity.owner} clampClass="line-clamp-2" />
      </div>

      <div className="px-2 text-xs text-serif-foreground/90 leading-snug">
        <ClampedText text={activity.outcomesHeadline} clampClass="line-clamp-2" />
      </div>

      <div className="px-2 flex flex-wrap gap-1">
        {activity.iepLinkage.length === 0 ? (
          <span className="text-xs text-serif-muted-foreground/60">—</span>
        ) : (
          activity.iepLinkage.map(code => <IEPPill key={code} code={code} />)
        )}
      </div>

      <div className="px-2">
        <TimelineBar activity={activity} view={view} />
      </div>
    </div>
  );
}
