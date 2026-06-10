/**
 * Registry of GVDs available to the user. For the demo, only the
 * adult R/R CLL document is real — the others are placeholders to
 * convey the "multiple GVDs per asset" capability of the platform.
 */
export interface GvdDocument {
  id: string;
  label: string;
  populated: boolean;
  pdfPath?: string;
}

export const GVD_DOCUMENTS: GvdDocument[] = [
  {
    id: 'alnyx-adult-rr-cll',
    label: 'Alnyx — Adult R/R CLL/SLL',
    populated: true,
    pdfPath: '/gvd/Alnyx_CLL_GVD.pdf',
  },
  {
    id: 'alnyx-paediatric-cll',
    label: 'Alnyx — Paediatric CLL',
    populated: false,
  },
  {
    id: 'alnyx-post-transplant',
    label: 'Alnyx — Post-transplant CLL',
    populated: false,
  },
  {
    id: 'alnyx-treatment-naive',
    label: 'Alnyx — Treatment-naive CLL',
    populated: false,
  },
];

export const DEFAULT_DOCUMENT_ID = GVD_DOCUMENTS[0].id;

export function getDocumentById(id: string): GvdDocument | undefined {
  return GVD_DOCUMENTS.find(d => d.id === id);
}
