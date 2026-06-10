'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { LitSearchState, SearchResult, ScreeningDecision, ScreeningResult, HighlightTerm, BatchSize } from '@/lib/litsearch/types'
import { ARTICLES, type Article } from '@/lib/library/data'
import { useLibraryStore, type PushResult } from '@/lib/library/store'
import { DEMO_PUSH_ARTICLES } from '@/data/demo/litSearchExample'

type ResultsAction =
  | { type: 'UPDATE_SCREENING'; payload: ScreeningResult }
  | { type: 'INCREMENT_OVERRIDE_COUNT' }
  | { type: 'REMOVE_HIGHLIGHT_TERM'; payload: string }
  | { type: 'ADD_HIGHLIGHT_TERM'; payload: HighlightTerm }
  | { type: 'SET_CONFIDENCE_THRESHOLDS'; payload: LitSearchState['confidenceThresholds'] }
  | { type: 'SET_RESULTS_TAB'; payload: LitSearchState['resultsTab'] }
  | { type: 'SET_BATCH_SIZE'; payload: BatchSize }

interface Props {
  state: LitSearchState
  dispatch: React.Dispatch<ResultsAction>
  onOpenModal: (article: SearchResult) => void
  onScreenNextBatch: () => void
}

function ConfidenceDot({ confidence, thresholds }: { confidence: number; thresholds: LitSearchState['confidenceThresholds'] }) {
  if (confidence === 0) return <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: 'var(--serif-muted-foreground)' }} />
  if (confidence >= thresholds.high) return <span className="w-2 h-2 rounded-full inline-block bg-[#4A8B15]" />
  if (confidence >= thresholds.moderate) return <span className="w-2 h-2 rounded-full inline-block bg-[#BA7517]" />
  return <span className="w-2 h-2 rounded-full inline-block bg-[#C0392B]" />
}

function getFinalDecision(screening: ScreeningResult | undefined): ScreeningDecision {
  if (!screening) return 'pending'
  if (screening.overridden && screening.userDecision) return screening.userDecision
  return screening.decision
}

export default function SearchResultsTab({ state, dispatch, onOpenModal, onScreenNextBatch }: Props) {
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(25)
  const [selectedPmids, setSelectedPmids] = useState<Set<string>>(new Set())
  const [openOverridePmid, setOpenOverridePmid] = useState<string | null>(null)
  const [overrideDecision, setOverrideDecision] = useState<ScreeningDecision>('include')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideTermInputs, setOverrideTermInputs] = useState<Record<string, string>>({})
  const [dismissedLearning, setDismissedLearning] = useState(false)
  const [pushResult, setPushResult] = useState<PushResult | null>(null)

  // Canonical Library is the single target. The dropdown is kept for fidelity
  // with the ported UI; in this demo there is exactly one library.
  const selectedLibrary = 'demo-library-oag'

  const { pushArticles } = useLibraryStore()

  // Map every retrievable PMID → a canonical Article push payload. The 22
  // existing results resolve from the Library (ARTICLES); the 4 new ones from
  // the curated demo push map. The store dedupes by PMID on push.
  const articleByPmid = useMemo(() => {
    const m: Record<string, Article> = {}
    ARTICLES.forEach(a => { if (a.pmid) m[a.pmid] = a })
    Object.entries(DEMO_PUSH_ARTICLES).forEach(([pmid, a]) => { m[pmid] = a })
    return m
  }, [])

  const { results, screenings, confidenceThresholds, isScreening, screeningProgress, resultsTab, overrideCount } = state

  const getFilteredResults = () => {
    return results.filter(r => {
      const s = screenings[r.pmid]
      const decision = getFinalDecision(s)
      if (resultsTab === 'included') return decision === 'include'
      if (resultsTab === 'excluded') return decision === 'exclude'
      return true
    })
  }

  const filtered = getFilteredResults()
  const totalPages = Math.max(1, Math.ceil(filtered.length / localPageSize))
  const paginated = filtered.slice((localPage - 1) * localPageSize, localPage * localPageSize)

  const includedCount = results.filter(r => getFinalDecision(screenings[r.pmid]) === 'include').length
  const excludedCount = results.filter(r => getFinalDecision(screenings[r.pmid]) === 'exclude').length

  function handlePushToLibrary() {
    const includedArticles: Article[] = results
      .filter(r => getFinalDecision(screenings[r.pmid]) === 'include')
      .map(r => articleByPmid[r.pmid])
      .filter((a): a is Article => Boolean(a))
    const result = pushArticles(includedArticles)
    setPushResult(result)
  }

  function handleSaveOverride(pmid: string) {
    const existing = screenings[pmid]
    if (!existing) return
    dispatch({
      type: 'UPDATE_SCREENING',
      payload: {
        ...existing,
        overridden: true,
        userDecision: overrideDecision,
        userReason: overrideReason,
      } as ScreeningResult,
    })
    dispatch({ type: 'INCREMENT_OVERRIDE_COUNT' })
    setOpenOverridePmid(null)
    setOverrideReason('')
    setPushResult(null)
  }

  function handleBatchDecision(decision: ScreeningDecision) {
    selectedPmids.forEach(pmid => {
      const existing = screenings[pmid]
      if (!existing) return
      dispatch({
        type: 'UPDATE_SCREENING',
        payload: {
          ...existing,
          overridden: true,
          userDecision: decision,
          userReason: 'Batch decision',
        } as ScreeningResult,
      })
      dispatch({ type: 'INCREMENT_OVERRIDE_COUNT' })
    })
    setSelectedPmids(new Set())
    setPushResult(null)
  }

  function toggleSelect(pmid: string) {
    setSelectedPmids(prev => {
      const next = new Set(prev)
      if (next.has(pmid)) next.delete(pmid)
      else next.add(pmid)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedPmids.size === paginated.length) {
      setSelectedPmids(new Set())
    } else {
      setSelectedPmids(new Set(paginated.map(r => r.pmid)))
    }
  }

  const picoTypes = state.framework === 'SPIDER'
    ? (['S', 'PI', 'D', 'E', 'R'] as const)
    : (['P', 'I', 'C', 'O'] as const)

  const PICO_BLOCK_COLORS: Record<string, { bg: string; color: string }> = {
    P:  { bg: '#E6F1FB', color: '#0C447C' },
    I:  { bg: '#EEEDFE', color: '#3C3489' },
    C:  { bg: '#E1F5EE', color: '#085041' },
    O:  { bg: '#FAEEDA', color: '#633806' },
    S:  { bg: '#E6F1FB', color: '#0C447C' },
    PI: { bg: '#EEEDFE', color: '#3C3489' },
    D:  { bg: '#E1F5EE', color: '#085041' },
    E:  { bg: '#FAEEDA', color: '#633806' },
    R:  { bg: '#F5F3F0', color: '#5F5E5A' },
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ibm-mono)',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--serif-muted-foreground)',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'block',
  }

  const screenedCount = state.screenedPmids.length
  const retrievedCount = state.retrievedPmids.length
  const remainingCount = Math.max(0, retrievedCount - screenedCount)
  const showContinue =
    !state.showBatchPrompt &&
    !state.isSearching &&
    !state.isScreening &&
    retrievedCount > 0 &&
    remainingCount > 0

  const batchOptions: BatchSize[] = [25, 50, 100, 'all']

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6 pb-24">
      {/* Section 1 — PICO Keyword Highlighting */}
      <div>
        <span style={labelStyle}>PICO Keyword Highlighting</span>
        <p className="text-[11px] mb-3" style={{ color: 'var(--serif-muted-foreground)' }}>
          Shown in abstracts · remove low-value terms · add terms per category
        </p>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${picoTypes.length}, 1fr)` }}
        >
          {picoTypes.map(type => {
            const colors = PICO_BLOCK_COLORS[type]
            const terms = state.highlightTerms.filter(t => t.picoType === type)
            const blockForType = state.blocks.find(b => b.type === type)
            const label = blockForType?.label ?? type
            return (
              <div
                key={type}
                className="flex flex-col rounded-[8px] overflow-hidden"
                style={{ border: '1px solid var(--serif-border)' }}
              >
                <div
                  className="px-3 py-2 font-mono text-[10px] font-medium tracking-widest uppercase flex items-center justify-between"
                  style={{ backgroundColor: colors.bg, color: colors.color }}
                >
                  <span>[{type}] {label}</span>
                  <span className="opacity-60">{terms.length}</span>
                </div>
                <div className="flex-1 px-2 py-2 bg-white flex flex-col gap-1.5" style={{ minHeight: '60px' }}>
                  {terms.map(term => (
                    <div
                      key={term.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                      style={{ backgroundColor: colors.bg, color: colors.color }}
                    >
                      <span className="flex-1 min-w-0 truncate">{term.text}</span>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'REMOVE_HIGHLIGHT_TERM', payload: term.id })}
                        className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center opacity-60 hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-2 py-1.5" style={{ borderTop: '1px solid var(--serif-border)' }}>
                  <input
                    type="text"
                    value={overrideTermInputs[type] ?? ''}
                    onChange={e => setOverrideTermInputs(prev => ({ ...prev, [type]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (overrideTermInputs[type] ?? '').trim()
                        if (val) {
                          dispatch({
                            type: 'ADD_HIGHLIGHT_TERM',
                            payload: { id: Math.random().toString(36).slice(2), text: val, picoType: type },
                          })
                          setOverrideTermInputs(prev => ({ ...prev, [type]: '' }))
                        }
                      }
                    }}
                    placeholder="Add term…"
                    className="w-full text-[11px] bg-transparent outline-none"
                    style={{ color: 'var(--serif-foreground)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-2 font-mono text-[9px]" style={{ color: 'var(--serif-muted-foreground)' }}>
          Sourced from building blocks — remove generic terms, keep specific clinical phrases
        </p>
      </div>

      {/* Section 2 — Confidence Thresholds */}
      <div>
        <span style={labelStyle}>Confidence Thresholds</span>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#4A8B15]" />
            High ≥
            <input
              type="number"
              min={50}
              max={99}
              value={confidenceThresholds.high}
              onChange={e => dispatch({
                type: 'SET_CONFIDENCE_THRESHOLDS',
                payload: { ...confidenceThresholds, high: Number(e.target.value) },
              })}
              className="w-12 text-center text-xs font-mono bg-transparent outline-none"
              style={{ borderBottom: '1px solid var(--serif-border)' }}
            />
            %
          </label>
          <label className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#BA7517]" />
            Moderate ≥
            <input
              type="number"
              min={1}
              max={99}
              value={confidenceThresholds.moderate}
              onChange={e => dispatch({
                type: 'SET_CONFIDENCE_THRESHOLDS',
                payload: { ...confidenceThresholds, moderate: Number(e.target.value) },
              })}
              className="w-12 text-center text-xs font-mono bg-transparent outline-none"
              style={{ borderBottom: '1px solid var(--serif-border)' }}
            />
            %
          </label>
          <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
            <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
            Low &lt; {confidenceThresholds.moderate}%
          </span>
          <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--serif-muted-foreground)' }} />
            No data = 0%
          </span>
        </div>
      </div>

      {/* Section 3 — Learning loop banner */}
      {overrideCount >= 10 && !dismissedLearning && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-[8px]"
          style={{
            backgroundColor: 'var(--conf-mid-bg)',
            border: '1px solid var(--conf-mid-border)',
          }}
        >
          <span className="text-[11px]">
            10 overrides recorded — criteria updated based on your decisions. Re-run?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 rounded-[4px] text-xs font-medium text-white bg-[#083860]"
            >
              Re-run ↗
            </button>
            <button
              type="button"
              onClick={() => setDismissedLearning(true)}
              className="px-3 py-1 rounded-[4px] text-xs font-mono"
              style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Continue-batch row */}
      {showContinue && (
        <div
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-[8px] flex-wrap"
          style={{ border: '1px solid var(--serif-border)', backgroundColor: 'var(--serif-muted)' }}
        >
          <span className="text-[11px] font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
            {screenedCount.toLocaleString()} of {retrievedCount.toLocaleString()} retrieved articles screened · {remainingCount.toLocaleString()} remaining
          </span>
          <div className="flex items-center gap-2">
            <div className="flex" style={{ gap: 0 }}>
              {batchOptions.map((opt, i) => {
                const selected = state.batchSize === opt
                const disabled = opt !== 'all' && (opt as number) > remainingCount
                const label = opt === 'all' ? `All remaining (${remainingCount})` : String(opt)
                return (
                  <button
                    key={String(opt)}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_BATCH_SIZE', payload: opt })}
                    disabled={disabled}
                    className="px-2.5 py-1 text-[11px] font-mono disabled:opacity-30"
                    style={{
                      borderRadius:
                        i === 0 ? '5px 0 0 5px' : i === batchOptions.length - 1 ? '0 5px 5px 0' : '0',
                      border: '1px solid var(--serif-border)',
                      backgroundColor: selected ? '#083860' : 'white',
                      color: selected ? 'white' : 'var(--serif-muted-foreground)',
                      marginLeft: i === 0 ? 0 : -1,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={onScreenNextBatch}
              className="px-3 py-1 rounded-[5px] text-[11px] font-medium text-white bg-[#083860]"
            >
              Screen next batch ↗
            </button>
          </div>
        </div>
      )}

      {/* Section 4 — Results table */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-playfair text-xl font-normal" style={{ color: 'var(--serif-foreground)' }}>
            AI screened search results
          </h2>
          <span className="font-mono text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
            {results.length} articles · {screenedCount} of {retrievedCount} retrieved screened
            {state.demoLimited ? ' · Demo mode: limited to 25' : ''}
          </span>
        </div>

        {isScreening && (
          <div className="mb-4">
            <p className="text-xs font-mono mb-1" style={{ color: 'var(--serif-muted-foreground)' }}>
              Screening {screeningProgress.done} / {screeningProgress.total} articles…
            </p>
            <div
              className="h-1 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--serif-border)' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${screeningProgress.total > 0 ? (screeningProgress.done / screeningProgress.total) * 100 : 0}%`,
                  backgroundColor: '#083860',
                }}
              />
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex mb-4" style={{ borderBottom: '1px solid var(--serif-border)' }}>
          {(['all', 'included', 'excluded'] as const).map(tab => {
            const count = tab === 'included' ? includedCount : tab === 'excluded' ? excludedCount : results.length
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { dispatch({ type: 'SET_RESULTS_TAB', payload: tab }); setLocalPage(1) }}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-colors"
                style={{
                  borderBottomColor: resultsTab === tab ? '#083860' : 'transparent',
                  color: resultsTab === tab ? '#083860' : 'var(--serif-muted-foreground)',
                }}
              >
                {tab} ({count})
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div
          className="w-full rounded-[8px] overflow-hidden"
          style={{ border: '1px solid var(--serif-border)' }}
        >
          <table className="w-full border-collapse">
            <thead style={{ backgroundColor: 'var(--serif-muted)' }}>
              <tr>
                <th className="px-3 py-2 text-left w-10" style={{ color: 'var(--serif-muted-foreground)', fontSize: '9px', fontFamily: 'var(--font-ibm-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedPmids.size === paginated.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--serif-muted-foreground)' }}>Title / Authors</th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider w-20" style={{ color: 'var(--serif-muted-foreground)' }}>Decision</th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider" style={{ width: '75px', color: 'var(--serif-muted-foreground)' }}>Conf.</th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--serif-muted-foreground)' }}>Reason</th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider w-20" style={{ color: 'var(--serif-muted-foreground)' }}>Override</th>
                <th className="px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider w-16" style={{ color: 'var(--serif-muted-foreground)' }}>Abstract</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(article => {
                const screening = screenings[article.pmid]
                const finalDecision = getFinalDecision(screening)
                const isOverridden = screening?.overridden ?? false
                const isOverrideOpen = openOverridePmid === article.pmid
                const conf = screening?.confidence ?? 0

                return (
                  <React.Fragment key={article.pmid}>
                    <tr
                      className="hover:bg-[rgba(8,56,96,0.02)] transition-colors"
                      style={{
                        borderBottom: '1px solid var(--serif-border)',
                        borderLeft: isOverridden ? '2px solid var(--conf-mid-text)' : undefined,
                      }}
                    >
                      <td className="px-3 py-2.5 w-10">
                        <input
                          type="checkbox"
                          checked={selectedPmids.has(article.pmid)}
                          onChange={() => toggleSelect(article.pmid)}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div
                          className="font-playfair text-[12.5px] leading-snug line-clamp-2 cursor-pointer hover:text-[#083860]"
                          onClick={() => onOpenModal(article)}
                        >
                          {article.title}
                        </div>
                        <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--serif-muted-foreground)' }}>
                          {article.authors.length > 0
                            ? `${article.authors[0]}${article.authors.length > 1 ? ' et al.' : ''}`
                            : ''}
                          {article.journal ? ` · ${article.journal}` : ''}
                          {article.pubDate ? ` · ${article.pubDate.slice(0, 4)}` : ''}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 w-20">
                        {finalDecision === 'include' && !isOverridden && (
                          <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: 'var(--conf-high-bg)', color: 'var(--conf-high-text)' }}>
                            Include
                          </span>
                        )}
                        {finalDecision === 'exclude' && !isOverridden && (
                          <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: 'var(--conf-low-bg)', color: 'var(--conf-low-text)' }}>
                            Exclude
                          </span>
                        )}
                        {finalDecision === 'pending' && (
                          <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: 'var(--serif-muted)', color: 'var(--serif-muted-foreground)' }}>
                            Pending
                          </span>
                        )}
                        {isOverridden && (
                          <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: 'var(--conf-mid-bg)', color: 'var(--conf-mid-text)' }}>
                            {finalDecision === 'include' ? 'Overridden ↑' : 'Overridden ↓'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5" style={{ width: '75px' }}>
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <ConfidenceDot confidence={conf} thresholds={confidenceThresholds} />
                          {conf === 0 ? 'No data' : `${conf}%`}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px]">
                        {finalDecision === 'include' && (
                          <span style={{ color: 'var(--serif-muted-foreground)' }}>Relevant article</span>
                        )}
                        {finalDecision === 'exclude' && screening && (
                          <span style={{ color: 'var(--conf-low-text)' }}>{screening.simplifiedReason}</span>
                        )}
                        {finalDecision === 'pending' && <span>—</span>}
                      </td>
                      <td className="px-3 py-2.5 w-20">
                        <button
                          type="button"
                          onClick={() => {
                            if (isOverrideOpen) {
                              setOpenOverridePmid(null)
                            } else {
                              setOpenOverridePmid(article.pmid)
                              setOverrideDecision(finalDecision === 'include' ? 'exclude' : 'include')
                              setOverrideReason('')
                            }
                          }}
                          className="border rounded-[4px] px-2 py-1 text-[10px] font-mono hover:opacity-70"
                          style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
                        >
                          Override
                        </button>
                      </td>
                      <td className="px-3 py-2.5 w-16">
                        <button
                          type="button"
                          onClick={() => onOpenModal(article)}
                          className="border rounded-[4px] px-2 py-1 text-[10px] font-mono hover:opacity-70"
                          style={{ borderColor: 'var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
                        >
                          Abstract
                        </button>
                      </td>
                    </tr>
                    {isOverrideOpen && (
                      <tr key={`${article.pmid}-override`}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid var(--serif-border)' }}>
                          <div
                            className="flex items-center gap-3 px-4 py-3"
                            style={{ backgroundColor: 'var(--serif-muted)' }}
                          >
                            <div className="flex gap-1">
                              {(['include', 'exclude'] as const).map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setOverrideDecision(d)}
                                  className="px-3 py-1 rounded-[4px] text-xs font-mono transition-colors"
                                  style={{
                                    backgroundColor: overrideDecision === d ? '#083860' : 'transparent',
                                    color: overrideDecision === d ? 'white' : 'var(--serif-muted-foreground)',
                                    border: overrideDecision === d ? 'none' : '1px solid var(--serif-border)',
                                  }}
                                >
                                  {d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={overrideReason}
                              onChange={e => setOverrideReason(e.target.value)}
                              placeholder="Reason for override…"
                              className="flex-1 border rounded-[4px] px-2 py-1 text-xs bg-white outline-none"
                              style={{ borderColor: 'var(--serif-border)' }}
                              onFocus={e => { e.currentTarget.style.borderColor = '#083860' }}
                              onBlur={e => { e.currentTarget.style.borderColor = 'var(--serif-border)' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveOverride(article.pmid)}
                              className="px-3 py-1 rounded-[4px] text-xs font-medium text-white bg-[#083860]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenOverridePmid(null)}
                              className="px-3 py-1 rounded-[4px] text-xs font-mono"
                              style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm" style={{ color: 'var(--serif-muted-foreground)' }}>
                    No articles in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>Rows per page:</span>
            <select
              value={localPageSize}
              onChange={e => { setLocalPageSize(Number(e.target.value)); setLocalPage(1) }}
              className="text-xs font-mono border rounded-[4px] px-2 py-1 bg-white"
              style={{ borderColor: 'var(--serif-border)' }}
            >
              {[25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
            <span>Page {localPage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setLocalPage(p => Math.max(1, p - 1))}
              disabled={localPage === 1}
              className="px-2 py-1 border rounded-[4px] disabled:opacity-40"
              style={{ borderColor: 'var(--serif-border)' }}
            >
              ‹ Prev
            </button>
            <button
              type="button"
              onClick={() => setLocalPage(p => Math.min(totalPages, p + 1))}
              disabled={localPage === totalPages}
              className="px-2 py-1 border rounded-[4px] disabled:opacity-40"
              style={{ borderColor: 'var(--serif-border)' }}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Batch action bar */}
      {selectedPmids.size > 0 && (
        <div
          className="sticky bottom-0 flex items-center gap-3 px-4 py-2.5"
          style={{
            backgroundColor: 'var(--serif-muted)',
            borderTop: '1px solid var(--serif-border)',
            marginLeft: '-24px',
            marginRight: '-24px',
          }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
            {selectedPmids.size} selected
          </span>
          <button
            type="button"
            onClick={() => handleBatchDecision('include')}
            className="px-3 py-1 rounded-[4px] text-xs font-medium text-white bg-[#083860]"
          >
            Mark include
          </button>
          <button
            type="button"
            onClick={() => handleBatchDecision('exclude')}
            className="px-3 py-1 rounded-[4px] text-xs font-mono"
            style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
          >
            Exclude
          </button>
          <button
            type="button"
            onClick={() => setSelectedPmids(new Set())}
            className="px-3 py-1 rounded-[4px] text-xs font-mono"
            style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Push to library footer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-2.5"
        style={{
          backgroundColor: 'var(--serif-muted)',
          borderTop: '1px solid var(--serif-border)',
        }}
      >
        <span className="font-mono text-[10px]" style={{ color: 'var(--serif-muted-foreground)' }}>
          {pushResult ? (
            <>
              {pushResult.added > 0
                ? `Added ${pushResult.added} new ${pushResult.added === 1 ? 'article' : 'articles'} to the Library`
                : 'No new articles added'}
              {pushResult.deduped > 0 ? ` · ${pushResult.deduped} already in Library (deduped by PMID)` : ''}
              {' · '}
              <Link href="/library" className="underline hover:opacity-70" style={{ color: '#083860' }}>
                View in Library ↗
              </Link>
            </>
          ) : (
            `${includedCount} included articles ready to push`
          )}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={selectedLibrary}
            onChange={() => { /* single canonical library in this demo */ }}
            className="border rounded-[6px] px-3 py-1.5 text-xs bg-white"
            style={{ borderColor: 'var(--serif-border)' }}
          >
            <option value="demo-library-oag">Open-Angle Glaucoma Library</option>
          </select>
          <button
            type="button"
            onClick={handlePushToLibrary}
            disabled={includedCount === 0}
            className="px-4 py-1.5 rounded-[6px] text-xs font-medium text-white bg-[#083860] disabled:opacity-40"
          >
            Push to library ↗
          </button>
        </div>
      </div>
    </div>
  )
}
