'use client';

import { useRouter } from 'next/navigation';
import type { DossierSummary, DossierStatus } from '@/lib/dossier/types';
import { Card } from './Card';

// ── Status badge ──────────────────────────────────────────────────────────────

function statusStyle(status: DossierStatus): { bg: string; color: string; label: string } {
  switch (status) {
    case 'draft':     return { bg: 'var(--serif-muted)',           color: 'var(--serif-muted-foreground)', label: 'Draft' };
    case 'in_review': return { bg: 'rgba(186,117,23,0.12)',        color: '#BA7517',                       label: 'In review' };
    case 'final':     return { bg: 'rgba(15,110,86,0.12)',         color: '#0F6E56',                       label: 'Final' };
    case 'archived':  return { bg: 'rgba(163,45,45,0.1)',          color: '#A32D2D',                       label: 'Archived' };
  }
}

// ── Relative date helper ──────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30)  return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// ── DossierCard ───────────────────────────────────────────────────────────────

interface Props {
  dossier: DossierSummary;
}

export function DossierCard({ dossier }: Props) {
  const router = useRouter();
  const ss = statusStyle(dossier.status);
  const pct = dossier.sectionCount > 0
    ? Math.round((dossier.completedSections / dossier.sectionCount) * 100)
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/dossier-builder/${dossier.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/dossier-builder/${dossier.id}`)}
      className="cursor-pointer"
    >
    <Card
      accentTop
      interactive
      className="flex flex-col gap-4"
    >
      {/* Title */}
      <div>
        <h3
          className="font-playfair text-xl font-normal leading-snug mb-1"
          style={{ color: 'var(--serif-foreground)' }}
        >
          {dossier.title}
        </h3>

        {/* Library badge */}
        <span
          className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase px-2 py-0.5 rounded-[3px]"
          style={{ backgroundColor: 'rgba(8,56,96,0.1)', color: 'var(--serif-accent)' }}
        >
          {dossier.libraryName}
        </span>
      </div>

      {/* Indication + Product */}
      {(dossier.libraryIndication || dossier.libraryProduct) && (
        <p
          className="font-mono text-[10px] tracking-[0.08em] uppercase -mt-2"
          style={{ color: 'var(--serif-muted-foreground)' }}
        >
          {[dossier.libraryIndication, dossier.libraryProduct].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>
            {dossier.completedSections} / {dossier.sectionCount} sections
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--serif-accent)' }}>
            {pct}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--serif-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: 'var(--serif-accent)' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span
          className="font-mono text-[9px] font-medium tracking-[0.08em] uppercase px-2 py-0.5 rounded-[3px]"
          style={{ backgroundColor: ss.bg, color: ss.color }}
        >
          {ss.label}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--serif-muted-foreground)' }}>
          Updated {relativeDate(dossier.updatedAt)}
        </span>
      </div>
    </Card>
    </div>
  );
}
