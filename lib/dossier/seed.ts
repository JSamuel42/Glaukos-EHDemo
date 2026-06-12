/**
 * Dossier demo seeding (DEMO_MODE, in-memory / lossy on refresh).
 *
 * Seeds the pre-baked portfolio (Global / UK / Germany) into the in-memory
 * store once per session. A hard refresh re-evaluates the store module and
 * this re-seeds, discarding added dossiers + edits. `resetDossierDemo()`
 * restores the portfolio on demand.
 *
 * The Context Manager's writing context stays in localStorage (peripheral
 * config, not dossier content).
 */

import { seedDossiers, resetDossiers, isSeeded } from '@/lib/dossier/store';
import {
  GLAUCOMA_DOSSIER_SEEDS,
  GLAUCOMA_DOSSIER_ID,
  GLAUCOMA_DOSSIER_CONTEXT,
} from '@/data/demo/glaucomaDossier';

/** localStorage key for a dossier's writing context (Context Manager). */
export function contextKey(dossierId: string): string {
  return `glaukos-dossier-context-${dossierId}`;
}

function seedContext(): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    // Global context seeds the writing-context default; country dossiers reuse it.
    const key = contextKey(GLAUCOMA_DOSSIER_ID);
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(GLAUCOMA_DOSSIER_CONTEXT));
    }
  } catch { /* swallow */ }
}

/** Seed the pre-baked portfolio once per session. */
export function seedDossierDemo(): void {
  if (isSeeded()) return;
  seedDossiers(GLAUCOMA_DOSSIER_SEEDS);
  seedContext();
}

/** Reset to the pre-baked portfolio, discarding added dossiers + edits. */
export function resetDossierDemo(): void {
  resetDossiers(GLAUCOMA_DOSSIER_SEEDS);
}
