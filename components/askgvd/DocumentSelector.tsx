'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { FileText, ChevronDown, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { type GvdDocument } from '@/lib/askgvd/documents';

interface Props {
  documents: GvdDocument[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Dropdown for switching between GVDs available for the asset. Only
 * populated docs are clickable; the rest render as a "Coming soon" item
 * to convey the multi-GVD capability without faking content.
 */
export default function DocumentSelector({ documents, activeId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const active = documents.find(d => d.id === activeId) ?? documents[0];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-serif-border bg-white hover:border-serif-muted-foreground/50 transition-colors text-sm text-serif-foreground max-w-[360px]"
          aria-label="Select GVD document"
        >
          <FileText size={14} className="text-[color:var(--evhub-navy)] flex-shrink-0" />
          <span className="truncate font-medium">{active.label}</span>
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
          className="z-40 w-80 overflow-hidden rounded-md border border-serif-border bg-white shadow-xl flex flex-col"
        >
          <div className="px-4 py-2 border-b border-serif-border bg-serif-muted/30">
            <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-serif-muted-foreground">
              Available GVDs
            </div>
          </div>
          <ul className="py-1">
            {documents.map(doc => {
              const isActive = doc.id === activeId;
              const isDisabled = !doc.populated;
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onSelect(doc.id);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors text-sm',
                      isDisabled
                        ? 'text-serif-muted-foreground/70 cursor-not-allowed'
                        : 'text-serif-foreground hover:bg-serif-muted/40',
                      isActive && 'bg-[rgba(93,202,165,0.10)]',
                    )}
                  >
                    {isDisabled ? (
                      <Lock size={11} className="text-serif-muted-foreground/60 flex-shrink-0" />
                    ) : (
                      <FileText size={12} className="text-[color:var(--evhub-navy)] flex-shrink-0" />
                    )}
                    <span className={cn('truncate', isActive && 'font-semibold')}>{doc.label}</span>
                    {isDisabled && (
                      <span className="ml-auto text-[10px] uppercase tracking-[0.12em] font-mono text-serif-muted-foreground/70">
                        Coming soon
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
