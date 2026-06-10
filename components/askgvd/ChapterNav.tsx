'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import type { GvdNav } from '@/lib/askgvd/data';
import { cn } from '@/lib/cn';

interface Props {
  nav: GvdNav;
  activeChapter: string;
  activeSection: string | null;
  onSelectChapter: (chapterNumber: string) => void;
  onSelectSection: (sectionNumber: string) => void;
}

export default function ChapterNav({
  nav,
  activeChapter,
  activeSection,
  onSelectChapter,
  onSelectSection,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([activeChapter]));

  function toggleExpand(num: string) {
    setExpanded(curr => {
      const next = new Set(curr);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  const activeChapterMeta = nav.chapters.find(c => c.number === activeChapter);
  const triggerLabel = activeChapterMeta
    ? `${activeChapterMeta.number}. ${activeChapterMeta.title}`
    : nav.document_title;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-serif-border bg-white hover:border-serif-muted-foreground/50 transition-colors text-sm text-serif-foreground max-w-[460px]"
          aria-label="Open chapter navigation"
        >
          <BookOpen size={14} className="text-[color:var(--evhub-navy)] flex-shrink-0" />
          <span className="truncate font-medium">{triggerLabel}</span>
          <ChevronDown
            size={14}
            className={cn(
              'text-serif-muted-foreground transition-transform flex-shrink-0',
              open && 'rotate-180',
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-40 w-96 max-h-[70vh] overflow-hidden rounded-md border border-serif-border bg-white shadow-xl flex flex-col"
        >
          <div className="px-4 py-3 border-b border-serif-border bg-serif-muted/30">
            <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-serif-muted-foreground mb-1">
              Table of contents
            </div>
            <div className="text-xs text-serif-foreground leading-snug font-medium">
              {nav.document_title}
            </div>
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            {nav.chapters.map(chapter => {
              const isExpanded = expanded.has(chapter.number);
              const isActive = activeChapter === chapter.number;
              return (
                <div key={chapter.number} className="border-b border-serif-border/40 last:border-b-0">
                  <div
                    className={cn(
                      'flex items-center pl-1.5 pr-3 py-2 hover:bg-serif-muted/30 transition-colors',
                      isActive && 'bg-[rgba(93,202,165,0.10)]',
                    )}
                  >
                    {chapter.sections.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(chapter.number)}
                        className="p-0.5 mr-1 text-serif-muted-foreground hover:text-serif-foreground"
                        aria-label={isExpanded ? `Collapse ${chapter.title}` : `Expand ${chapter.title}`}
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                    ) : (
                      <span className="w-5" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChapter(chapter.number);
                        setOpen(false);
                      }}
                      className="flex items-baseline gap-2 flex-1 text-left"
                    >
                      <span
                        className={cn(
                          'text-[10px] font-mono text-serif-muted-foreground',
                          isActive && 'text-[color:var(--evhub-navy)] font-semibold',
                        )}
                      >
                        {chapter.number}
                      </span>
                      <span
                        className={cn(
                          'text-sm text-serif-foreground',
                          isActive ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {chapter.title}
                      </span>
                      <span className="ml-auto text-[10px] text-serif-muted-foreground/70 font-mono">
                        p.{chapter.page_num}
                      </span>
                    </button>
                  </div>
                  {isExpanded && chapter.sections.length > 0 && (
                    <ul className="pb-1">
                      {chapter.sections.map(section => {
                        const isSecActive = activeSection === section.number;
                        return (
                          <li key={section.number}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectSection(section.number);
                                setOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-baseline gap-2 pl-9 pr-3 py-1.5 text-left hover:bg-serif-muted/30 transition-colors',
                                isSecActive && 'bg-[rgba(93,202,165,0.10)]',
                              )}
                            >
                              <span
                                className={cn(
                                  'text-[10px] font-mono text-serif-muted-foreground',
                                  isSecActive && 'text-[color:var(--evhub-navy)] font-semibold',
                                )}
                              >
                                {section.number}
                              </span>
                              <span
                                className={cn(
                                  'text-xs text-serif-foreground/85 truncate',
                                  isSecActive && 'font-semibold text-serif-foreground',
                                )}
                              >
                                {section.title}
                              </span>
                              <span className="ml-auto text-[10px] text-serif-muted-foreground/60 font-mono">
                                p.{section.page_num}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
