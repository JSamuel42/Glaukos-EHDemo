import { cn } from '@/lib/cn';

type PillCategory = 'E' | 'C' | 'P' | 'D' | 'OH' | 'S' | 'GVD';

/**
 * Map an IEP code to a category for colouring.
 *   - "GVD" / "OH..." matched first (longer prefix)
 *   - Single-letter codes (E1, C2, P3, D1, S7) use first char
 */
function pillCategory(code: string): PillCategory {
  if (code === 'GVD') return 'GVD';
  if (code.startsWith('OH')) return 'OH';
  const first = code[0] as PillCategory;
  if (first === 'E' || first === 'C' || first === 'P' || first === 'D' || first === 'S') {
    return first;
  }
  return 'C';
}

const PILL_STYLES: Record<PillCategory, string> = {
  E:   'bg-[color:var(--evhub-navy)] text-white',
  C:   'bg-[color:var(--evhub-mint)] text-white',
  P:   'bg-purple-600 text-white',
  D:   'bg-amber-400 text-amber-950',
  OH:  'bg-rose-500 text-white',
  S:   'bg-emerald-600 text-white',
  GVD: 'bg-slate-700 text-white',
};

interface Props {
  code: string;
}

export default function IEPPill({ code }: Props) {
  const cat = pillCategory(code);
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide',
        PILL_STYLES[cat],
      )}
    >
      {code}
    </span>
  );
}
