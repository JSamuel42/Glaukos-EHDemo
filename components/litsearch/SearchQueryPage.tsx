'use client'

import { useReducer, useState } from 'react'
import type { LitSearchState, SearchResult, ScreeningDecision, SavedSearch, BatchSize, ClarificationQuestion, BooleanOp, BetweenBlockOp, BuildingBlockTerm, ScreeningResult } from '@/lib/litsearch/types'
import { DEFAULT_CRITERIA } from '@/lib/litsearch/searchCriteria'
import {
  DEMO_RETRIEVED_PMIDS,
  DEMO_RESULT_BY_PMID,
  DEMO_SCREENINGS,
} from '@/data/demo/litSearchExample'
import SearchBuilderTab from '@/components/litsearch/SearchBuilderTab'
import SearchResultsTab from '@/components/litsearch/SearchResultsTab'
import AbstractModal from '@/components/litsearch/AbstractModal'

type Action =
  | { type: 'SET_RESEARCH_QUESTION'; payload: string }
  | { type: 'SET_CLARIFICATION_MESSAGES'; payload: LitSearchState['clarificationMessages'] }
  | { type: 'APPEND_CLARIFICATION_MESSAGE'; payload: LitSearchState['clarificationMessages'][0] }
  | { type: 'SET_SCOPE_CONFIRMED'; payload: boolean }
  | { type: 'SET_SCOPE_SUMMARY'; payload: string }
  | { type: 'SET_FRAMEWORK'; payload: LitSearchState['framework'] }
  | { type: 'SET_BLOCKS'; payload: LitSearchState['blocks'] }
  | { type: 'SET_HIGHLIGHT_TERMS'; payload: LitSearchState['highlightTerms'] }
  | { type: 'REMOVE_HIGHLIGHT_TERM'; payload: string }
  | { type: 'ADD_HIGHLIGHT_TERM'; payload: LitSearchState['highlightTerms'][0] }
  | { type: 'SET_CRITERIA'; payload: LitSearchState['criteria'] }
  | { type: 'SET_FILTERS'; payload: Partial<LitSearchState['filters']> }
  | { type: 'SET_RESULTS'; payload: LitSearchState['results'] }
  | { type: 'UPDATE_SCREENING'; payload: ScreeningResult }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'SET_IS_SCREENING'; payload: boolean }
  | { type: 'SET_SCREENING_PROGRESS'; payload: { done: number; total: number } }
  | { type: 'INCREMENT_OVERRIDE_COUNT' }
  | { type: 'SET_CONFIDENCE_THRESHOLDS'; payload: LitSearchState['confidenceThresholds'] }
  | { type: 'SET_ACTIVE_TAB'; payload: LitSearchState['activeTab'] }
  | { type: 'SET_RESULTS_TAB'; payload: LitSearchState['resultsTab'] }
  | { type: 'SET_MODAL_ARTICLE'; payload: SearchResult | null }
  | { type: 'UPDATE_BLOCK_TERM_OPERATOR'; payload: { blockIndex: number; termIndex: number; operator: BooleanOp } }
  | { type: 'UPDATE_BLOCK_OPERATOR'; payload: { blockIndex: number; operator: BetweenBlockOp } }
  | { type: 'REMOVE_BLOCK_TERM'; payload: { blockIndex: number; termId: string } }
  | { type: 'ADD_BLOCK_TERM'; payload: { blockIndex: number; term: BuildingBlockTerm } }
  | { type: 'START_NEW_SEARCH' }
  | { type: 'SET_TOTAL_HITS'; payload: number }
  | { type: 'SET_RETRIEVED_PMIDS'; payload: string[] }
  | { type: 'ADD_SCREENED_PMIDS'; payload: string[] }
  | { type: 'SET_BATCH_SIZE'; payload: BatchSize }
  | { type: 'SET_SHOW_BATCH_PROMPT'; payload: boolean }
  | { type: 'SET_DEMO_LIMITED'; payload: boolean }
  | { type: 'APPEND_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_CLARIFICATION_QUESTIONS'; payload: ClarificationQuestion[] }
  | { type: 'UPDATE_CLARIFICATION_QUESTION'; payload: { id: string; patch: Partial<ClarificationQuestion> } }
  | { type: 'SET_IS_REFINING_QUERY'; payload: boolean }
  | { type: 'RESET' }

function reducer(state: LitSearchState, action: Action): LitSearchState {
  switch (action.type) {
    case 'SET_RESEARCH_QUESTION': return { ...state, researchQuestion: action.payload }
    case 'SET_CLARIFICATION_MESSAGES': return { ...state, clarificationMessages: action.payload }
    case 'APPEND_CLARIFICATION_MESSAGE': return { ...state, clarificationMessages: [...state.clarificationMessages, action.payload] }
    case 'SET_SCOPE_CONFIRMED': return { ...state, scopeConfirmed: action.payload }
    case 'SET_SCOPE_SUMMARY': return { ...state, scopeSummary: action.payload }
    case 'SET_FRAMEWORK': return { ...state, framework: action.payload }
    case 'SET_BLOCKS': return { ...state, blocks: action.payload }
    case 'SET_HIGHLIGHT_TERMS': return { ...state, highlightTerms: action.payload }
    case 'REMOVE_HIGHLIGHT_TERM': return { ...state, highlightTerms: state.highlightTerms.filter(t => t.id !== action.payload) }
    case 'ADD_HIGHLIGHT_TERM': return { ...state, highlightTerms: [...state.highlightTerms, action.payload] }
    case 'SET_CRITERIA': return { ...state, criteria: action.payload }
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_RESULTS': return { ...state, results: action.payload }
    case 'UPDATE_SCREENING': return { ...state, screenings: { ...state.screenings, [action.payload.pmid]: action.payload } }
    case 'SET_IS_SEARCHING': return { ...state, isSearching: action.payload }
    case 'SET_IS_SCREENING': return { ...state, isScreening: action.payload }
    case 'SET_SCREENING_PROGRESS': return { ...state, screeningProgress: action.payload }
    case 'INCREMENT_OVERRIDE_COUNT': return { ...state, overrideCount: state.overrideCount + 1 }
    case 'SET_CONFIDENCE_THRESHOLDS': return { ...state, confidenceThresholds: action.payload }
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload }
    case 'SET_RESULTS_TAB': return { ...state, resultsTab: action.payload }
    case 'SET_MODAL_ARTICLE': return { ...state, modalArticle: action.payload }
    case 'UPDATE_BLOCK_TERM_OPERATOR': {
      const blocks = state.blocks.map((b, bi) => {
        if (bi !== action.payload.blockIndex) return b
        return { ...b, terms: b.terms.map((t, ti) => ti === action.payload.termIndex ? { ...t, operator: action.payload.operator } : t) }
      })
      return { ...state, blocks }
    }
    case 'UPDATE_BLOCK_OPERATOR': {
      const blocks = state.blocks.map((b, bi) =>
        bi === action.payload.blockIndex ? { ...b, blockOperator: action.payload.operator } : b
      )
      return { ...state, blocks }
    }
    case 'REMOVE_BLOCK_TERM': {
      const blocks = state.blocks.map((b, bi) => {
        if (bi !== action.payload.blockIndex) return b
        return { ...b, terms: b.terms.filter(t => t.id !== action.payload.termId) }
      })
      return { ...state, blocks }
    }
    case 'ADD_BLOCK_TERM': {
      const blocks = state.blocks.map((b, bi) => {
        if (bi !== action.payload.blockIndex) return b
        return { ...b, terms: [...b.terms, action.payload.term] }
      })
      return { ...state, blocks }
    }
    case 'START_NEW_SEARCH': return {
      ...state,
      isSearching: true,
      totalHits: 0,
      retrievedPmids: [],
      screenedPmids: [],
      results: [],
      screenings: {},
      showBatchPrompt: false,
      demoLimited: false,
      screeningProgress: { done: 0, total: 0 },
    }
    case 'SET_TOTAL_HITS': return { ...state, totalHits: action.payload }
    case 'SET_RETRIEVED_PMIDS': return { ...state, retrievedPmids: action.payload }
    case 'ADD_SCREENED_PMIDS': {
      const next = new Set(state.screenedPmids)
      action.payload.forEach(p => next.add(p))
      return { ...state, screenedPmids: Array.from(next) }
    }
    case 'SET_BATCH_SIZE': return { ...state, batchSize: action.payload }
    case 'SET_SHOW_BATCH_PROMPT': return { ...state, showBatchPrompt: action.payload }
    case 'SET_DEMO_LIMITED': return { ...state, demoLimited: action.payload }
    case 'APPEND_RESULTS': {
      const seen = new Set(state.results.map(r => r.pmid))
      const additions = action.payload.filter(r => !seen.has(r.pmid))
      return { ...state, results: [...state.results, ...additions] }
    }
    case 'SET_CLARIFICATION_QUESTIONS': return { ...state, clarificationQuestions: action.payload }
    case 'UPDATE_CLARIFICATION_QUESTION': {
      const questions = state.clarificationQuestions.map(q =>
        q.id === action.payload.id ? { ...q, ...action.payload.patch } : q
      )
      return { ...state, clarificationQuestions: questions }
    }
    case 'SET_IS_REFINING_QUERY': return { ...state, isRefiningQuery: action.payload }
    case 'RESET': return getInitialState(null)
    default: return state
  }
}

function getInitialState(savedSearch: SavedSearch | null | undefined): LitSearchState {
  const batchDefaults = {
    totalHits: 0,
    retrievedPmids: [] as string[],
    screenedPmids: [] as string[],
    batchSize: 50 as BatchSize,
    showBatchPrompt: false,
    demoLimited: false,
  }
  const clarificationDefaults = {
    clarificationQuestions: [] as ClarificationQuestion[],
    isRefiningQuery: false,
  }
  if (savedSearch) {
    return {
      researchQuestion: savedSearch.researchQuestion,
      clarificationMessages: [],
      ...clarificationDefaults,
      scopeConfirmed: true,
      scopeSummary: '',
      framework: savedSearch.framework,
      blocks: savedSearch.blocks,
      highlightTerms: savedSearch.highlightTerms,
      criteria: savedSearch.criteria.length > 0 ? savedSearch.criteria : DEFAULT_CRITERIA,
      filters: savedSearch.filters,
      ...batchDefaults,
      results: [],
      screenings: {},
      isSearching: false,
      isScreening: false,
      screeningProgress: { done: 0, total: 0 },
      overrideCount: 0,
      confidenceThresholds: { high: 90, moderate: 80 },
      activeTab: 'builder',
      resultsTab: 'included',
      modalArticle: null,
    }
  }
  return {
    researchQuestion: '',
    clarificationMessages: [],
    ...clarificationDefaults,
    scopeConfirmed: false,
    scopeSummary: '',
    framework: 'PICO',
    blocks: [],
    highlightTerms: [],
    criteria: DEFAULT_CRITERIA,
    filters: { language: 'english' },
    ...batchDefaults,
    results: [],
    screenings: {},
    isSearching: false,
    isScreening: false,
    screeningProgress: { done: 0, total: 0 },
    overrideCount: 0,
    confidenceThresholds: { high: 90, moderate: 80 },
    activeTab: 'builder',
    resultsTab: 'included',
    modalArticle: null,
  }
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

export interface SearchQueryPageProps {
  initialSavedSearch?: SavedSearch | null
}

export default function SearchQueryPage({ initialSavedSearch }: SearchQueryPageProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => getInitialState(initialSavedSearch))
  const [searchName, setSearchName] = useState(initialSavedSearch?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  // DEMO_MODE: saving is a local affordance only — there is no DB.
  async function handleSaveSearch() {
    setIsSaving(true)
    await delay(400)
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 2000)
    setIsSaving(false)
  }

  // Stage 1 — "esearch": surface the pre-baked retrieved PMID set + batch prompt.
  async function handleRunSearch() {
    dispatch({ type: 'START_NEW_SEARCH' })
    await delay(700)
    dispatch({ type: 'SET_RETRIEVED_PMIDS', payload: DEMO_RETRIEVED_PMIDS })
    dispatch({ type: 'SET_TOTAL_HITS', payload: DEMO_RETRIEVED_PMIDS.length })
    dispatch({ type: 'SET_SHOW_BATCH_PROMPT', payload: true })
    dispatch({ type: 'SET_IS_SEARCHING', payload: false })
  }

  // Reveal pre-baked screening verdicts one at a time so the progress bar fills
  // naturally. User overrides are preserved.
  async function screenArticles(articles: SearchResult[], baseDone: number, baseTotal: number) {
    if (articles.length === 0) return
    dispatch({ type: 'SET_IS_SCREENING', payload: true })
    dispatch({ type: 'SET_SCREENING_PROGRESS', payload: { done: baseDone, total: baseTotal } })

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const existing = state.screenings[article.pmid]
      if (existing?.overridden) {
        dispatch({ type: 'SET_SCREENING_PROGRESS', payload: { done: baseDone + i + 1, total: baseTotal } })
        continue
      }
      await delay(55)
      const screening = DEMO_SCREENINGS[article.pmid]
      if (screening) dispatch({ type: 'UPDATE_SCREENING', payload: screening })
      dispatch({ type: 'SET_SCREENING_PROGRESS', payload: { done: baseDone + i + 1, total: baseTotal } })
    }
    dispatch({ type: 'SET_IS_SCREENING', payload: false })
  }

  // Stage 2 — fetch + screen the first batch.
  async function handleBeginScreening() {
    const size = state.batchSize === 'all' ? state.retrievedPmids.length : state.batchSize
    const batch = state.retrievedPmids.slice(0, size)
    if (batch.length === 0) return

    dispatch({ type: 'SET_SHOW_BATCH_PROMPT', payload: false })
    dispatch({ type: 'SET_IS_SEARCHING', payload: true })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'results' })
    await delay(500)

    const articles = batch.map(p => DEMO_RESULT_BY_PMID[p]).filter((a): a is SearchResult => Boolean(a))
    dispatch({ type: 'SET_RESULTS', payload: articles })
    dispatch({ type: 'SET_IS_SEARCHING', payload: false })
    dispatch({ type: 'ADD_SCREENED_PMIDS', payload: articles.map(a => a.pmid) })

    await screenArticles(articles, 0, articles.length)
  }

  // Continuation — fetch + screen the next batch of remaining PMIDs.
  async function handleScreenNextBatch() {
    const screenedSet = new Set(state.screenedPmids)
    const remaining = state.retrievedPmids.filter(p => !screenedSet.has(p))
    if (remaining.length === 0) return

    const size = state.batchSize === 'all' ? remaining.length : Math.min(state.batchSize, remaining.length)
    const batch = remaining.slice(0, size)

    dispatch({ type: 'SET_IS_SEARCHING', payload: true })
    await delay(500)

    const articles = batch.map(p => DEMO_RESULT_BY_PMID[p]).filter((a): a is SearchResult => Boolean(a))
    dispatch({ type: 'APPEND_RESULTS', payload: articles })
    dispatch({ type: 'SET_IS_SEARCHING', payload: false })
    dispatch({ type: 'ADD_SCREENED_PMIDS', payload: articles.map(a => a.pmid) })

    const totalAfter = state.screenedPmids.length + articles.length
    await screenArticles(articles, state.screenedPmids.length, totalAfter)
  }

  function handleRefineSearch() {
    dispatch({ type: 'SET_SHOW_BATCH_PROMPT', payload: false })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'builder' })
  }

  function handleOverride(pmid: string, decision: ScreeningDecision, reason: string) {
    const existing = state.screenings[pmid]
    if (!existing) return
    dispatch({
      type: 'UPDATE_SCREENING',
      payload: { ...existing, overridden: true, userDecision: decision, userReason: reason },
    })
    dispatch({ type: 'INCREMENT_OVERRIDE_COUNT' })
  }

  return (
    <div style={{ backgroundColor: 'var(--serif-background)' }}>
      {/* Sticky sub-header (sits below the 56px app top bar) */}
      <div
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(250,250,248,0.95)',
          borderBottom: '1px solid var(--serif-border)',
          padding: '0 24px',
        }}
      >
        <div
          className="max-w-5xl mx-auto flex items-start justify-between"
          style={{ paddingTop: '10px', paddingBottom: '4px' }}
        >
          <div>
            <h1 className="font-playfair text-xl font-normal" style={{ color: 'var(--serif-foreground)' }}>
              Literature Reviews
            </h1>
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder={state.researchQuestion ? state.researchQuestion.slice(0, 60) : 'Search name'}
              className="bg-transparent focus:outline-none font-mono"
              style={{
                fontSize: '12px',
                color: 'var(--serif-muted-foreground)',
                borderBottom: '1px solid transparent',
                maxWidth: '360px',
                width: '100%',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--serif-border)' }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = 'transparent' }}
            />
          </div>
          <span
            className="font-mono text-[10px] tracking-widest uppercase mt-1"
            style={{ color: 'var(--serif-muted-foreground)' }}
          >
            {state.activeTab === 'builder' ? 'Query Builder' : 'Results'}
          </span>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto flex border-t" style={{ borderColor: 'var(--serif-border)' }}>
          {(['builder', 'results'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
              className="px-6 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors border-b-2"
              style={{
                borderBottomColor: state.activeTab === tab ? '#083860' : 'transparent',
                color: state.activeTab === tab ? '#083860' : 'var(--serif-muted-foreground)',
              }}
            >
              {tab === 'builder' ? 'Search Builder' : `Search Results${state.results.length > 0 ? ` (${state.results.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-20">
        {state.activeTab === 'builder' && (
          <SearchBuilderTab
            state={state}
            dispatch={dispatch}
            onRunSearch={handleRunSearch}
            onSaveSearch={handleSaveSearch}
            isSaving={isSaving}
            justSaved={justSaved}
            onBeginScreening={handleBeginScreening}
            onRefineSearch={handleRefineSearch}
          />
        )}
        {state.activeTab === 'results' && (
          <SearchResultsTab
            state={state}
            dispatch={dispatch}
            onOpenModal={(article) => dispatch({ type: 'SET_MODAL_ARTICLE', payload: article })}
            onScreenNextBatch={handleScreenNextBatch}
          />
        )}
      </div>

      {/* Abstract modal */}
      {state.modalArticle && (
        <AbstractModal
          article={state.modalArticle}
          screening={state.screenings[state.modalArticle.pmid]}
          highlightTerms={state.highlightTerms}
          criteria={state.criteria}
          onClose={() => dispatch({ type: 'SET_MODAL_ARTICLE', payload: null })}
          onOverride={handleOverride}
        />
      )}
    </div>
  )
}
