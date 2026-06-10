// ─────────────────────────────────────────────────────────────────────────
// Literature Reviews — pre-baked iStent / OAG demo example (DEMO_MODE).
//
// The saved search, its retrieved PMIDs, the per-article screening states, and
// the push-to-library payloads are all static here — no live PubMed, no DB.
//
// The 22 "existing" results are derived from the canonical Library articles
// (single source of truth). The 4 "new" results below are real iStent-specific
// PubMed articles NOT yet in the Library — pushing the search lands those 4 and
// dedupes the 22 by PMID.
//
// Source for the 4 new articles: PubMed. DOIs carried per article for
// attribution.
// ─────────────────────────────────────────────────────────────────────────

import { ARTICLES, type Article } from '@/lib/library/data'
import { DEFAULT_CRITERIA } from '@/lib/litsearch/searchCriteria'
import type {
  SavedSearch,
  SearchResult,
  ScreeningResult,
  CriteriaCheck,
} from '@/lib/litsearch/types'

// ── Saved search: Epidemiology & burden of uncontrolled OAG ───────────────
export const OAG_SAVED_SEARCH: SavedSearch = {
  id: 'demo-search-oag',
  name: 'Epidemiology and burden of uncontrolled open-angle glaucoma',
  researchQuestion:
    'What is the epidemiology and burden of open-angle glaucoma across major markets, including general and diagnosed prevalence, the proportion with uncontrolled disease, and the population eligible for surgical (MIGS) intervention?',
  queryString:
    '("open-angle glaucoma" OR "POAG" OR "OAG") AND ("prevalence" OR "incidence" OR "epidemiology" OR "burden") AND ("uncontrolled" OR "advanced" OR "surgical" OR "MIGS")',
  framework: 'PICO',
  blocks: [
    { type: 'P', label: 'P — Population', blockOperator: 'AND', terms: [
      { id: 'gl-t1', text: 'open-angle glaucoma', operator: 'OR' },
      { id: 'gl-t2', text: 'POAG', operator: 'OR' },
      { id: 'gl-t3', text: 'OAG', operator: 'OR' },
    ] },
    { type: 'I', label: 'I — Intervention', blockOperator: 'AND', terms: [
      { id: 'gl-t4', text: 'prevalence', operator: 'OR' },
      { id: 'gl-t5', text: 'incidence', operator: 'OR' },
      { id: 'gl-t6', text: 'epidemiology', operator: 'OR' },
      { id: 'gl-t7', text: 'burden', operator: 'OR' },
    ] },
    { type: 'C', label: 'C — Context', blockOperator: 'AND', terms: [
      { id: 'gl-t8', text: 'uncontrolled', operator: 'OR' },
      { id: 'gl-t9', text: 'advanced', operator: 'OR' },
      { id: 'gl-t10', text: 'surgical', operator: 'OR' },
    ] },
    { type: 'O', label: 'O — Outcomes', blockOperator: 'AND', terms: [
      { id: 'gl-t11', text: 'intraocular pressure', operator: 'OR' },
      { id: 'gl-t12', text: 'visual field progression', operator: 'OR' },
      { id: 'gl-t13', text: 'MIGS', operator: 'OR' },
    ] },
  ],
  criteria: DEFAULT_CRITERIA.map((c) => {
    if (c.parameterId === 'population')
      return { ...c, inclusionText: 'Adults with open-angle glaucoma; uncontrolled / surgical-eligible subgroups', exclusionText: 'Angle-closure or congenital glaucoma only' }
    if (c.parameterId === 'comparison')
      return { ...c, inclusionText: 'Major markets: US, EU5, China, Japan, India', exclusionText: '' }
    if (c.parameterId === 'study_design')
      return { ...c, inclusionText: 'Population-based studies, SLRs/MAs, RWE, RCTs, economic evaluations', exclusionText: 'Animal / in vitro studies, case reports' }
    if (c.parameterId === 'language')
      return { ...c, inclusionText: 'English', exclusionText: 'Non-English publications' }
    return c
  }),
  filters: { language: 'english', dateFrom: '2019-01-01', dateTo: '2026-06-01' },
  highlightTerms: [
    { id: 'gl-h1', text: 'open-angle glaucoma', picoType: 'P' },
    { id: 'gl-h2', text: 'primary open-angle glaucoma', picoType: 'P' },
    { id: 'gl-h3', text: 'POAG', picoType: 'P' },
    { id: 'gl-h4', text: 'prevalence', picoType: 'I' },
    { id: 'gl-h5', text: 'incidence', picoType: 'I' },
    { id: 'gl-h6', text: 'uncontrolled', picoType: 'C' },
    { id: 'gl-h7', text: 'advanced', picoType: 'C' },
    { id: 'gl-h8', text: 'intraocular pressure', picoType: 'O' },
    { id: 'gl-h9', text: 'visual field progression', picoType: 'O' },
    { id: 'gl-h10', text: 'minimally invasive glaucoma surgery', picoType: 'O' },
    { id: 'gl-h11', text: 'MIGS', picoType: 'O' },
  ],
  resultCount: 26,
  createdAt: '2026-03-28T09:00:00Z',
  lastRunAt: '2026-05-30T11:40:00Z',
  createdBy: 'Demo User',
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Strip a DOI out of a canonical article URL (https://doi.org/<doi>). */
function doiFromUrl(url: string | null): string | undefined {
  if (!url) return undefined
  const m = url.match(/doi\.org\/(.+)$/)
  return m ? m[1] : undefined
}

/** Map a canonical Library Article → a Lit Search SearchResult for display. */
function articleToSearchResult(a: Article): SearchResult {
  return {
    pmid: a.pmid ?? a.id,
    title: a.title ?? a.id,
    authors: a.authors ? a.authors.split(',').map(s => s.trim()).filter(Boolean) : [],
    journal: a.journal ?? '',
    pubDate: a.pub_date ?? (a.pub_year ? `${a.pub_year}-01-01` : ''),
    abstract: a.abstract ?? '',
    doi: doiFromUrl(a.url),
    pubmedUrl: a.pub_link ?? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
  }
}

/** All-criteria-met checks for an included article. */
const ALL_MET_CHECKS: CriteriaCheck[] = DEFAULT_CRITERIA.map(c => ({
  parameterId: c.parameterId,
  parameterLabel: c.parameterLabel,
  met: true,
}))

function includeScreening(pmid: string, confidence: number, justification: string): ScreeningResult {
  return {
    pmid,
    decision: 'include',
    confidence,
    simplifiedReason: 'Relevant article',
    justification,
    criteriaChecks: ALL_MET_CHECKS,
    overridden: false,
    aiDecision: 'include',
    aiConfidence: confidence,
  }
}

// ── The 4 NEW iStent-specific articles (not yet in the Library) ─────────────
// Each carries a SearchResult (for the Results table) and a canonical Article
// (the push-to-library payload). Source: PubMed.

interface NewArticle {
  result: SearchResult
  screening: ScreeningResult
  article: Article
}

const NEW_ARTICLES: NewArticle[] = [
  {
    result: {
      pmid: '36260288',
      title: 'Effectiveness and Safety of iStent infinite Trabecular Micro-Bypass for Uncontrolled Glaucoma',
      authors: ['Sarkisian SR', 'Grover DS', 'Gallardo MJ', 'Brubaker JW', 'Giamporcaro JE', 'Hornbeak DM', 'Katz LJ', 'Navratil T'],
      journal: 'Journal of Glaucoma',
      pubDate: '2022-10-20',
      doi: '10.1097/IJG.0000000000002141',
      abstract: 'The iStent infinite Trabecular Micro-Bypass System implanted in patients with open angle glaucoma (OAG) uncontrolled by prior surgical or medical therapy was effective in reducing mean diurnal intraocular pressure with a favorable safety profile. This prospective, multicenter, single-arm trial implanted iStent infinite (3 iStent inject W stents) as a stand-alone procedure in eyes with OAG uncontrolled by prior incisional/cilioablative surgery or maximum tolerated medical therapy. 76.1% of enrolled patients met the responder endpoint (≥20% mean diurnal IOP reduction at month 12), with a mean reduction of 5.9 mmHg. Safety was favorable, with no explants, infection, device-related interventions, or hypotony.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/36260288/',
    },
    screening: includeScreening('36260288', 98, 'Pivotal stand-alone iStent infinite trial in uncontrolled OAG; reports IOP-lowering effectiveness and safety in the surgical-eligible population. Directly on-topic for the surgical (MIGS) tier of the funnel.'),
    article: {
      id: 'Sarkisian, 2022',
      pmid: '36260288',
      url: 'https://doi.org/10.1097/IJG.0000000000002141',
      product_group: 'Multiple',
      brand: 'Multiple',
      inn: null,
      product_display: 'Multiple',
      indication: 'Open-Angle Glaucoma',
      title: 'Effectiveness and Safety of iStent infinite Trabecular Micro-Bypass for Uncontrolled Glaucoma',
      authors: 'Sarkisian SR, Grover DS, Gallardo MJ, Brubaker JW, Giamporcaro JE, Hornbeak DM, Katz LJ, Navratil T',
      journal: 'Journal of Glaucoma',
      pub_date: '2022-10-20',
      pub_year: 2022,
      pub_link: 'https://pubmed.ncbi.nlm.nih.gov/36260288/',
      pub_type: 'Manuscript',
      study_type: 'Clinical',
      study_design: null,
      geography: 'United States',
      sponsor: null,
      population: 'Adults with OAG uncontrolled by prior surgery or maximum tolerated medical therapy',
      interventions: 'iStent infinite (3 trabecular micro-bypass stents), stand-alone',
      outcomes: null,
      categories: [{ category: 'Management', subcategories: ['Treatment patterns'] }],
      scientific_narrative_link: null,
      value_message_link: null,
      objection_handler_link: null,
      abstract: 'The iStent infinite Trabecular Micro-Bypass System implanted in patients with open angle glaucoma (OAG) uncontrolled by prior surgical or medical therapy was effective in reducing mean diurnal intraocular pressure with a favorable safety profile. In this prospective, multicenter, single-arm trial, 76.1% of enrolled patients met the responder endpoint (≥20% mean diurnal IOP reduction at month 12), with a mean reduction of 5.9 mmHg and no explants, infection, device-related interventions, or hypotony.',
      funnel_level: 'L5 Surgical-eligible (MIGS)',
      theme: 'epi',
    },
  },
  {
    result: {
      pmid: '39812758',
      title: 'Third-Generation Trabecular Micro-Bypass Implantation with Phacoemulsification for Glaucoma',
      authors: ['Vest Z', 'Alinaghizadeh N', 'Prendergast C'],
      journal: 'Ophthalmology and Therapy',
      pubDate: '2025-01-15',
      doi: '10.1007/s40123-024-01087-7',
      abstract: 'This retrospective, consecutive, real-world case series assessed iStent infinite (third-generation trabecular micro-bypass, three stents) implanted with phacoemulsification in patients with mild-to-moderate primary open-angle glaucoma (POAG). Among 121 eyes, mean IOP reduced from 18.1 to 13.8 mmHg (23.8%) and medications from 1.38 to 1.06 at 12 months. The proportion of eyes achieving IOP ≤15 mmHg rose from 21.9% to 75.0%. Adverse events were largely mild and transient; fewer than 3% required secondary intervention. This is one of the first and largest published datasets for the device combined with cataract surgery in real-world usage.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/39812758/',
    },
    screening: includeScreening('39812758', 95, 'Large real-world series of iStent infinite + phaco in mild-to-moderate POAG, reporting IOP and medication reduction. Strong real-world evidence for the surgical-eligible population.'),
    article: {
      id: 'Vest, 2025',
      pmid: '39812758',
      url: 'https://doi.org/10.1007/s40123-024-01087-7',
      product_group: 'Multiple',
      brand: 'Multiple',
      inn: null,
      product_display: 'Multiple',
      indication: 'Open-Angle Glaucoma',
      title: 'Third-Generation Trabecular Micro-Bypass Implantation with Phacoemulsification for Glaucoma',
      authors: 'Vest Z, Alinaghizadeh N, Prendergast C',
      journal: 'Ophthalmology and Therapy',
      pub_date: '2025-01-15',
      pub_year: 2025,
      pub_link: 'https://pubmed.ncbi.nlm.nih.gov/39812758/',
      pub_type: 'Manuscript',
      study_type: 'RWE',
      study_design: null,
      geography: 'United States',
      sponsor: null,
      population: '121 eyes with mild-to-moderate POAG undergoing combined cataract surgery',
      interventions: 'iStent infinite (three stents) with phacoemulsification',
      outcomes: null,
      categories: [{ category: 'Management', subcategories: ['Treatment patterns'] }],
      scientific_narrative_link: null,
      value_message_link: null,
      objection_handler_link: null,
      abstract: 'Retrospective real-world case series of iStent infinite implanted with phacoemulsification in mild-to-moderate POAG. Among 121 eyes, mean IOP reduced from 18.1 to 13.8 mmHg (23.8%) and medications from 1.38 to 1.06 at 12 months, with eyes achieving IOP ≤15 mmHg rising from 21.9% to 75.0% and favorable safety.',
      funnel_level: 'L5 Surgical-eligible (MIGS)',
      theme: 'epi',
    },
  },
  {
    result: {
      pmid: '40128494',
      title: 'Six-Month Outcomes from a Prospective, Randomized Study of iStent infinite Versus Hydrus in Open-Angle Glaucoma: The INTEGRITY Study',
      authors: ['Ahmed IIK', 'Berdahl JP', 'Yadgarov A', 'Reiss GR', 'Sarkisian SR', 'Gagné S', 'Robles M', 'Voskanyan LA', 'Sadruddin O', 'Parizadeh D', 'Giamporcaro JE', 'Kothe AC', 'Katz LJ', 'Navratil T'],
      journal: 'Ophthalmology and Therapy',
      pubDate: '2025-03-25',
      doi: '10.1007/s40123-025-01126-x',
      abstract: 'INTEGRITY is a prospective, randomized, double-masked, multicenter study comparing stand-alone implantation of iStent infinite (three trabecular micro-bypass stents) versus Hydrus (one stent) in adults with open-angle glaucoma. At month 6, similar proportions achieved ≥20% mean diurnal IOP reduction (82.7% iStent infinite vs 78.9% Hydrus); for unmedicated reduction without surgical complications the difference favored iStent infinite (78.2% vs 65.0%). iStent infinite had significantly fewer surgical complications (3.3% vs 16.9%). Both devices produced clinically meaningful IOP reduction.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/40128494/',
    },
    screening: includeScreening('40128494', 97, 'Head-to-head randomized trial of iStent infinite vs Hydrus in OAG with comparative effectiveness and safety outcomes. High-value comparative evidence for the surgical-eligible tier.'),
    article: {
      id: 'Ahmed, 2025',
      pmid: '40128494',
      url: 'https://doi.org/10.1007/s40123-025-01126-x',
      product_group: 'Multiple',
      brand: 'Multiple',
      inn: null,
      product_display: 'Multiple',
      indication: 'Open-Angle Glaucoma',
      title: 'Six-Month Outcomes from a Prospective, Randomized Study of iStent infinite Versus Hydrus in Open-Angle Glaucoma: The INTEGRITY Study',
      authors: 'Ahmed IIK, Berdahl JP, Yadgarov A, Reiss GR, Sarkisian SR, Gagné S, Robles M, Voskanyan LA, Sadruddin O, Parizadeh D, Giamporcaro JE, Kothe AC, Katz LJ, Navratil T',
      journal: 'Ophthalmology and Therapy',
      pub_date: '2025-03-25',
      pub_year: 2025,
      pub_link: 'https://pubmed.ncbi.nlm.nih.gov/40128494/',
      pub_type: 'Manuscript',
      study_type: 'Clinical',
      study_design: null,
      geography: 'North America',
      sponsor: null,
      population: 'Adults with open-angle glaucoma randomized to stand-alone stent implantation',
      interventions: 'iStent infinite (three stents) vs Hydrus Microstent (one stent)',
      outcomes: null,
      categories: [{ category: 'Management', subcategories: ['Treatment patterns'] }],
      scientific_narrative_link: null,
      value_message_link: null,
      objection_handler_link: null,
      abstract: 'INTEGRITY randomized, double-masked, multicenter study comparing stand-alone iStent infinite versus Hydrus in OAG. At month 6, similar proportions achieved ≥20% mean diurnal IOP reduction (82.7% vs 78.9%); unmedicated reduction without surgical complications favored iStent infinite (78.2% vs 65.0%), which also had significantly fewer surgical complications (3.3% vs 16.9%).',
      funnel_level: 'L5 Surgical-eligible (MIGS)',
      theme: 'epi',
    },
  },
  {
    result: {
      pmid: '34427250',
      title: 'iStent versus iStent inject implantation combined with phacoemulsification in open angle glaucoma',
      authors: ['Shalaby WS', 'Lam SS', 'Arbabi A', 'Myers JS', 'Moster MR', 'Kolomeyer NN', 'Razeghinejad R', 'Shukla AG', 'Hussein TR', 'Eid TM', 'Shalaby SM', 'Lee D'],
      journal: 'Indian Journal of Ophthalmology',
      pubDate: '2021-09-01',
      doi: '10.4103/ijo.IJO_308_21',
      abstract: 'This single-center retrospective comparative case series compared iStent versus iStent inject combined with phacoemulsification in open angle glaucoma (197 eyes; ≥1 year follow-up). Both groups achieved significant IOP and medication reduction at months 6 and 12. iStent inject achieved lower IOP at month 6 and a higher proportion of eyes reaching IOP ≤15 mmHg at months 6 and 12, though overall surgical success was comparable. Older age and lower baseline IOP — rather than stent type — predicted surgical failure.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/34427250/',
    },
    screening: includeScreening('34427250', 93, 'Comparative case series of iStent vs iStent inject with cataract surgery in OAG, reporting IOP and medication outcomes. Relevant treatment-pattern evidence for the surgical-eligible population.'),
    article: {
      id: 'Shalaby, 2021',
      pmid: '34427250',
      url: 'https://doi.org/10.4103/ijo.IJO_308_21',
      product_group: 'Multiple',
      brand: 'Multiple',
      inn: null,
      product_display: 'Multiple',
      indication: 'Open-Angle Glaucoma',
      title: 'iStent versus iStent inject implantation combined with phacoemulsification in open angle glaucoma',
      authors: 'Shalaby WS, Lam SS, Arbabi A, Myers JS, Moster MR, Kolomeyer NN, Razeghinejad R, Shukla AG, Hussein TR, Eid TM, Shalaby SM, Lee D',
      journal: 'Indian Journal of Ophthalmology',
      pub_date: '2021-09-01',
      pub_year: 2021,
      pub_link: 'https://pubmed.ncbi.nlm.nih.gov/34427250/',
      pub_type: 'Manuscript',
      study_type: 'RWE',
      study_design: null,
      geography: 'United States',
      sponsor: null,
      population: '197 eyes with open angle glaucoma undergoing combined cataract surgery',
      interventions: 'iStent vs iStent inject with phacoemulsification',
      outcomes: null,
      categories: [{ category: 'Management', subcategories: ['Treatment patterns'] }],
      scientific_narrative_link: null,
      value_message_link: null,
      objection_handler_link: null,
      abstract: 'Single-center retrospective comparative case series comparing iStent versus iStent inject with phacoemulsification in OAG (197 eyes). Both groups achieved significant IOP and medication reduction; iStent inject reached lower IOP at month 6 and more eyes with IOP ≤15 mmHg, while overall surgical success was comparable. Older age and lower baseline IOP predicted failure rather than stent type.',
      funnel_level: 'L5 Surgical-eligible (MIGS)',
      theme: 'epi',
    },
  },
]

// ── Assembled demo result set: 22 existing (from Library) + 4 new ──────────

const EXISTING_RESULTS: SearchResult[] = ARTICLES.map(articleToSearchResult)

const EXISTING_SCREENINGS: Record<string, ScreeningResult> = {}
ARTICLES.forEach((a, i) => {
  const pmid = a.pmid ?? a.id
  // Deterministic high-confidence include for each curated Library article.
  const confidence = 90 + ((i * 3) % 9) // 90–98
  EXISTING_SCREENINGS[pmid] = includeScreening(
    pmid,
    confidence,
    `Curated Library article on ${a.indication ?? 'open-angle glaucoma'} (${a.funnel_level ?? 'funnel-tagged'}). Matches the population, outcomes, and study-design criteria for this search.`,
  )
})

/** All retrieved PMIDs for the example, in display order (new first). */
export const DEMO_RETRIEVED_PMIDS: string[] = [
  ...NEW_ARTICLES.map(n => n.result.pmid),
  ...EXISTING_RESULTS.map(r => r.pmid),
]

/** Full SearchResult set, keyed in the same order as DEMO_RETRIEVED_PMIDS. */
export const DEMO_SEARCH_RESULTS: SearchResult[] = [
  ...NEW_ARTICLES.map(n => n.result),
  ...EXISTING_RESULTS,
]

/** Screening verdicts keyed by PMID (all included for this curated example). */
export const DEMO_SCREENINGS: Record<string, ScreeningResult> = {
  ...EXISTING_SCREENINGS,
  ...Object.fromEntries(NEW_ARTICLES.map(n => [n.result.pmid, n.screening])),
}

/**
 * Canonical Article push payloads for the 4 NEW articles, keyed by PMID. The
 * 22 existing results dedupe against the Library by PMID, so only these are
 * ever appended on push.
 */
export const DEMO_PUSH_ARTICLES: Record<string, Article> = Object.fromEntries(
  NEW_ARTICLES.map(n => [n.result.pmid, n.article]),
)

/** Quick lookup of a SearchResult by PMID. */
export const DEMO_RESULT_BY_PMID: Record<string, SearchResult> = Object.fromEntries(
  DEMO_SEARCH_RESULTS.map(r => [r.pmid, r]),
)
