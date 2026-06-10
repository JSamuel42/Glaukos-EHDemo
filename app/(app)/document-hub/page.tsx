'use client';

import { useState, useMemo } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Sparkles, Search } from 'lucide-react';
import { DOCHUB_DATA, DOCHUB_BY_ID } from '@/lib/dochub/data';
import {
  EMPTY_DOCHUB_FILTERS,
  applyDocHubFilters,
  type DocHubFilterState,
} from '@/lib/dochub/filters';
import { useChatPanel } from '@/components/chat/ChatPanelContext';
import FilterRail from '@/components/dochub/FilterRail';
import DocumentGroup from '@/components/dochub/DocumentGroup';

export default function DocumentHubPage() {
  const [filterState, setFilterState] = useState<DocHubFilterState>(EMPTY_DOCHUB_FILTERS);
  const [search, setSearch] = useState('');
  const { setIsOpen } = useChatPanel();

  // First apply the rail filters, then narrow with the inline search box
  // (matches against title + description case-insensitively).
  const filteredDocs = useMemo(() => {
    const base = applyDocHubFilters(DOCHUB_DATA.documents, filterState);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(d => {
      const hay = `${d.title} ${d.description ?? ''} ${d.agency ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [filterState, search]);

  const filteredIdSet = useMemo(() => new Set(filteredDocs.map(d => d.id)), [filteredDocs]);

  // Rebuild groups based on filtered docs (keeps pre-sorted newest-first order
  // from the ingestion step). Drop empty groups.
  const visibleGroups = useMemo(() => {
    return DOCHUB_DATA.groups
      .map(g => ({
        ...g,
        doc_ids: g.doc_ids.filter(id => filteredIdSet.has(id)),
      }))
      .filter(g => g.doc_ids.length > 0);
  }, [filteredIdSet]);

  const total = DOCHUB_DATA.documents.length;
  const visibleCount = filteredDocs.length;

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <FilterRail filterState={filterState} onChange={setFilterState} />

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-baseline justify-between mb-4 gap-4">
            <div>
              <h1 className="font-playfair text-3xl text-serif-foreground">Document Hub</h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground">
                <span className="text-serif-foreground font-semibold">{total} documents</span>
                {' · '}
                <span className="text-serif-foreground font-semibold">{visibleCount}</span> after
                filters
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--evhub-navy)' }}
            >
              <Sparkles size={14} className="text-[color:var(--evhub-mint)]" />
              <span className="inline-flex items-baseline gap-px">
                <span>Ask</span>
                <sup className="text-[0.7em] font-semibold tracking-normal -translate-y-px">AI</sup>
              </span>
            </button>
          </div>

          {/* Inline search across title, description and agency — narrows the
              filtered set without altering the rail filters. */}
          <div className="relative max-w-xl mb-5">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-serif-muted-foreground pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search across key global and local documents"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-serif-border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)] focus:border-transparent"
            />
          </div>

          <div className="space-y-5">
            {visibleGroups.length === 0 && (
              <div className="rounded-lg border border-dashed border-serif-border bg-white p-10 text-center">
                <p className="text-sm text-serif-muted-foreground">
                  No documents match the current filters.
                </p>
              </div>
            )}
            {visibleGroups.map(g => (
              <DocumentGroup
                key={`${g.product}-${g.geography}`}
                product={g.product}
                geography={g.geography}
                documents={g.doc_ids.map(id => DOCHUB_BY_ID[id]).filter(Boolean)}
              />
            ))}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
