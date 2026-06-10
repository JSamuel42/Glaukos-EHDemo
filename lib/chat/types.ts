import type { ModuleKey } from '@/lib/modules';

export interface AttachedItem {
  id: string;
  title: string;
  subtitle?: string;
  kind: 'publication' | 'document' | 'value-message' | 'scp-statement';
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatRequestBody {
  moduleKey: ModuleKey;
  attachedItemIds: string[];
  messages: { role: 'user' | 'assistant'; content: string }[];
  /** True when the user message originated from a clickable suggested-question card. */
  isSuggestedQuestion?: boolean;
  /** The module key the user was in at the time of the previous message (for context-shift acknowledgement). */
  previousModuleKey?: ModuleKey;
}
