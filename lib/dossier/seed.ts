/**
 * Dossier demo seeding (DEMO_MODE, localStorage). Idempotent via a seed
 * version; bumping SEED_VERSION forces a re-seed of the demo dossier while
 * preserving any user-created dossiers.
 */

import { readAllDossiers, writeAllDossiers, type StoredDossier } from '@/lib/dossier/store';
import { GLAUCOMA_DOSSIER_SEED, GLAUCOMA_DOSSIER_ID, GLAUCOMA_DOSSIER_CONTEXT } from '@/data/demo/glaucomaDossier';

const SEED_VERSION = 1;
const SEED_VERSION_KEY = 'glaukos-dossier-seed-version';

/** localStorage key for a dossier's writing context (Context Manager). */
export function contextKey(dossierId: string): string {
  return `glaukos-dossier-context-${dossierId}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Seed the iStent demo dossier once per seed version. */
export function seedDossierDemo(): void {
  if (!isBrowser()) return;
  try {
    if (window.localStorage.getItem(SEED_VERSION_KEY) === String(SEED_VERSION)) return;

    const existing = readAllDossiers();
    const others = existing.filter((d) => d.id !== GLAUCOMA_DOSSIER_ID);
    // Deep-clone the seed so later in-session edits never mutate the module constant.
    const seed = JSON.parse(JSON.stringify(GLAUCOMA_DOSSIER_SEED)) as StoredDossier;
    writeAllDossiers([seed, ...others]);

    window.localStorage.setItem(contextKey(GLAUCOMA_DOSSIER_ID), JSON.stringify(GLAUCOMA_DOSSIER_CONTEXT));
    window.localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  } catch (err) {
    console.warn('[dossier seed] failed:', err);
  }
}
