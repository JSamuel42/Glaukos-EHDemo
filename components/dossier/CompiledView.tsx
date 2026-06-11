'use client';

import { useEffect, useRef, useState } from 'react';
import type { DossierSummary, DossierSection, SectionArticleLink } from '@/lib/dossier/types';
import { flattenSectionTree } from '@/lib/dossier/store';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOURCE_LABELS = { ai: 'AI draft', human: 'Human edited', hybrid: 'Hybrid' } as const;

/** Heading element per section level. */
function SectionHeading({ level, children }: { level: number; children: React.ReactNode }) {
  const baseClass = 'font-playfair font-normal';
  if (level === 1) return <h2 className={`${baseClass} text-2xl mb-4`} style={{ borderBottom: '1px solid var(--serif-border)', paddingBottom: '8px' }}>{children}</h2>;
  if (level === 2) return <h3 className={`${baseClass} text-xl mb-3`}>{children}</h3>;
  if (level === 3) return <h4 className={`${baseClass} text-lg mb-2`}>{children}</h4>;
  return <h5 className={`font-sans font-semibold text-base mb-2`}>{children}</h5>;
}

/** Collect all unique article links from the full section tree, deduplicated by articleNumber. */
function collectAllLinks(sections: DossierSection[]): SectionArticleLink[] {
  const seen = new Set<number>();
  const result: SectionArticleLink[] = [];
  function walk(nodes: DossierSection[]) {
    for (const s of nodes) {
      for (const link of s.articleLinks) {
        if (!seen.has(link.articleNumber)) {
          seen.add(link.articleNumber);
          result.push(link);
        }
      }
      walk(s.children);
    }
  }
  walk(sections);
  return result.sort((a, b) => a.articleNumber - b.articleNumber);
}

// ── Table of Contents item ────────────────────────────────────────────────────

interface TocItemProps {
  section: DossierSection;
  activeId: string | null;
  onClick: (id: string) => void;
}

function TocItem({ section, activeId, onClick }: TocItemProps) {
  const isActive = activeId === section.id;
  const indent = (section.level - 1) * 12;
  return (
    <button
      type="button"
      onClick={() => onClick(section.id)}
      className="w-full text-left px-3 py-1.5 text-xs transition-colors"
      style={{
        paddingLeft: `${12 + indent}px`,
        backgroundColor: isActive ? 'rgba(8,56,96,0.08)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--serif-accent)' : '2px solid transparent',
        color: isActive ? 'var(--serif-accent)' : 'var(--serif-muted-foreground)',
      }}
    >
      <span className="font-mono text-[9px] mr-1.5">{section.number}</span>
      <span className="line-clamp-1">{section.title}</span>
    </button>
  );
}

// ── Per-section inline reasoning ──────────────────────────────────────────────

function SectionReasoningToggle({ section }: { section: DossierSection }) {
  const [open, setOpen] = useState(false);
  const reasoning = section.currentContent?.agentReasoning;
  if (!reasoning) return null;
  const fullCount = (reasoning.guidance_coverage ?? []).filter((g) => g.coverage === 'full').length;
  const total = (reasoning.guidance_coverage ?? []).length;
  return (
    <div className="mt-2 mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[10px] tracking-[0.06em] hover:opacity-70 transition-opacity"
        style={{ color: 'var(--serif-muted-foreground)' }}
      >
        {open ? '▾' : '▸'} Evidence notes &middot; {fullCount}/{total} guidance covered
      </button>
      {open && (
        <div
          className="mt-2 rounded-[6px] p-3 text-xs flex flex-col gap-2"
          style={{ backgroundColor: 'rgba(29,158,117,0.04)', border: '1px solid var(--serif-border)' }}
        >
          {(reasoning.guidance_coverage ?? []).map((g, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded-[3px] flex-shrink-0"
                style={{
                  backgroundColor: g.coverage === 'full' ? 'rgba(15,110,86,0.12)' : g.coverage === 'partial' ? 'rgba(186,117,23,0.12)' : 'rgba(163,45,45,0.1)',
                  color: g.coverage === 'full' ? '#0F6E56' : g.coverage === 'partial' ? '#BA7517' : '#A32D2D',
                }}
              >
                {g.coverage}
              </span>
              <span style={{ color: 'var(--serif-foreground)' }}>{g.guidance_point}</span>
            </div>
          ))}
          {(reasoning.evidence_gaps ?? []).length > 0 && (
            <div className="mt-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: '#A32D2D' }}>
                Gaps:
              </span>{' '}
              <span style={{ color: 'var(--serif-foreground)' }}>{reasoning.evidence_gaps.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CompiledView ──────────────────────────────────────────────────────────────

interface CompiledViewProps {
  dossier: DossierSummary;
  sections: DossierSection[];
  onClose: () => void;
}

export function CompiledView({ dossier, sections, onClose }: CompiledViewProps) {
  const flat = flattenSectionTree(sections);
  const allLinks = collectAllLinks(sections);
  const [activeId, setActiveId] = useState<string | null>(flat[0]?.id ?? null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Intersection observer for active TOC highlighting ────────────────────────
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const sectionEls = container.querySelectorAll('[data-section-id]');
    if (!sectionEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.getAttribute('data-section-id') ?? null);
            break;
          }
        }
      },
      { root: container, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    sectionEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [flat.length]);

  // ── Jump to section ──────────────────────────────────────────────────────────
  function handleTocClick(sectionId: string) {
    const el = contentRef.current?.querySelector(`[data-section-id="${sectionId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--serif-background)' }}
    >
      {/* Fixed header bar */}
      <div
        className="flex items-center justify-between px-8 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
      >
        <div>
          <h1 className="font-playfair text-xl font-normal" style={{ color: 'var(--serif-foreground)' }}>
            {dossier.title}
          </h1>
          <p className="font-mono text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
            {dossier.libraryName}
            {dossier.libraryIndication ? ` · ${dossier.libraryIndication}` : ''}
            {dossier.libraryProduct ? ` (${dossier.libraryProduct})` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            title="Export — coming in Session 6"
            className="px-4 py-2 rounded-[6px] text-sm border transition-all opacity-40 cursor-not-allowed"
            style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-foreground)' }}
          >
            Export
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] text-sm transition-all hover:opacity-70"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* TOC */}
        <div
          className="flex-shrink-0 overflow-y-auto py-3"
          style={{
            width: '200px',
            borderRight: '1px solid var(--serif-border)',
            backgroundColor: 'var(--serif-muted)',
          }}
        >
          <p className="font-mono text-[9px] font-medium tracking-[0.12em] uppercase px-3 mb-2" style={{ color: 'var(--serif-muted-foreground)' }}>
            Contents
          </p>
          {flat.map((s) => (
            <TocItem key={s.id} section={s} activeId={activeId} onClick={handleTocClick} />
          ))}
          {allLinks.length > 0 && (
            <button
              type="button"
              onClick={() => handleTocClick('__references')}
              className="w-full text-left px-3 py-1.5 text-xs mt-2 font-mono"
              style={{ color: 'var(--serif-muted-foreground)' }}
            >
              References
            </button>
          )}
        </div>

        {/* Document content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-12">
            {flat.map((section) => (
              <div key={section.id} data-section-id={section.id} className="mb-8">
                <div className="relative">
                  <SectionHeading level={section.level}>
                    <span className="font-mono text-sm mr-2" style={{ color: 'var(--serif-accent)' }}>
                      {section.number}
                    </span>
                    {section.title}
                  </SectionHeading>

                  {/* Source badge */}
                  {section.currentContent && (
                    <span
                      className="absolute top-0 right-0 font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-[3px]"
                      style={{ backgroundColor: 'var(--serif-muted)', color: 'var(--serif-muted-foreground)' }}
                    >
                      {SOURCE_LABELS[section.currentContent.source] ?? section.currentContent.source}
                    </span>
                  )}
                </div>

                {section.currentContent ? (
                  <>
                    {/* Render content HTML — [#N] citations styled gold */}
                    <div
                      className="prose-compiled"
                      style={{ color: 'var(--serif-foreground)', fontSize: '14px', lineHeight: '1.75' }}
                      dangerouslySetInnerHTML={{ __html: section.currentContent.content }}
                    />
                    <style>{`
                      .prose-compiled p { margin-bottom: 0.75em; }
                      .prose-compiled h2, .prose-compiled h3 { font-family: var(--font-playfair, "Playfair Display", serif); font-weight: 400; margin: 1em 0 0.5em; }
                      .prose-compiled ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.75em; }
                      .prose-compiled ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.75em; }
                      .prose-compiled li { margin-bottom: 0.25em; }
                      .prose-compiled table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                      .prose-compiled th, .prose-compiled td { border: 1px solid var(--serif-border); padding: 6px 10px; text-align: left; font-size: 13px; }
                      .prose-compiled th { background: var(--serif-muted); font-weight: 600; }
                    `}</style>
                    <SectionReasoningToggle section={section} />
                  </>
                ) : (
                  <p className="italic text-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
                    — Section pending —
                  </p>
                )}
              </div>
            ))}

            {/* Reference list */}
            {allLinks.length > 0 && (
              <div data-section-id="__references" className="mt-12 pt-8" style={{ borderTop: '1px solid var(--serif-border)' }}>
                <h2 className="font-playfair text-2xl font-normal mb-6" style={{ color: 'var(--serif-foreground)' }}>
                  References
                </h2>
                <ol className="flex flex-col gap-3">
                  {allLinks.map((link) => (
                    <li key={link.articleNumber} className="flex gap-3 text-sm" style={{ color: 'var(--serif-foreground)' }}>
                      <span className="font-mono text-[10px] font-medium flex-shrink-0 w-8 mt-0.5" style={{ color: 'var(--serif-accent)' }}>
                        [{link.articleNumber}]
                      </span>
                      <span>
                        {link.authors?.join(', ') || ''}
                        {link.authors?.length ? '. ' : ''}
                        <span className="italic">{link.title}</span>
                        {link.journal ? `. ${link.journal}` : ''}
                        {link.pubDate ? `. ${link.pubDate}` : ''}.
                        {link.pubmedUrl && (
                          <>
                            {' '}
                            <a
                              href={link.pubmedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline transition-opacity hover:opacity-70"
                              style={{ color: 'var(--serif-accent)' }}
                            >
                              PubMed
                            </a>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
