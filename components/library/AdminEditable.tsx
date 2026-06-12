'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * AdminEditable — wraps a Library table cell's display node. When `enabled`
 * (admin mode), clicking the cell swaps the display for an inline input /
 * textarea seeded with the current raw value. Enter (or blur) commits via
 * `onCommit`; Escape cancels. Outside admin mode it renders `children`
 * untouched, so the read-only table is unaffected.
 *
 * Clicks are stopped from bubbling to the row so entering edit mode doesn't
 * also toggle row selection.
 */
interface Props {
  enabled: boolean;
  value: string;
  multiline?: boolean;
  onCommit: (value: string) => void;
  children: React.ReactNode;
}

export default function AdminEditable({
  enabled,
  value,
  multiline = false,
  onCommit,
  children,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      // Focus + select on next tick once the field is mounted.
      const id = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }, 0);
      return () => clearTimeout(id);
    }
  }, [editing, value]);

  if (!enabled) return <>{children}</>;

  function commit() {
    setEditing(false);
    const trimmed = draft;
    if (trimmed !== value) onCommit(trimmed);
  }

  if (editing) {
    const shared =
      'w-full rounded border border-[color:var(--evhub-mint)] bg-white px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[color:var(--evhub-mint)]';
    return (
      <div onClick={e => e.stopPropagation()}>
        {multiline ? (
          <textarea
            ref={el => {
              inputRef.current = el;
            }}
            value={draft}
            rows={3}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
              }
            }}
            className={shared}
          />
        ) : (
          <input
            ref={el => {
              inputRef.current = el;
            }}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
            }}
            className={shared}
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Click to edit"
      className={cn(
        'cursor-text rounded-sm -mx-0.5 px-0.5 transition-colors',
        'hover:bg-[rgba(93,202,165,0.12)] hover:outline-dashed hover:outline-1 hover:outline-[color:var(--evhub-mint)]',
      )}
    >
      {children}
    </div>
  );
}
