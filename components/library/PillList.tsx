'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';

export type PillVariant = 'category' | 'subcategory';

interface Props {
  values: string[];
  variant?: PillVariant;
  /**
   * Maximum pills rendered before collapsing the remainder into a
   * "+N" pill. The tooltip on the cell reveals the full list.
   */
  maxVisible?: number;
}

/**
 * Renders a list of tag-pills (like the Indication column's purple pill,
 * extended to many values). Beyond `maxVisible`, a "+N" pill stands in for
 * the rest; hovering the cell shows the full list in a tooltip.
 */
export default function PillList({ values, variant = 'category', maxVisible = 3 }: Props) {
  if (!values.length) {
    return <span className="text-serif-muted-foreground">—</span>;
  }

  // Dedupe while preserving order — same category sometimes repeats
  // across grouped tags in the source data.
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      unique.push(v);
    }
  }

  const visible = unique.slice(0, maxVisible);
  const hiddenCount = unique.length - visible.length;
  const fullList = unique.join(', ');

  const pillBg = variant === 'category' ? 'rgba(93,202,165,0.18)' : 'rgba(133,183,235,0.20)';
  const pillFg = variant === 'category' ? '#0E5C42' : '#1B4B7A';

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="flex flex-wrap gap-1 cursor-default">
          {visible.map(v => (
            <span
              key={v}
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight max-w-full truncate"
              style={{ backgroundColor: pillBg, color: pillFg }}
              title={v}
            >
              {v}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span
              className={cn(
                'inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight',
              )}
              style={{
                backgroundColor: 'rgba(14,27,44,0.08)',
                color: 'var(--evhub-navy)',
              }}
              aria-label={`${hiddenCount} more`}
            >
              +{hiddenCount}
            </span>
          )}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 max-w-md px-3 py-2 rounded-md text-xs leading-relaxed shadow-lg whitespace-pre-wrap break-words"
          style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
        >
          {fullList}
          <Tooltip.Arrow style={{ fill: 'var(--evhub-navy)' }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
