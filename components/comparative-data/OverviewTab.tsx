import EvidenceSpiderChart from './EvidenceSpiderChart';

/**
 * Overview tab — now Evidence Profile (spider chart + best-in-class table)
 * only.  The detailed product-timeline graphic that used to live here has
 * moved to the Timelines tab and been replaced there by the simplified
 * StageMilestones view.
 */
export default function OverviewTab() {
  return (
    <div className="space-y-10">
      <section
        className="rounded-lg p-4"
        style={{
          backgroundColor: 'var(--serif-card)',
          border: '1px solid var(--serif-border)',
        }}
      >
        <EvidenceSpiderChart />
      </section>
    </div>
  );
}
