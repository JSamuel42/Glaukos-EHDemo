import type { StrengthRating } from '@/lib/comparative-data/ratings';

const STYLES: Record<
  StrengthRating,
  { bg: string; text: string; ring: string; symbol: string; label: string }
> = {
  strong: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    symbol: '↑',
    label: 'Strong',
  },
  parity: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
    symbol: '=',
    label: 'Parity',
  },
  weak: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    ring: 'ring-rose-200',
    symbol: '↓',
    label: 'Weak',
  },
  'not-yet-assessed': {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    ring: 'ring-slate-200',
    symbol: '—',
    label: 'Not yet assessed',
  },
};

export default function StrengthBadge({
  rating,
  rationale,
}: {
  rating: StrengthRating;
  rationale?: string;
}) {
  const s = STYLES[rating];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ${s.bg} ${s.text} ${s.ring}`}
      title={rationale}
    >
      <span className="font-mono">{s.symbol}</span>
      {s.label}
    </span>
  );
}
