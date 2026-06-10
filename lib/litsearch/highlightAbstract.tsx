import React from 'react'
import { HighlightTerm } from '@/lib/litsearch/types'

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

export function highlightAbstract(text: string, terms: HighlightTerm[]): React.ReactNode[] {
  if (!terms.length) return [text]
  const sorted = [...terms].sort((a, b) => b.text.length - a.text.length)
  const escaped = sorted.map(t => t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)
  return parts.map((part, i) => {
    const matchedTerm = sorted.find(t => t.text.toLowerCase() === part.toLowerCase())
    if (!matchedTerm) return part
    const style = PICO_STYLES[matchedTerm.picoType] || PICO_STYLES.P
    return (
      <mark key={i} style={{ background: style.bg, color: style.color, borderRadius: '4px', padding: '0 3px', border: 'none', fontStyle: 'inherit', fontWeight: 'inherit' }}>
        {part}
      </mark>
    )
  })
}
