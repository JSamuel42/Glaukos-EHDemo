'use client';

import { useRouter } from 'next/navigation';
import * as Popover from '@radix-ui/react-popover';
import { ArrowRight } from 'lucide-react';
import { VALUE_MESSAGES, DOMAIN_BY_KEY, type ValueMessage } from '@/lib/value-story/data';

interface Props {
  messageIds: string[];
  reinforceText: string;
}

/**
 * The "Reinforce Core Value Messages" panel on the right side of an
 * expanded objection card. Renders the reinforce paragraph plus a chip
 * for each linked Value Story message ID. Clicking a chip opens a Radix
 * popover with the message's full text and a button to deep-link into
 * the Value Story module — first cross-module navigation pattern in
 * the demo.
 */
export default function ReinforceMessagePopover({ messageIds, reinforceText }: Props) {
  const router = useRouter();
  const messages: ValueMessage[] = messageIds
    .map(id => VALUE_MESSAGES.find(m => m.id === id))
    .filter((m): m is ValueMessage => Boolean(m));

  return (
    <div className="rounded-md bg-purple-50 border border-purple-200 p-3 flex-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-purple-700 mb-1.5">
        Reinforce Core Value Messages
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{reinforceText}</p>

      {messages.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {messages.map(m => (
            <Popover.Root key={m.id}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-white border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  {m.id}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  align="start"
                  sideOffset={6}
                  collisionPadding={8}
                  className="z-50 max-w-md rounded-lg bg-white shadow-xl ring-1 ring-slate-200 p-4"
                >
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wide text-purple-600 mb-1">
                    Value Message {m.id} · {DOMAIN_BY_KEY[m.domain].name}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{m.text}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/payer-value-story')}
                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    style={{ color: 'var(--evhub-navy)' }}
                  >
                    Open in Value Story
                    <ArrowRight size={12} />
                  </button>
                  <Popover.Arrow className="fill-white" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ))}
        </div>
      )}
    </div>
  );
}
