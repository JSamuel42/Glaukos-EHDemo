import type { Funnel, FunnelLevel } from './data';

export interface ComputedLevel extends FunnelLevel {
  /** Absolute headcount at this level after percentage cascade. */
  absolute: number;
}

/**
 * Cascade a funnel's percentages down from its top-level absolute,
 * optionally substituting user-edited percentages from `overrides`.
 * Recomputed on every render in the workspace so % edits feel live.
 */
export function computeFunnel(
  funnel: Funnel,
  overrides?: Record<string, number>,
): ComputedLevel[] {
  const result: ComputedLevel[] = [];
  let running = funnel.topLevelAbsolute;

  for (let i = 0; i < funnel.levels.length; i++) {
    const lvl = funnel.levels[i];
    const pct = overrides?.[lvl.id] ?? lvl.percentage;
    let absolute: number;
    if (i === 0) {
      absolute = running;
    } else {
      absolute = running * (pct / 100);
      running = absolute;
    }
    result.push({ ...lvl, percentage: pct, absolute: Math.round(absolute) });
  }
  return result;
}

/** Compact display: 258M / 1.5M / 30k / 1,234 */
export function formatAbsolute(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  }
  return n.toLocaleString();
}
