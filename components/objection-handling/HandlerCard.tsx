'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import type { Handler } from '@/lib/objection-handling/data';
import { cn } from '@/lib/cn';

interface Props {
  handler: Handler;
  /** Tailwind classes for the handler ID pill — picked by parent based on domain. */
  domainColor: string;
}

/**
 * One handler row inside an expanded objection. Collapsed: ID pill +
 * handler text. Expanded: shows publication-count placeholder until the
 * end-of-cluster article-linking pass populates supporting_articles[].
 */
export default function HandlerCard({ handler, domainColor }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-serif-border bg-white">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full px-3 py-2.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors text-left"
      >
        <span
          className={cn(
            'shrink-0 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold',
            domainColor,
          )}
        >
          {handler.id}
        </span>
        <span className="flex-1 text-sm leading-relaxed text-serif-foreground">
          {handler.text}
        </span>
        <span className="shrink-0 text-serif-muted-foreground mt-0.5">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-serif-border bg-slate-50/40">
          <h4 className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-2">
            {handler.placeholder_publication_count} Publications
          </h4>
          {handler.supporting_articles.length === 0 ? (
            <ul className="space-y-1.5">
              {Array.from({ length: handler.placeholder_publication_count }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-dashed border-slate-300 bg-white text-xs text-serif-muted-foreground italic"
                >
                  <FileText size={11} className="shrink-0" />
                  <span>
                    Article linking pending — supporting publications will be available once
                    linked.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-1.5">
              {handler.supporting_articles.map(id => (
                <li
                  key={id}
                  className="px-2.5 py-2 rounded-md border border-serif-border bg-white text-xs text-serif-foreground"
                >
                  {id}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
