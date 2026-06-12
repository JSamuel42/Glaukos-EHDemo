'use client';

import { useEffect, useRef, useState } from 'react';
import type { DossierSummary } from '@/lib/dossier/types';
import { createDossierFromGlobal, getDossierSummary } from '@/lib/dossier/store';

interface Props {
  onClose: () => void;
  onCreated: (dossier: DossierSummary) => void;
}

/**
 * Add-another modal — the only creation path on the demo landing page.
 * Offers a single option: clone the Global dossier's structure AND content
 * forward into a new in-session (transient, reset-on-refresh) dossier.
 */
export function AddDossierModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleCreate() {
    if (!title.trim()) return;
    setIsCreating(true);
    setError('');
    try {
      const created = createDossierFromGlobal(title.trim());
      if (!created) {
        setError('Failed to create dossier — the Global dossier was not found.');
        return;
      }
      const summary = getDossierSummary(created.id);
      if (summary) {
        onCreated(summary);
      } else {
        setError('Failed to create dossier');
      }
    } catch {
      setError('Failed to create dossier');
    } finally {
      setIsCreating(false);
    }
  }

  const canCreate = title.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dossier-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className="relative z-10 w-full max-w-md rounded-[8px] overflow-hidden shadow-serif-lg flex flex-col"
        style={{ backgroundColor: 'var(--serif-card)', borderTop: '2px solid var(--serif-accent)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: 'var(--serif-border)' }}
        >
          <h2
            id="add-dossier-title"
            className="font-playfair text-2xl font-normal"
            style={{ color: 'var(--serif-foreground)' }}
          >
            Add another dossier
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-xl hover:bg-serif-muted transition-all duration-150"
            aria-label="Close"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* The single creation option */}
          <div
            className="rounded-[6px] border px-4 py-3.5 flex flex-col gap-1.5"
            style={{ borderColor: 'var(--serif-accent)', backgroundColor: 'rgba(8,56,96,0.05)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--serif-foreground)' }}>
              Start from Global&rsquo;s structure &amp; content
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--serif-muted-foreground)' }}>
              The Global dossier&rsquo;s sections and their written content are copied over as a
              starting point. You can then adapt each section locally.
            </p>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              className="font-mono text-xs font-medium tracking-[0.1em] uppercase"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              Dossier name *
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canCreate && handleCreate()}
              placeholder="e.g. iStent infinite — France 2026"
              className="w-full px-3 py-2 rounded-[6px] border text-sm bg-transparent focus:outline-none transition-colors"
              style={{
                borderColor: 'var(--serif-border)',
                color: 'var(--serif-foreground)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
            />
          </div>

          {/* In-session caveat */}
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            This is an in-session dossier — it lives in memory for this demo and is discarded on
            a page refresh or when you reset the demo data.
          </p>

          {error && (
            <p className="text-xs" style={{ color: '#A32D2D' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'var(--serif-border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] text-sm transition-all duration-150"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
            className="px-5 py-2 rounded-[6px] text-sm font-medium text-white transition-all duration-150 disabled:opacity-40"
            style={{ backgroundColor: 'var(--serif-accent)' }}
          >
            {isCreating ? 'Creating…' : 'Create from Global'}
          </button>
        </div>
      </div>
    </div>
  );
}
