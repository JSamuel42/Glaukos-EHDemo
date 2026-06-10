'use client';

import { useCallback, useEffect, useState } from 'react';
import { GVD_NAV, GVD_SECTIONS_BY_NUMBER } from '@/lib/askgvd/data';
import {
  GVD_DOCUMENTS,
  DEFAULT_DOCUMENT_ID,
  getDocumentById,
} from '@/lib/askgvd/documents';
import { useChatPanel } from '@/components/chat/ChatPanelContext';
import ChapterNav from '@/components/askgvd/ChapterNav';
import DocumentSelector from '@/components/askgvd/DocumentSelector';
import PdfViewer from '@/components/askgvd/PdfViewer';
import { cn } from '@/lib/cn';

// First chapter starts on page 7 — sensible default landing page so the
// reader sees real content rather than the cover or TOC.
const DEFAULT_PAGE = 7;

export default function AskGvdPage() {
  const [activeDocumentId, setActiveDocumentId] = useState(DEFAULT_DOCUMENT_ID);
  const [activeChapter, setActiveChapter] = useState('1');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE);

  const activeDoc = getDocumentById(activeDocumentId);

  const { setOnCitationClick, isOpen: chatOpen } = useChatPanel();

  // Citations in chat responses come as (Section X.Y, p. N). The page
  // number is the most useful signal — drive the PDF viewer directly off
  // it. We also update activeChapter/Section so the ChapterNav highlights
  // the cited location.
  const handleCitationClick = useCallback((section: string, page: number) => {
    const chapter = section.split('.')[0];
    setActiveChapter(chapter);
    setActiveSection(section);
    if (Number.isFinite(page) && page > 0) {
      setActivePage(page);
    }
  }, []);

  useEffect(() => {
    setOnCitationClick(handleCitationClick);
    return () => setOnCitationClick(undefined);
  }, [setOnCitationClick, handleCitationClick]);

  function selectChapter(chapterNumber: string) {
    setActiveChapter(chapterNumber);
    setActiveSection(null);
    const chapter = GVD_NAV.chapters.find(c => c.number === chapterNumber);
    if (chapter) setActivePage(chapter.page_num);
  }

  function selectSection(sectionNumber: string) {
    const chapter = sectionNumber.split('.')[0];
    setActiveChapter(chapter);
    setActiveSection(sectionNumber);
    const section = GVD_SECTIONS_BY_NUMBER[sectionNumber];
    if (section) {
      setActivePage(section.page_start);
    }
  }

  return (
    // Reserve space for the chat panel on Ask GVD when it's open, since
    // defaultOpen is true here — otherwise the panel overlays the right
    // edge of the PDF and important figures/tables get hidden.
    <div
      className={cn(
        'flex flex-col min-h-[calc(100vh-3.5rem)] transition-[padding] duration-300',
        chatOpen && 'md:pr-[380px]',
      )}
    >
      <div className="px-8 pt-7 pb-4">
        <h1 className="font-playfair text-3xl text-serif-foreground mb-4">Ask GVD</h1>
        <div className="flex flex-wrap items-center gap-3">
          <DocumentSelector
            documents={GVD_DOCUMENTS}
            activeId={activeDocumentId}
            onSelect={setActiveDocumentId}
          />
          {activeDoc?.populated && (
            <ChapterNav
              nav={GVD_NAV}
              activeChapter={activeChapter}
              activeSection={activeSection}
              onSelectChapter={selectChapter}
              onSelectSection={selectSection}
            />
          )}
        </div>
      </div>

      <div className="flex-1 px-8 pb-6">
        {activeDoc?.populated && activeDoc.pdfPath ? (
          <PdfViewer pdfPath={activeDoc.pdfPath} page={activePage} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-serif-muted-foreground">
            <p className="text-base font-medium text-serif-foreground mb-1">
              {activeDoc?.label ?? 'GVD'} not yet available
            </p>
            <p className="text-sm">This document is in development. Pick another GVD above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
