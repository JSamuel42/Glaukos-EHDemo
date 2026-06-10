'use client';

import { useState } from 'react';
import type { PillarKey } from '@/lib/scientific-narrative/data';
import PillarsPage from '@/components/scientific-narrative/PillarsPage';
import PillarDetailPage from '@/components/scientific-narrative/PillarDetailPage';

type PageKey = 'pillars' | 'detail';

/**
 * Scientific Narrative module — two-page internal flow driven by component
 * state. AppShell + chat panel are mounted by app/(app)/layout.tsx, so this
 * page wires only the inner content.
 */
export default function ScientificNarrativePage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('pillars');
  const [activePillar, setActivePillar] = useState<PillarKey | null>(null);

  if (currentPage === 'pillars' || !activePillar) {
    return (
      <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
        <PillarsPage
          onSelectPillar={p => {
            setActivePillar(p);
            setCurrentPage('detail');
          }}
        />
      </div>
    );
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      <PillarDetailPage
        pillarKey={activePillar}
        onChangePillar={setActivePillar}
        onBack={() => setCurrentPage('pillars')}
      />
    </div>
  );
}
