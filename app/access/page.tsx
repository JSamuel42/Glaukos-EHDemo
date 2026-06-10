'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EvHubLogo from '@/components/brand/EvHubLogo';

function AccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, redirect }),
      });
      if (res.ok) {
        const data = (await res.json()) as { redirect?: string };
        startTransition(() => {
          router.replace(data.redirect ?? '/');
          router.refresh();
        });
      } else {
        // Distinguish "config missing" (503) from "wrong password" (401) so
        // a misconfigured deploy doesn't masquerade as a typo.
        let errBody: { code?: string; hint?: string } = {};
        try {
          errBody = (await res.json()) as { code?: string; hint?: string };
        } catch {
          // ignore parse failure
        }
        if (res.status === 503 || errBody.code === 'env_missing') {
          setError(
            errBody.hint
              ? `Server misconfigured: ${errBody.hint}. Set the env var in Vercel and redeploy.`
              : 'Server misconfigured. Set DEMO_PASSWORD in Vercel and redeploy.',
          );
        } else {
          setError('Incorrect password. Try again.');
          setPassword('');
        }
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        autoFocus
        required
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Demo password"
        className="w-full px-4 py-3 rounded-md border border-serif-border bg-white text-serif-foreground placeholder:text-serif-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--evhub-mint)] focus:border-transparent"
      />

      {error && (
        <p
          role="alert"
          className="text-sm font-medium"
          style={{ color: '#C0392B' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full py-3 rounded-md font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: 'var(--evhub-mint)' }}
      >
        {submitting ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}

export default function AccessPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--evhub-navy)' }}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-10">
        <div className="flex justify-center mb-8">
          <EvHubLogo
            glyphSize={48}
            textSize="text-2xl"
            textColor="var(--evhub-navy)"
            withTm
            gap="gap-3.5"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-center text-serif-muted-foreground mb-1.5 font-mono">
          Demo access
        </p>
        <p className="text-sm text-center text-serif-muted-foreground mb-7">
          Enter the demo password to continue.
        </p>
        <Suspense fallback={null}>
          <AccessForm />
        </Suspense>
      </div>
    </div>
  );
}
