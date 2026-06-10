// ─── Demo fallbacks ─────────────────────────────────────────────────────────
// When DEMO_PASSWORD or SESSION_SECRET are missing from the environment
// (e.g., a Vercel env-var sync issue where the variable doesn't propagate
// to the runtime), these fallbacks kick in so the demo gate keeps working.
//
// This is a deliberate weakening for a demo app whose password will be
// shared with stakeholders anyway. For a real product you'd assert and fail
// loudly instead. If you fix the Vercel env var, the env wins over the
// fallback, so this stays out of the way once everything is plumbed.
//
// ANTHROPIC_API_KEY has no fallback — there's no usable default for it. If
// the chat API throws because the key is missing, the rest of the app is
// unaffected.
const FALLBACK_DEMO_PASSWORD = 'coral-lighthouse-42';
const FALLBACK_SESSION_SECRET =
  'evhub-demo-fallback-session-secret-not-secure-set-real-value-in-vercel-please';

export const DEMO_MODE =
  process.env.DEMO_MODE !== 'false'; // default true; set DEMO_MODE=false to disable

export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || FALLBACK_DEMO_PASSWORD;
export const SESSION_SECRET = process.env.SESSION_SECRET || FALLBACK_SESSION_SECRET;
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';

/**
 * True iff at least one of DEMO_PASSWORD / SESSION_SECRET is being served by
 * the fallback. Useful for surfacing a quiet warning in deployed logs without
 * blocking access. We don't surface this to the user — they're deliberately
 * unblocked by the fallback.
 */
export const USING_FALLBACK_ENV =
  !process.env.DEMO_PASSWORD || !process.env.SESSION_SECRET;

export function assertServerEnv() {
  if (USING_FALLBACK_ENV) {
    // Logged once per cold start in Vercel function logs. Helps diagnose
    // which env var didn't propagate without breaking the deploy.
    console.warn(
      '[evhub-s] Using demo fallback for DEMO_PASSWORD or SESSION_SECRET. ' +
        `DEMO_PASSWORD set=${!!process.env.DEMO_PASSWORD}, ` +
        `SESSION_SECRET set=${!!process.env.SESSION_SECRET}. ` +
        'Set these in Vercel project settings for production-grade behavior.',
    );
  }
  // No throws — fallbacks are non-empty, so the assertions can't fail.
}

export function assertChatEnv() {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set — AI chat is unavailable in this environment.');
  }
}
