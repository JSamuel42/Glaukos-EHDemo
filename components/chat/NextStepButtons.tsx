'use client';

import { ArrowRight } from 'lucide-react';
import { useChatPanel } from './ChatPanelContext';

interface Props {
  options: string[];
  /**
   * `disabled` is true for any assistant message that is NOT the latest, OR
   * when a stream is in-flight. Disabled buttons stay visible (40% opacity)
   * so the user can see the choices that were on offer earlier — useful for
   * demoability — but click is suppressed.
   */
  disabled: boolean;
}

/**
 * Pill-shaped buttons rendered below assistant messages that ended with a
 * `**Choose next step:**` block. Clicking submits the option label as the
 * next user message via the chat panel's programmatic sendMessage. The
 * rounded-full shape distinguishes these in-message actions from the
 * rounded-md toolbar actions (Summarise, AskAI).
 */
export function NextStepButtons({ options, disabled }: Props) {
  const { sendMessage, isStreaming } = useChatPanel();

  function handleClick(option: string) {
    if (disabled || isStreaming) return;
    void sendMessage({ content: option, isSuggestedQuestion: true });
  }

  const interactive = !disabled && !isStreaming;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((opt, i) => (
        <button
          key={`${i}-${opt}`}
          type="button"
          data-chat-trigger
          onClick={() => handleClick(opt)}
          disabled={!interactive}
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium rounded-full
            bg-[rgba(14,27,44,0.06)] text-[color:var(--evhub-navy)]
            border border-[rgba(14,27,44,0.15)]
            transition-colors
            hover:bg-[rgba(93,202,165,0.12)] hover:border-[rgba(93,202,165,0.45)]
            disabled:opacity-40 disabled:cursor-not-allowed
            disabled:hover:bg-[rgba(14,27,44,0.06)] disabled:hover:border-[rgba(14,27,44,0.15)]
          "
        >
          <span>{opt}</span>
          <ArrowRight size={12} className="opacity-60" />
        </button>
      ))}
    </div>
  );
}
