'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CustomSuggestedQuestion } from './ChatPanelContext';

export interface SuggestedQuestion {
  id: string;
  text: string;
}

export interface SuggestedQuestionGroup {
  category: string;
  questions: SuggestedQuestion[];
}

type Props =
  | {
      mode: 'grouped';
      groups: SuggestedQuestionGroup[];
      onPick: (question: SuggestedQuestion) => void;
      disabled?: boolean;
    }
  | {
      mode: 'flat';
      questions: SuggestedQuestion[];
      onPick: (question: SuggestedQuestion) => void;
      disabled?: boolean;
    }
  | {
      mode: 'custom';
      customQuestions: CustomSuggestedQuestion[];
      disabled?: boolean;
    };

/**
 * Empty-state alternative for modules with suggested-question entry points.
 *
 * Two render modes:
 *  - `grouped` — Ask GVD's collapsible categories with question buttons inside
 *    each section. Used only by Ask GVD.
 *  - `flat`    — a small "Get started…" heading above a vertical stack of
 *    bordered question buttons. Used by every other chat-enabled module so
 *    they share one visual style.
 */
export default function SuggestedQuestions(props: Props) {
  if (props.mode === 'flat') {
    return <FlatList {...props} />;
  }
  if (props.mode === 'custom') {
    return <CustomList {...props} />;
  }
  return <GroupedList {...props} />;
}

/* ── Custom mode (page-supplied handlers) ───────────────────────────────── */
function CustomList({
  customQuestions,
  disabled = false,
}: {
  customQuestions: CustomSuggestedQuestion[];
  disabled?: boolean;
}) {
  if (customQuestions.length === 0) return null;
  return (
    <div className="mt-6 text-left">
      <p className="text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground/80 mb-2">
        Get started with one of these
      </p>
      <ul className="flex flex-col gap-2">
        {customQuestions.map(q => (
          <li key={q.id}>
            <button
              type="button"
              data-chat-trigger
              disabled={disabled}
              onClick={() => void q.onClick()}
              className="w-full text-left px-3 py-2.5 rounded-md border border-serif-border bg-white hover:border-[color:var(--evhub-mint)] hover:shadow-sm transition-all text-xs text-serif-foreground leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Flat mode ──────────────────────────────────────────────────────────── */
function FlatList({
  questions,
  onPick,
  disabled = false,
}: {
  questions: SuggestedQuestion[];
  onPick: (question: SuggestedQuestion) => void;
  disabled?: boolean;
}) {
  if (questions.length === 0) return null;
  return (
    <div className="mt-6 text-left">
      <p className="text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground/80 mb-2">
        Get started with one of these
      </p>
      <ul className="flex flex-col gap-2">
        {questions.map(q => (
          <li key={q.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(q)}
              className="w-full text-left px-3 py-2.5 rounded-md border border-serif-border bg-white hover:border-[color:var(--evhub-mint)] hover:shadow-sm transition-all text-xs text-serif-foreground leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Grouped mode (Ask GVD) ─────────────────────────────────────────────── */
function GroupedList({
  groups,
  onPick,
  disabled = false,
}: {
  groups: SuggestedQuestionGroup[];
  onPick: (question: SuggestedQuestion) => void;
  disabled?: boolean;
}) {
  // All groups expanded by default — the panel only shows when conversation
  // is empty, so we want everything visible at the start.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(cat: string) {
    setCollapsed(curr => {
      const next = new Set(curr);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {groups.map(group => {
        const isCollapsed = collapsed.has(group.category);
        return (
          <div key={group.category} className="border border-serif-border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(group.category)}
              className="w-full flex items-center justify-between px-3 py-2 bg-serif-muted/40 hover:bg-serif-muted/60 transition-colors text-left"
              aria-expanded={!isCollapsed}
            >
              <span className="text-[11px] uppercase tracking-[0.14em] font-mono font-semibold text-serif-foreground">
                {group.category}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  'text-serif-muted-foreground transition-transform',
                  isCollapsed && '-rotate-90',
                )}
              />
            </button>
            {!isCollapsed && (
              <ul className="flex flex-col">
                {group.questions.map(q => (
                  <li key={q.id} className="border-t border-serif-border/60">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onPick(q)}
                      className="w-full text-left px-3 py-2 text-xs text-serif-foreground hover:bg-[rgba(93,202,165,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q.text}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
