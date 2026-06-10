import {
  RANGES,
  rulerCells,
  formatMonthShort,
  type TimelineView,
} from '@/lib/projects/timeline';
import { cn } from '@/lib/cn';
import { ROW_GRID } from './grid';

interface Props {
  view: TimelineView;
}

/**
 * Header row containing the 4 column titles and the month-by-month ruler
 * cells. Shares the ROW_GRID template with ActivityRow so columns align.
 */
export default function TimelineRuler({ view }: Props) {
  const cells = rulerCells(RANGES[view]);

  return (
    <div
      className={cn(
        ROW_GRID,
        'text-xs text-serif-muted-foreground border-b border-serif-border pb-2',
      )}
    >
      <div className="px-2 font-semibold text-serif-foreground">Activity</div>
      <div className="px-2 font-semibold text-serif-foreground">Owner</div>
      <div className="px-2 font-semibold text-serif-foreground">Expected outcomes</div>
      <div className="px-2 font-semibold text-serif-foreground">IEP linkage</div>

      <div className="relative flex">
        {cells.map((c, i) => (
          <div
            key={`${c.year}-${c.month}`}
            className={cn(
              'flex-1 text-center border-l text-[10px] leading-tight pt-1',
              c.isYearStart
                ? 'border-serif-muted-foreground/60'
                : c.isQuarterStart
                  ? 'border-serif-border'
                  : 'border-serif-border/40',
              i === 0 && 'border-l-0',
            )}
          >
            <div
              className={cn(
                c.isYearStart && 'font-semibold text-[color:var(--evhub-navy)]',
              )}
            >
              {c.month === 1 ? c.year : formatMonthShort(c.month)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
