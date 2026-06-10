import StageMilestones from './StageMilestones';
import HtaOutcomesTable from './HtaOutcomesTable';

/**
 * Third tab — simplified stage-milestone view plus the HTA outcomes table
 * underneath. The detailed marker-by-marker ProductTimeline that was on
 * Overview is intentionally retired in favour of this lighter view; the
 * file is kept in the repo as dead code in case we want to bring it back.
 */
export default function TimelinesTab() {
  return (
    <div className="space-y-10">
      <section
        className="rounded-lg p-4"
        style={{
          backgroundColor: 'var(--serif-card)',
          border: '1px solid var(--serif-border)',
        }}
      >
        <StageMilestones />
      </section>

      <section
        className="rounded-lg p-4"
        style={{
          backgroundColor: 'var(--serif-card)',
          border: '1px solid var(--serif-border)',
        }}
      >
        <HtaOutcomesTable />
      </section>
    </div>
  );
}
