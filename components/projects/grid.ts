/**
 * Shared 5-column grid template for the Projects timeline.
 * Used by both TimelineRuler and ActivityRow so column edges align.
 *
 *   1. Activity name      ── minmax(180px, 1.3fr)
 *   2. Owner              ── minmax(110px, 0.75fr)   (narrower, allowed to wrap)
 *   3. Expected outcomes  ── minmax(160px, 1.05fr)   (narrower, line-clamp-2)
 *   4. IEP linkage        ── minmax(120px, 0.8fr)
 *   5. Timeline bar area  ── minmax(0, 3.2fr)        (extra room reclaimed
 *                                                     from Owner + Outcomes)
 */
export const ROW_GRID =
  'grid grid-cols-[minmax(180px,1.3fr)_minmax(110px,0.75fr)_minmax(160px,1.05fr)_minmax(120px,0.8fr)_minmax(0,3.2fr)]';
