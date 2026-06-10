/**
 * NEXT-STEP BLOCK CONVENTION
 *
 * Assistant messages may end with a "Choose next step" block:
 *
 *   ...some prose response...
 *
 *   **Choose next step:**
 *   - Option label one
 *   - Option label two
 *   - Option label three
 *
 * The block must be at end-of-message (only trailing whitespace allowed after).
 * The UI parses this block, suppresses it from rendered output, and renders the
 * bullet items as clickable buttons. Clicking a button submits its label as
 * the next user message.
 *
 * This convention is used for both:
 *   - Next-step suggestions after substantive answers
 *   - Clarification options when the module clarifies before answering
 *
 * There is no semantic distinction in the markup — only the prose framing
 * differs (an answer vs a question above the block).
 *
 * Failure modes:
 *   - No block          → prose unchanged, options null. Message renders normally.
 *   - Block mid-message → no match, prose unchanged, options null.
 *   - 1 option / 7+     → sanity bounds reject; markdown bullets render through
 *                          the prose path.
 *
 * The marker also tolerates streaming: while only `**Choose next step:` (no
 * closing `**`) has arrived, the regex doesn't match, so the half-formed
 * block stays visible briefly. Once the closing `**` and bullets land, the
 * parser swaps in the button row.
 */

export interface ParsedNextStep {
  prose: string;
  options: string[] | null;
}

// Matches:
//   **Choose next step:**     (optional surrounding whitespace, optional colon, case-insensitive)
//   - option 1
//   - option 2
//   ...
// Anchored to end-of-message — only trailing whitespace allowed after.
const NEXT_STEP_RE =
  /\n\s*\*\*\s*Choose next step\s*:?\s*\*\*\s*\n((?:[ \t]*[-*][ \t]+[^\n]+\n?)+)\s*$/i;

export function parseNextStepBlock(content: string): ParsedNextStep {
  const match = content.match(NEXT_STEP_RE);
  if (!match || match.index === undefined) {
    return { prose: content, options: null };
  }

  const prose = content.slice(0, match.index).replace(/\s+$/, '');
  const bulletText = match[1];

  const options = bulletText
    .split('\n')
    .map(line => line.replace(/^[ \t]*[-*][ \t]+/, '').trim())
    // Strip optional surrounding markdown emphasis (* or _) Claude sometimes
    // adds around option labels.
    .map(line => line.replace(/^[\*_]+|[\*_]+$/g, '').trim())
    .filter(line => line.length > 0);

  // Sanity bounds — 1 option isn't a useful button row, 7+ clutters the UI.
  if (options.length < 2 || options.length > 6) {
    return { prose: content, options: null };
  }

  return { prose, options };
}
