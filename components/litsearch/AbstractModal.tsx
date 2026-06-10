'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { SearchResult, ScreeningResult, HighlightTerm, InclusionCriterion, ScreeningDecision } from '@/lib/litsearch/types'
import { highlightAbstract } from '@/lib/litsearch/highlightAbstract'

interface Props {
  article: SearchResult
  screening: ScreeningResult | undefined
  highlightTerms: HighlightTerm[]
  criteria: InclusionCriterion[]
  onClose: () => void
  onOverride: (pmid: string, decision: ScreeningDecision, reason: string) => void
}

const PICO_STYLES: Record<string, { bg: string; color: string }> = {
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

export default function AbstractModal({ article, screening, highlightTerms, criteria, onClose, onOverride }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [showOverrideForm, setShowOverrideForm] = useState(false)
  const [overrideDecision, setOverrideDecision] = useState<ScreeningDecision>('include')
  const [overrideReason, setOverrideReason] = useState('')

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  function handleSaveOverride() {
    onOverride(article.pmid, overrideDecision, overrideReason)
    setShowOverrideForm(false)
    setOverrideReason('')
  }

  const highlightedNodes = highlightAbstract(article.abstract || 'No abstract available.', highlightTerms)

  const picoLegend = [
    { type: 'P', label: 'Population' },
    { type: 'I', label: 'Intervention' },
    { type: 'C', label: 'Context' },
    { type: 'O', label: 'Outcomes' },
  ]

  function getConfidenceColor(conf: number, decision: ScreeningDecision): string {
    if (conf === 0) return 'var(--serif-muted-foreground)'
    if (decision === 'include') return '#4A8B15'
    if (conf >= 80) return '#BA7517'
    return '#C0392B'
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-[16px] max-w-3xl w-full flex flex-col shadow-2xl"
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-5 pb-4 flex-shrink-0 relative"
          style={{ borderBottom: '1px solid var(--serif-border)' }}
        >
          <button
            type="button"
            aria-label="Close abstract"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-[4px] text-lg hover:opacity-70"
            style={{ backgroundColor: 'var(--serif-muted)' }}
          >
            ×
          </button>
          <h2
            className="font-playfair text-[15px] font-normal leading-snug pr-10"
            style={{ color: 'var(--serif-foreground)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {article.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs" style={{ color: 'var(--serif-muted-foreground)' }}>
            {article.authors.length > 0 && (
              <span>{article.authors[0]}{article.authors.length > 1 ? ' et al.' : ''}</span>
            )}
            {article.journal && <span>· {article.journal}</span>}
            {article.pubDate && <span>· {article.pubDate.slice(0, 4)}</span>}
            {article.pubmedUrl && (
              <a
                href={article.pubmedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#083860' }}
              >
                PubMed ↗
              </a>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: abstract */}
          <div className="overflow-y-auto px-6 py-5 flex-1">
            <div className="flex gap-3 flex-wrap mb-4">
              {picoLegend.map(({ type, label }) => {
                const s = PICO_STYLES[type]
                return (
                  <span
                    key={type}
                    className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-mono"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    [{type}] {label}
                  </span>
                )
              })}
            </div>
            <p
              className="text-[13px] leading-[1.8]"
              style={{ color: 'var(--serif-foreground)', fontFamily: 'var(--font-source-sans)' }}
            >
              {highlightedNodes}
            </p>
          </div>

          {/* Right: screening panel */}
          <div
            className="flex-shrink-0 overflow-y-auto px-4 py-5 flex flex-col gap-4"
            style={{
              width: '40%',
              borderLeft: '1px solid var(--serif-border)',
              backgroundColor: 'var(--serif-muted)',
            }}
          >
            {!screening ? (
              <p className="text-sm italic" style={{ color: 'var(--serif-muted-foreground)' }}>
                Not yet screened
              </p>
            ) : (
              <>
                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-wider mb-2"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    AI Screening Decision
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: screening.decision === 'include'
                        ? 'var(--conf-high-bg)'
                        : screening.decision === 'exclude'
                          ? 'var(--conf-low-bg)'
                          : 'var(--serif-muted)',
                      color: screening.decision === 'include'
                        ? 'var(--conf-high-text)'
                        : screening.decision === 'exclude'
                          ? 'var(--conf-low-text)'
                          : 'var(--serif-muted-foreground)',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getConfidenceColor(screening.confidence, screening.decision) }}
                    />
                    {screening.decision.charAt(0).toUpperCase() + screening.decision.slice(1)} · {screening.confidence}%
                  </span>
                </div>

                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-wider mb-2"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    Justification
                  </p>
                  <p
                    className="text-[12.5px] leading-[1.65] italic"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    {screening.justification}
                  </p>
                </div>

                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-wider mb-2"
                    style={{ color: 'var(--serif-muted-foreground)' }}
                  >
                    Criteria Check
                  </p>
                  <ul className="flex flex-col gap-1">
                    {criteria.map(criterion => {
                      const check = screening.criteriaChecks.find(
                        c => c.parameterId === criterion.parameterId
                      )
                      if (!check) {
                        return (
                          <li key={criterion.parameterId} className="text-[11.5px] flex items-start gap-1.5">
                            <span style={{ color: 'var(--serif-muted-foreground)' }}>—</span>
                            <span style={{ color: 'var(--serif-muted-foreground)' }}>{criterion.parameterLabel}</span>
                          </li>
                        )
                      }
                      return (
                        <li key={criterion.parameterId} className="text-[11.5px] flex items-start gap-1.5">
                          <span style={{ color: check.met ? '#3B6D11' : '#A32D2D', flexShrink: 0 }}>
                            {check.met ? '✓' : '✗'}
                          </span>
                          <span>
                            {criterion.parameterLabel}
                            {!check.met && check.failReason && (
                              <span className="text-[10.5px] italic ml-1" style={{ color: 'var(--serif-muted-foreground)' }}>
                                · {check.failReason}
                              </span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-6 py-3 flex justify-between items-center"
          style={{ borderTop: '1px solid var(--serif-border)' }}
        >
          <div>
            <button
              type="button"
              onClick={() => setShowOverrideForm(v => !v)}
              className="px-4 py-2 rounded-[6px] text-sm font-mono"
              style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
            >
              Override decision
            </button>
            {showOverrideForm && (
              <div className="flex items-center gap-2 mt-2">
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
                <input
                  type="text"
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder="Reason for override…"
                  className="flex-1 border rounded-[4px] px-2 py-1 text-xs bg-white outline-none"
                  style={{ borderColor: 'var(--serif-border)' }}
                />
                <button
                  type="button"
                  onClick={handleSaveOverride}
                  className="px-3 py-1 rounded-[4px] text-xs font-medium text-white bg-[#083860]"
                >
                  Save override
                </button>
                <button
                  type="button"
                  onClick={() => setShowOverrideForm(false)}
                  className="px-3 py-1 rounded-[4px] text-xs font-mono"
                  style={{ border: '1px solid var(--serif-border)', color: 'var(--serif-muted-foreground)' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-[6px] text-sm font-medium text-white bg-[#083860]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
