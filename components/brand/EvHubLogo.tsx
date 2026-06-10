import { cn } from '@/lib/cn';

/**
 * Three chevron-shaped stripes stacked tightly, matching the EvHub brand mark:
 * vivid purple top, deep navy middle, mint base. Each stripe is a thin "V"
 * band — apex at the top edge, thickness extending down. They sit flush so
 * the apex of each lower stripe meets the base of the one above, giving the
 * layered-pyramid / stacked-pages read of the brand glyph.
 */
export function StackGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Top stripe — vivid purple */}
      <path
        d="M 4 10 L 12 6 L 20 10 L 20 12 L 12 8 L 4 12 Z"
        fill="#A855F7"
      />
      {/* Middle stripe — deep navy */}
      <path
        d="M 3 14 L 12 10 L 21 14 L 21 16 L 12 12 L 3 16 Z"
        fill="#0E1B2C"
      />
      {/* Base stripe — mint */}
      <path
        d="M 2 18 L 12 14 L 22 18 L 22 20 L 12 16 L 2 20 Z"
        fill="#5DCAA5"
      />
    </svg>
  );
}

export default function EvHubLogo({
  className,
  glyphSize = 22,
  textSize = 'text-sm',
  textColor = '#FFFFFF',
  withTm = false,
  gap = 'gap-2.5',
}: {
  className?: string;
  glyphSize?: number;
  textSize?: string;
  textColor?: string;
  /** Render a small ™ after "Evidence Hub" — used on the access screen. */
  withTm?: boolean;
  /** Tailwind gap utility between glyph and wordmark. */
  gap?: string;
}) {
  return (
    <span className={cn('inline-flex items-center', gap, className)}>
      <StackGlyph size={glyphSize} />
      <span
        className={cn('font-playfair tracking-[0.18em] uppercase', textSize)}
        style={{ color: textColor }}
      >
        Evidence Hub
        {withTm && (
          // ™ should not inherit the wide letter-spacing of the wordmark and
          // should sit slightly above the baseline. Reset spacing + use sup.
          <sup
            className="ml-0.5 tracking-normal"
            style={{ fontSize: '0.5em', verticalAlign: 'super' }}
          >
            ™
          </sup>
        )}
      </span>
    </span>
  );
}
