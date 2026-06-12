/**
 * Section sign-off states (Phase 5.7) — a 3-state, role-illustrative sign-off
 * that replaces the old AI/Hybrid source badge.
 *
 *   AI draft (default) → Human verified (medical writer) → GVD lead approved.
 *
 * Modelled as two cumulative booleans on the section (in-session, per dossier).
 * RBAC is NOT enforced — the toggles sit where role-gated sign-off would later
 * plug in.
 */

export interface SignOff {
  /** Medical-writer verification. */
  humanVerified: boolean;
  /** Client GVD-lead approval (implies human-verified). */
  gvdApproved: boolean;
}

export type SignOffState = 'ai-draft' | 'human-verified' | 'gvd-approved';

/** Highest state reached from the cumulative toggles. */
export function signOffState(s?: SignOff | null): SignOffState {
  if (s?.gvdApproved) return 'gvd-approved';
  if (s?.humanVerified) return 'human-verified';
  return 'ai-draft';
}

export const SIGNOFF_META: Record<SignOffState, { label: string; bg: string; color: string }> = {
  'ai-draft':        { label: 'AI Draft',          bg: 'var(--serif-muted)',      color: 'var(--serif-muted-foreground)' },
  'human-verified':  { label: 'Human Verified',    bg: 'rgba(24,95,165,0.12)',    color: '#185FA5' },
  'gvd-approved':    { label: 'GVD Lead approved', bg: 'rgba(15,110,86,0.12)',    color: '#0F6E56' },
};

/** Ordered states for legends. */
export const SIGNOFF_ORDER: SignOffState[] = ['ai-draft', 'human-verified', 'gvd-approved'];

/** Role label illustrated by each step (not enforced). */
export const SIGNOFF_ROLE: Record<Exclude<SignOffState, 'ai-draft'>, string> = {
  'human-verified': 'Medical writer',
  'gvd-approved': 'GVD lead',
};
