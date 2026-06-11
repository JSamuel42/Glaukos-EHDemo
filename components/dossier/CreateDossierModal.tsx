'use client';

import { useEffect, useRef, useState } from 'react';
import type { DossierSummary } from '@/lib/dossier/types';
import { createDossier, getDossierSummary, CANONICAL_LIBRARY } from '@/lib/dossier/store';

interface Props {
  onClose: () => void;
  onCreated: (dossier: DossierSummary) => void;
}

export function CreateDossierModal({ onClose, onCreated }: Props) {
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
      // One canonical library in this demo — no picker needed.
      const created = createDossier({ title: title.trim(), libraryId: CANONICAL_LIBRARY.id });
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
      aria-labelledby="create-dossier-title"
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
            id="create-dossier-title"
            className="font-playfair text-2xl font-normal"
            style={{ color: 'var(--serif-foreground)' }}
          >
            New Dossier
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
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              className="font-mono text-xs font-medium tracking-[0.1em] uppercase"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              Dossier title *
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canCreate && handleCreate()}
              placeholder="e.g. iStent infinite GVD — Open-Angle Glaucoma 2026"
              className="w-full px-3 py-2 rounded-[6px] border text-sm bg-transparent focus:outline-none transition-colors"
              style={{
                borderColor: 'var(--serif-border)',
                color: 'var(--serif-foreground)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--serif-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--serif-border)')}
            />
          </div>

          {/* Library — single canonical library (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label
              className="font-mono text-xs font-medium tracking-[0.1em] uppercase"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              Library
            </label>
            <div
              className="w-full px-3 py-2 rounded-[6px] border text-sm"
              style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-foreground)', backgroundColor: 'var(--serif-muted)' }}
            >
              {CANONICAL_LIBRARY.name}
              {CANONICAL_LIBRARY.product ? ` (${CANONICAL_LIBRARY.product})` : ''}
            </div>
          </div>

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
            {isCreating ? 'Creating…' : 'Create dossier'}
          </button>
        </div>
      </div>
    </div>
  );
}
