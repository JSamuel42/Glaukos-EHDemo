'use client';

import { useState } from 'react';
import ViewToggle from '@/components/projects/ViewToggle';
import TimelineRuler from '@/components/projects/TimelineRuler';
import Section from '@/components/projects/Section';
import type { TimelineView } from '@/lib/projects/timeline';

export default function ProjectsPage() {
  const [view, setView] = useState<TimelineView>('1yr');

  return (
    <div className="pl-8 pr-12 py-7 max-w-screen-2xl mx-auto">
      <header className="mb-6 flex items-start justify-between gap-4">
        <h1 className="font-playfair text-3xl text-serif-foreground">
          Overview of Key Evidence Generation Activities for Alnyx
        </h1>
        <ViewToggle view={view} onChange={setView} />
      </header>

      <TimelineRuler view={view} />

      <div className="mt-4 space-y-4">
        <Section section="global" view={view} />
        <Section section="local" view={view} />
      </div>
    </div>
  );
}
