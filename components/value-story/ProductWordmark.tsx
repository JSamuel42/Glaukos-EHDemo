import { cn } from '@/lib/cn';

interface Props {
  className?: string;
  /** Font size in pixels; the decorative dot scales relative to this. */
  size?: number;
}

/**
 * Product wordmark — Playfair Display with a teal accent dot before the
 * name. Demo-grade — easy to swap for a polished logo later without
 * touching the surrounding banner layout.
 */
export default function ProductWordmark({ className, size = 28 }: Props) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 font-playfair', className)}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span
        aria-hidden
        className="inline-block rounded-full"
        style={{
          width: Math.round(size * 0.36),
          height: Math.round(size * 0.36),
          backgroundColor: 'var(--evhub-mint)',
        }}
      />
      <span className="font-medium tracking-tight" style={{ color: 'var(--evhub-navy)' }}>
        iStent infinite
      </span>
    </span>
  );
}
