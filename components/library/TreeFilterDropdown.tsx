'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TreeNode {
  parent: string;
  children: string[];
}

interface Props {
  label: string;
  tree: TreeNode[];
  selectedParents: Set<string>;
  selectedChildren: Set<string>;
  onChange: (parents: Set<string>, children: Set<string>) => void;
}

export default function TreeFilterDropdown({
  label,
  tree,
  selectedParents,
  selectedChildren,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const totalSelected = selectedParents.size + selectedChildren.size;

  function toggleParent(parent: string, allChildren: string[]) {
    const nextParents = new Set(selectedParents);
    const nextChildren = new Set(selectedChildren);
    if (nextParents.has(parent)) {
      nextParents.delete(parent);
    } else {
      nextParents.add(parent);
      // Selecting parent supersedes any individual child selections under it
      for (const c of allChildren) nextChildren.delete(c);
    }
    onChange(nextParents, nextChildren);
  }

  function toggleChild(child: string, parent: string) {
    const nextChildren = new Set(selectedChildren);
    const nextParents = new Set(selectedParents);
    if (nextChildren.has(child)) {
      nextChildren.delete(child);
    } else {
      nextChildren.add(child);
      // Drop parent — user is being specific
      nextParents.delete(parent);
    }
    onChange(nextParents, nextChildren);
  }

  function toggleExpand(parent: string) {
    const next = new Set(expanded);
    if (next.has(parent)) next.delete(parent);
    else next.add(parent);
    setExpanded(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors',
          totalSelected > 0
            ? 'border-[color:var(--evhub-mint)] bg-[rgba(93,202,165,0.08)] text-serif-foreground'
            : 'border-serif-border bg-white text-serif-foreground hover:border-serif-muted-foreground/50',
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{label}</span>
        {totalSelected > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--evhub-mint)' }}
          >
            {totalSelected}
          </span>
        )}
        <ChevronDown
          size={14}
          className={cn('transition-transform text-serif-muted-foreground', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 max-h-96 overflow-hidden rounded-md border border-serif-border bg-white shadow-lg z-30 flex flex-col">
          <div className="flex items-center justify-end px-3 py-1.5 border-b border-serif-border bg-serif-muted/30">
            <button
              type="button"
              onClick={() => onChange(new Set(), new Set())}
              className="text-[11px] text-serif-muted-foreground hover:text-serif-foreground hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {tree.map(node => {
              const isExpanded = expanded.has(node.parent);
              const parentChecked = selectedParents.has(node.parent);
              const someChildSelected = node.children.some(c => selectedChildren.has(c));
              const indeterminate = !parentChecked && someChildSelected;

              return (
                <div key={node.parent} className="border-b border-serif-border/40 last:border-b-0">
                  <div className="flex items-center pl-1.5 pr-3 py-1.5 hover:bg-serif-muted/40 text-sm">
                    <button
                      type="button"
                      onClick={() => toggleExpand(node.parent)}
                      className="p-0.5 mr-1 text-serif-muted-foreground hover:text-serif-foreground"
                      aria-label={isExpanded ? `Collapse ${node.parent}` : `Expand ${node.parent}`}
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={parentChecked}
                        ref={el => {
                          if (el) el.indeterminate = indeterminate;
                        }}
                        onChange={() => toggleParent(node.parent, node.children)}
                        className="accent-[color:var(--evhub-mint)]"
                      />
                      <span className="font-medium">{node.parent}</span>
                    </label>
                  </div>
                  {isExpanded && (
                    <ul className="pl-8 pr-3 pb-1.5">
                      {node.children.map(child => (
                        <li key={child}>
                          <label className="flex items-center gap-2 py-1 hover:bg-serif-muted/30 -mx-2 px-2 rounded cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={selectedChildren.has(child) || parentChecked}
                              disabled={parentChecked}
                              onChange={() => toggleChild(child, node.parent)}
                              className="accent-[color:var(--evhub-mint)]"
                            />
                            <span
                              className={cn(
                                'truncate',
                                parentChecked
                                  ? 'text-serif-muted-foreground/70'
                                  : 'text-serif-muted-foreground',
                              )}
                              title={child}
                            >
                              {child}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
