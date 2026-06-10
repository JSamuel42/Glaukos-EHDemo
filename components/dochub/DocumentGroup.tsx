'use client';

import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FileText, ExternalLink } from 'lucide-react';
import type { DocHubDocument } from '@/lib/dochub/data';
import CountryFlag from './CountryFlag';
import { cn } from '@/lib/cn';

interface Props {
  product: string;
  geography: string;
  documents: DocHubDocument[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * One product-geography group rendered as a self-contained table card.
 * Group header shows product on the left, geography (with flag) on the right.
 * Title column has Radix Popover behaviour: hover for tooltip, click for a
 * richer card with the description and an inert "Open PDF" button.
 */
export default function DocumentGroup({ product, geography, documents }: Props) {
  if (!documents.length) return null;

  return (
    <section className="rounded-lg border border-serif-border bg-white overflow-hidden">
      {/* Header — light surface, same column-title typography as the table head
          below it. Layout: PRODUCT | [flag] GEOGRAPHY, left-aligned. */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-serif-border bg-white">
        <span className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-serif-foreground">
          {product}
        </span>
        <span aria-hidden className="text-serif-muted-foreground/40">|</span>
        <span className="inline-flex items-center gap-1.5">
          <CountryFlag geography={geography} size={14} />
          <span className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-serif-foreground">
            {geography}
          </span>
        </span>
      </header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground border-b border-serif-border bg-slate-50/60">
              <th className="px-4 py-2 font-semibold" style={{ width: 130 }}>Date</th>
              <th className="px-4 py-2 font-semibold">Document</th>
              <th className="px-4 py-2 font-semibold" style={{ width: 110 }}>Type</th>
              <th className="px-4 py-2 font-semibold" style={{ width: 170 }}>Tag</th>
              <th className="px-4 py-2 font-semibold" style={{ width: 140 }}>Agency</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(d => (
              <tr key={d.id} className="border-b border-serif-border last:border-b-0 hover:bg-slate-50/40">
                <td className="px-4 py-2.5 text-serif-muted-foreground whitespace-nowrap">
                  {formatDate(d.date)}
                </td>
                <td className="px-4 py-2.5">
                  <DocumentTitlePopover document={d} />
                </td>
                <td className="px-4 py-2.5">
                  <TypePill type={d.type} />
                </td>
                <td className="px-4 py-2.5">
                  <TagPill tag={d.tag} />
                </td>
                <td className="px-4 py-2.5 text-xs text-serif-muted-foreground whitespace-nowrap">
                  {d.agency ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DocumentTitlePopover({ document: d }: { document: DocHubDocument }) {
  const description = d.description ?? 'No description available.';
  return (
    <Popover.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-start gap-2 text-left cursor-pointer hover:text-[color:var(--evhub-navy)] focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)] rounded-sm"
            >
              <FileText
                size={13}
                className="mt-0.5 shrink-0 text-[color:var(--evhub-navy)]/70"
              />
              <span className="text-sm leading-snug">
                {d.title}
                <span className="ml-1.5 text-[10px] font-mono text-serif-muted-foreground">
                  [{d.id}]
                </span>
              </span>
            </button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            collisionPadding={8}
            className="z-40 max-w-md px-3 py-2 rounded-md text-xs leading-relaxed shadow-lg whitespace-pre-wrap break-words"
            style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
          >
            {description}
            <Tooltip.Arrow style={{ fill: 'var(--evhub-navy)' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-[380px] rounded-lg border border-serif-border bg-white shadow-xl p-4"
        >
          <h3 className="font-playfair text-base text-serif-foreground leading-snug">
            {d.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wide font-mono text-serif-muted-foreground">
            <span>{d.id}</span>
            {d.date && <span>·</span>}
            {d.date && <span>{formatDate(d.date)}</span>}
            {d.agency && <span>·</span>}
            {d.agency && <span>{d.agency}</span>}
          </div>
          <p className="mt-3 text-sm text-serif-foreground leading-relaxed">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-serif-muted-foreground italic">
              Preview not available in demo
            </span>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white opacity-50 cursor-not-allowed"
              style={{ backgroundColor: 'var(--evhub-navy)' }}
              title="Preview not available in demo"
            >
              <ExternalLink size={12} />
              Open PDF
            </button>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function TypePill({ type }: { type: 'Internal' | 'External' | null }) {
  if (!type) return <span className="text-serif-muted-foreground">—</span>;
  const isInternal = type === 'Internal';
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
      )}
      style={
        isInternal
          ? { backgroundColor: 'rgba(175,169,236,0.30)', color: '#3D3893' }
          : { backgroundColor: 'rgba(100,116,139,0.15)', color: '#334155' }
      }
    >
      {type}
    </span>
  );
}

function TagPill({ tag }: { tag: string | null }) {
  if (!tag) return <span className="text-serif-muted-foreground">—</span>;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ backgroundColor: 'rgba(133,183,235,0.22)', color: '#1B4B7A' }}
    >
      {tag}
    </span>
  );
}
