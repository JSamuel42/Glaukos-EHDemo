'use client';

import { useEffect, useRef, useState } from 'react';
import { contextKey } from '@/lib/dossier/seed';

export interface DossierContext {
  gvdDescription: string;
  writingStyle: string;
  valueStory: string;
  communicationStrategy: string;
}

interface Props {
  dossierId: string;
  onClose: () => void;
}

function loadContext(dossierId: string): DossierContext {
  try {
    const raw = localStorage.getItem(contextKey(dossierId));
    if (raw) return { ...emptyContext(), ...(JSON.parse(raw) as Partial<DossierContext>) };
  } catch { /* ignore */ }
  return emptyContext();
}

function emptyContext(): DossierContext {
  return { gvdDescription: '', writingStyle: '', valueStory: '', communicationStrategy: '' };
}

function saveContext(dossierId: string, ctx: DossierContext) {
  try {
    localStorage.setItem(contextKey(dossierId), JSON.stringify(ctx));
  } catch { /* ignore */ }
}

export function loadDossierContext(dossierId: string): DossierContext {
  return loadContext(dossierId);
}

const FIELDS: { key: keyof DossierContext; label: string; placeholder: string; rows: number }[] = [
  {
    key: 'gvdDescription',
    label: 'GVD descriptive context',
    placeholder: 'Describe the product, indication, target market, and regulatory context for this Global Value Dossier…',
    rows: 4,
  },
  {
    key: 'writingStyle',
    label: 'Writing style & tone of voice',
    placeholder: 'e.g. Scientific but accessible, third person, active voice. Avoid overly promotional language. Use hedging language where evidence is limited…',
    rows: 3,
  },
  {
    key: 'valueStory',
    label: 'Overarching value story',
    placeholder: 'What is the core value narrative? What unmet needs does this product address? What are the key differentiators?',
    rows: 4,
  },
  {
    key: 'communicationStrategy',
    label: 'Communication strategy',
    placeholder: 'Who is the target audience (payers, HTA bodies, clinicians)? What key messages should be reinforced throughout?',
    rows: 3,
  },
];

export function ContextManagerModal({ dossierId, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<DossierContext>(() => loadContext(dossierId));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleChange(key: keyof DossierContext, value: string) {
    setCtx((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveContext(dossierId, ctx);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasContent = Object.values(ctx).some((v) => v.trim().length > 0);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(26,26,26,0.45)', backdropFilter: 'blur(2px)' }}
      aria-modal="true"
      role="dialog"
      aria-label="Context Manager"
    >
      <div
        className="relative flex flex-col w-full mx-4 rounded-[8px] shadow-2xl"
        style={{
          backgroundColor: 'var(--serif-card)',
          border: '1px solid var(--serif-border)',
          borderTop: '3px solid var(--serif-accent)',
          maxWidth: '680px',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span
              className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase"
              style={{ color: 'var(--serif-accent)' }}
            >
              Context Manager
            </span>
            <p className="text-sm leading-snug" style={{ color: 'var(--serif-muted-foreground)' }}>
              This context is provided to the Writing agent on every generation — refine it to shape the dossier narrative.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-[4px] text-lg transition-colors hover:bg-serif-muted"
            style={{ color: 'var(--serif-muted-foreground)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--serif-border)' }} />

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto flex-1">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`ctx-${field.key}`}
                className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'var(--serif-muted-foreground)' }}
              >
                {field.label}
              </label>
              <textarea
                id={`ctx-${field.key}`}
                value={ctx[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={field.rows}
                placeholder={field.placeholder}
                className="w-full resize-none rounded-[6px] border px-3 py-2.5 text-sm leading-relaxed focus:outline-none transition-colors"
                style={{
                  borderColor: 'var(--serif-border)',
                  backgroundColor: 'var(--serif-muted)',
                  color: 'var(--serif-foreground)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--serif-accent)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--serif-border)'; }}
              />
            </div>
          ))}

          {!hasContent && (
            <p className="text-xs text-center" style={{ color: 'var(--serif-muted-foreground)', fontStyle: 'italic' }}>
              Fill in at least one field above — the Writing agent will use this context on every generation run.
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--serif-border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] border text-sm transition-all duration-200 hover:bg-serif-muted"
            style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-[6px] text-sm font-medium text-white transition-all duration-200"
            style={{ backgroundColor: saved ? '#0F6E56' : 'var(--serif-accent)' }}
          >
            {saved ? 'Saved ✓' : 'Save context'}
          </button>
        </div>
      </div>
    </div>
  );
}
