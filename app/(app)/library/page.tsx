'use client';

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, CalendarClock, Clock, FileText } from 'lucide-react';
import { type Article } from '@/lib/library/data';
import { useLibraryStore } from '@/lib/library/store';
import {
  EMPTY_FILTERS,
  applyFilters,
  isFilterActive,
  type FilterState,
  DATE_THRESHOLD_COUNTS,
  type DateThresholdKey,
} from '@/lib/library/filters';
import {
  useChatPanel,
  type CustomSuggestedQuestion,
} from '@/components/chat/ChatPanelContext';
import FilterToolbar from '@/components/library/FilterToolbar';
import LibraryTable from '@/components/library/LibraryTable';
import Pagination from '@/components/library/Pagination';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 50;
/** Max articles attached to a single Summarise request — keeps the
 *  system prompt within Claude's context budget for the demo. */
const SUMMARISE_CAP = 30;

/** Build the per-row AttachedItem shape used everywhere selection feeds chat. */
function toAttachedItem(a: Article) {
  return {
    id: a.id,
    title: a.title || a.id,
    subtitle: `${a.product_display} · ${a.indication ?? '—'} · ${a.pub_year ?? '—'}`,
    kind: 'publication' as const,
  };
}

/**
 * Library presets — empty-state buttons in the chat panel. Each spec carries:
 *  - buildFilter: returns a FilterState that the page will apply visibly to
 *    the table
 *  - contextPhrase: the human noun phrase substituted into the summarise
 *    request ("articles published in the last 3 months")
 * The shared summariseSubset helper does the rest (attach articles, open
 * the chat, send the request).
 */
interface LibraryPresetSpec {
  id: string;
  label: string;
  buildFilter: () => FilterState;
  contextPhrase: string;
}

const LIBRARY_PRESETS: LibraryPresetSpec[] = [
  {
    id: 'migs-evidence',
    label: 'Summarise the MIGS evidence.',
    buildFilter: () => ({ ...EMPTY_FILTERS, funnelLevels: new Set(['L5 Surgical-eligible (MIGS)', 'L5 Surgical-eligible']) }),
    contextPhrase: 'MIGS and surgical-eligible articles',
  },
  {
    id: 'advanced-burden',
    label: 'What do we know about the burden of advanced glaucoma?',
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      funnelLevels: new Set(['L4 Uncontrolled / advanced']),
    }),
    contextPhrase: 'articles on advanced / uncontrolled glaucoma burden',
  },
  {
    id: 'treatment-patterns',
    label: 'What are the current treatment patterns?',
    buildFilter: () => ({
      ...EMPTY_FILTERS,
      categoryParents: new Set(['Management']),
    }),
    contextPhrase: 'articles on glaucoma treatment and management patterns',
  },
];

/**
 * The Suspense wrapper exists for `useSearchParams` — Next.js requires
 * routes that read search params to be wrapped during static generation,
 * otherwise build fails on this page. The inner component owns all the
 * actual state and rendering.
 */
export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageInner />
    </Suspense>
  );
}

function LibraryPageInner() {
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const { allArticles } = useLibraryStore();

  const searchParams = useSearchParams();
  const targetArticleId = searchParams?.get('article') ?? null;

  // Deep-link handler — citation chips in SN / VM / OH link to
  // /library?article=<id>. When that param is present, clear any active
  // filters so the row is in the visible set, jump to the page it sits
  // on (default sort = source order in ARTICLES), then on the next tick
  // scroll the row into view and tint it mint for ~2.4s. Silent no-op
  // when the ID doesn't match.
  useEffect(() => {
    if (!targetArticleId) return;
    const idx = allArticles.findIndex(a => a.id === targetArticleId);
    if (idx < 0) return;

    // Deliberate synchronous state sync in response to the ?article= URL
    // param (an external input, not render-derived state) — the cascading
    // render is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterState(EMPTY_FILTERS);
    setSelectedIds(new Set());
    setPage(Math.floor(idx / PAGE_SIZE) + 1);
    setHighlightedId(targetArticleId);

    // Let React commit the new page + filter state before we look up the
    // DOM node. requestAnimationFrame would also work; setTimeout(0) is
    // explicit and easier to read.
    const scrollT = setTimeout(() => {
      const el = document.getElementById(`article-${targetArticleId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    const clearT = setTimeout(() => setHighlightedId(null), 2400);
    return () => {
      clearTimeout(scrollT);
      clearTimeout(clearT);
    };
  }, [targetArticleId, allArticles]);

  const filtered = useMemo(() => applyFilters(allArticles, filterState), [allArticles, filterState]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // Skip the auto-page-reset while a deep-link is targeting a specific
    // row — the deep-link effect above clears filters AND sets page to
    // the target row's page, and this effect would otherwise overwrite
    // that page number back to 1.
    if (targetArticleId) return;
    // Reset to page 1 whenever the active filters change — intentional
    // state sync driven by filterState, not a render-derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [filterState, targetArticleId]);

  const {
    setAttachedItems,
    setIsOpen,
    sendMessage,
    isStreaming,
    setCustomSuggestedQuestions,
  } = useChatPanel();

  // Selection → chat attachments. Kept as a side-effect so toggling row
  // checkboxes updates the chat panel's attachment chips without explicit
  // wiring at every call site. The Summarise / preset flows bypass this by
  // passing an attachedItemIdsOverride into sendMessage — they don't depend
  // on selection state having propagated.
  useEffect(() => {
    const items = allArticles.filter(a => selectedIds.has(a.id)).map(toAttachedItem);
    setAttachedItems(items);
  }, [selectedIds, setAttachedItems, allArticles]);

  function toggleSelected(id: string) {
    setSelectedIds(curr => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage(ids: string[]) {
    setSelectedIds(curr => {
      const allOn = ids.every(i => curr.has(i));
      const next = new Set(curr);
      if (allOn) {
        for (const i of ids) next.delete(i);
      } else {
        for (const i of ids) next.add(i);
      }
      return next;
    });
  }

  function toggleDateThreshold(key: DateThresholdKey) {
    setFilterState(s => ({
      ...s,
      dateThreshold: s.dateThreshold === key ? null : key,
    }));
  }

  // Shared helper — all four Summarise entry points (button × selection,
  // button × filters, presets × 3) route through this. Attaches the subset
  // (capped at SUMMARISE_CAP), opens the chat panel, and sends a summarise
  // request whose wording is determined by the caller's `contextPhrase`.
  const summariseSubset = useCallback(
    (articles: Article[], contextPhrase: string) => {
      const total = articles.length;
      if (total === 0) return;

      const subset = articles.slice(0, SUMMARISE_CAP);
      const attached = subset.map(toAttachedItem);

      // Set attachments for display chips. The override below makes
      // sendMessage independent of when React commits this update.
      setAttachedItems(attached);
      setIsOpen(true);

      const phrase =
        total <= SUMMARISE_CAP
          ? `Summarise the ${total} ${contextPhrase}.`
          : `Summarise the top ${SUMMARISE_CAP} of ${total} ${contextPhrase}.`;

      void sendMessage({
        content: phrase,
        isSuggestedQuestion: true,
        attachedItemIdsOverride: attached.map(a => a.id),
      });
    },
    [setAttachedItems, setIsOpen, sendMessage],
  );

  // Register Library presets as the chat panel's custom suggested questions
  // while this page is mounted. Each preset's onClick visibly applies its
  // filter spec, clears any existing selection (presets summarise the filter
  // result, not whatever was selected before), then routes through
  // summariseSubset using applyFilters synchronously — state from
  // setFilterState above hasn't committed yet, so we can't rely on the
  // memoised `filtered`.
  useEffect(() => {
    const presets: CustomSuggestedQuestion[] = LIBRARY_PRESETS.map(p => ({
      id: p.id,
      label: p.label,
      onClick: () => {
        const newFilter = p.buildFilter();
        setFilterState(newFilter);
        setSelectedIds(new Set());
        const matched = applyFilters(allArticles, newFilter);
        summariseSubset(matched, p.contextPhrase);
      },
    }));
    setCustomSuggestedQuestions(presets);
    return () => setCustomSuggestedQuestions(null);
  }, [setCustomSuggestedQuestions, summariseSubset, allArticles]);

  // Summarise-button visibility + label
  const filtersActive = useMemo(() => isFilterActive(filterState), [filterState]);
  const hasSelection = selectedIds.size > 0;
  const showSummarise = hasSelection || filtersActive;
  const summariseCountLabel = useMemo(() => {
    if (hasSelection) return String(selectedIds.size);
    if (filtersActive) {
      const m = filtered.length;
      return m <= SUMMARISE_CAP ? String(m) : `top ${SUMMARISE_CAP} of ${m}`;
    }
    return null;
  }, [hasSelection, filtersActive, selectedIds.size, filtered.length]);

  const handleSummariseClick = useCallback(() => {
    if (hasSelection) {
      const selected = allArticles.filter(a => selectedIds.has(a.id));
      const noun = selected.length === 1 ? 'selected article' : 'selected articles';
      summariseSubset(selected, noun);
    } else if (filtersActive) {
      summariseSubset(filtered, 'articles matching the current filters');
    }
  }, [hasSelection, filtersActive, selectedIds, filtered, summariseSubset, allArticles]);

  // Indicator 1 label adapts: "22 articles" when no filters, "7 of 22" when filtered.
  const isFiltered = filtered.length !== allArticles.length;
  const primaryLabel = isFiltered
    ? `${filtered.length} of ${allArticles.length} articles`
    : `${allArticles.length} articles`;

  return (
    <div className="px-8 py-7">
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h1 className="font-playfair text-3xl text-serif-foreground">Library</h1>
        <div className="flex items-center gap-2">
          {showSummarise && (
            <button
              type="button"
              data-chat-trigger
              onClick={handleSummariseClick}
              disabled={isStreaming}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--evhub-mint)' }}
            >
              <FileText size={14} />
              <span>Summarise</span>
              {summariseCountLabel && (
                <span className="text-xs font-mono opacity-90">
                  ({summariseCountLabel})
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            data-chat-trigger
            onClick={() => setIsOpen(true)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90',
              // When Summarise is visible we demote AskAI to an outlined
              // secondary so the eye is drawn to the contextual primary
              // action rather than the always-available chat opener.
              showSummarise
                ? 'border border-[color:var(--evhub-navy)] bg-white text-[color:var(--evhub-navy)]'
                : 'text-white',
            )}
            style={
              showSummarise ? undefined : { backgroundColor: 'var(--evhub-navy)' }
            }
          >
            <Sparkles size={14} className="text-[color:var(--evhub-mint)]" />
            <span className="inline-flex items-baseline gap-px">
              <span>Ask</span>
              <sup className="text-[0.7em] font-semibold tracking-normal -translate-y-px">AI</sup>
            </span>
          </button>
        </div>
      </div>

      {/* Stats + date quick-action chips. The first slot is the dynamic
          counter (total / filtered + selected). The next two are the
          static-count date quick-filters; clicking applies a date filter
          on top of any other active filters. Mutually exclusive. */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground">
          <span className="text-serif-foreground font-semibold">{primaryLabel}</span>
          {selectedIds.size > 0 && (
            <>
              {' · '}
              <span className="text-serif-foreground font-semibold">{selectedIds.size}</span>{' '}
              selected
            </>
          )}
        </span>

        <span className="text-serif-muted-foreground/40">|</span>

        <DateChip
          icon={<CalendarClock size={12} />}
          label="Since last GVD"
          count={DATE_THRESHOLD_COUNTS.SINCE_LAST_GVD}
          active={filterState.dateThreshold === 'SINCE_LAST_GVD'}
          onClick={() => toggleDateThreshold('SINCE_LAST_GVD')}
        />
        <DateChip
          icon={<Clock size={12} />}
          label="Last 3 months"
          count={DATE_THRESHOLD_COUNTS.LAST_3_MONTHS}
          active={filterState.dateThreshold === 'LAST_3_MONTHS'}
          onClick={() => toggleDateThreshold('LAST_3_MONTHS')}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-serif-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={filterState.search}
            onChange={e => setFilterState(s => ({ ...s, search: e.target.value }))}
            placeholder="Search title, authors, abstract..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-serif-border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)] focus:border-transparent"
          />
        </div>
        <FilterToolbar state={filterState} onChange={setFilterState} />
      </div>

      <LibraryTable
        articles={paged}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleAllOnPage={toggleAllOnPage}
        highlightedId={highlightedId}
      />

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        totalCount={filtered.length}
        onChange={setPage}
      />
    </div>
  );
}

/**
 * Date quick-action chip. Carries a static preview count (e.g. "86") that
 * doesn't change with other filters; click toggles the chip on/off and
 * applies the date filter. Styling matches the FilterDropdown active state
 * for visual consistency with the rest of the filter row.
 */
function DateChip({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors',
        active
          ? 'border-[color:var(--evhub-mint)] bg-[rgba(93,202,165,0.12)] text-serif-foreground font-semibold'
          : 'border-serif-border bg-white text-serif-foreground hover:border-serif-muted-foreground/50',
      )}
    >
      <span className="text-[color:var(--evhub-navy)]">{icon}</span>
      <span>{label}</span>
      <span
        className={cn(
          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
          active ? 'text-white' : 'text-serif-muted-foreground bg-serif-muted',
        )}
        style={active ? { backgroundColor: 'var(--evhub-mint)' } : undefined}
      >
        {count}
      </span>
    </button>
  );
}
