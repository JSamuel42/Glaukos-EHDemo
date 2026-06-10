'use client';

interface Props {
  pdfPath: string;
  page: number;
}

/**
 * Renders the GVD PDF inline via an iframe. The `#page=N` URL fragment is
 * understood by the browser's built-in PDF viewer (Chrome, Edge, Safari,
 * Firefox) and scrolls the document to that page. We key the iframe by
 * page so React fully remounts it when the page changes — `#page=` hash
 * updates alone are unreliable across browsers (some scroll, some don't,
 * Safari especially), but a key-driven remount always lands on the right
 * page. Slight reload cost is acceptable for a demo navigation pattern.
 */
export default function PdfViewer({ pdfPath, page }: Props) {
  const src = `${pdfPath}#page=${page}&toolbar=1&navpanes=0&statusbar=0&view=FitH`;

  return (
    <div
      className="w-full bg-[color:var(--evhub-navy)]/5 rounded-md overflow-hidden border border-serif-border"
      style={{ height: 'calc(100vh - 200px)', minHeight: 480 }}
    >
      <iframe
        key={`${pdfPath}-${page}`}
        src={src}
        title="GVD document"
        className="w-full h-full border-0"
      />
    </div>
  );
}
