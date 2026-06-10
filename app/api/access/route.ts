import { NextRequest, NextResponse } from 'next/server';
import { DEMO_PASSWORD, assertServerEnv } from '@/lib/env';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Surface env-var misconfiguration distinctly from a wrong password, so the
  // user can tell from the access screen which one is the problem. Without
  // this, a missing DEMO_PASSWORD on Vercel surfaces as "Incorrect password",
  // which is misleading.
  try {
    assertServerEnv();
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Server misconfigured',
        code: 'env_missing',
        hint: err instanceof Error ? err.message : 'Check server env vars',
      },
      { status: 503 },
    );
  }

  let body: { password?: string; redirect?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Trim both sides defensively. Vercel's env-var input commonly picks up
  // trailing whitespace from copy-paste, and users sometimes type a leading
  // space before their password. We don't want either to cause a 401.
  const submitted = (body.password ?? '').trim();
  const expected = DEMO_PASSWORD.trim();
  if (!submitted || submitted !== expected) {
    await new Promise(r => setTimeout(r, 300));
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true, redirect: body.redirect ?? '/' });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
