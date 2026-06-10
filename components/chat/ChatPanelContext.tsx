'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AttachedItem, ChatMessage } from '@/lib/chat/types';
import type { ModuleKey } from '@/lib/modules';

type CitationClickHandler = (section: string, page: number) => void;

/**
 * Custom suggested-question entry registered by a module page. Replaces the
 * config-driven flat presets for that module while the page is mounted.
 * Click runs the page-supplied handler — used by Library to apply a filter
 * to the table and trigger a contextual summary instead of submitting raw
 * question text.
 */
export interface CustomSuggestedQuestion {
  id: string;
  label: string;
  onClick: () => void | Promise<void>;
}

export interface SendMessageArgs {
  content: string;
  isSuggestedQuestion?: boolean;
  /**
   * Explicit list of attachment IDs to send with this request. Bypasses the
   * provider's `attachedItems` state — useful when the caller has just queued
   * `setAttachedItems(...)` in the same event handler and would otherwise
   * read stale state inside the chat panel's send closure.
   */
  attachedItemIdsOverride?: string[];
}

type SendMessageImpl = (args: SendMessageArgs) => Promise<void>;

interface ChatPanelContextValue {
  // Items attached to the current chat turn (e.g., publications selected in
  // the Library table). Provided per-module by the page that owns selection.
  attachedItems: AttachedItem[];
  setAttachedItems: (items: AttachedItem[]) => void;

  // Whether the chat panel is currently visible.
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Persistent conversation. Spec: one conversation follows the user across
  // modules within a session; refresh clears. Lifting this into the context
  // (vs the panel's local state) is what makes the persistence work.
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  resetConversation: () => void;

  // Tracks the module the user was in when they sent the most recent message.
  // When the next message is sent from a different module, the chat API gets
  // previousModuleKey so the model can acknowledge the shift in prose.
  lastMessageModuleKey: ModuleKey | null;
  setLastMessageModuleKey: (key: ModuleKey | null) => void;

  // Optional handler for clicking inline citations. Provided by per-module
  // pages that own the document being cited (e.g. Ask GVD's page scrolls
  // the document body to the cited section). Other modules can leave it
  // unset; citation buttons render but click is a no-op.
  onCitationClick: CitationClickHandler | undefined;
  setOnCitationClick: (handler: CitationClickHandler | undefined) => void;

  // True while a chat request is in-flight (post-submit, mid-stream).
  // Exposed on the context so pages can disable their own chat-trigger
  // buttons (e.g. Library's Summarise) while a response is streaming.
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;

  // Page-supplied empty-state presets that override the module's config
  // suggestions. When non-null and non-empty, the chat panel renders these
  // instead. Pages should set on mount and clear on unmount.
  customSuggestedQuestions: CustomSuggestedQuestion[] | null;
  setCustomSuggestedQuestions: (qs: CustomSuggestedQuestion[] | null) => void;

  // Programmatic send. The chat panel registers its real send implementation
  // via `_registerSendImpl` on mount; pages call `sendMessage` to push a
  // message into the conversation without going through the chat input form.
  sendMessage: SendMessageImpl;
  _registerSendImpl: (impl: SendMessageImpl | null) => void;
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function ChatPanelProvider({
  children,
  initialOpen = false,
}: {
  children: ReactNode;
  initialOpen?: boolean;
}) {
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastMessageModuleKey, setLastMessageModuleKey] = useState<ModuleKey | null>(null);
  const [onCitationClick, setOnCitationClickState] = useState<CitationClickHandler | undefined>(
    undefined,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [customSuggestedQuestions, setCustomSuggestedQuestions] =
    useState<CustomSuggestedQuestion[] | null>(null);

  const setOnCitationClick = useCallback((handler: CitationClickHandler | undefined) => {
    // Wrap in a setter that doesn't lose the function reference. React's
    // useState would otherwise call our function with prevState. Use a
    // functional updater to install the handler directly.
    setOnCitationClickState(() => handler);
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setLastMessageModuleKey(null);
  }, []);

  // Ref-stored send implementation. The chat panel registers its real send
  // function on mount (re-registering on every render so the closure stays
  // fresh); pages call `sendMessage` which dispatches through this ref.
  const sendImplRef = useRef<SendMessageImpl | null>(null);
  const _registerSendImpl = useCallback((impl: SendMessageImpl | null) => {
    sendImplRef.current = impl;
  }, []);
  const sendMessage = useCallback<SendMessageImpl>(async args => {
    const impl = sendImplRef.current;
    if (!impl) return;
    return impl(args);
  }, []);

  return (
    <ChatPanelContext.Provider
      value={{
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
        setOnCitationClick,
        isStreaming,
        setIsStreaming,
        customSuggestedQuestions,
        setCustomSuggestedQuestions,
        sendMessage,
        _registerSendImpl,
      }}
    >
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) throw new Error('useChatPanel must be used within ChatPanelProvider');
  return ctx;
}
