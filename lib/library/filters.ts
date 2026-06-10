import type { Article } from './data';
import { ARTICLES } from './data';

// Demo-time date thresholds for the glaucoma library (articles span 2019–2025).
export const DATE_THRESHOLDS = {
  SINCE_LAST_GVD: '2024-01-01',
  LAST_3_MONTHS: '2025-01-01',
} as const;

export type DateThresholdKey = keyof typeof DATE_THRESHOLDS;

/**
 * Pre-computed article counts for each date threshold.
 * Powers "Since last GVD (N)" / "2025-present (N)" chip labels.
 */
export const DATE_THRESHOLD_COUNTS: Record<DateThresholdKey, number> = {
  SINCE_LAST_GVD: ARTICLES.filter(
    a => a.pub_date && a.pub_date >= DATE_THRESHOLDS.SINCE_LAST_GVD,
  ).length,
  LAST_3_MONTHS: ARTICLES.filter(
    a => a.pub_date && a.pub_date >= DATE_THRESHOLDS.LAST_3_MONTHS,
  ).length,
};

export interface FilterState {
  products: Set<string>;
  productGroups: Set<string>;
  indications: Set<string>;
  pubTypes: Set<string>;
  studyTypes: Set<string>;
  geographies: Set<string>;
  sponsors: Set<string>;
  funnelLevels: Set<string>;
  categories: Set<string>;
  categoryParents: Set<string>;
  search: string;
  /** Quick date filter — mutually exclusive between thresholds. */
  dateThreshold: DateThresholdKey | null;
}

export const EMPTY_FILTERS: FilterState = {
  products: new Set(),
  productGroups: new Set(),
  indications: new Set(),
  pubTypes: new Set(),
  studyTypes: new Set(),
  geographies: new Set(),
  sponsors: new Set(),
  funnelLevels: new Set(),
  categories: new Set(),
  categoryParents: new Set(),
  search: '',
  dateThreshold: null,
};

export function isFilterActive(s: FilterState): boolean {
  return (
    s.products.size > 0 ||
    s.productGroups.size > 0 ||
    s.indications.size > 0 ||
    s.pubTypes.size > 0 ||
    s.studyTypes.size > 0 ||
    s.geographies.size > 0 ||
    s.funnelLevels.size > 0 ||
    s.categories.size > 0 ||
    s.categoryParents.size > 0 ||
    s.search.trim() !== '' ||
    s.dateThreshold !== null
  );
}

export function applyFilters(articles: Article[], s: FilterState): Article[] {
  const q = s.search.trim().toLowerCase();
  const dateMin = s.dateThreshold ? DATE_THRESHOLDS[s.dateThreshold] : null;

  return articles.filter(a => {
    // Products: parent OR child match
    if (s.productGroups.size > 0 || s.products.size > 0) {
      const groupMatch = a.product_group ? s.productGroups.has(a.product_group) : false;
      const childMatch = s.products.has(a.product_display);
      if (!groupMatch && !childMatch) return false;
    }
    if (s.indications.size > 0 && (!a.indication || !s.indications.has(a.indication))) return false;
    if (s.pubTypes.size > 0 && (!a.pub_type || !s.pubTypes.has(a.pub_type))) return false;
    if (s.studyTypes.size > 0 && (!a.study_type || !s.studyTypes.has(a.study_type))) return false;
    if (s.geographies.size > 0 && (!a.geography || !s.geographies.has(a.geography))) return false;
    if (s.funnelLevels.size > 0 && (!a.funnel_level || !s.funnelLevels.has(a.funnel_level))) return false;

    if (s.categoryParents.size > 0 || s.categories.size > 0) {
      const matches = a.categories.some(c => {
        if (s.categoryParents.has(c.category)) return true;
        return c.subcategories.some(sub => s.categories.has(sub));
      });
      if (!matches) return false;
    }

    if (dateMin && (!a.pub_date || a.pub_date < dateMin)) return false;

    if (q) {
      const haystack = [a.title, a.authors, a.abstract, a.product_display]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
