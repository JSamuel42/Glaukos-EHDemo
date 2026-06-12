'use client';

import { useEffect, useState } from 'react';
import { FUNNELS, getFunnel } from '@/lib/epidemiology/data';
import { computeFunnel, formatAbsolute } from '@/lib/epidemiology/calc';
import { FunnelWorkspace } from '@/components/epidemiology/FunnelWorkspace';
import { SavedFunnelsList } from '@/components/epidemiology/SavedFunnelsList';
import { useChatPanel } from '@/components/chat/ChatPanelContext';

/**
 * Epidemiology — Target Population Funnels.
 *
 * Two stacked sections:
 *   - Top: live workspace with one or two funnels (Add comparison /
 *     Close comparison toggle).
 *   - Bottom: saved-funnels table — View/Compare actions swap funnels
 *     in and out of the workspace slots above.
 *
 * No chat integration; the platform chat panel still renders globally
 * with its stub config for this route, which is fine.
 */
export default function EpidemiologyPage() {
  const [primaryId, setPrimaryId] = useState<string>(FUNNELS[0].id);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const { setModuleContext } = useChatPanel();

  // ── Chat grounding (Phase 6) ──────────────────────────────────────────────────
  // Describe the primary funnel — country, base population, and the computed
  // tier cascade down to the surgical-eligible target — to the chat panel.
  useEffect(() => {
    const funnel = getFunnel(primaryId);
    if (!funnel) {
      setModuleContext(null);
      return;
    }
    const levels = computeFunnel(funnel);
    // End the cascade at the surgical-eligible target tier (inclusive).
    const targetIdx = levels.findIndex((l) => l.isTarget);
    const tiers = (targetIdx >= 0 ? levels.slice(0, targetIdx + 1) : levels)
      .map((l) => `${l.name} = ${formatAbsolute(l.absolute)} (${l.percentage}%)`)
      .join(' → ');
    const ctx =
      `Active funnel: ${funnel.countryFullName} ` +
      `(adults 40+: ${formatAbsolute(funnel.topLevelAbsolute)}). Tiers: ${tiers}`;
    setModuleContext(ctx);
    return () => setModuleContext(null);
  }, [primaryId, setModuleContext]);

  function handleCompare(id: string) {
    if (id === primaryId) return; // already in primary slot
    setComparisonId(id);
  }

  function handleView(id: string) {
    // Switching primary to whatever is currently in comparison would
    // leave the same funnel in both slots — clear comparison instead.
    if (id === comparisonId) {
      setComparisonId(null);
    }
    setPrimaryId(id);
  }

  return (
    <div className="pl-8 pr-12 py-7 max-w-screen-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-playfair text-3xl text-serif-foreground leading-tight">
          Epidemiology — Target Population Funnels
        </h1>
        <p className="text-sm text-serif-muted-foreground mt-1">
          Open-angle glaucoma L1→L5 funnel — surgical-eligible (MIGS) population estimates by country
        </p>
      </header>

      <div className="grid gap-6 grid-rows-[minmax(0,3fr)_minmax(0,2fr)]">
        <FunnelWorkspace
          primaryId={primaryId}
          comparisonId={comparisonId}
          onChangePrimary={setPrimaryId}
          onChangeComparison={setComparisonId}
        />
        <SavedFunnelsList
          primaryId={primaryId}
          comparisonId={comparisonId}
          onView={handleView}
          onCompare={handleCompare}
        />
      </div>
    </div>
  );
}
