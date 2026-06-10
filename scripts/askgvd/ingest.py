"""Ask GVD ingestion: parses the alphabetinib CLL/SLL GVD PDF into
structured chapter/section JSON plus a chat corpus with section + page metadata.

The PDF's text-extraction quirks force a two-pass parse:
  - The page header on every body page is "<page-number> Novoneumax Pharma",
    which gets mashed into the first line and looks like a section header.
    We strip that aggressively before any pattern matching.
  - PDF extraction occasionally collapses a chapter title and its first
    sub-section title onto one line, e.g. "3 ALPHABETINIB VALUE STORY    3.1
    Value proposition". So we run finditer (not line-anchored) for sub-section
    patterns and a separate finditer for chapter patterns.
"""

import re
import json
from pathlib import Path
from pypdf import PdfReader

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE = REPO_ROOT / 'data' / 'source' / 'Alnyx_CLL_GVD.pdf'
OUT_DIR = REPO_ROOT / 'data' / 'askgvd'
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------- A. Read PDF text page by page ----------
reader = PdfReader(str(SOURCE))
total_pages = len(reader.pages)
print(f'PDF has {total_pages} pages')

pages = []
for i, page in enumerate(reader.pages):
    txt = page.extract_text() or ''
    pages.append({'page_num': i + 1, 'text': txt})

# ---------- B. Strip header/footer boilerplate aggressively ----------
# Page headers appear as: "<page-number> Novoneumax Pharma" at the START of
# many body pages, mashed onto the same line as the page's first content line.
# Also: "NEXGENVION GLOBAL – CONFIDENTIAL <page-number>" appears at top of others.
PAGE_HEADER_PATTERNS = [
    re.compile(r'^\s*\d+\s+Novoneumax\s+Pharma\s*', re.MULTILINE | re.IGNORECASE),
    re.compile(r'NEXGENVION\s+GLOBAL\s*[–-]\s*CONFIDENTIAL\s*\d*', re.IGNORECASE),
    re.compile(r'Novoneumax\s+Pharma\s*\d*', re.IGNORECASE),
    re.compile(r'^\s*\d+\s*$', re.MULTILINE),  # bare page numbers
    re.compile(r'STRICTLY\s+CONFIDENTIAL\s*(For\s+internal\s+use\s+only)?', re.IGNORECASE),
]


def clean(text):
    for pat in PAGE_HEADER_PATTERNS:
        text = pat.sub(' ', text)
    # Don't collapse runs of spaces — they're load-bearing as section
    # boundary markers ("X TITLE    Y.Z subtitle"). Only collapse newlines.
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


for p in pages:
    p['text'] = clean(p['text'])

# ---------- C. Section detection ----------
# We use TWO regexes:
#   - CHAPTER_RE matches single-digit-number + ALL-CAPS title (5–80 chars)
#   - SUBSECTION_RE matches X.Y or X.Y.Z + mixed-case title (3–80 chars)
# Both are searched as finditer over each page's full text (not line-anchored),
# because PDF extraction sometimes mashes section headers onto a single line
# with surrounding content.

# Chapter: 1-9 + ALL-CAPS title (5–80 chars). Lookahead also accepts a
# following sub-section number ("STORY 3.1...") since the PDF often mashes
# them together.
CHAPTER_RE = re.compile(
    r'(?:^|\n|\s{2,})(?P<number>[1-9])\s+(?P<title>[A-Z][A-Z0-9 /\-&,()]{4,80}?)(?=\s{2,}|\n|$|\s+\d|[a-z])',
    re.MULTILINE,
)

# Sub-section: X.Y or X.Y.Z + mixed-case title. Allow single-whitespace
# start (PDF extraction sometimes only gives one space between section
# header and the next thing). Title is bounded by 2+ whitespace, newline,
# or end — and end-of-title also accepts the start of a body-text run
# (a multi-char lowercase word) so titles don't run on into the body.
SUBSECTION_RE = re.compile(
    r'(?:^|\n|\s)(?P<number>[1-9]\d?\.\d+(?:\.\d+)?)\s+(?P<title>[A-Z][^\n]{2,80}?)(?=\s{2,}|\n|$|\s+[a-z]\w{4,}\s+\w)',
    re.MULTILINE,
)


def is_real_section(title: str) -> bool:
    if len(title) > 100:
        return False
    lower = title.lower().strip()
    bad_prefixes = ('table ', 'figure ', 'source:', 'note:', 'see ', 'p.',
                    'mg ', 'mg/', 'ml ', '%')
    if lower.startswith(bad_prefixes):
        return False
    # Must contain at least one alphabetic char
    if not re.search(r'[A-Za-z]', title):
        return False
    return True


# Hardcoded chapter title set (uppercase) for validation — anything we detect
# whose number is single-digit but title doesn't match one of these is a false positive.
EXPECTED_CHAPTERS = {
    '1': 'INTRODUCTION',
    '2': 'EXECUTIVE SUMMARY',
    '3': 'ALPHABETINIB VALUE STORY',
    '4': 'BURDEN OF R/R CLL',
    '5': 'INTRODUCTION TO ALPHABETINIB',
    '6': 'ECONOMIC EVALUATION',
    '7': 'APPENDICES',
    '8': 'REFERENCES',
}

# Pages 1–6 are front matter (cover, TOC, list of figures/tables/abbreviations).
# They contain section-number-looking entries — e.g. "1.1 About ... 7" — that
# would otherwise be picked up as anchors and shadow the real body anchors.
FRONT_MATTER_LAST_PAGE = 6

anchors = []
seen_keys = set()

for p in pages:
    if p['page_num'] <= FRONT_MATTER_LAST_PAGE:
        continue
    text = p['text']
    # Find chapter anchors first — accept only those matching EXPECTED_CHAPTERS
    for m in CHAPTER_RE.finditer(text):
        number = m.group('number').strip()
        title = m.group('title').strip().rstrip(' .')
        expected = EXPECTED_CHAPTERS.get(number)
        if not expected:
            continue
        # Title must start with the expected uppercase title (allow trailing chars)
        if not title.startswith(expected[:min(len(expected), 12)]):
            continue
        if not is_real_section(title):
            continue
        key = ('1', number)  # depth-1 key
        if key in seen_keys:
            continue
        seen_keys.add(key)
        anchors.append({
            'number': number,
            'title': expected,  # use the canonical title, not what we detected
            'page_num': p['page_num'],
            'depth': 1,
        })
    # Find sub-section anchors
    for m in SUBSECTION_RE.finditer(text):
        number = m.group('number').strip()
        title = m.group('title').strip().rstrip(' .')
        if not is_real_section(title):
            continue
        depth = number.count('.') + 1
        key = (str(depth), number)
        if key in seen_keys:
            continue
        seen_keys.add(key)
        anchors.append({
            'number': number,
            'title': title,
            'page_num': p['page_num'],
            'depth': depth,
        })


def section_sort_key(a):
    return tuple(int(n) for n in a['number'].split('.'))


anchors.sort(key=section_sort_key)
print(f'Detected {len(anchors)} section anchors')

# ---------- D. Build the chapter tree ----------
chapters = []
chapter_by_number = {}
for a in anchors:
    if a['depth'] == 1:
        c = {
            'number': a['number'],
            'title': a['title'],
            'page_num': a['page_num'],
            'sections': [],
        }
        chapters.append(c)
        chapter_by_number[a['number']] = c

# Attach depth-2 sections to their parent chapter
for a in anchors:
    if a['depth'] == 2:
        parent = a['number'].split('.')[0]
        if parent in chapter_by_number:
            chapter_by_number[parent]['sections'].append({
                'number': a['number'],
                'title': a['title'],
                'page_num': a['page_num'],
            })

print(f'Built {len(chapters)} chapters')

# ---------- E. Extract per-section content ----------
# Concatenate ALL pages' text with page-break markers, then split on detected
# anchor positions (re-finding each anchor's exact byte offset).
joined = []
page_offsets = []  # parallel list: index in `joined` where each page starts
running = 0
for p in pages:
    page_offsets.append((p['page_num'], running))
    joined.append(p['text'])
    joined.append('\n\n')
    running += len(p['text']) + 2
full_text = ''.join(joined)


def offset_to_page(offset: int) -> int:
    last_page = 1
    for page_num, off in page_offsets:
        if off > offset:
            break
        last_page = page_num
    return last_page


# Re-find each anchor's character offset in full_text. The anchor's first
# occurrence after its page's start is the one we want.
anchor_offsets = []
for a in anchors:
    page_off = next((o for pn, o in page_offsets if pn == a['page_num']), 0)
    # Pattern: number followed by space + title prefix (first ~30 chars)
    title_head = re.escape(a['title'][:30])
    pat = re.compile(r'\b' + re.escape(a['number']) + r'\s+' + title_head)
    m = pat.search(full_text, pos=page_off)
    if m:
        anchor_offsets.append((m.start(), a))
    else:
        # Fall back: just use the page offset
        anchor_offsets.append((page_off, a))

anchor_offsets.sort(key=lambda x: x[0])

section_content = {}
for i, (offset, a) in enumerate(anchor_offsets):
    next_offset = anchor_offsets[i + 1][0] if i + 1 < len(anchor_offsets) else len(full_text)
    # Skip the anchor's own header in the text
    header_match = re.match(
        r'\b' + re.escape(a['number']) + r'\s+[^\n]+',
        full_text[offset:next_offset],
    )
    body_start = offset + (header_match.end() if header_match else 0)
    body = full_text[body_start:next_offset].strip()
    pages_covered = sorted({offset_to_page(off) for off in range(offset, min(next_offset, len(full_text)), 200)})
    section_content[a['number']] = {
        'number': a['number'],
        'title': a['title'],
        'page_start': a['page_num'],
        'pages_covered': pages_covered,
        'text': body,
    }

print(f'Extracted text for {len(section_content)} sections')


# ---------- F. Build the chat corpus ----------
corpus = {
    'document_id': 'alnyx_cll_gvd',
    'document_title': 'Alnyx (alphabetinib) in relapsed or refractory chronic lymphocytic leukemia — Global Value Dossier',
    'total_pages': total_pages,
    'sections': sorted(section_content.values(), key=section_sort_key),
}

# ---------- G. Chapter nav ----------
nav = {
    'document_title': corpus['document_title'],
    'chapters': chapters,
}

# ---------- H. Suggested questions ----------
suggested_questions = [
    {'id': 'sq-bun-1', 'category': 'Burden & unmet need',
     'text': 'What are the key patient subpopulations with the highest unmet need?'},
    {'id': 'sq-bun-2', 'category': 'Burden & unmet need',
     'text': 'What is the QoL impact of R/R CLL on patients?'},
    {'id': 'sq-bun-3', 'category': 'Burden & unmet need',
     'text': 'What are the key drivers of socioeconomic burden due to R/R CLL?'},
    {'id': 'sq-sd-1', 'category': 'Study design',
     'text': 'What were the key features of the pivotal study (RESCUE / PCYC-1102)?'},
    {'id': 'sq-sd-2', 'category': 'Study design',
     'text': 'How does the RESONATE study compare alphabetinib to standard of care?'},
    {'id': 'sq-sd-3', 'category': 'Study design',
     'text': 'What patient populations were included in the CLL-3 trial?'},
    {'id': 'sq-eff-1', 'category': 'Effectiveness',
     'text': 'What are the key efficacy outcomes reported with alphabetinib?'},
    {'id': 'sq-eff-2', 'category': 'Effectiveness',
     'text': 'How does alphabetinib perform in high-risk patient subgroups (e.g., del(17p))?'},
    {'id': 'sq-eff-3', 'category': 'Effectiveness',
     'text': 'What is the durability of response with alphabetinib?'},
    {'id': 'sq-cd-1', 'category': 'Clinical differentiation',
     'text': 'How does alphabetinib differentiate from current single-agent therapies?'},
    {'id': 'sq-cd-2', 'category': 'Clinical differentiation',
     'text': 'What is the safety profile of alphabetinib relative to existing treatments?'},
    {'id': 'sq-cd-3', 'category': 'Clinical differentiation',
     'text': "What is the value of alphabetinib's effect on the immune system?"},
]

# ---------- I. Write outputs ----------
CORPUS_PATH = OUT_DIR / 'corpus.json'
CORPUS_PATH.write_text(json.dumps(corpus, indent=2, ensure_ascii=False), encoding='utf-8')

NAV_PATH = OUT_DIR / 'nav.json'
NAV_PATH.write_text(json.dumps(nav, indent=2, ensure_ascii=False), encoding='utf-8')

SUGGESTED_PATH = OUT_DIR / 'suggested-questions.json'
SUGGESTED_PATH.write_text(json.dumps(suggested_questions, indent=2, ensure_ascii=False), encoding='utf-8')

# ---------- J. Stats ----------
print('\n=== Summary ===')
print(f'Pages: {total_pages}')
print(f'Chapters: {len(chapters)}')
for c in chapters:
    print(f'  {c["number"]} {c["title"]} (p.{c["page_num"]}, {len(c["sections"])} sub-sections)')
    for s in c['sections'][:6]:
        print(f'    {s["number"]} {s["title"][:60]}')
    if len(c['sections']) > 6:
        print(f'    ... and {len(c["sections"]) - 6} more')

print(f'\nTotal sections (all depths): {len(corpus["sections"])}')
total_chars = sum(len(s['text']) for s in corpus['sections'])
print(f'Total corpus characters: {total_chars:,}')
if corpus['sections']:
    print(f'Average section length: {total_chars // len(corpus["sections"])} chars')

empty = [s for s in corpus['sections'] if len(s['text']) < 50]
print(f'Sections with <50 chars (likely stub): {len(empty)}')
for s in empty[:5]:
    print(f'  {s["number"]} {s["title"]}: {len(s["text"])} chars')

print(f'\nWrote {CORPUS_PATH}')
print(f'Wrote {NAV_PATH}')
print(f'Wrote {SUGGESTED_PATH}')
