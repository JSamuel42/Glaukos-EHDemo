import articlesJson from '@/data/library/articles.json';
import filterTreeJson from '@/data/library/filter-tree.json';

export interface Article {
  id: string;
  url: string | null;
  product_group: string | null;
  brand: string | null;
  inn: string | null;
  product_display: string;
  indication: string | null;
  title: string | null;
  authors: string | null;
  journal: string | null;
  pub_date: string | null;
  pub_year: number | null;
  pub_link: string | null;
  pub_type: string | null;
  study_type: string | null;
  study_design: string | null;
  geography: string | null;
  sponsor: string | null;
  population: string | null;
  interventions: string | null;
  outcomes: string | null;
  categories: { category: string; subcategories: string[] }[];
  scientific_narrative_link: string | null;
  value_message_link: string | null;
  objection_handler_link: string | null;
  abstract: string | null;
  /** Patient-funnel position (L1–L5). Preserved for Phase 3 dossier section linking. */
  funnel_level?: string | null;
  /** Article theme grouping ('epi' | 'burden'). Preserved for dossier linking. */
  theme?: string | null;
  /** PubMed ID. Preserved for traceability and Phase 3 linking. */
  pmid?: string | null;
}

export interface FilterTree {
  products: { group: string; children: string[] }[];
  indications: string[];
  pub_types: string[];
  study_types: string[];
  geographies: string[];
  sponsors: string[];
  categories: { category: string; subcategories: string[] }[];
  funnel_levels: string[];
}

export const ARTICLES = articlesJson as unknown as Article[];
export const FILTER_TREE = filterTreeJson as unknown as FilterTree;
