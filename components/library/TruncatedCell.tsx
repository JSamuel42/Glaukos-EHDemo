'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReactNode, CSSProperties } from 'react';

interface Props {
  text: string | null | undefined;
  fallback?: string;
  /** Optional element to render in place of text inside the truncated span. */
  children?: ReactNode;
  /**
   * Maximum number of lines before truncating. Defaults to 1 (single-line
   * ellipsis). Pass 2 (or higher) to wrap and clamp to that many lines —
   * used for the Title column where two-line titles read better than a
   * tooltip-only reveal.
   */
  lineClamp?: number;
}

/**
 * Truncates text and reveals full content in a Radix tooltip on hover.
 * Tooltip.Provider is mounted at the table level so we don't pay one
 * provider per cell.
 */
export default function TruncatedCell({
  text,
  fallback = '—',
  children,
  lineClamp = 1,
}: Props) {
  if (!text) {
    return <span className="text-serif-muted-foreground">{fallback}</span>;
  }

  const clampStyle: CSSProperties =
    lineClamp > 1
      ? {
          display: '-webkit-box',
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          // Slightly tighter line-height than the table default helps
          // multi-line cells stay legible without ballooning row heights.
          lineHeight: 1.35,
        }
      : {};

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          className={lineClamp > 1 ? 'block cursor-default' : 'block truncate cursor-default'}
          style={clampStyle}
        >
          {children ?? text}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 max-w-md px-3 py-2 rounded-md text-xs leading-relaxed shadow-lg whitespace-pre-wrap break-words"
          style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
        >
          {text}
          <Tooltip.Arrow style={{ fill: 'var(--evhub-navy)' }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
