'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, pageSize, totalCount, onChange }: Props) {
  if (pageCount <= 1 && totalCount === 0) {
    return null;
  }

  // Build page list with ellipses around the current page
  const pages: (number | 'ellipsis')[] = [];
  const wantedSet = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sortedNums = [...wantedSet].filter(n => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  let prev = 0;
  for (const n of sortedNums) {
    if (prev && n - prev > 1) pages.push('ellipsis');
    pages.push(n);
    prev = n;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-3 py-3 px-1">
      <div className="text-[11px] uppercase tracking-[0.12em] font-mono text-serif-muted-foreground">
        {totalCount > 0 ? `${start}–${end} of ${totalCount}` : '0 results'}
      </div>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-serif-muted-foreground hover:text-serif-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={12} /> Previous
          </button>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="px-1 text-xs text-serif-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={cn(
                  'min-w-[28px] px-2 py-1 rounded text-xs',
                  p === page
                    ? 'text-white font-semibold'
                    : 'text-serif-muted-foreground hover:text-serif-foreground hover:bg-serif-muted',
                )}
                style={p === page ? { backgroundColor: 'var(--evhub-navy)' } : undefined}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onChange(Math.min(pageCount, page + 1))}
            disabled={page === pageCount}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-serif-muted-foreground hover:text-serif-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
