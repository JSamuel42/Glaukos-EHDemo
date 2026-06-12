'use client';

/**
 * ValuePill — a single coloured tag-pill for scalar Library columns
 * (Study Type, Sponsor, Geography). Mirrors the soft-tint + dark-text,
 * rounded-full look of the Category / Sub-category pills (see PillList), but
 * assigns a distinct hue per value so the column reads at a glance.
 *
 * Colours are assigned from a fixed palette: known values get a curated tint;
 * anything unexpected falls back to a deterministic hash of the string so the
 * same value always wears the same colour across rows.
 */

interface Tint {
  bg: string;
  fg: string;
}

// Soft-tint / dark-text pairs, in the demo's serif palette family.
const PALETTE: Tint[] = [
  { bg: 'rgba(93,202,165,0.18)', fg: '#0E5C42' }, // mint   (matches Category)
  { bg: 'rgba(133,183,235,0.20)', fg: '#1B4B7A' }, // blue   (matches Sub-category)
  { bg: 'rgba(175,169,236,0.22)', fg: '#3B348C' }, // violet (matches Indication family)
  { bg: 'rgba(244,162,97,0.20)', fg: '#9A4A12' }, // amber
  { bg: 'rgba(231,111,131,0.18)', fg: '#8C2B3D' }, // rose
  { bg: 'rgba(120,180,140,0.20)', fg: '#2F6B45' }, // sage
  { bg: 'rgba(150,160,180,0.22)', fg: '#3A4555' }, // slate
  { bg: 'rgba(220,190,120,0.22)', fg: '#7A5A12' }, // gold
];

// Curated assignments so the common glaucoma-demo values read intentionally.
const KNOWN: Record<string, number> = {
  // Study types
  'SLR / TLR': 1,
  RWE: 0,
  Clinical: 5,
  Economic: 6,
  'NMA / ITC': 2,
  Other: 6,
  // Sponsors
  Academia: 0,
  Industry: 3,
  // Geographies
  Global: 2,
  Europe: 1,
  'United States': 4,
  'North America': 4,
  'United Kingdom': 5,
  APAC: 3,
  'South Korea': 7,
  India: 7,
};

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

function tintFor(value: string): Tint {
  const idx = value in KNOWN ? KNOWN[value] : hashIndex(value);
  return PALETTE[idx];
}

export default function ValuePill({ value }: { value: string | null }) {
  if (!value) return <span className="text-serif-muted-foreground">—</span>;
  const { bg, fg } = tintFor(value);
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight max-w-full truncate"
      style={{ backgroundColor: bg, color: fg }}
      title={value}
    >
      {value}
    </span>
  );
}
