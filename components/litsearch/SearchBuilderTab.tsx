'use client'

import React, { useState, useRef } from 'react'
import type { LitSearchState, BooleanOp, BetweenBlockOp, BuildingBlockTerm, Framework, ClarificationQuestion, BatchSize } from '@/lib/litsearch/types'
import { OAG_SAVED_SEARCH } from '@/data/demo/litSearchExample'

type LitSearchAction =
  | { type: 'SET_RESEARCH_QUESTION'; payload: string }
  | { type: 'SET_CLARIFICATION_MESSAGES'; payload: LitSearchState['clarificationMessages'] }
  | { type: 'APPEND_CLARIFICATION_MESSAGE'; payload: LitSearchState['clarificationMessages'][0] }
  | { type: 'SET_CLARIFICATION_QUESTIONS'; payload: ClarificationQuestion[] }
  | { type: 'UPDATE_CLARIFICATION_QUESTION'; payload: { id: string; patch: Partial<ClarificationQuestion> } }
  | { type: 'SET_IS_REFINING_QUERY'; payload: boolean }
  | { type: 'SET_SCOPE_CONFIRMED'; payload: boolean }
  | { type: 'SET_SCOPE_SUMMARY'; payload: string }
  | { type: 'SET_FRAMEWORK'; payload: Framework }
  | { type: 'SET_BLOCKS'; payload: LitSearchState['blocks'] }
  | { type: 'SET_HIGHLIGHT_TERMS'; payload: LitSearchState['highlightTerms'] }
  | { type: 'SET_CRITERIA'; payload: LitSearchState['criteria'] }
  | { type: 'SET_FILTERS'; payload: Partial<LitSearchState['filters']> }
  | { type: 'UPDATE_BLOCK_TERM_OPERATOR'; payload: { blockIndex: number; termIndex: number; operator: BooleanOp } }
  | { type: 'UPDATE_BLOCK_OPERATOR'; payload: { blockIndex: number; operator: BetweenBlockOp } }
  | { type: 'REMOVE_BLOCK_TERM'; payload: { blockIndex: number; termId: string } }
  | { type: 'ADD_BLOCK_TERM'; payload: { blockIndex: number; term: BuildingBlockTerm } }
  | { type: 'SET_BATCH_SIZE'; payload: BatchSize }
  | { type: 'RESET' }

interface Props {
  state: LitSearchState
  dispatch: React.Dispatch<LitSearchAction>
  onRunSearch: () => void
  onSaveSearch: () => void
  isSaving: boolean
  justSaved: boolean
  onBeginScreening: () => void
  onRefineSearch: () => void
}

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

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function cycleOperator(op: BooleanOp): BooleanOp {
  if (op === 'AND') return 'OR'
  if (op === 'OR') return 'NOT'
  return 'AND'
}

function cycleBetweenBlockOperator(op: BetweenBlockOp): BetweenBlockOp {
  return op === 'AND' ? 'OR' : 'AND'
}

export default function SearchBuilderTab({ state, dispatch, onRunSearch, onSaveSearch, isSaving, justSaved, onBeginScreening, onRefineSearch }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false)
  const [termInputs, setTermInputs] = useState<Record<number, string>>({})
  const [focusedTextarea, setFocusedTextarea] = useState(false)
  const criteriaRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const today = new Date().toISOString().slice(0, 10)

  // DEMO_MODE: query generation is pre-baked. Rather than call a live medical-
  // librarian agent, we populate the builder from the curated iStent/OAG saved
  // search so the example reproduces deterministically with no backend.
  async function handleGenerateQuery() {
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 600))
    dispatch({ type: 'SET_BLOCKS', payload: OAG_SAVED_SEARCH.blocks })
    dispatch({ type: 'SET_HIGHLIGHT_TERMS', payload: OAG_SAVED_SEARCH.highlightTerms })
    dispatch({ type: 'SET_SCOPE_SUMMARY', payload: OAG_SAVED_SEARCH.researchQuestion })
    dispatch({ type: 'SET_CLARIFICATION_QUESTIONS', payload: [] })
    dispatch({ type: 'SET_SCOPE_CONFIRMED', payload: true })
    setIsGenerating(false)
  }

  async function handleSubmitClarification(q: ClarificationQuestion) {
    dispatch({ type: 'UPDATE_CLARIFICATION_QUESTION', payload: { id: q.id, patch: { submitted: true } } })
  }

  function handleEditClarification(qId: string) {
    dispatch({ type: 'UPDATE_CLARIFICATION_QUESTION', payload: { id: qId, patch: { submitted: false } } })
  }

  function summariseAnswer(q: ClarificationQuestion): string {
    const parts: string[] = []
    const nonOther = q.selectedOptions.filter(o => o !== 'Other')
    if (nonOther.length > 0) parts.push(nonOther.join(', '))
    if (q.selectedOptions.includes('Other') && q.otherText.trim()) parts.push(`Other: ${q.otherText.trim()}`)
    if (q.responseType === 'free_text' && q.otherText.trim()) parts.push(q.otherText.trim())
    return parts.length > 0 ? `Selected: ${parts.join(' · ')}` : 'No response'
  }

  function isAnswerValid(q: ClarificationQuestion): boolean {
    if (q.responseType === 'free_text') return q.otherText.trim().length > 0
    if (q.selectedOptions.length === 0) return false
    if (q.selectedOptions.includes('Other') && q.otherText.trim().length === 0) return false
    return true
  }

  function toggleSelection(q: ClarificationQuestion, option: string) {
    const isMulti = q.responseType === 'multi_select_other'
    let next: string[]
    if (isMulti) {
      next = q.selectedOptions.includes(option)
        ? q.selectedOptions.filter(o => o !== option)
        : [...q.selectedOptions, option]
    } else {
      next = q.selectedOptions.includes(option) ? [] : [option]
    }
    dispatch({ type: 'UPDATE_CLARIFICATION_QUESTION', payload: { id: q.id, patch: { selectedOptions: next } } })
  }

  // DEMO_MODE: criteria are pre-baked from the curated saved search.
  async function handleGenerateCriteria() {
    setIsGeneratingCriteria(true)
    await new Promise(r => setTimeout(r, 600))
    dispatch({ type: 'SET_CRITERIA', payload: OAG_SAVED_SEARCH.criteria })
    setIsGeneratingCriteria(false)
  }

  function handleAddTerm(blockIndex: number) {
    const val = (termInputs[blockIndex] || '').trim()
    if (!val) return
    const term: BuildingBlockTerm = { id: generateId(), text: val, operator: 'OR' }
    dispatch({ type: 'ADD_BLOCK_TERM', payload: { blockIndex, term } })
    setTermInputs(prev => ({ ...prev, [blockIndex]: '' }))
  }

  function handleSetDateRange(years: number) {
    const from = new Date()
    from.setFullYear(from.getFullYear() - years)
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: today,
      },
    })
  }

  function getActiveDatePill(): number | null {
    if (!state.filters.dateFrom || !state.filters.dateTo) return null
    const from = new Date(state.filters.dateFrom)
    const now = new Date()
    const diffYears = Math.round((now.getTime() - from.getTime()) / (365.25 * 24 * 3600 * 1000))
    if ([1, 2, 5, 10].includes(diffYears)) return diffYears
    return null
  }

  function getCriterionInclusion(parameterId: string): string {
    const c = state.criteria.find(c => c.parameterId === parameterId)
    return c?.inclusionText ?? ''
  }

  function getCriterionExclusion(parameterId: string): string {
    const c = state.criteria.find(c => c.parameterId === parameterId)
    return c?.exclusionText ?? ''
  }

  function updateCriterion(parameterId: string, field: 'inclusionText' | 'exclusionText', value: string) {
    const updated = state.criteria.map(c =>
      c.parameterId === parameterId ? { ...c, [field]: value } : c
    )
    dispatch({ type: 'SET_CRITERIA', payload: updated })
  }

  const validCriteriaCount = state.criteria.filter(c => c.inclusionText.trim().length > 0).length

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ibm-mono)',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--serif-muted-foreground)',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'block',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
      {/* Step 1 — Research Question */}
      <div>
        <span style={labelStyle}>1 — Research Question &amp; Objective</span>
        <textarea
          value={state.researchQuestion}
          onChange={e => dispatch({ type: 'SET_RESEARCH_QUESTION', payload: e.target.value })}
          onFocus={() => setFocusedTextarea(true)}
          onBlur={() => setFocusedTextarea(false)}
          placeholder="State your research question and define your objective…"
          className="rounded-t-[12px] rounded-b-none w-full px-4 py-3 text-sm resize-none min-h-[80px]"
          style={{
            backgroundColor: 'var(--serif-muted)',
            border: `1px solid ${focusedTextarea ? '#083860' : 'var(--serif-border)'}`,
            borderBottom: `2px solid ${focusedTextarea ? '#083860' : 'var(--serif-border)'}`,
            outline: 'none',
          }}
        />
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={handleGenerateQuery}
            disabled={state.researchQuestion.trim().length < 10 || isGenerating}
            className="px-5 py-2 rounded-[6px] text-sm font-medium text-white bg-[#083860] disabled:opacity-40 flex items-center gap-2"
          >
            {isGenerating && (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isGenerating ? 'Generating…' : 'Generate query'}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="px-5 py-2 rounded-[6px] text-sm font-medium"
            style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)', background: 'transparent' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Step 2 — Scope Clarification */}
      {state.clarificationQuestions.length > 0 && !state.scopeConfirmed && (
        <div>
          <span style={labelStyle}>2 — Scope Clarification</span>
          <p className="text-xs mb-3" style={{ color: 'var(--serif-muted-foreground)' }}>
            Answer each question and click Submit · responses refine the search strategy
          </p>

          <div className="flex flex-col gap-3">
            {state.clarificationQuestions.map(q => {
              const submitted = q.submitted
              const otherSelected = q.selectedOptions.includes('Other')

              if (submitted) {
                return (
                  <div
                    key={q.id}
                    className="rounded-[8px] p-3 flex items-start gap-3"
                    style={{ border: '1px solid var(--serif-border)', backgroundColor: 'var(--serif-muted)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-snug" style={{ color: 'var(--serif-muted-foreground)' }}>
                        {q.question}
                      </p>
                      <p
                        className="font-mono text-[10px] mt-1 uppercase tracking-wider"
                        style={{ color: 'var(--serif-foreground)' }}
                      >
                        {summariseAnswer(q)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditClarification(q.id)}
                      aria-label="Edit response"
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-[4px] hover:bg-[rgba(0,0,0,0.05)]"
                      style={{ color: 'var(--serif-muted-foreground)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                )
              }

              const options =
                q.responseType === 'yes_no_other'
                  ? ['Yes', 'No', 'Other']
                  : q.responseType === 'multi_select_other'
                    ? [...(q.options ?? []), 'Other']
                    : []
              const valid = isAnswerValid(q)

              return (
                <div
                  key={q.id}
                  className="rounded-[8px] p-4 flex flex-col gap-3"
                  style={{ border: '1px solid var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                      style={{ backgroundColor: '#083860' }}
                    />
                    <p className="text-[13px] leading-snug" style={{ color: 'var(--serif-foreground)' }}>
                      {q.question}
                    </p>
                  </div>

                  {q.responseType !== 'free_text' && (
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => {
                        const selected = q.selectedOptions.includes(opt)
                        const isMulti = q.responseType === 'multi_select_other'
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleSelection(q, opt)}
                            className="text-[11px] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors"
                            style={
                              selected
                                ? { backgroundColor: '#083860', color: 'white' }
                                : { border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }
                            }
                            aria-pressed={selected}
                          >
                            {selected && isMulti && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {(otherSelected || q.responseType === 'free_text') && (
                    <textarea
                      rows={2}
                      value={q.otherText}
                      onChange={e => dispatch({
                        type: 'UPDATE_CLARIFICATION_QUESTION',
                        payload: { id: q.id, patch: { otherText: e.target.value } },
                      })}
                      placeholder={q.responseType === 'free_text' ? 'Your answer…' : 'Please specify…'}
                      className="text-[12px] px-3 py-2 resize-none rounded-[6px] w-full"
                      style={{
                        backgroundColor: 'var(--serif-muted)',
                        border: '1px solid var(--serif-border)',
                        outline: 'none',
                      }}
                    />
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => handleSubmitClarification(q)}
                      disabled={!valid}
                      className="px-3 py-1.5 rounded-[5px] text-[11px] font-medium text-white bg-[#083860] disabled:opacity-40"
                    >
                      Submit response
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {(() => {
            const allSubmitted = state.clarificationQuestions.every(q => q.submitted)
            const refining = state.isRefiningQuery
            return (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SCOPE_CONFIRMED', payload: true })}
                  disabled={!allSubmitted || refining}
                  className="px-5 py-2 rounded-[6px] text-sm font-medium text-white bg-[#083860] disabled:opacity-40 inline-flex items-center gap-2"
                >
                  {refining && (
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: 'white' }}
                      aria-label="Refining"
                    />
                  )}
                  {refining ? 'Refining…' : 'Confirm & build blocks ↗'}
                </button>
                {!allSubmitted && (
                  <span className="text-[11px] font-mono" style={{ color: 'var(--serif-muted-foreground)' }}>
                    {state.clarificationQuestions.filter(q => q.submitted).length} / {state.clarificationQuestions.length} submitted
                  </span>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Step 3 — Building Blocks */}
      {state.scopeConfirmed && state.blocks.length > 0 && (
        <div>
          <span style={labelStyle}>3 — Query Building Blocks</span>
          <p className="text-xs mb-3" style={{ color: 'var(--serif-muted-foreground)' }}>
            Click any operator badge to toggle · between blocks: AND/OR · within blocks: AND/OR/NOT
          </p>

          <div className="flex mb-4" style={{ gap: '0' }}>
            {(['PICO', 'SPIDER'] as Framework[]).map((fw, i) => (
              <button
                key={fw}
                type="button"
                onClick={() => dispatch({ type: 'SET_FRAMEWORK', payload: fw })}
                className="px-4 py-1.5 text-xs font-mono"
                style={{
                  borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                  border: '1px solid var(--serif-border)',
                  backgroundColor: state.framework === fw ? '#083860' : 'transparent',
                  color: state.framework === fw ? 'white' : 'var(--serif-muted-foreground)',
                  marginLeft: i === 0 ? 0 : -1,
                }}
              >
                {fw}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2">
            {state.blocks.map((block, bi) => {
              const colors = PICO_BLOCK_COLORS[block.type] ?? PICO_BLOCK_COLORS.P
              return (
                <React.Fragment key={block.type}>
                  {bi > 0 && (
                    <div className="flex-shrink-0 self-center mt-6">
                      <button
                        type="button"
                        onClick={() => dispatch({
                          type: 'UPDATE_BLOCK_OPERATOR',
                          payload: { blockIndex: bi, operator: cycleBetweenBlockOperator(block.blockOperator) },
                        })}
                        className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-[3px] cursor-pointer hover:opacity-70"
                        style={{ backgroundColor: 'var(--serif-muted)', color: 'var(--serif-muted-foreground)' }}
                        aria-label={`Between-block operator (currently ${block.blockOperator}) — click to toggle`}
                      >
                        {block.blockOperator}
                      </button>
                    </div>
                  )}
                  <div
                    className="flex-1 flex flex-col rounded-[8px] overflow-hidden"
                    style={{ border: '1px solid var(--serif-border)' }}
                  >
                    <div
                      className="px-3 py-2 font-mono text-[10px] font-medium tracking-widest uppercase"
                      style={{ backgroundColor: colors.bg, color: colors.color }}
                    >
                      [{block.type}] {block.label}
                    </div>
                    <div
                      className="flex-1 px-2 py-2 flex flex-col gap-1.5 bg-white"
                      style={{ minHeight: '80px' }}
                    >
                      {block.terms.map((term, ti) => (
                        <React.Fragment key={term.id}>
                          {ti > 0 && (
                            <button
                              type="button"
                              onClick={() => dispatch({
                                type: 'UPDATE_BLOCK_TERM_OPERATOR',
                                payload: { blockIndex: bi, termIndex: ti, operator: cycleOperator(term.operator) },
                              })}
                              className="self-center font-mono text-[9px] uppercase px-1 py-0.5 rounded-[3px] cursor-pointer hover:opacity-70"
                              style={{ backgroundColor: 'var(--serif-muted)', color: 'var(--serif-muted-foreground)' }}
                            >
                              {term.operator}
                            </button>
                          )}
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                            style={{ backgroundColor: colors.bg, color: colors.color }}
                          >
                            <span className="flex-1 min-w-0 truncate">{term.text}</span>
                            <button
                              type="button"
                              onClick={() => dispatch({
                                type: 'REMOVE_BLOCK_TERM',
                                payload: { blockIndex: bi, termId: term.id },
                              })}
                              className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center opacity-60 hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="px-2 py-1.5" style={{ borderTop: '1px solid var(--serif-border)' }}>
                      <input
                        type="text"
                        value={termInputs[bi] ?? ''}
                        onChange={e => setTermInputs(prev => ({ ...prev, [bi]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTerm(bi) }}
                        onBlur={() => handleAddTerm(bi)}
                        placeholder="Add term…"
                        className="w-full text-[11px] bg-transparent outline-none"
                        style={{ color: 'var(--serif-foreground)' }}
                      />
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleGenerateCriteria}
            disabled={isGeneratingCriteria}
            className="w-full py-2.5 rounded-[8px] text-sm font-medium text-white bg-[#083860] disabled:opacity-40 mt-4 flex items-center justify-center gap-2"
          >
            {isGeneratingCriteria && (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isGeneratingCriteria ? 'Generating criteria…' : 'Generate criteria'}
          </button>
        </div>
      )}

      {/* Step 4 — Criteria table */}
      {state.criteria.some(c => c.inclusionText || c.exclusionText) && (
        <div>
          <span style={labelStyle}>4 — Inclusion / Exclusion Criteria</span>
          <p className="text-xs mb-3" style={{ color: 'var(--serif-muted-foreground)' }}>
            Minimum 2 parameters required · editable
          </p>

          <div
            className="w-full rounded-[8px] overflow-hidden"
            style={{ border: '1px solid var(--serif-border)' }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: '100px 1fr 1fr',
                backgroundColor: 'var(--serif-muted)',
                borderBottom: '1px solid var(--serif-border)',
              }}
            >
              <div className="px-3 py-2" />
              <div
                className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider"
                style={{ color: '#3B6D11' }}
              >
                Inclusion
              </div>
              <div
                className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider"
                style={{ color: '#791F1F' }}
              >
                Exclusion
              </div>
            </div>

            {state.criteria.map((criterion) => {
              if (criterion.parameterId === 'timeframe') {
                return (
                  <div
                    key={criterion.parameterId}
                    className="grid"
                    style={{
                      gridTemplateColumns: '100px 1fr',
                      borderBottom: '1px solid var(--serif-border)',
                    }}
                  >
                    <div
                      className="px-3 py-2 font-mono text-[10px]"
                      style={{ color: 'var(--serif-muted-foreground)' }}
                    >
                      {criterion.parameterLabel}
                    </div>
                    <div className="px-3 py-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 2, 5, 10].map(yr => {
                          const active = getActiveDatePill() === yr
                          return (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => handleSetDateRange(yr)}
                              className="rounded-full px-3 py-1 text-xs font-mono transition-colors"
                              style={{
                                backgroundColor: active ? '#083860' : 'transparent',
                                color: active ? 'white' : 'var(--serif-muted-foreground)',
                                border: active ? 'none' : '1px solid var(--serif-border)',
                              }}
                            >
                              {yr} yr{yr !== 1 ? 's' : ''}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={state.filters.dateFrom ?? ''}
                          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { dateFrom: e.target.value } })}
                          className="text-xs px-2 py-1 rounded-[4px]"
                          style={{ border: '1px solid var(--serif-border)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>to</span>
                        <input
                          type="date"
                          value={state.filters.dateTo ?? ''}
                          onChange={e => dispatch({ type: 'SET_FILTERS', payload: { dateTo: e.target.value } })}
                          className="text-xs px-2 py-1 rounded-[4px]"
                          style={{ border: '1px solid var(--serif-border)' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={criterion.parameterId}
                  className="grid"
                  style={{
                    gridTemplateColumns: '100px 1fr 1fr',
                    borderBottom: '1px solid var(--serif-border)',
                  }}
                >
                  <div
                    className="px-3 py-2 font-mono text-[10px]"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    {criterion.parameterLabel}
                  </div>
                  <div className="p-1.5">
                    <div
                      ref={el => { criteriaRefs.current[`${criterion.parameterId}-inclusion`] = el }}
                      contentEditable="true"
                      suppressContentEditableWarning
                      onInput={e => updateCriterion(criterion.parameterId, 'inclusionText', e.currentTarget.textContent ?? '')}
                      className="rounded-[4px] px-2 py-1 text-[11px] min-h-[28px] outline-none"
                      style={{
                        backgroundColor: '#EAF3DE',
                        border: '1px solid rgba(59,109,17,0.3)',
                      }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3B6D11' }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,109,17,0.3)' }}
                      dangerouslySetInnerHTML={{ __html: getCriterionInclusion(criterion.parameterId) }}
                    />
                  </div>
                  <div className="p-1.5">
                    <div
                      ref={el => { criteriaRefs.current[`${criterion.parameterId}-exclusion`] = el }}
                      contentEditable="true"
                      suppressContentEditableWarning
                      onInput={e => updateCriterion(criterion.parameterId, 'exclusionText', e.currentTarget.textContent ?? '')}
                      className="rounded-[4px] px-2 py-1 text-[11px] min-h-[28px] outline-none"
                      style={{
                        backgroundColor: '#FCEBEB',
                        border: '1px solid rgba(163,45,45,0.3)',
                      }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#A32D2D' }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(163,45,45,0.3)' }}
                      dangerouslySetInnerHTML={{ __html: getCriterionExclusion(criterion.parameterId) }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Run + Save search */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onRunSearch}
              disabled={validCriteriaCount < 2 || state.isSearching}
              title={validCriteriaCount < 2 ? 'Add at least 2 inclusion criteria' : undefined}
              className="flex-1 h-12 rounded-[8px] text-sm font-medium text-white bg-[#083860] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {state.isSearching && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {state.isSearching ? 'Searching PubMed…' : 'Run search'}
            </button>
            <button
              type="button"
              onClick={onSaveSearch}
              disabled={isSaving || state.isSearching}
              title="Save the query builder and criteria for later"
              className="h-12 px-5 rounded-[8px] text-sm font-medium disabled:opacity-40 inline-flex items-center justify-center gap-2"
              style={{
                border: '1px solid var(--serif-border)',
                color: justSaved ? '#1F6B3A' : 'var(--serif-foreground)',
                background: 'transparent',
              }}
            >
              {isSaving ? (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : justSaved ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
              {isSaving ? 'Saving…' : justSaved ? 'Saved' : 'Save search'}
            </button>
          </div>

          {/* Inline batch prompt */}
          {state.showBatchPrompt && state.totalHits > 0 && (() => {
            const overCap = state.totalHits > state.retrievedPmids.length
            const retrievedCount = state.retrievedPmids.length
            const batchOptions: BatchSize[] = [25, 50, 100, 'all']
            const beginCount = state.batchSize === 'all'
              ? retrievedCount
              : Math.min(state.batchSize as number, retrievedCount)
            return (
              <div
                className="mt-4 rounded-[8px] overflow-hidden flex flex-col"
                style={{ border: '1px solid var(--serif-border)', backgroundColor: 'var(--serif-card)' }}
              >
                <div className="h-[3px] w-full" style={{ backgroundColor: '#083860' }} />
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-playfair text-lg leading-snug" style={{ color: 'var(--serif-foreground)' }}>
                      Search returned {state.totalHits.toLocaleString()} {state.totalHits === 1 ? 'article' : 'articles'}
                    </h3>
                    <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--serif-muted-foreground)' }}>
                      {overCap
                        ? `Retrieved first ${retrievedCount.toLocaleString()} PMIDs · refine criteria to narrow further`
                        : `All ${retrievedCount.toLocaleString()} PMIDs retrieved`}
                      {state.demoLimited ? ' · Demo mode: limited to 25 articles' : ''}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span style={labelStyle}>Screen articles in batches</span>
                    <div className="flex" style={{ gap: 0 }}>
                      {batchOptions.map((opt, i) => {
                        const selected = state.batchSize === opt
                        const disabled = opt !== 'all' && (opt as number) > retrievedCount
                        const label = opt === 'all' ? `All (${retrievedCount})` : String(opt)
                        return (
                          <button
                            key={String(opt)}
                            type="button"
                            onClick={() => dispatch({ type: 'SET_BATCH_SIZE', payload: opt })}
                            disabled={disabled}
                            className="px-3 py-1.5 text-xs font-mono disabled:opacity-30"
                            style={{
                              borderRadius:
                                i === 0 ? '6px 0 0 6px' : i === batchOptions.length - 1 ? '0 6px 6px 0' : '0',
                              border: '1px solid var(--serif-border)',
                              backgroundColor: selected ? '#083860' : 'transparent',
                              color: selected ? 'white' : 'var(--serif-muted-foreground)',
                              marginLeft: i === 0 ? 0 : -1,
                            }}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onBeginScreening}
                      disabled={retrievedCount === 0}
                      className="flex-1 py-2.5 rounded-[6px] text-sm font-medium text-white bg-[#083860] disabled:opacity-40"
                    >
                      Begin screening {beginCount} {beginCount === 1 ? 'article' : 'articles'} ↗
                    </button>
                    <button
                      type="button"
                      onClick={onRefineSearch}
                      className="px-4 py-2 rounded-[6px] text-sm font-medium"
                      style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)', background: 'transparent' }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
