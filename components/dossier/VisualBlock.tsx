'use client';

import { useMemo } from 'react';
import type { VisualSpec, FunnelLevelSpec } from '@/lib/dossier/types';
import { sanitizeSvg } from '@/lib/dossier/sanitizeSvg';

/**
 * VisualBlock — renders a dossier visual as SVG, in both the draft preview and
 * the compiled view (Audit+Fix 2). The user never sees the underlying JSON
 * spec or raw markup:
 *   - funnel: JSON spec → SVG trapezoid funnel (dossier-owned renderer)
 *   - svg:    sanitised raw SVG markup, embedded
 *
 * The funnel renderer is intentionally self-contained (its own SVG, serif
 * palette) rather than reusing Epidemiology's div/CSS funnel — a unification
 * pass is deferred to the Phase 6 follow-up.
 */

const NAVY = '#083860';
const MINT = '#5DCAA5';

/** Linear interpolation between the navy→mint band colours by depth. */
function bandColor(i: number, n: number): string {
  if (n <= 1) return NAVY;
  const t = i / (n - 1);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const navy = [8, 56, 96];
  const mint = [93, 202, 165];
  return `rgb(${lerp(navy[0], mint[0])}, ${lerp(navy[1], mint[1])}, ${lerp(navy[2], mint[2])})`;
}

function FunnelSvg({ title, levels }: { title?: string; levels: FunnelLevelSpec[] }) {
  const W = 720;
  const bandH = 64;
  const gap = 8;
  const topPad = title ? 44 : 16;
  const H = topPad + levels.length * (bandH + gap) + 8;

  // Widths taper from full at the top to ~30% at the bottom. We taper by rank
  // (not raw value) so a near-flat funnel still reads as a funnel; the value is
  // shown as a label, keeping the geometry legible.
  const maxW = W * 0.92;
  const minW = W * 0.32;
  const widths = levels.map((_, i) =>
    levels.length <= 1 ? maxW : maxW - ((maxW - minW) * i) / (levels.length - 1),
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto', fontFamily: 'var(--font-source-sans, sans-serif)' }}
      role="img"
      aria-label={title ? `Funnel: ${title}` : 'Funnel diagram'}
    >
      {title && (
        <text x={W / 2} y={26} textAnchor="middle" fontSize={17} fontWeight={600} fill={NAVY}
          style={{ fontFamily: 'var(--font-playfair, serif)' }}>
          {title}
        </text>
      )}
      {levels.map((lvl, i) => {
        const topW = widths[i];
        const botW = i < levels.length - 1 ? widths[i + 1] : Math.max(minW * 0.85, widths[i] - (widths[i] - minW) * 0.4);
        const y = topPad + i * (bandH + gap);
        const cx = W / 2;
        const pts = [
          [cx - topW / 2, y],
          [cx + topW / 2, y],
          [cx + botW / 2, y + bandH],
          [cx - botW / 2, y + bandH],
        ].map(p => p.join(',')).join(' ');
        const fill = bandColor(i, levels.length);
        return (
          <g key={i}>
            <polygon points={pts} fill={fill} opacity={0.92} />
            <text x={cx} y={y + (lvl.note ? bandH / 2 - 4 : bandH / 2 + 1)} textAnchor="middle"
              fontSize={14} fontWeight={600} fill="#FFFFFF" dominantBaseline="middle">
              {lvl.label}
              {typeof lvl.value === 'number' ? `  ·  ${formatValue(lvl.value)}` : ''}
            </text>
            {lvl.note && (
              <text x={cx} y={y + bandH / 2 + 13} textAnchor="middle" fontSize={11}
                fill="rgba(255,255,255,0.85)" dominantBaseline="middle">
                {lvl.note}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Compact value formatting: 3_500_000 → "3.5M", 12000 → "12K". */
function formatValue(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(v);
}

export default function VisualBlock({ spec }: { spec: VisualSpec }) {
  const safeSvg = useMemo(
    () => (spec.kind === 'svg' ? sanitizeSvg(spec.svg) : ''),
    [spec],
  );

  if (spec.kind === 'funnel') {
    return (
      <div className="my-3 rounded-[8px] border p-4" style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}>
        <FunnelSvg title={spec.title} levels={spec.levels} />
      </div>
    );
  }

  // Raw SVG (sanitised).
  if (!safeSvg) {
    return (
      <div className="my-3 rounded-[8px] border p-4 text-xs" style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}>
        Visual could not be rendered.
      </div>
    );
  }
  return (
    <div
      className="my-3 rounded-[8px] border p-4 flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
      style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
      dangerouslySetInnerHTML={{ __html: safeSvg }}
    />
  );
}
