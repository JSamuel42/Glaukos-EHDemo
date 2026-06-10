import { STRENGTH_LABEL, type StrengthLevel } from '@/lib/value-story/data';
import { cn } from '@/lib/cn';

const LEVEL_INDEX: Record<StrengthLevel, number> = {
  aspirational: 1,
  emerging: 2,
  strong: 3,
  robust: 4,
};

// Purple → teal gradient across the four levels.
const SEGMENT_COLORS = [
  'bg-purple-500', // aspirational
  'bg-violet-500', // emerging
  'bg-blue-500', // strong
  'bg-teal-500', // robust
];

interface Props {
  level: StrengthLevel;
  /** Show the four-dot legend below the bar. Off by default. */
  showLegend?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Four-segment horizontal evidence-strength indicator. Filled segments
 * carry a purple→teal gradient; the level label ("Strong 3/4") sits to
 * the right of the bar. Reused by Scientific Narrative + likely
 * Objection Handling — keep visual changes here.
 */
export default function StrengthIndicator({
  level,
  showLegend = false,
  size = 'sm',
  className,
}: Props) {
  const filledIndex = LEVEL_INDEX[level];
  const labelClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const segmentWidth = size === 'sm' ? 'w-7' : 'w-9';
  const segmentHeight = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={cn(
                segmentHeight,
                segmentWidth,
                'rounded-sm transition-colors',
                i < filledIndex ? SEGMENT_COLORS[i] : 'bg-slate-200',
              )}
            />
          ))}
        </div>
        <span className={cn(labelClass, 'font-medium text-slate-700')}>
          {STRENGTH_LABEL[level]}
        </span>
        <span className={cn(labelClass, 'text-slate-500 font-mono')}>{filledIndex}/4</span>
      </div>
      {showLegend && (
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Aspirational
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-500" /> Emerging
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Strong
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> Robust
          </span>
        </div>
      )}
    </div>
  );
}
