import documentsJson from '@/data/dochub/documents.json';

export interface DocHubDocument {
  id: string;
  date: string | null;
  product: string | null;
  geography: string | null;
  title: string;
  description: string | null;
  type: 'Internal' | 'External' | null;
  tag: string | null;
  agency: string | null;
  summary: string | null;
  has_summary: boolean;
}

export interface DocHubGroup {
  product: string;
  geography: string;
  doc_ids: string[];
  count: number;
}

export interface DocHubFilterTree {
  products: string[];
  geographies: string[];
  types: string[];
  tags: string[];
}

interface DocHubData {
  documents: DocHubDocument[];
  filter_tree: DocHubFilterTree;
  groups: DocHubGroup[];
}

export const DOCHUB_DATA = documentsJson as unknown as DocHubData;

export const DOCHUB_BY_ID: Record<string, DocHubDocument> = Object.fromEntries(
  DOCHUB_DATA.documents.map(d => [d.id, d]),
);
