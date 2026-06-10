'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { Article } from '@/lib/library/data';
import { cn } from '@/lib/cn';
import TruncatedCell from './TruncatedCell';
import PillList from './PillList';

interface Props {
  articles: Article[];
  selectedIds: Set<string>;
  onToggleSelected: (id: string) => void;
  onToggleAllOnPage: (allOnPageIds: string[]) => void;
  /** When set, the matching row gets a mint highlight tint and a left
   *  accent bar. Used by the page's ?article=<id> deep-link handler to
   *  draw the eye to a freshly-navigated row. The highlight fades when
   *  the page clears this back to null. */
  highlightedId?: string | null;
}

type SortKey =
  | 'id'
  | 'product_display'
  | 'indication'
  | 'title'
  | 'pub_date'
  | 'pub_type'
  | 'study_type'
  | 'geography'
  | 'sponsor';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function categoryParentList(article: Article): string[] {
  return article.categories.map(c => c.category);
}

function categorySubList(article: Article): string[] {
  return article.categories.flatMap(c => c.subcategories);
}

/**
 * Split a linkage field (string | null in articles.json) into a clean
 * list of IDs. Future-proofs against the field becoming comma-separated
 * for multi-link entries — today every value is a single ID.
 */
function linkageList(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Colour palette per linkage code, mirroring the category palette each
 * code already wears inside its home module (Scientific Narrative pillar
 * colours, Objection Handler domain colours, Value Message domain hues).
 * Keeps the Library cells visually anchored to the module the chip
 * points back to.
 */
function linkPillStyle(code: string): { bg: string; text: string } {
  const snMatch = /^S(\d+)$/.exec(code);
  if (snMatch) {
    const n = Number(snMatch[1]);
    if (n <= 3) return { bg: 'bg-rose-50', text: 'text-rose-700' };       // burden
    if (n <= 6) return { bg: 'bg-cyan-50', text: 'text-cyan-700' };       // clinical-dev
    if (n <= 10) return { bg: 'bg-emerald-50', text: 'text-emerald-700' };// efficacy
    return { bg: 'bg-purple-50', text: 'text-purple-700' };               // patient impact
  }
  const ohMatch = /^OH(\d+)$/.exec(code);
  if (ohMatch) {
    const n = Number(ohMatch[1]);
    if (n <= 3) return { bg: 'bg-rose-50', text: 'text-rose-700' };       // disease burden
    if (n <= 7) return { bg: 'bg-cyan-50', text: 'text-cyan-700' };       // clinical value
    if (n <= 10) return { bg: 'bg-emerald-50', text: 'text-emerald-700' };// clinical diff
    return { bg: 'bg-purple-50', text: 'text-purple-700' };               // economic value
  }
  switch (code[0]) {
    case 'E': return { bg: 'bg-slate-100', text: 'text-slate-700' };      // economic
    case 'C': return { bg: 'bg-emerald-50', text: 'text-emerald-700' };   // clinical
    case 'P': return { bg: 'bg-purple-50', text: 'text-purple-700' };     // patient
    case 'D': return { bg: 'bg-amber-50', text: 'text-amber-800' };       // differentiation
    default:  return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

function LinkPill({ code }: { code: string }) {
  const { bg, text } = linkPillStyle(code);
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold',
        bg,
        text,
      )}
    >
      {code}
    </span>
  );
}

function LinkPillCell({ value }: { value: string | null }) {
  const codes = linkageList(value);
  if (codes.length === 0) {
    return <span className="text-serif-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {codes.map(code => (
        <LinkPill key={code} code={code} />
      ))}
    </div>
  );
}

export default function LibraryTable({
  articles,
  selectedIds,
  onToggleSelected,
  onToggleAllOnPage,
  highlightedId = null,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return articles;
    const out = [...articles].sort((a, b) => {
      const av = (a as unknown as Record<string, string | number | null>)[sortKey];
      const bv = (b as unknown as Record<string, string | number | null>)[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv);
      }
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      // Mixed types — fall back to string compare
      return String(av).localeCompare(String(bv));
    });
    return sortDir === 'asc' ? out : out.reverse();
  }, [articles, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir('asc');
    }
  }

  const allOnPageSelected = sorted.length > 0 && sorted.every(a => selectedIds.has(a.id));

  function SortHeader({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 text-left hover:text-serif-foreground transition-colors uppercase tracking-[0.06em] text-[10px]"
      >
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ArrowUp size={10} />
          ) : (
            <ArrowDown size={10} />
          )
        ) : (
          <ArrowUpDown size={10} className="opacity-30" />
        )}
      </button>
    );
  }

  const headerCellBase = 'px-3 py-2.5 text-left font-semibold text-serif-muted-foreground';
  const cellBase = 'px-3 py-2 align-top';
  const stickyCol1 = { width: 40 };
  const stickyCol2 = { left: 40, width: 130 };

  return (
    <Tooltip.Provider delayDuration={400}>
      <div
        className="overflow-x-auto overflow-y-auto border border-serif-border rounded-md bg-white"
        style={{ maxHeight: 'calc(100vh - 320px)' }}
      >
        <table className="text-xs" style={{ minWidth: '3200px' }}>
          <thead className="sticky top-0 z-10 bg-serif-muted/95 backdrop-blur border-b border-serif-border">
            <tr>
              <th
                className={cn(headerCellBase, 'sticky left-0 z-20 bg-serif-muted border-r border-serif-border')}
                style={stickyCol1}
              >
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={() => onToggleAllOnPage(sorted.map(a => a.id))}
                  className="accent-[color:var(--evhub-mint)] cursor-pointer"
                  aria-label="Select all on page"
                />
              </th>
              <th
                className={cn(headerCellBase, 'sticky z-20 bg-serif-muted border-r border-serif-border')}
                style={stickyCol2}
              >
                <SortHeader k="id" label="Article ID" />
              </th>
              <th className={headerCellBase} style={{ width: 160 }}>
                <SortHeader k="product_display" label="Product" />
              </th>
              <th className={headerCellBase} style={{ width: 90 }}>
                <SortHeader k="indication" label="Indication" />
              </th>
              <th className={headerCellBase} style={{ width: 360 }}>
                <SortHeader k="title" label="Title" />
              </th>
              <th className={headerCellBase} style={{ width: 110 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Authors</span>
              </th>
              <th className={headerCellBase} style={{ width: 200 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Journal / Conference</span>
              </th>
              <th className={headerCellBase} style={{ width: 110 }}>
                <SortHeader k="pub_date" label="Date" />
              </th>
              <th className={headerCellBase} style={{ width: 100 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Pub link</span>
              </th>
              <th className={headerCellBase} style={{ width: 110 }}>
                <SortHeader k="pub_type" label="Pub type" />
              </th>
              <th className={headerCellBase} style={{ width: 110 }}>
                <SortHeader k="study_type" label="Study type" />
              </th>
              <th className={headerCellBase} style={{ width: 180 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Study design</span>
              </th>
              <th className={headerCellBase} style={{ width: 130 }}>
                <SortHeader k="geography" label="Geography" />
              </th>
              <th className={headerCellBase} style={{ width: 110 }}>
                <SortHeader k="sponsor" label="Sponsor" />
              </th>
              <th className={headerCellBase} style={{ width: 220 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Patient population</span>
              </th>
              <th className={headerCellBase} style={{ width: 220 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Interventions</span>
              </th>
              <th className={headerCellBase} style={{ width: 220 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Key Outcomes</span>
              </th>
              <th className={headerCellBase} style={{ width: 180 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Category</span>
              </th>
              <th className={headerCellBase} style={{ width: 200 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Sub-category</span>
              </th>
              <th className={headerCellBase} style={{ width: 80 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Sci Narr</span>
              </th>
              <th className={headerCellBase} style={{ width: 80 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Value Msg</span>
              </th>
              <th className={headerCellBase} style={{ width: 80 }}>
                <span className="uppercase tracking-[0.06em] text-[10px]">Obj Hand</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a => {
              const isSel = selectedIds.has(a.id);
              const isHighlighted = highlightedId === a.id;
              return (
                <tr
                  key={a.id}
                  id={`article-${a.id}`}
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('a, button, input, label')) return;
                    onToggleSelected(a.id);
                  }}
                  className={cn(
                    'border-b border-serif-border/40 cursor-pointer transition-colors duration-300',
                    isHighlighted
                      ? 'bg-[rgba(93,202,165,0.22)]'
                      : isSel
                        ? 'bg-[rgba(93,202,165,0.08)]'
                        : 'hover:bg-serif-muted/30',
                  )}
                >
                  <td
                    className={cn(
                      cellBase,
                      'sticky left-0 z-10 border-r border-serif-border/50 transition-colors duration-300',
                      isHighlighted
                        ? 'bg-[#CFEEDD]'
                        : isSel
                          ? 'bg-[#E8F6F0]'
                          : 'bg-white',
                    )}
                    style={stickyCol1}
                  >
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => onToggleSelected(a.id)}
                      className="accent-[color:var(--evhub-mint)] cursor-pointer"
                      aria-label={`Select ${a.id}`}
                    />
                  </td>
                  <td
                    className={cn(
                      cellBase,
                      'sticky z-10 border-r border-serif-border/50 transition-colors duration-300',
                      isHighlighted
                        ? 'bg-[#CFEEDD]'
                        : isSel
                          ? 'bg-[#E8F6F0]'
                          : 'bg-white',
                    )}
                    style={stickyCol2}
                  >
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[color:var(--evhub-navy)] hover:underline font-medium"
                      >
                        {a.id}
                      </a>
                    ) : (
                      <span className="font-medium">{a.id}</span>
                    )}
                  </td>
                  <td className={cellBase} style={{ width: 160 }}>
                    <TruncatedCell text={a.product_display} lineClamp={2} />
                  </td>
                  <td className={cellBase} style={{ width: 90 }}>
                    {a.indication ? (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundColor: 'rgba(175,169,236,0.25)',
                          color: 'var(--evhub-navy)',
                        }}
                      >
                        {a.indication}
                      </span>
                    ) : (
                      <span className="text-serif-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={cellBase} style={{ width: 360 }}>
                    <TruncatedCell text={a.title} lineClamp={2} />
                  </td>
                  <td
                    className={cn(cellBase, 'text-serif-muted-foreground')}
                    style={{ width: 110 }}
                  >
                    <TruncatedCell text={a.authors} lineClamp={2} />
                  </td>
                  <td className={cellBase} style={{ width: 200 }}>
                    <TruncatedCell text={a.journal} lineClamp={2} />
                  </td>
                  <td
                    className={cn(cellBase, 'text-serif-muted-foreground tabular-nums whitespace-nowrap')}
                    style={{ width: 110 }}
                  >
                    {formatDate(a.pub_date)}
                  </td>
                  <td className={cellBase} style={{ width: 100 }}>
                    {a.pub_link ? (
                      <a
                        href={a.pub_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[color:var(--evhub-navy)] hover:underline whitespace-nowrap"
                      >
                        Source <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-serif-muted-foreground">—</span>
                    )}
                  </td>
                  <td className={cn(cellBase, 'whitespace-nowrap')} style={{ width: 110 }}>
                    {a.pub_type ?? <span className="text-serif-muted-foreground">—</span>}
                  </td>
                  <td className={cn(cellBase, 'whitespace-nowrap')} style={{ width: 110 }}>
                    {a.study_type ?? <span className="text-serif-muted-foreground">—</span>}
                  </td>
                  <td className={cellBase} style={{ width: 180 }}>
                    <TruncatedCell text={a.study_design} lineClamp={2} />
                  </td>
                  <td className={cn(cellBase, 'whitespace-nowrap')} style={{ width: 130 }}>
                    {a.geography ?? <span className="text-serif-muted-foreground">—</span>}
                  </td>
                  <td className={cn(cellBase, 'whitespace-nowrap')} style={{ width: 110 }}>
                    {a.sponsor ?? <span className="text-serif-muted-foreground">—</span>}
                  </td>
                  <td className={cellBase} style={{ width: 220 }}>
                    <TruncatedCell text={a.population} lineClamp={2} />
                  </td>
                  <td className={cellBase} style={{ width: 220 }}>
                    <TruncatedCell text={a.interventions} lineClamp={2} />
                  </td>
                  <td className={cellBase} style={{ width: 220 }}>
                    <TruncatedCell text={a.outcomes} lineClamp={2} />
                  </td>
                  <td className={cellBase} style={{ width: 180 }}>
                    <PillList values={categoryParentList(a)} variant="category" maxVisible={3} />
                  </td>
                  <td className={cellBase} style={{ width: 200 }}>
                    <PillList values={categorySubList(a)} variant="subcategory" maxVisible={4} />
                  </td>
                  <td className={cellBase} style={{ width: 80 }}>
                    <LinkPillCell value={a.scientific_narrative_link} />
                  </td>
                  <td className={cellBase} style={{ width: 80 }}>
                    <LinkPillCell value={a.value_message_link} />
                  </td>
                  <td className={cellBase} style={{ width: 80 }}>
                    <LinkPillCell value={a.objection_handler_link} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-serif-muted-foreground">
            No articles match the current filters.
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}
