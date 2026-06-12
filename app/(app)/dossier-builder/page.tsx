'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DossierCard, AddDossierModal } from '@/components/dossier';
import { Card } from '@/components/dossier/Card';
import DossierSeeder from '@/components/dossier/DossierSeeder';
import { listDossiers } from '@/lib/dossier/store';
import { resetDossierDemo } from '@/lib/dossier/seed';
import type { DossierSummary } from '@/lib/dossier/types';

function DossierListContent() {
  const router = useRouter();
  const [dossiers, setDossiers] = useState<DossierSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Hydrate from the in-memory store on mount (an external system, not
    // render-derived state) — the synchronous state sync is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDossiers(listDossiers());
    setIsLoading(false);
  }, []);

  function handleCreated(dossier: DossierSummary) {
    setDossiers(listDossiers());
    setShowAddModal(false);
    router.push(`/dossier-builder/${dossier.id}`);
  }

  function handleReset() {
    resetDossierDemo();
    setDossiers(listDossiers());
  }

  return (
    <div className="px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-playfair text-3xl text-serif-foreground">Dossier Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--serif-muted-foreground)' }}>
            Compile and write your evidence dossier
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--serif-muted-foreground)', opacity: 0.8 }}>
            Demo portfolio — added dossiers and edits reset on refresh.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-mono tracking-[0.04em] border transition-all duration-150 hover:opacity-80 flex-shrink-0"
          style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
          title="Restore the pre-baked portfolio, discarding added dossiers and edits"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.183m0-4.991v4.99" />
          </svg>
          Reset demo data
        </button>
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20 text-sm"
          style={{ color: 'var(--serif-muted-foreground)' }}
        >
          Loading…
        </div>
      ) : dossiers.length === 0 ? (
        <div className="max-w-md mx-auto mt-8">
          <Card accentTop className="flex flex-col items-center gap-4 py-16 text-center">
            <svg
              aria-hidden="true"
              className="h-12 w-12 opacity-20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <div>
              <p
                className="font-playfair text-lg font-normal mb-1"
                style={{ color: 'var(--serif-foreground)' }}
              >
                No dossiers yet
              </p>
              <p className="text-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
                Create your first dossier to begin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-5 py-2.5 rounded-[6px] text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: 'var(--serif-accent)' }}
            >
              Add a dossier
            </button>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dossiers.map((dossier) => (
            <DossierCard key={dossier.id} dossier={dossier} />
          ))}

          {/* + Add another — dashed affordance, copies from Global */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-[8px] border border-dashed flex flex-col items-center justify-center gap-3 py-12 px-4 text-center transition-all duration-150 hover:opacity-80 min-h-[200px]"
            style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(8,56,96,0.08)', color: 'var(--serif-accent)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className="font-playfair text-base" style={{ color: 'var(--serif-foreground)' }}>
              Add another
            </span>
            <span className="text-xs leading-relaxed max-w-[200px]">
              Start from Global&rsquo;s structure &amp; content (copied over).
            </span>
          </button>
        </div>
      )}

      {showAddModal && (
        <AddDossierModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default function DossierBuilderPage() {
  return (
    <DossierSeeder>
      <DossierListContent />
    </DossierSeeder>
  );
}
