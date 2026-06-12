/**
 * sanitizeSvg — conservative, dependency-free SVG sanitiser for the dossier
 * "raw SVG" visual path (Audit+Fix 2).
 *
 * The raw-SVG visuals come from our own writing agent (our API key, our
 * prompt), so the threat model is low — but we still strip the obvious script
 * vectors before embedding the markup, rather than trusting model output
 * verbatim. We deliberately avoid pulling DOMPurify + jsdom (≈90 transitive
 * packages, awkward on the serverless build): a regex pass runs identically in
 * the browser and during static prerender, where the compiled view is built.
 *
 * This is NOT a general-purpose sanitiser for untrusted third-party SVG. It is
 * scoped to the demo's controlled generation path. The funnel visual never
 * goes through here — its SVG is produced by our own renderer from a JSON spec.
 */

/** Strip script-bearing constructs and event handlers from SVG markup. */
export function sanitizeSvg(input: string): string {
  if (!input) return '';
  let svg = input;

  // Drop anything outside a single root <svg>…</svg> (preamble, code fences).
  const match = svg.match(/<svg[\s\S]*<\/svg>/i);
  if (match) svg = match[0];

  // Remove <script>, <foreignObject> (can host HTML/JS), and <a> wrappers' hrefs.
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
  // Remove <use>/<image> that reference external resources.
  svg = svg.replace(/<(use|image)\b[^>]*\b(?:xlink:href|href)\s*=\s*["'](?!#)[^"']*["'][^>]*>/gi, '');

  // Strip inline event handlers: on*="…" / on*='…'.
  svg = svg.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  svg = svg.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');

  // Neutralise javascript:/data: URIs in href/xlink:href.
  svg = svg.replace(
    /\b(xlink:href|href)\s*=\s*"(?:\s*(?:javascript|data)\s*:)[^"]*"/gi,
    '$1="#"',
  );
  svg = svg.replace(
    /\b(xlink:href|href)\s*=\s*'(?:\s*(?:javascript|data)\s*:)[^']*'/gi,
    "$1='#'",
  );

  // Strip <style> blocks (can carry url()/@import vectors).
  svg = svg.replace(/<style[\s\S]*?<\/style>/gi, '');

  return svg.trim();
}
