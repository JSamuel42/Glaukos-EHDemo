import type { DocHubDocument } from './data';

export interface DocHubFilterState {
  products: Set<string>;
  geographies: Set<string>;
  types: Set<string>;
  tags: Set<string>;
}

export const EMPTY_DOCHUB_FILTERS: DocHubFilterState = {
  products: new Set(),
  geographies: new Set(),
  types: new Set(),
  tags: new Set(),
};

export function isDocHubFilterActive(s: DocHubFilterState): boolean {
  return s.products.size + s.geographies.size + s.types.size + s.tags.size > 0;
}

export function applyDocHubFilters(
  docs: DocHubDocument[],
  s: DocHubFilterState,
): DocHubDocument[] {
  return docs.filter(d => {
    if (s.products.size > 0 && (!d.product || !s.products.has(d.product))) return false;
    if (s.geographies.size > 0 && (!d.geography || !s.geographies.has(d.geography))) return false;
    if (s.types.size > 0 && (!d.type || !s.types.has(d.type))) return false;
    if (s.tags.size > 0 && (!d.tag || !s.tags.has(d.tag))) return false;
    return true;
  });
}
