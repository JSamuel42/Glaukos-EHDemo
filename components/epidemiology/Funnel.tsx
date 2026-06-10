'use client';

import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import {
  FUNNELS,
  COUNTRY_FLAGS,
  type Funnel as FunnelType,
} from '@/lib/epidemiology/data';
import { computeFunnel, formatAbsolute } from '@/lib/epidemiology/calc';
import { PublicationsModal } from './PublicationsModal';
import { cn } from '@/lib/cn';

interface Props {
  funnel: FunnelType;
  onSwitchFunnel: (id: string) => void;
}

/** Width step between adjacent funnel levels (% of the container). */
const WIDTH_STEP = 11;

/**
 * Single-funnel renderer. Stacked horizontal bars that narrow at each
 * level, mimicking a funnel shape without bothering with SVG paths.
 * Editable percentages cascade live via useState overrides; clicking
 * a level opens the publications modal. The whole funnel is rasterised
 * to PNG via html-to-image on export.
 */
export function Funnel({ funnel, onSwitchFunnel }: Props) {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement | null>(null);

  // Reset overrides when the user switches to a different funnel in
  // this slot — previous edits shouldn't carry across funnels.
  const [activeFunnelId, setActiveFunnelId] = useState(funnel.id);
  if (activeFunnelId !== funnel.id) {
    setActiveFunnelId(funnel.id);
    setOverrides({});
  }

  const computed = computeFunnel(funnel, overrides);
  const target = computed[computed.length - 1];

  function handlePctChange(levelId: string, raw: string) {
    const v = parseFloat(raw);
    setOverrides(prev => ({ ...prev, [levelId]: Number.isFinite(v) ? v : 0 }));
  }

  async function handleExport() {
    const node = captureRef.current;
    if (!node) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.download = `${funnel.id}-funnel.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('PNG export failed', err);
      window.alert('Export to PNG failed — see console for details.');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header — flag, funnel selector, target tally, export button.
          Sits OUTSIDE the captured node so the chrome doesn't bleed
          into the exported image. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">{COUNTRY_FLAGS[funnel.country]}</span>
          <div className="min-w-0">
            <select
              value={funnel.id}
              onChange={e => onSwitchFunnel(e.target.value)}
              className="text-sm font-semibold text-[color:var(--evhub-navy)] bg-transparent border-0 cursor-pointer hover:underline focus:outline-none px-0"
              aria-label="Switch funnel in this slot"
            >
              {FUNNELS.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-0.5">
              Target population:{' '}
              <span className="font-semibold text-[color:var(--evhub-navy)] tabular-nums">
                {formatAbsolute(target.absolute)}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 shrink-0"
          title="Export as PNG"
        >
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Captured region — funnel bars only. */}
      <div ref={captureRef} className="flex flex-col items-center gap-1 py-2 bg-white">
        {computed.map((lvl, i) => {
          const widthPct = Math.max(34, 100 - i * WIDTH_STEP);
          return (
            <div key={lvl.id} className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => setOpenLevelId(lvl.id)}
                className={cn(
                  'group w-full border rounded-md transition-shadow text-left px-4 py-3',
                  'hover:ring-2 hover:ring-[color:var(--evhub-mint)] hover:ring-offset-1',
                  lvl.isTarget
                    ? 'bg-[rgba(93,202,165,0.25)] border-[color:var(--evhub-mint)]'
                    : 'bg-slate-100 border-slate-300',
                )}
                style={{ maxWidth: `${widthPct}%` }}
              >
                <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[color:var(--evhub-navy)] leading-tight truncate">
                      {lvl.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {lvl.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold text-[color:var(--evhub-navy)] tabular-nums">
                      {formatAbsolute(lvl.absolute)}
                    </div>
                    {i > 0 && (
                      <div
                        className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-1"
                        // Editing the % shouldn't open the publications modal.
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          step={i === 1 ? '0.001' : '0.1'}
                          value={lvl.percentage}
                          onChange={e => handlePctChange(lvl.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-16 text-right bg-white/70 border border-slate-300 rounded px-1 py-0.5 text-xs tabular-nums"
                          aria-label={`${lvl.name} percentage`}
                        />
                        <span>%</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {openLevelId && (
        <PublicationsModal
          funnel={funnel}
          level={computed.find(l => l.id === openLevelId)!}
          onClose={() => setOpenLevelId(null)}
        />
      )}
    </div>
  );
}
