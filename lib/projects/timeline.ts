import type { Activity } from './data';

export type TimelineView = '1yr' | '2yr';

export interface TimelineRange {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

export const RANGES: Record<TimelineView, TimelineRange> = {
  '1yr': { startYear: 2026, startMonth: 1, endYear: 2026, endMonth: 12 },
  '2yr': { startYear: 2026, startMonth: 1, endYear: 2027, endMonth: 12 },
};

function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

export function rangeMonths(range: TimelineRange): number {
  return (
    monthIndex(range.endYear, range.endMonth) -
    monthIndex(range.startYear, range.startMonth) +
    1
  );
}

export interface BarPosition {
  leftPct: number;
  widthPct: number;
  clippedRight: boolean;
  clippedLeft: boolean;
}

/**
 * Compute the bar's left%/width% within the visible range, plus flags for
 * the activity extending beyond either edge. Returns null when the activity
 * sits entirely outside the range (so the row renders an empty cell).
 */
export function barPosition(activity: Activity, range: TimelineRange): BarPosition | null {
  const rangeStart = monthIndex(range.startYear, range.startMonth);
  const rangeEnd = monthIndex(range.endYear, range.endMonth);
  const actStart = monthIndex(activity.startYear, activity.startMonth);
  const actEnd = monthIndex(activity.endYear, activity.endMonth);

  if (actEnd < rangeStart || actStart > rangeEnd) return null;

  const clampedStart = Math.max(actStart, rangeStart);
  const clampedEnd = Math.min(actEnd, rangeEnd);
  const total = rangeEnd - rangeStart + 1;

  return {
    leftPct: ((clampedStart - rangeStart) / total) * 100,
    widthPct: ((clampedEnd - clampedStart + 1) / total) * 100,
    clippedRight: actEnd > rangeEnd,
    clippedLeft: actStart < rangeStart,
  };
}

/** Month-by-month ruler cells with quarter / year-start markers. */
export function rulerCells(
  range: TimelineRange,
): Array<{ year: number; month: number; isQuarterStart: boolean; isYearStart: boolean }> {
  const cells: Array<{ year: number; month: number; isQuarterStart: boolean; isYearStart: boolean }> = [];
  let y = range.startYear;
  let m = range.startMonth;
  const end = monthIndex(range.endYear, range.endMonth);
  while (monthIndex(y, m) <= end) {
    cells.push({
      year: y,
      month: m,
      isQuarterStart: m === 1 || m === 4 || m === 7 || m === 10,
      isYearStart: m === 1,
    });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return cells;
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonthShort(month: number): string {
  return MONTH_SHORT[month - 1];
}
