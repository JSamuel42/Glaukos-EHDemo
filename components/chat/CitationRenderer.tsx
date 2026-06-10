'use client';

import { Fragment, type ReactNode } from 'react';

const CITATION_RE = /\(Section ([\d.]+),?\s*p\.?\s*(\d+)\)/g;

/**
 * Renders text with inline citation buttons. Citations of the form
 * "(Section 5.3.1, p. 47)" are replaced with clickable button chips.
 *
 * If no onCitationClick is provided the chip still renders but acts as a
 * visual marker only (no-op on click). The module's page provides the
 * handler via ChatPanelContext.setOnCitationClick.
 */
export function renderWithCitations(
  text: string,
  onCitationClick: ((section: string, page: number) => void) | undefined,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CITATION_RE.lastIndex = 0;
  while ((match = CITATION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const section = match[1];
    const page = parseInt(match[2], 10);
    parts.push(
      <button
        key={`c-${match.index}-${section}-${page}`}
        type="button"
        onClick={() => onCitationClick?.(section, page)}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-mono align-baseline transition-colors"
        style={{
          color: 'var(--evhub-navy)',
          backgroundColor: 'rgba(93,202,165,0.15)',
          cursor: onCitationClick ? 'pointer' : 'default',
        }}
      >
        §{section} · p.{page}
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`t-${lastIndex}-end`}>{text.slice(lastIndex)}</Fragment>);
  }
  return parts;
}
