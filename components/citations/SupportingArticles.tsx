'use client';

import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import {
  findPublicationsForMessage,
  type CitationModule,
} from '@/lib/publications/citations';

interface Props {
  module: CitationModule;
  messageId: string;
  /**
   * When set, dashed "Article linking pending…" placeholder boxes fill
   * remaining slots up to this total. Used by Scientific Narrative and
   * Payer Value Story where each message has a known
   * placeholder_publication_count.
   *
   * Omit (or set to 0) to render only the linked publications with no
   * placeholder fill — used by the Objection Handler where the placeholder
   * count is owned per-handler, not per-objection, so the OH-level live
   * reference rendering shouldn't generate phantom OH-level placeholders.
   */
  placeholderCount?: number;
}

/**
 * Renders a vertical list of supporting-publication boxes for a given
 * SN / VM / OH message ID. Live linkages (from articles.json) render as
 * solid-bordered, clickable boxes that deep-link to /library?article=<id>;
 * any remaining slots up to `placeholderCount` fill with the existing
 * dashed "Article linking pending" placeholder copy. Returns null when
 * there's neither a live reference nor a placeholder slot to render.
 */
export function SupportingArticles({
  module,
  messageId,
  placeholderCount = 0,
}: Props) {
  const pubs = findPublicationsForMessage(module, messageId);
  const totalSlots = Math.max(pubs.length, placeholderCount);
  if (totalSlots === 0) return null;

  return (
    <ul className="space-y-2">
      {Array.from({ length: totalSlots }).map((_, i) => {
        const pub = i < pubs.length ? pubs[i] : null;
        if (pub) {
          return (
            <li key={pub.id}>
              <Link
                href={`/library?article=${encodeURIComponent(pub.id)}`}
                title={pub.title}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-md border border-serif-border bg-white text-xs text-serif-foreground hover:border-[color:var(--evhub-mint)] hover:bg-[rgba(93,202,165,0.06)] transition-colors"
              >
                <FileText size={12} className="shrink-0 text-[#0F6E56]" />
                <span className="font-medium whitespace-nowrap">{pub.id}</span>
                {pub.title && (
                  <span className="text-serif-muted-foreground truncate min-w-0 flex-1">
                    — {pub.title}
                  </span>
                )}
                <ArrowRight
                  size={10}
                  className="shrink-0 opacity-0 group-hover:opacity-70 transition-opacity"
                />
              </Link>
            </li>
          );
        }
        return (
          <li
            key={`placeholder-${i}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-dashed border-slate-300 bg-white text-xs text-serif-muted-foreground italic"
          >
            <FileText size={12} className="shrink-0" />
            <span>
              Article linking pending — supporting publications will be available once
              linked.
            </span>
          </li>
        );
      })}
    </ul>
  );
}
