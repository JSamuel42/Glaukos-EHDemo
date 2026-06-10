import * as Flags from 'country-flag-icons/react/3x2';
import { Globe } from 'lucide-react';
import { getFlagCode } from '@/lib/dochub/geography';
import { cn } from '@/lib/cn';

interface Props {
  geography: string;
  /** Width in pixels (height auto-derives as 2/3 width for 3:2 flag SVGs). */
  size?: number;
  className?: string;
}

/**
 * Renders an inline country flag for one of the supported geographies, or a
 * Lucide Globe icon for the "Global" sentinel. Falls back to the globe icon
 * if `country-flag-icons` doesn't ship the requested code.
 */
export default function CountryFlag({ geography, size = 18, className }: Props) {
  const code = getFlagCode(geography);

  if (code === 'GLOBAL') {
    return (
      <Globe
        size={size}
        className={cn('text-slate-500', className)}
        aria-label="Global"
      />
    );
  }

  const Flag = (Flags as Record<string, React.ComponentType<{ width: number; height: number }>>)[
    code
  ];

  if (!Flag) {
    return (
      <Globe
        size={size}
        className={cn('text-slate-400', className)}
        aria-label={geography}
      />
    );
  }

  const h = Math.round((size * 2) / 3);
  return (
    <span
      className={cn(
        'inline-block overflow-hidden rounded-sm ring-1 ring-slate-200 align-middle',
        className,
      )}
      style={{ width: size, height: h }}
      aria-label={geography}
    >
      <Flag width={size} height={h} />
    </span>
  );
}
