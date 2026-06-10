import corpusJson from '@/data/askgvd/corpus.json';
import navJson from '@/data/askgvd/nav.json';
import suggestedJson from '@/data/askgvd/suggested-questions.json';

export interface GvdSection {
  number: string;
  title: string;
  page_start: number;
  pages_covered: number[];
  text: string;
}

export interface GvdChapter {
  number: string;
  title: string;
  page_num: number;
  sections: { number: string; title: string; page_num: number }[];
}

export interface GvdCorpus {
  document_id: string;
  document_title: string;
  total_pages: number;
  sections: GvdSection[];
}

export interface GvdNav {
  document_title: string;
  chapters: GvdChapter[];
}

export interface GvdSuggestedQuestion {
  id: string;
  category: string;
  text: string;
}

export const GVD_CORPUS = corpusJson as unknown as GvdCorpus;
export const GVD_NAV = navJson as unknown as GvdNav;
export const GVD_SUGGESTED_QUESTIONS = suggestedJson as unknown as GvdSuggestedQuestion[];

export const GVD_SECTIONS_BY_NUMBER: Record<string, GvdSection> = Object.fromEntries(
  GVD_CORPUS.sections.map(s => [s.number, s]),
);

/** All sections belonging to a chapter (by chapter number, e.g. "5"). */
export function getSectionsForChapter(chapterNumber: string): GvdSection[] {
  return GVD_CORPUS.sections.filter(
    s => s.number === chapterNumber || s.number.startsWith(chapterNumber + '.'),
  );
}

/** Group suggested questions by category, preserving the order they appear in the JSON. */
export function suggestedQuestionsByCategory(): { category: string; questions: GvdSuggestedQuestion[] }[] {
  const seen: string[] = [];
  const groups: Record<string, GvdSuggestedQuestion[]> = {};
  for (const q of GVD_SUGGESTED_QUESTIONS) {
    if (!groups[q.category]) {
      groups[q.category] = [];
      seen.push(q.category);
    }
    groups[q.category].push(q);
  }
  return seen.map(c => ({ category: c, questions: groups[c] }));
}
