'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Sparkles, X, RotateCcw, Send, ArrowDown } from 'lucide-react';
import type { ModuleKey } from '@/lib/modules';
import type { ChatMessage, ChatRequestBody } from '@/lib/chat/types';
import { getChatConfig } from '@/lib/chat/module-registry';
import { suggestedQuestionsByCategory } from '@/lib/askgvd/data';
import { useChatPanel } from './ChatPanelContext';
import { renderWithCitations } from './CitationRenderer';
import SuggestedQuestions from './SuggestedQuestions';
import { NextStepButtons } from './NextStepButtons';
import { parseNextStepBlock } from '@/lib/chat/parse-next-step';
import { cn } from '@/lib/cn';

const DISCLAIMER = 'AI can make mistakes, always double check responses';

function makeId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Streams the SSE response into onText/onError/onDone callbacks. Buffer-aware:
 * chunks can split mid-event, so we keep a trailing buffer and only consume
 * complete `data: ...\n\n` frames.
 */
async function consumeStream(
  res: Response,
  onText: (chunk: string) => void,
  onError: (msg: string) => void,
  onDone: () => void,
) {
  if (!res.body) {
    onError('Empty response body');
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        if (!frame.startsWith('data: ')) continue;
        const data = frame.slice(6);
        if (data === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data) as { text?: string; error?: string };
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (typeof parsed.text === 'string') {
            onText(parsed.text);
          }
        } catch {
          // skip malformed frame
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Stream error');
  }
}

export default function ChatPanel({ moduleKey }: { moduleKey: ModuleKey }) {
  const config = getChatConfig(moduleKey);
  const {
    attachedItems,
    setAttachedItems,
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    resetConversation,
    lastMessageModuleKey,
    setLastMessageModuleKey,
    onCitationClick,
    isStreaming: streaming,
    setIsStreaming,
    customSuggestedQuestions,
    moduleContext,
    _registerSendImpl,
  } = useChatPanel();

  const [input, setInput] = useState('');
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userScrolledUpRef = useRef(false);
  const panelRef = useRef<HTMLElement | null>(null);

  // Click-outside-to-collapse. While the panel is open, a mousedown anywhere
  // outside the panel (and not on an element opted-out via `data-chat-trigger`)
  // closes it. The trigger attribute lets future buttons (e.g. Summarise)
  // open / interact with the panel without auto-closing it.
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (target.closest('[data-chat-trigger]')) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Auto-scroll to bottom on new content unless user scrolled up
  useEffect(() => {
    if (userScrolledUpRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const scrolledUp = distanceFromBottom > 80;
    userScrolledUpRef.current = scrolledUp;
    setShowJumpToLatest(scrolledUp && messages.length > 0);
  }

  function jumpToLatest() {
    userScrolledUpRef.current = false;
    setShowJumpToLatest(false);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  function reset() {
    resetConversation();
    setShowJumpToLatest(false);
    userScrolledUpRef.current = false;
  }

  async function send(args: {
    content: string;
    isSuggestedQuestion?: boolean;
    attachedItemIdsOverride?: string[];
  }) {
    const trimmed = args.content.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: trimmed };
    const assistantId = makeId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    // Snapshot the previous module so we can include it in the request body if changed
    const previousModuleKey = lastMessageModuleKey;
    const messagesAtSendTime = messages;

    setMessages(curr => [...curr, userMsg, assistantMsg]);
    setLastMessageModuleKey(moduleKey);
    setInput('');
    setIsStreaming(true);

    // Pages can pass an explicit attachedItemIdsOverride when they have just
    // queued setAttachedItems in the same event handler — reading from the
    // provider's `attachedItems` here would otherwise be one render stale.
    const attachedIds =
      args.attachedItemIdsOverride ?? attachedItems.map(a => a.id);

    const requestBody: ChatRequestBody = {
      moduleKey,
      attachedItemIds: attachedIds,
      messages: [...messagesAtSendTime, userMsg].map(m => ({ role: m.role, content: m.content })),
      isSuggestedQuestion: args.isSuggestedQuestion,
      previousModuleKey:
        previousModuleKey && previousModuleKey !== moduleKey ? previousModuleKey : undefined,
      moduleContext: moduleContext ?? undefined,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        let errMsg = `Request failed (${res.status})`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) errMsg = data.error;
        } catch {
          // ignore
        }
        setMessages(curr =>
          curr.map(m =>
            m.id === assistantId ? { ...m, error: errMsg, isStreaming: false } : m,
          ),
        );
        setIsStreaming(false);
        return;
      }

      await consumeStream(
        res,
        chunk => {
          setMessages(curr =>
            curr.map(m => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          );
        },
        msg => {
          setMessages(curr =>
            curr.map(m =>
              m.id === assistantId ? { ...m, error: msg, isStreaming: false } : m,
            ),
          );
        },
        () => {
          setMessages(curr =>
            curr.map(m => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
          );
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setMessages(curr =>
        curr.map(m =>
          m.id === assistantId ? { ...m, error: msg, isStreaming: false } : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send({ content: input });
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send({ content: input });
    }
  }

  // Click handler for config-driven SuggestedQuestions empty-state buttons.
  // Page-supplied custom presets (e.g. Library's filter-and-summarise flow)
  // come through `customSuggestedQuestions` on the context with their own
  // onClick handlers, so this fallback only fires for the static config
  // entries on Ask GVD / DocuHub / Value Story / Objection / Sci Narrative
  // / Comparative Data.
  function handleSuggestedQuestionPick(q: { id: string; text: string }) {
    void send({ content: q.text, isSuggestedQuestion: true });
  }

  // Register this panel's send as the context's sendMessage implementation.
  // Re-registering every render keeps the closure fresh (latest messages,
  // attachedItems, moduleKey, etc.). The cleanup clears the ref so a page
  // calling sendMessage after the panel unmounts becomes a no-op.
  useEffect(() => {
    _registerSendImpl(send);
    return () => _registerSendImpl(null);
  });

  const showEmptyState = messages.length === 0;
  const showAttachments = config.supportsAttachments && attachedItems.length > 0;
  const attachmentNoun =
    attachedItems[0]?.kind === 'document' ? 'Documents' : 'Publications';

  // Ask GVD module uses runtime-loaded suggested questions grouped by category;
  // other modules can use the in-config suggestedQuestions if provided.
  const showRichSuggestions = showEmptyState && moduleKey === 'ask-gvd';
  const askGvdGroups = showRichSuggestions
    ? suggestedQuestionsByCategory().map(g => ({
        category: g.category,
        questions: g.questions.map(q => ({ id: q.id, text: q.text })),
      }))
    : [];

  return (
    <>
      {/* Always-visible vertical rail trigger when collapsed */}
      {!isOpen && (
        <button
          type="button"
          data-chat-trigger
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat"
          className="fixed top-14 right-0 bottom-0 z-30 w-10 flex flex-col items-center justify-center gap-2 transition-colors"
          style={{
            background: 'linear-gradient(180deg, var(--evhub-navy) 0%, #0A1726 100%)',
            color: '#FFFFFF',
          }}
        >
          <Sparkles size={16} className="text-[color:var(--evhub-mint)]" />
          <span
            className="text-[10px] uppercase tracking-[0.18em] font-mono"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Ask AI
          </span>
        </button>
      )}

      <aside
        ref={panelRef}
        className={cn(
          'fixed top-14 right-0 bottom-0 z-30 bg-white border-l border-serif-border shadow-2xl flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: 'min(540px, 95vw)' }}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-serif-border"
          style={{ backgroundColor: 'var(--evhub-navy)' }}
        >
          <div className="flex items-center gap-2 text-white">
            <Sparkles size={16} className="text-[color:var(--evhub-mint)]" />
            <span className="font-playfair text-base">{config.panelTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={reset}
              aria-label="Reset chat"
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              disabled={streaming}
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {showAttachments && (
          <div className="px-4 py-3 border-b border-serif-border bg-serif-muted/40">
            <div className="text-[11px] uppercase tracking-[0.14em] font-mono text-serif-muted-foreground mb-2">
              Attached {attachmentNoun} ({attachedItems.length})
            </div>
            <ul className="flex flex-col gap-1.5">
              {attachedItems.slice(0, 5).map(item => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2 bg-white border border-serif-border rounded px-2.5 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-serif-foreground truncate">{item.title}</div>
                    {item.subtitle && (
                      <div className="text-[10px] text-serif-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() =>
                      setAttachedItems(attachedItems.filter(i => i.id !== item.id))
                    }
                    className="text-serif-muted-foreground hover:text-serif-foreground p-0.5"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
              {attachedItems.length > 5 && (
                <li className="text-[10px] text-serif-muted-foreground px-1">
                  +{attachedItems.length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* AskAI status band — centred pulsing dot + label, sits below the
            attachments band (or directly below the header when no attachments
            are present) and above the conversation area. Larger and more
            prominent than the prior in-header dot so the AI's thinking state
            is unambiguous. */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-serif-border bg-white">
          <span
            className={cn(
              // 2x the prior 12px dot — clearly visible across a meeting
              // room. Halo widens proportionally so the soft mint surround
              // still reads as a glow rather than a hairline ring.
              'inline-block h-6 w-6 rounded-full shadow-[0_0_0_5px_rgba(93,202,165,0.18)]',
              streaming ? 'animate-ai-thinking' : '',
            )}
            style={{ backgroundColor: 'var(--evhub-mint)' }}
            aria-label={streaming ? 'AI is thinking' : 'AI ready'}
            role="status"
          />
          <span className="font-playfair text-base text-serif-foreground tracking-[0.01em]">
            Ask<sup className="text-[0.62em] font-sans align-super ml-0.5 tracking-wider">AI</sup>
          </span>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 relative"
        >
          {showEmptyState && (
            <div className="text-center py-4">
              <p className="text-sm text-serif-muted-foreground mb-2">
                {config.emptyStateBody}
              </p>

              {/* Empty-state preset rendering precedence:
                  1. Page-supplied customSuggestedQuestions (Library presets) win
                     when present — they run page-owned handlers (filter-then-
                     summarise), not the default submit-question-text flow.
                  2. Otherwise Ask GVD's grouped panel.
                  3. Otherwise the config's flat suggestedQuestions. */}
              {customSuggestedQuestions && customSuggestedQuestions.length > 0 && (
                <SuggestedQuestions
                  mode="custom"
                  customQuestions={customSuggestedQuestions}
                  disabled={streaming}
                />
              )}

              {!(customSuggestedQuestions && customSuggestedQuestions.length > 0)
                && showRichSuggestions
                && askGvdGroups.length > 0 && (
                <SuggestedQuestions
                  mode="grouped"
                  groups={askGvdGroups}
                  onPick={handleSuggestedQuestionPick}
                  disabled={streaming}
                />
              )}

              {!(customSuggestedQuestions && customSuggestedQuestions.length > 0)
                && !showRichSuggestions
                && config.suggestedQuestions
                && config.suggestedQuestions.length > 0 && (
                <SuggestedQuestions
                  mode="flat"
                  questions={config.suggestedQuestions.map(q => ({ id: q.id, text: q.text }))}
                  onPick={handleSuggestedQuestionPick}
                  disabled={streaming}
                />
              )}
            </div>
          )}

          {!showEmptyState && (() => {
            // "Latest assistant" = most recent assistant message AND nothing
            // newer from the user. Buttons on older assistant turns remain
            // visible but inert.
            const lastAssistantIdx = messages
              .map(m => m.role)
              .lastIndexOf('assistant');
            const userAfterLastAssistant =
              lastAssistantIdx >= 0 &&
              messages
                .slice(lastAssistantIdx + 1)
                .some(m => m.role === 'user');

            return (
              <ul className="flex flex-col gap-3">
                {messages.map((m, idx) => {
                  const isAssistant = m.role === 'assistant';
                  // Only run the next-step parser on assistant messages, and
                  // only once streaming for that message has finished — the
                  // partial block would match prematurely if Claude paused
                  // mid-list, and we'd then flip back to raw bullets when
                  // more text arrived.
                  const parsed = isAssistant && !m.isStreaming
                    ? parseNextStepBlock(m.content)
                    : { prose: m.content, options: null as string[] | null };
                  const proseToRender = isAssistant ? parsed.prose : m.content;
                  const isLatestAssistant =
                    isAssistant &&
                    idx === lastAssistantIdx &&
                    !userAfterLastAssistant;

                  return (
                    <li key={m.id} className="flex flex-col">
                      <div
                        className={cn(
                          'rounded-lg px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words',
                          m.role === 'user'
                            ? 'self-end bg-[rgba(14,27,44,0.08)] text-serif-foreground'
                            : 'self-start bg-serif-muted text-serif-foreground',
                        )}
                      >
                        {isAssistant
                          ? renderWithCitations(proseToRender, onCitationClick)
                          : m.content}
                        {isAssistant && m.isStreaming && (
                          <span
                            className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse"
                            style={{ backgroundColor: 'var(--evhub-mint)' }}
                          />
                        )}
                        {m.error && (
                          <span className="block mt-1.5 text-xs" style={{ color: '#9C2A2A' }}>
                            {m.error}
                          </span>
                        )}
                      </div>
                      {isAssistant && parsed.options && (
                        <div className="self-start max-w-[85%]">
                          <NextStepButtons
                            options={parsed.options}
                            disabled={!isLatestAssistant}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            );
          })()}

          {showJumpToLatest && (
            <button
              type="button"
              onClick={jumpToLatest}
              className="sticky bottom-2 left-1/2 -translate-x-1/2 ml-[50%] flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-md"
              style={{ backgroundColor: 'var(--evhub-navy)', color: '#FFFFFF' }}
            >
              <ArrowDown size={12} /> Jump to latest
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-serif-border px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              disabled={streaming}
              placeholder={streaming ? 'Generating…' : 'Start by asking a question'}
              className="flex-1 resize-none px-3 py-2 rounded-md border border-serif-border bg-white text-sm text-serif-foreground placeholder:text-serif-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[color:var(--evhub-mint)] focus:border-transparent disabled:bg-serif-muted/40"
            />
            <button
              type="submit"
              disabled={streaming || input.trim().length === 0}
              aria-label="Send message"
              className="flex items-center justify-center w-9 h-9 rounded-md text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--evhub-mint)' }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-serif-muted-foreground/80 mt-2 text-center">
            {DISCLAIMER}
          </p>
        </form>
      </aside>
    </>
  );
}
