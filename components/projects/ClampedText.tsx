'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  text: string;
  /** Tailwind line-clamp class to apply, e.g. 'line-clamp-2'. */
  clampClass?: string;
  className?: string;
}

/**
 * Renders `text` with a line-clamp and shows a hand-rolled tooltip on hover
 * ONLY when the text is actually truncated. Detects truncation by comparing
 * scrollHeight to clientHeight after layout. Avoids the native `title` attr
 * to dodge its ~500ms browser delay.
 */
export default function ClampedText({
  text,
  clampClass = 'line-clamp-2',
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [hover, setHover] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // +1 absorbs sub-pixel rounding differences.
    setTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <span
      className="relative inline-block w-full align-top"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span ref={ref} className={cn('block', clampClass, className)}>
        {text}
      </span>
      {hover && truncated && (
        <span
          role="tooltip"
          className="absolute z-30 left-0 top-full mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-md border border-serif-border bg-white shadow-lg px-3 py-2 text-xs leading-relaxed text-serif-foreground pointer-events-none"
        >
          {text}
        </span>
      )}
    </span>
  );
}
