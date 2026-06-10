'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ScientificStatement } from '@/lib/scientific-narrative/data';
import { SupportingArticles } from '@/components/citations/SupportingArticles';
import { cn } from '@/lib/cn';

interface Props {
  statement: ScientificStatement;
}

const PILL_COLORS: Record<string, string> = {
  burden: 'bg-rose-100 text-rose-700',
  'clinical-development': 'bg-cyan-100 text-cyan-700',
  efficacy: 'bg-emerald-100 text-emerald-700',
  'patient-impact': 'bg-purple-100 text-purple-700',
};

/**
 * Statement card — collapsible row keyed by statement ID with a pillar-
 * coloured pill. Expanded view shows the pending publication-linking
 * placeholder (real article entries arrive in the cluster-final pass).
 */
export default function StatementCard({ statement }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pillColor = PILL_COLORS[statement.pillar] ?? 'bg-slate-100 text-slate-700';

  return (
    <article className="rounded-lg border border-serif-border bg-white overflow-hidden transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 text-left"
      >
        <span
          className={cn(
            'shrink-0 inline-flex items-center justify-center min-w-[36px] h-7 px-2 rounded text-xs font-mono font-semibold',
            pillColor,
          )}
        >
          {statement.id}
        </span>
        <span className="flex-1 text-sm text-serif-foreground leading-relaxed">
          {statement.text}
        </span>
        <span className="shrink-0 text-serif-muted-foreground mt-0.5">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-serif-border bg-slate-50/40">
          <h4 className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-2">
            {statement.placeholder_publication_count} Publications
          </h4>
          {/* SupportingArticles renders any publication-side linkages (from
              articles.json) as solid clickable boxes deep-linking to the
              Library row, then fills the rest of the slots up to
              placeholder_publication_count with the existing dashed
              "Article linking pending" placeholders. Linked references
              share the same box dimensions as the placeholders so the
              layout stays consistent regardless of how many slots are
              live yet. */}
          <SupportingArticles
            module="scientific-narrative"
            messageId={statement.id}
            placeholderCount={statement.placeholder_publication_count}
          />
        </div>
      )}
    </article>
  );
}
