'use client';

import { useState } from 'react';
import type { ObjectionDomainKey } from '@/lib/objection-handling/data';
import DomainsPage from '@/components/objection-handling/DomainsPage';
import DomainDetailPage from '@/components/objection-handling/DomainDetailPage';

type PageKey = 'domains' | 'detail';

/**
 * Objection Handling module — two-page internal flow driven by
 * component state. The AppShell wrapper lives in app/(app)/layout.tsx;
 * the chat panel rail is mounted there and detects this route via
 * ChatPanelHost.
 */
export default function ObjectionHandlingPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('domains');
  const [activeDomain, setActiveDomain] = useState<ObjectionDomainKey | null>(null);

  if (currentPage === 'domains') {
    return (
      <DomainsPage
        onSelectDomain={d => {
          setActiveDomain(d);
          setCurrentPage('detail');
        }}
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

  // Defensive fallback (activeDomain null but route=detail).
  return (
    <DomainsPage
      onSelectDomain={d => {
        setActiveDomain(d);
        setCurrentPage('detail');
      }}
    />
  );
}
