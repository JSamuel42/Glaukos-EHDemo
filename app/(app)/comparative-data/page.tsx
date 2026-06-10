'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ALL_PRODUCTS } from '@/lib/comparative-data/data';
import OverviewTab from '@/components/comparative-data/OverviewTab';
import EvidenceGridTab from '@/components/comparative-data/EvidenceGridTab';
import TimelinesTab from '@/components/comparative-data/TimelinesTab';
import { cn } from '@/lib/cn';

type Tab = 'overview' | 'evidence-grid' | 'timelines';

// Specific Indication selector — single selectable value for the demo
// (4L MM TCE), with the earlier-line indications shown as disabled options
// so the user can see the eventual catalogue without being able to pick them.
const INDICATION_OPTIONS = [
  { id: '4l-mm-tce', label: '4L MM (TCE)', disabled: false },
  { id: '3l-mm', label: '3L MM', disabled: true },
  { id: '2l-mm', label: '2L MM', disabled: true },
];

export default function ComparativeDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [indicationId, setIndicationId] = useState<string>('4l-mm-tce');
  const [indicationOpen, setIndicationOpen] = useState(false);
  const selectedIndication = INDICATION_OPTIONS.find(o => o.id === indicationId)!;

  return (
    <div className="pl-8 pr-12 py-7 max-w-7xl mx-auto">
      {/* Title */}
      <h1 className="font-playfair text-3xl text-serif-foreground leading-tight">
        Comparative Data
      </h1>

      {/* Indication row */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-serif-foreground">R / R Multiple Myeloma</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">Specific Indication</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIndicationOpen(o => !o)}
            onBlur={() => setTimeout(() => setIndicationOpen(false), 120)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-serif-border bg-white text-sm font-medium text-serif-foreground hover:border-serif-muted-foreground/60"
          >
            {selectedIndication.label}
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {indicationOpen && (
            <div className="absolute z-30 mt-1 left-0 min-w-[160px] rounded-md border border-serif-border bg-white shadow-lg overflow-hidden">
              {INDICATION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    setIndicationId(opt.id);
                    setIndicationOpen(false);
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-1.5 text-sm',
                    opt.disabled
                      ? 'text-slate-400 cursor-not-allowed bg-slate-50/60'
                      : opt.id === indicationId
                        ? 'bg-slate-50 font-semibold text-serif-foreground'
                        : 'text-serif-foreground hover:bg-slate-50',
                  )}
                  title={opt.disabled ? 'Not available in this demo' : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thin gold rule */}
      <div
        className="mt-4 mb-5"
        style={{ height: '1px', backgroundColor: 'rgba(8,56,96,0.30)' }}
      />

      {/* Products label + chip row */}
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.18em] font-mono font-semibold text-serif-muted-foreground mb-2">
          Products ({ALL_PRODUCTS.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_PRODUCTS.map(p => (
            <span
              key={p.brandName}
              className="px-2 py-0.5 text-xs rounded-md ring-1 font-medium"
              style={
                p.isFictional
                  ? {
                      backgroundColor: 'rgba(8,56,96,0.08)',
                      color: 'rgba(8,56,96,0.92)',
                      boxShadow: 'inset 0 0 0 1px rgba(8,56,96,0.25)',
                    }
                  : {
                      backgroundColor: 'var(--serif-muted, #F1ECE3)',
                      color: 'var(--serif-foreground, #1E1B16)',
                      boxShadow: 'inset 0 0 0 1px var(--serif-border, #E5DECE)',
                    }
              }
            >
              {p.brandName}
              {p.isFictional && (
                <span className="ml-1" style={{ color: 'rgba(8,56,96,0.65)' }}>
                  ·pre-launch
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Tab strip */}
      <div className="border-b border-serif-border mb-6">
        <div className="flex gap-1">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'evidence-grid'}
            onClick={() => setActiveTab('evidence-grid')}
          >
            Evidence Grid
          </TabButton>
          <TabButton
            active={activeTab === 'timelines'}
            onClick={() => setActiveTab('timelines')}
          >
            Timelines
          </TabButton>
        </div>
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'evidence-grid' && <EvidenceGridTab />}
      {activeTab === 'timelines' && <TimelinesTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
        active
          ? 'border-[color:var(--evhub-navy)] text-[color:var(--evhub-navy)]'
          : 'border-transparent text-serif-muted-foreground hover:text-serif-foreground',
      )}
    >
      {children}
    </button>
  );
}
