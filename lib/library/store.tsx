'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ARTICLES, type Article } from '@/lib/library/data';

/**
 * In-memory Library store (DEMO_MODE, no DB).
 *
 * The canonical Library is the static `ARTICLES` set from Phase 1. The
 * Literature Reviews module pushes selected search results here at runtime;
 * pushed articles live in React state for the session and are merged ahead of
 * the static set on the Library page. Refreshing the browser resets to the
 * static 22 — by design for the demo.
 *
 * Dedupe is by PMID (falling back to article id) so pushing the curated iStent
 * example lands only the articles not already in the Library.
 */

function keyOf(a: Article): string {
  return a.pmid ?? a.id;
}

export interface PushResult {
  added: number;
  deduped: number;
  addedIds: string[];
}

/** Free-text Article fields editable inline in admin mode. */
type EditableField =
  | 'title'
  | 'product_display'
  | 'authors'
  | 'journal'
  | 'pub_type'
  | 'study_type'
  | 'geography'
  | 'sponsor'
  | 'population'
  | 'interventions';

interface LibraryStoreValue {
  /** Runtime-pushed articles (session only), newest first. */
  pushedArticles: Article[];
  /** Static + pushed (with admin edits applied), pushed first so new articles surface at the top. */
  allArticles: Article[];
  /** Set of PMIDs/ids currently in the Library (static + pushed). */
  existingKeys: Set<string>;
  /** Append articles, skipping any whose PMID/id is already present. */
  pushArticles: (articles: Article[]) => PushResult;
  /** Admin-mode inline edit — overlay a single field value for one article
   *  (session only, lossy on refresh). */
  updateArticleField: (id: string, field: EditableField, value: string) => void;
}

const LibraryStoreContext = createContext<LibraryStoreValue | null>(null);

export function LibraryStoreProvider({ children }: { children: React.ReactNode }) {
  const [pushedArticles, setPushedArticles] = useState<Article[]>([]);
  // Admin-mode field overrides: articleId → { field → value }. Applied on top
  // of the static + pushed sets. Session-only, reset on refresh.
  const [edits, setEdits] = useState<Record<string, Partial<Article>>>({});

  const existingKeys = useMemo(() => {
    const s = new Set<string>(ARTICLES.map(keyOf));
    pushedArticles.forEach(a => s.add(keyOf(a)));
    return s;
  }, [pushedArticles]);

  const allArticles = useMemo(() => {
    const merged = [...pushedArticles, ...ARTICLES];
    if (Object.keys(edits).length === 0) return merged;
    return merged.map(a => (edits[a.id] ? { ...a, ...edits[a.id] } : a));
  }, [pushedArticles, edits]);

  const updateArticleField = useCallback(
    (id: string, field: EditableField, value: string) => {
      setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    },
    [],
  );

  const pushArticles = useCallback((articles: Article[]): PushResult => {
    // Compute additions synchronously from the static set + the currently
    // pushed set (closure) so the caller gets an accurate result immediately.
    // Dedupe against the static set, the already-pushed set, and within the
    // incoming batch itself.
    const present = new Set<string>(ARTICLES.map(keyOf));
    pushedArticles.forEach(a => present.add(keyOf(a)));

    const additions: Article[] = [];
    const result: PushResult = { added: 0, deduped: 0, addedIds: [] };
    const batchSeen = new Set<string>();
    for (const a of articles) {
      const k = keyOf(a);
      if (present.has(k) || batchSeen.has(k)) {
        result.deduped += 1;
        continue;
      }
      batchSeen.add(k);
      additions.push(a);
      result.added += 1;
      result.addedIds.push(a.id);
    }

    if (additions.length > 0) {
      setPushedArticles(prev => [...additions, ...prev]);
    }
    return result;
  }, [pushedArticles]);

  const value = useMemo<LibraryStoreValue>(
    () => ({ pushedArticles, allArticles, existingKeys, pushArticles, updateArticleField }),
    [pushedArticles, allArticles, existingKeys, pushArticles, updateArticleField],
  );

  return (
    <LibraryStoreContext.Provider value={value}>
      {children}
    </LibraryStoreContext.Provider>
  );
}

export function useLibraryStore(): LibraryStoreValue {
  const ctx = useContext(LibraryStoreContext);
  if (!ctx) {
    throw new Error('useLibraryStore must be used within a LibraryStoreProvider');
  }
  return ctx;
}
