'use client';

import { useState } from 'react';
import type { DomainKey } from '@/lib/value-story/data';
import SelectorPage from '@/components/value-story/SelectorPage';
import DomainsPage from '@/components/value-story/DomainsPage';
import DomainDetailPage from '@/components/value-story/DomainDetailPage';

type PageKey = 'selector' | 'domains' | 'detail';

/**
 * Value Story module — three-page internal flow driven by component state.
 * The AppShell wrapper lives in app/(app)/layout.tsx; the chat panel rail
 * is already mounted there and detects this route via ChatPanelHost.
 */
export default function PayerValueStoryPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('selector');
  const [selectedIndication, setSelectedIndication] = useState<string | null>(null);
  // Start with nothing pre-selected; the user can tick any combination
  // of payer-issue chips on the selector page.
  const [selectedPayerIssues, setSelectedPayerIssues] = useState<Set<string>>(new Set());
  const [activeDomain, setActiveDomain] = useState<DomainKey | null>(null);

  if (currentPage === 'selector') {
    return (
      <SelectorPage
        selectedIndication={selectedIndication}
        setSelectedIndication={setSelectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        setSelectedPayerIssues={setSelectedPayerIssues}
        onContinue={() => setCurrentPage('domains')}
      />
    );
  }

  if (currentPage === 'domains') {
    return (
      <DomainsPage
        selectedIndication={selectedIndication}
        selectedPayerIssues={selectedPayerIssues}
        onRemovePayerIssue={id => {
          const next = new Set(selectedPayerIssues);
          next.delete(id);
          setSelectedPayerIssues(next);
        }}
        onClearIndication={() => setSelectedIndication(null)}
        onSelectDomain={d => {
          setActiveDomain(d);
          setCurrentPage('detail');
        }}
        onBack={() => setCurrentPage('selector')}
      />
    );
  }

  if (currentPage === 'detail' && activeDomain) {
    return (
      <DomainDetailPage
        domainKey={activeDomain}
        onChangeDomain={setActiveDomain}
        onBack={() => setCurrentPage('domains')}
      />
    );
  }

  // Fallback (e.g. activeDomain is null but currentPage is 'detail') — return to grid.
  return (
    <DomainsPage
      selectedIndication={selectedIndication}
      selectedPayerIssues={selectedPayerIssues}
      onRemovePayerIssue={id => {
        const next = new Set(selectedPayerIssues);
        next.delete(id);
        setSelectedPayerIssues(next);
      }}
      onClearIndication={() => setSelectedIndication(null)}
      onSelectDomain={d => {
        setActiveDomain(d);
        setCurrentPage('detail');
      }}
      onBack={() => setCurrentPage('selector')}
    />
  );
}
