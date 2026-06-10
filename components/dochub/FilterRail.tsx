'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DOCHUB_DATA } from '@/lib/dochub/data';
import type { DocHubFilterState } from '@/lib/dochub/filters';
import { isDocHubFilterActive } from '@/lib/dochub/filters';
import CountryFlag from './CountryFlag';
import { cn } from '@/lib/cn';

interface Props {
  filterState: DocHubFilterState;
  onChange: (s: DocHubFilterState) => void;
}

/**
 * Left-side filter rail for the Document Hub. Four collapsible groups:
 * Product, Geography, Type, Tag. Each group renders as a labelled section
 * with a chevron header. Geography rows show inline country flags; Type
 * rows render as coloured pills (purple for Internal, slate for External).
 */
export default function FilterRail({ filterState, onChange }: Props) {
  function toggle(field: keyof DocHubFilterState, value: string) {
    const next: DocHubFilterState = {
      products: new Set(filterState.products),
      geographies: new Set(filterState.geographies),
      types: new Set(filterState.types),
      tags: new Set(filterState.tags),
    };
    const set = next[field];
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange(next);
  }

  function clearAll() {
    onChange({
      products: new Set(),
      geographies: new Set(),
      types: new Set(),
      tags: new Set(),
    });
  }

  const active = isDocHubFilterActive(filterState);

  return (
    <aside className="w-60 shrink-0 border-r border-serif-border bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-serif-border flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-serif-foreground">
          Filters
        </h2>
        {active && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-serif-muted-foreground hover:text-serif-foreground hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <Section title="Product" defaultOpen>
        <ul className="space-y-1">
          {DOCHUB_DATA.filter_tree.products.map(p => (
            <CheckboxRow
              key={p}
              label={p}
              checked={filterState.products.has(p)}
              onToggle={() => toggle('products', p)}
            />
          ))}
        </ul>
      </Section>

      <Section title="Geography" defaultOpen>
        <ul className="space-y-1">
          {DOCHUB_DATA.filter_tree.geographies.map(g => (
            <CheckboxRow
              key={g}
              checked={filterState.geographies.has(g)}
              onToggle={() => toggle('geographies', g)}
              label={
                <span className="inline-flex items-center gap-2">
                  <CountryFlag geography={g} size={14} />
                  <span>{g}</span>
                </span>
              }
            />
          ))}
        </ul>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-serif-muted-foreground hover:text-serif-foreground"
            >
              <Info size={11} />
              See more markets
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={6}
              className="z-50 max-w-xs px-3 py-2 rounded-md text-xs leading-relaxed shadow-lg"
              style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
            >
              More markets coming soon — Italy, Spain, Japan, US.
              <Tooltip.Arrow style={{ fill: 'var(--evhub-navy)' }} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Section>

      <Section title="Type" defaultOpen>
        <div className="flex flex-wrap gap-2">
          {DOCHUB_DATA.filter_tree.types.map(t => {
            const isActive = filterState.types.has(t);
            const isInternal = t === 'Internal';
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle('types', t)}
                aria-pressed={isActive}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-all border',
                  isActive
                    ? isInternal
                      ? 'border-[color:var(--evhub-purple)] bg-[rgba(175,169,236,0.25)] text-[#3D3893]'
                      : 'border-slate-400 bg-slate-200 text-slate-800'
                    : 'border-serif-border bg-white text-serif-muted-foreground hover:border-serif-muted-foreground/60',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Tag" defaultOpen>
        <ul className="space-y-1">
          {DOCHUB_DATA.filter_tree.tags.map(t => (
            <CheckboxRow
              key={t}
              label={t}
              checked={filterState.tags.has(t)}
              onToggle={() => toggle('tags', t)}
            />
          ))}
        </ul>
      </Section>
    </aside>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-serif-border">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-serif-foreground hover:bg-slate-50/60"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <label className="flex items-center gap-2 cursor-pointer py-0.5 text-xs text-serif-foreground hover:text-[color:var(--evhub-navy)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="accent-[color:var(--evhub-mint)] h-3.5 w-3.5"
        />
        <span className="truncate">{label}</span>
      </label>
    </li>
  );
}
