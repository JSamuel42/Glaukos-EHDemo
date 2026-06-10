'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

export default function FilterDropdown({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const showSearch = options.length > 10;
  const visible = search
    ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  function toggle(opt: string) {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors',
          selected.size > 0
            ? 'border-[color:var(--evhub-mint)] bg-[rgba(93,202,165,0.08)] text-serif-foreground'
            : 'border-serif-border bg-white text-serif-foreground hover:border-serif-muted-foreground/50',
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--evhub-mint)' }}
          >
            {selected.size}
          </span>
        )}
        <ChevronDown
          size={14}
          className={cn('transition-transform text-serif-muted-foreground', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-80 overflow-hidden rounded-md border border-serif-border bg-white shadow-lg z-30 flex flex-col">
          {showSearch && (
            <div className="p-2 border-b border-serif-border">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-serif-muted-foreground pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Filter ${label.toLowerCase()}...`}
                  className="w-full pl-7 pr-2 py-1.5 text-xs rounded border border-serif-border focus:outline-none focus:ring-1 focus:ring-[color:var(--evhub-mint)]"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-serif-border bg-serif-muted/30">
            <button
              type="button"
              onClick={() => onChange(new Set(options))}
              className="text-[11px] text-[color:var(--evhub-navy)] hover:underline"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="text-[11px] text-serif-muted-foreground hover:text-serif-foreground hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {visible.map(opt => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-serif-muted/40 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.has(opt)}
                  onChange={() => toggle(opt)}
                  className="accent-[color:var(--evhub-mint)]"
                />
                <span className="truncate" title={opt}>
                  {opt}
                </span>
              </label>
            ))}
            {visible.length === 0 && (
              <div className="px-3 py-2 text-xs text-serif-muted-foreground">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
