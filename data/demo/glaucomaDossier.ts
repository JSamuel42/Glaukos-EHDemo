// ─────────────────────────────────────────────────────────────────────────
// iStent infinite — Global Value Dossier (Open-Angle Glaucoma) demo seed.
//
// Ported from EvHub-D's glaucomaDossierDetail.ts, restructured into the
// localStorage StoredDossier shape. Section→article links reference the
// canonical Phase-1 Library by article id (ARTICLES order = article number).
//
// Pre-baked sections (1.2.1.1, 1.2.2, 1.2.3) ship with currentContent.
// Live-generation targets (1.1 Disease Overview, 1.2.1.2 Surgical-Eligible
// Population) ship empty; 1.2.1.2 carries a preGenerationNote caveat.
// ─────────────────────────────────────────────────────────────────────────

import { ARTICLES } from '@/lib/library/data';
import type { StoredDossier, StoredSection, StoredArticleLink, StoredContentVersion } from '@/lib/dossier/store';

const DOSSIER_ID = 'demo-dossier-istent-oag';
const LIBRARY_ID = 'demo-library-oag';
const CREATED_AT = '2026-03-01T10:00:00Z';
const NOW = '2026-05-30T15:00:00Z';

/** Map 1-based article numbers → StoredArticleLink against canonical ARTICLES. */
function links(articleNumbers: number[], sectionId: string): StoredArticleLink[] {
  return articleNumbers
    .map((n) => {
      const a = ARTICLES[n - 1];
      if (!a) return null;
      return {
        id: `sal-${sectionId}-${n}`,
        sectionId,
        libraryArticleId: a.id,
        addedAt: CREATED_AT,
      } satisfies StoredArticleLink;
    })
    .filter((l): l is StoredArticleLink => l !== null);
}

const ABSTRACT_ONLY_NOTE =
  'All extractions in this dossier are abstract-only; full-text figures have not been accessed.';

function version(
  id: string,
  sectionId: string,
  wordCount: number,
  createdAt: string,
  content: string,
  agentReasoning: StoredContentVersion['agentReasoning'],
): StoredContentVersion {
  return {
    id, sectionId, content, contentType: 'text', version: 1,
    isCurrent: true, wordCount, source: 'ai', agentReasoning, createdAt,
  };
}

// ── Pre-baked content ───────────────────────────────────────────────────────

const PREVALENCE_CONTENT = `<p>Open-angle glaucoma exerts a substantial and progressively expanding global burden, driven principally by population ageing and an asymptomatic clinical course that allows disease to accumulate before diagnosis. A systematic review and meta-analysis of prospective cohorts quantified this trajectory directly: in 2022, the global incidence of primary open-angle glaucoma stood at 23.46 (95% CI 15.68–32.91) new cases per 10,000 person-years among adults aged 40–79, with an age-specific gradient that intensifies sharply across the seventh and eighth decades — from 5.51 per 10,000 at 40–44 years to 64.36 per 10,000 at 75–79 years [#1]. The pooled annual cumulative incidence of 0.21% indicates that for every five hundred unaffected adults in this age band, approximately one transitions to incident disease each year, and the burden is most concentrated in low sociodemographic-index regions and in Africa, where access to case finding compounds the underlying biological gradient. Elevated intraocular pressure, family history, myopia and advancing age were identified as the principal risk modifiers [#1].</p>

<p>Regional prevalence data triangulate this incidence picture. A meta-analysis of European population-based studies estimated a pooled prevalence of 2.60% (95% CI 1.90–3.56) in the adult population, with rising odds by age and notable variation across the continent — a pattern the authors explicitly attribute to demographic ageing rather than secular changes in disease biology, projecting continued growth in absolute case counts across Europe in the coming decade [#2]. The Thessaloniki Eye Study added longitudinal granularity: in an elderly White urban population in Northern Greece followed for twelve years, the cumulative incidence of open-angle glaucoma reached 4.4% (≈0.37% per annum), with pseudoexfoliative glaucoma contributing 2.1% and a strong association with pseudoexfoliation as the principal modifiable risk pathway in this older cohort [#4].</p>

<p>Diagnosed-prevalence data in major Western markets reinforce the same trajectory. Analysis of the 2019 California Medicare population (5.86 million beneficiaries aged 65 and over) reported that 3.8% carried any glaucoma diagnosis and 2.9% specifically primary open-angle glaucoma, with multivariable predictors including older age, Black versus non-Hispanic White race and higher comorbidity burden [#3]. Across Northeast Asian populations, pooled myopic open-angle glaucoma prevalence reached 4.10% (95% CI 3.00–5.70) within myopic subgroups and 1.10% (95% CI 0.60–1.70) in the general population, anchoring regional estimates for high-myopia markets such as South Korea and Japan [#8]. Taken together, these data delineate a large, geographically heterogeneous diagnosed population that will continue to expand as demographic ageing proceeds across all major markets.</p>`;

const CLINICAL_BURDEN_CONTENT = `<p>Open-angle glaucoma remains the leading cause of irreversible blindness worldwide, and the clinical burden it imposes is shaped by two compounding features of its natural history: progressive and silent retinal ganglion cell loss, and a treatment pathway in which inadequate intraocular pressure control allows damage to accumulate even after diagnosis. The scale of preventable visual loss is illustrated by the Malmö population screening programme, in which 32,918 of 42,497 invited individuals were examined: the cumulative incidence of blindness from glaucoma was 0.17% among screened participants versus 0.32% among potential participants who declined or were not reached, and corresponding low-vision rates were 0.25% and 0.53%. The roughly two-fold reduction implies that population-level case finding can avert approximately half of bilateral low vision and blindness attributable to glaucoma in comparable settings, and reframes a substantial share of glaucoma-related visual disability as an avoidable rather than inevitable outcome [#6].</p>

<p>For patients who reach diagnosis, the burden does not end there. A 7- to 11-year follow-up of 127 patients with advanced open-angle glaucoma at presentation documented progression in 46.5% of eyes, with a mean deviation deterioration of −0.43 dB per year overall and −0.67 dB per year among progressors. The risk profile is informative: inadequate intraocular pressure reduction, better baseline mean deviation, presence of disc haemorrhage, and lower central corneal thickness were associated with progression, while patients achieving more than 20.94% intraocular pressure reduction had a lower progression rate [#13]. The implication is that nearly half of an already-advanced cohort continues to lose visual field over a decade despite ongoing therapy, defining a clear population in whom intensified intraocular pressure lowering — including via surgical or device-based approaches — is required.</p>

<p>Severity at presentation varies sharply by age and access. In a thirteen-year retrospective cohort of 106 patients with juvenile open-angle glaucoma (203 eyes), 31.5% of eyes were already blind at first tertiary-care assessment, rising to 35.5% at a mean follow-up of nearly eight years; bilateral blindness increased from 15.2% to 19.8% over the same period, and a higher cumulative number of glaucoma surgeries per patient was associated with visual impairment progression [#15]. In the elderly, the Thessaloniki Eye Study reported a 12-year cumulative incidence of open-angle glaucoma of 4.4% in an urban White population — approximately 0.37% per year — with only 11.1% of incident cases presenting with baseline intraocular pressure above 21 mmHg, underscoring the limitations of pressure-based screening alone and the need for structural or functional case-finding pathways [#4].</p>`;

const HUMANISTIC_BURDEN_CONTENT = `<p>The humanistic burden of open-angle glaucoma is best characterised not by a single number but by the convergence of multiple validated patient-reported outcome instruments, each pointing to the same conclusion: vision-specific quality of life deteriorates measurably as disease severity advances, and the trajectory is reversible only to the extent that intraocular pressure can be controlled durably. The Treatment of Advanced Glaucoma Study (TAGS), a UK multicentre randomised controlled trial of 453 adults with newly diagnosed advanced open-angle glaucoma, provides the clearest contemporary anchor. At five-year follow-up, vision-specific quality of life on the VFQ-25 was similar between patients managed with primary trabeculectomy (83.3) and those managed medically (81.3), yet mean intraocular pressure was meaningfully lower with surgery (12.07 vs 14.76 mmHg) and visual field mean deviation was better preserved. The interpretive point is consequential: comparable five-year vision-specific quality of life is reached only when the surgical arm delivers materially superior disease control, indicating that the disease itself, not the modality of treatment, drives the humanistic outcome [#10].</p>

<p>Presentation stage independently shapes humanistic burden. A clinical review of advanced-at-diagnosis disease characterises the typical patient profile — asymptomatic high intraocular pressure, no family history, social disadvantage, and limited engagement with routine sight testing — and notes that everyday functional capacity (reading, walking, driving) declines disproportionately once bilateral visual field loss is present. Quality-of-life scores worsen faster with each additional decibel lost when the underlying damage is advanced, transforming what is often framed as a slowly progressive condition into a steep, irreversible decline at the late end of the severity spectrum [#11]. This reinforces the structural argument for case finding earlier in the funnel and for therapies that durably arrest progression once disease is identified.</p>

<p>Quantitative instrument-level evidence in moderate-to-severe disease completes the picture. A cross-sectional Indian study of 122 participants administered three glaucoma-specific tools (GAL-9, GQL-15, and the Viswanathan questionnaire) and observed a graded deterioration in scores from controls to moderate to severe primary open-angle glaucoma across all three instruments. Activity limitation in dark adaptation emerged as the dominant deficit in moderate disease, while limitation of activities requiring central and near vision became most pronounced as disease progressed to severe — concrete and clinically interpretable functional losses that map directly onto night-time mobility, reading, and recognition of familiar faces. The convergence across three independent instruments strengthens the inference that the magnitude of humanistic loss is real rather than instrument-dependent [#12].</p>`;

// ── Section list ────────────────────────────────────────────────────────────

const sections: StoredSection[] = [
  {
    id: 'demo-gla-sec-1', dossierId: DOSSIER_ID, parentSectionId: null,
    number: '1', title: 'Disease Background', status: 'draft', orderIndex: 0,
    guidanceNotes: '• Frame open-angle glaucoma along the disease funnel (general → diagnosed → treated → uncontrolled → surgical-eligible)\n• Establish epidemiological context and humanistic / clinical burden\n• Set up the unmet-need argument for MIGS / iStent infinite',
    articleLinks: [], contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-11', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-1',
    number: '1.1', title: 'Disease Overview', status: 'pending', orderIndex: 0,
    guidanceNotes: '• Define open-angle glaucoma and its pathophysiology (progressive retinal ganglion cell loss)\n• State that elevated intraocular pressure is the principal modifiable risk factor\n• Note that it is the leading cause of irreversible blindness worldwide\n• Summarise the management paradigm (topical therapy → laser → surgery)',
    articleLinks: links([9, 7, 1], 'demo-gla-sec-11'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-12', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-1',
    number: '1.2', title: 'Burden of Disease', status: 'draft', orderIndex: 1,
    guidanceNotes: '• Establish epidemiological scale first (1.2.1), then clinical, humanistic and economic burden\n• Visual impairment / blindness as the principal clinical outcome\n• Quality-of-life impacts in advanced disease and adherence-related costs',
    articleLinks: [], contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-13', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-12',
    number: '1.2.1', title: 'Epidemiology', status: 'draft', orderIndex: 0,
    guidanceNotes: '• General and diagnosed prevalence across major markets\n• Patient funnel: prevalence → diagnosed → treated → uncontrolled → surgical-eligible\n• Size the addressable MIGS population where the evidence allows',
    articleLinks: [], contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-131', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-13',
    number: '1.2.1.1', title: 'Prevalence in Major Markets', status: 'draft', orderIndex: 0,
    guidanceNotes: '• Global incidence and regional prevalence of primary open-angle glaucoma\n• Diagnosed prevalence in major Western markets\n• Asian and Indian context where available\n• Frame estimates within the disease funnel — these are general and diagnosed prevalence, not yet the surgical-eligible subset',
    articleLinks: links([1, 2, 3, 4, 8], 'demo-gla-sec-131'),
    contentVersions: [version('sc-gla-131-v1', 'demo-gla-sec-131', 425, '2026-05-29T14:00:00Z', PREVALENCE_CONTENT, {
      reference_extractions: [
        { article_number: 1, key_findings: 'Global POAG incidence 23.46 per 10,000 person-years (40–79), rising to 64.36 at 75–79; cumulative annual incidence 0.21%.' },
        { article_number: 2, key_findings: 'European POAG prevalence pooled at 2.60% (95% CI 1.90–3.56); rising odds with age; projected growth from population ageing.' },
        { article_number: 3, key_findings: 'California Medicare 2019: 3.8% any glaucoma, 2.9% POAG in beneficiaries aged ≥65; race and comorbidity predictors.' },
        { article_number: 4, key_findings: 'Thessaloniki Eye Study 12-year OAG cumulative incidence 4.4% (~0.37%/year) in elderly White population; pseudoexfoliation key risk factor.' },
        { article_number: 8, key_findings: 'Northeast Asia: 4.10% myopic OAG prevalence in myopic subgroups; 1.10% myopic OAG in general population.' },
      ],
      guidance_coverage: [
        { guidance_point: 'Global incidence and regional prevalence of primary open-angle glaucoma', coverage: 'full', supporting_refs: [1, 2, 4] },
        { guidance_point: 'Diagnosed prevalence in major Western markets', coverage: 'full', supporting_refs: [3] },
        { guidance_point: 'Asian and Indian context where available', coverage: 'partial', supporting_refs: [8] },
        { guidance_point: 'Frame estimates within the disease funnel — these are general and diagnosed prevalence, not yet the surgical-eligible subset', coverage: 'full', supporting_refs: [1, 3] },
      ],
      evidence_gaps: [
        'No dedicated China- or India-level diagnosed-prevalence study in the current library; Asian context is represented indirectly via the Northeast Asia pooled estimate.',
        'Extraction scope: abstract-only — full-text figures have not been accessed.',
      ],
      consistency_notes: 'Regional estimates are consistent with the global systematic review within expected demographic variation; the age-related steepening is reproduced across cohorts.',
      synthesis_approach: 'Layered general → regional → diagnosed, with explicit funnel framing so the next subsection (Surgical-Eligible Population) can step down from these denominators. ' + ABSTRACT_ONLY_NOTE,
    })],
    createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-132', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-13',
    number: '1.2.1.2', title: 'Surgical-Eligible Population', status: 'pending', orderIndex: 1,
    guidanceNotes: '• Estimate the proportion of the open-angle glaucoma population that is uncontrolled despite therapy\n• Describe the population eligible for minimally invasive glaucoma surgery (MIGS)\n• Reference real-world shifts toward MIGS adoption and device-based options\n• Size the addressable population for iStent infinite where the evidence allows',
    articleLinks: links([16, 17, 18, 20, 21, 22], 'demo-gla-sec-132'),
    contentVersions: [],
    preGenerationNote: 'Evidence gap: the surgical-eligible proportion is not directly reported in the linked abstracts. The MIGS literature (e.g. [#16], [#17]) describes device efficacy in eligible patients but does not size the eligible population. Generation will synthesise a funnel-based estimate and explicitly flag this limitation.',
    createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-121', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-12',
    number: '1.2.2', title: 'Clinical Burden', status: 'draft', orderIndex: 1,
    guidanceNotes: '• Visual loss and blindness rates in open-angle glaucoma\n• Long-term progression to advanced disease despite treatment\n• Severity at presentation and across special populations',
    articleLinks: links([6, 13, 15, 4], 'demo-gla-sec-121'),
    contentVersions: [version('sc-gla-121-v1', 'demo-gla-sec-121', 432, '2026-05-29T13:30:00Z', CLINICAL_BURDEN_CONTENT, {
      reference_extractions: [
        { article_number: 6, key_findings: 'Malmö screening: blindness incidence 0.17% screened vs 0.32% non-screened; low vision 0.25% vs 0.53%; ~50% reduction with screening.' },
        { article_number: 13, key_findings: '7–11-year follow-up of advanced OAG (n=127): 46.5% of eyes progressed; MD change −0.43 dB/year overall, −0.67 dB/year progressors; IOP reduction >20.94% protective.' },
        { article_number: 15, key_findings: 'Juvenile OAG cohort (203 eyes, 106 patients, 13 years): 31.5% blind at presentation → 35.5% at 8 years; bilateral blindness 15.2%→19.8%.' },
        { article_number: 4, key_findings: 'Thessaloniki Eye Study: 12-year OAG incidence 4.4% (~0.37%/year) in elderly White population; only 11.1% of incident cases had IOP >21 mmHg.' },
      ],
      guidance_coverage: [
        { guidance_point: 'Visual loss and blindness rates in open-angle glaucoma', coverage: 'full', supporting_refs: [6, 15] },
        { guidance_point: 'Long-term progression to advanced disease despite treatment', coverage: 'full', supporting_refs: [13] },
        { guidance_point: 'Severity at presentation and across special populations', coverage: 'full', supporting_refs: [15, 4] },
      ],
      evidence_gaps: [
        'Adult cohorts equivalent to the juvenile dataset [#15] for severity-at-presentation in major markets are not represented; non-IOP screening modalities (OCT, perimetry) implied by [#4] are not directly evaluated in the linked library.',
        'Extraction scope: abstract-only — full-text figures have not been accessed.',
      ],
      consistency_notes: 'Progression and visual-disability metrics are directionally consistent across cohorts despite differing populations and follow-up durations; the principal interpretive caveat is that severity instruments differ between juvenile (visual acuity blindness criteria) and adult (mean deviation) datasets.',
      synthesis_approach: 'Built from preventable burden → progression despite treatment → severity-at-presentation, to support the downstream value claim that earlier or more durable intraocular pressure lowering matters. ' + ABSTRACT_ONLY_NOTE,
    })],
    createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-122', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-12',
    number: '1.2.3', title: 'Humanistic Burden', status: 'draft', orderIndex: 2,
    guidanceNotes: '• Health-related quality of life in advanced glaucoma\n• Functional impact (reading, walking, driving, dark adaptation)\n• Glaucoma-specific patient-reported outcome instruments (VFQ-25, GQL-15, GAL-9)',
    articleLinks: links([10, 11, 12], 'demo-gla-sec-122'),
    contentVersions: [version('sc-gla-122-v1', 'demo-gla-sec-122', 421, '2026-05-29T13:45:00Z', HUMANISTIC_BURDEN_CONTENT, {
      reference_extractions: [
        { article_number: 10, key_findings: 'TAGS RCT (n=453, 5-year follow-up): VFQ-25 83.3 trabeculectomy vs 81.3 medical; superior IOP control (12.07 vs 14.76 mmHg) and visual field preservation in the surgical arm.' },
        { article_number: 11, key_findings: 'Patient profile for advanced-at-diagnosis: asymptomatic high IOP, no family history, social disadvantage; QoL worsens disproportionately with bilateral field loss.' },
        { article_number: 12, key_findings: 'Cross-sectional Indian study (n=122): graded QoL deficit on GAL-9, GQL-15, Viswanathan from controls → moderate → severe POAG; dark adaptation dominant in moderate, central/near vision in severe.' },
      ],
      guidance_coverage: [
        { guidance_point: 'Health-related quality of life in advanced glaucoma', coverage: 'full', supporting_refs: [10, 12] },
        { guidance_point: 'Functional impact (reading, walking, driving, dark adaptation)', coverage: 'full', supporting_refs: [11, 12] },
        { guidance_point: 'Glaucoma-specific patient-reported outcome instruments (VFQ-25, GQL-15, GAL-9)', coverage: 'full', supporting_refs: [10, 12] },
      ],
      evidence_gaps: [
        'Caregiver burden, productivity loss, and fall-risk consequences of severe glaucoma are not directly characterised in the linked abstracts.',
        'Extraction scope: abstract-only — full-text figures have not been accessed.',
      ],
      consistency_notes: 'The direction of HRQoL loss is consistent across three independent instruments and three populations (UK RCT, advanced-presentation review, Indian cross-sectional); magnitude differs because instruments and severity strata are not directly comparable.',
      synthesis_approach: 'Sequenced as RCT anchor → presentation-stage determinants → instrument-level convergence, with explicit interpretation of why comparable VFQ-25 scores between TAGS arms reflect disease control rather than treatment equivalence. ' + ABSTRACT_ONLY_NOTE,
    })],
    createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-123', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-12',
    number: '1.2.4', title: 'Economic Burden', status: 'pending', orderIndex: 3,
    guidanceNotes: '• Direct healthcare costs of open-angle glaucoma\n• Cost of medication non-adherence\n• Socioeconomic disparities in severity',
    articleLinks: links([14, 5], 'demo-gla-sec-123'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-2', dossierId: DOSSIER_ID, parentSectionId: null,
    number: '2', title: 'Treatment Landscape', status: 'pending', orderIndex: 1,
    guidanceNotes: '• Map the treatment pathway from topical therapy through laser to surgery\n• Articulate the unmet need in uncontrolled glaucoma\n• Position iStent infinite within the surgical landscape',
    articleLinks: [], contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-21', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-2',
    number: '2.1', title: 'Treatment Guidelines & Standard of Care', status: 'pending', orderIndex: 0,
    guidanceNotes: '• Summarise European Glaucoma Society / American Academy of Ophthalmology guidance for open-angle glaucoma management\n• Stepwise paradigm: topical → selective laser trabeculoplasty → surgical escalation',
    articleLinks: links([7], 'demo-gla-sec-21'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-22', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-2',
    number: '2.2', title: 'Unmet Need in Uncontrolled Glaucoma', status: 'pending', orderIndex: 1,
    guidanceNotes: '• Quantify uncontrolled disease despite medical therapy\n• Characterise the surgically-escalated population (PTVT, MicroShunt, PreserFlo)\n• Position MIGS as the bridge between drops and trabeculectomy',
    articleLinks: links([19, 20, 21], 'demo-gla-sec-22'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-23', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-2',
    number: '2.3', title: 'iStent infinite — Device Overview', status: 'pending', orderIndex: 2,
    guidanceNotes: '• Describe the iStent infinite device, mechanism and indication\n• Summarise MIGS class evidence (Cochrane, German MIGS programme)',
    articleLinks: links([16, 17, 18], 'demo-gla-sec-23'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-3', dossierId: DOSSIER_ID, parentSectionId: null,
    number: '3', title: 'Value Proposition', status: 'pending', orderIndex: 2,
    guidanceNotes: '• Translate clinical evidence into payer-relevant value claims\n• Frame the economic case around adherence and surgical escalation avoidance',
    articleLinks: [], contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-31', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-3',
    number: '3.1', title: 'Clinical Value', status: 'pending', orderIndex: 0,
    guidanceNotes: '• Intraocular pressure reduction and drop-free disease control\n• Real-world progression and visual field outcomes',
    articleLinks: links([16, 17, 19], 'demo-gla-sec-31'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
  {
    id: 'demo-gla-sec-32', dossierId: DOSSIER_ID, parentSectionId: 'demo-gla-sec-3',
    number: '3.2', title: 'Economic Value', status: 'pending', orderIndex: 1,
    guidanceNotes: '• Cost-effectiveness of adherence and surgical escalation avoidance\n• Healthcare resource utilisation implications',
    articleLinks: links([14, 5], 'demo-gla-sec-32'), contentVersions: [], createdAt: CREATED_AT, updatedAt: NOW,
  },
];

export const GLAUCOMA_DOSSIER_ID = DOSSIER_ID;

export const GLAUCOMA_DOSSIER_SEED: StoredDossier = {
  id: DOSSIER_ID,
  libraryId: LIBRARY_ID,
  title: 'iStent infinite — Global Value Dossier: Open-Angle Glaucoma',
  region: 'Global',
  status: 'draft',
  createdAt: CREATED_AT,
  updatedAt: NOW,
  sections,
};

// ─────────────────────────────────────────────────────────────────────────
// Country dossiers (UK, Germany) — independent, pre-baked, adapted.
//
// Each clones the Global section tree (new ids), leaves most sections pending
// (so Adapt-from-Global is offered where Global has content), keeps burden
// (1.2) light/structural, and pre-bakes an ADAPTED epidemiology section
// (1.2.1.1): a European-range opener (Gallo Afflitto 2022, #2) followed by a
// local expansion weighting the country-specific records. iStent infinite is a
// device, so local framing follows device HTA routes (UK: NICE MTEP/IP;
// Germany: method evaluation / NUB).
// ─────────────────────────────────────────────────────────────────────────

/** Clone the Global section tree into a country dossier with fresh ids. */
function cloneCountrySections(
  countryId: string,
  prefix: string,
  overrides: Record<string, { content?: StoredContentVersion; articleNumbers?: number[]; status?: StoredSection['status'] }>,
): StoredSection[] {
  return sections.map((s) => {
    const newId = `${prefix}-${s.id}`;
    const ov = overrides[s.number];
    const linkSectionId = newId;
    return {
      id: newId,
      dossierId: countryId,
      parentSectionId: s.parentSectionId ? `${prefix}-${s.parentSectionId}` : null,
      number: s.number,
      title: s.title,
      guidanceNotes: s.guidanceNotes,
      // All cloned sections start pending (Adapt-from-Global offered where
      // Global has content), unless an override sets the adapted epi to draft.
      status: ov?.status ?? 'pending',
      orderIndex: s.orderIndex,
      articleLinks: ov?.articleNumbers
        ? links(ov.articleNumbers, linkSectionId)
        : [],
      contentVersions: ov?.content ? [{ ...ov.content, sectionId: linkSectionId }] : [],
      preGenerationNote: s.preGenerationNote,
      createdAt: CREATED_AT,
      updatedAt: NOW,
    };
  });
}

const UK_EPI_CONTENT = `<p>Open-angle glaucoma prevalence in the United Kingdom sits within the wider European range. A meta-analysis of European population-based studies estimated a pooled primary open-angle glaucoma prevalence of 2.60% (95% CI 1.90–3.56) in the adult population, rising with age and projected to grow as the population ages [#2]. This European range frames the UK denominator from which the surgical-eligible population is drawn.</p>

<p>UK-specific evidence concentrates at the advanced, uncontrolled end of the funnel — the population most relevant to standalone surgical intervention. The Treatment of Advanced Glaucoma Study (TAGS), a UK multicentre randomised controlled trial of 453 adults with newly diagnosed advanced open-angle glaucoma, established that materially superior intraocular pressure control is required to hold vision-specific quality of life over five years (primary trabeculectomy 12.07 vs medical management 14.76 mmHg, with better visual-field preservation) [#10]. Complementing this, a UK clinical review of advanced-at-diagnosis disease characterises the patients who present late — asymptomatic raised pressure, no family history, social disadvantage, limited engagement with sight testing — and the disproportionate functional decline once bilateral field loss is established [#11]. Together these define a clearly bounded UK surgical-eligible population for whom durable, options-preserving intraocular pressure lowering is the central need. Local access is governed by NICE device routes (MTEP / Interventional Procedures).</p>`;

const DE_EPI_CONTENT = `<p>Open-angle glaucoma prevalence in Germany sits within the European range. A meta-analysis of European population-based studies estimated a pooled primary open-angle glaucoma prevalence of 2.60% (95% CI 1.90–3.56), rising with age [#2]; a German minimally invasive glaucoma surgery review reports that approximately 1.4% of the German population aged 35–74 has glaucoma, anchoring the national denominator [#17].</p>

<p>The local expansion draws on European cohort and screening evidence that bounds the diagnosed and uncontrolled tiers. The Thessaloniki Eye Study reported a 12-year cumulative open-angle glaucoma incidence of 4.4% (~0.37% per year) in an elderly European population, with only 11.1% of incident cases presenting with baseline intraocular pressure above 21 mmHg — underlining the limits of pressure-based case finding [#4]. The Malmö population screening programme showed that systematic case finding roughly halved the incidence of glaucoma-related blindness (0.17% screened vs 0.32%) and low vision (0.25% vs 0.53%) [#6], indicating a sizeable detectable, treatable population upstream of the surgical-eligible tier. The same German MIGS review situates iStent within the trabecular micro-bypass options available to this population [#17]. Local access follows German device routes (method evaluation / NUB).</p>`;

function epiVersion(prefix: string, content: string, wordCount: number): StoredContentVersion {
  return {
    id: `${prefix}-sc-epi-v1`,
    sectionId: '', // set by cloneCountrySections
    content,
    contentType: 'text',
    version: 1,
    isCurrent: true,
    wordCount,
    source: 'ai',
    agentReasoning: {
      reference_extractions: [],
      guidance_coverage: [],
      evidence_gaps: ['Country-specific surgical-eligible proportion is not directly reported; the local expansion characterises the uncontrolled/advanced tier from which it is drawn. ' + ABSTRACT_ONLY_NOTE],
      consistency_notes: 'European prevalence range opens the section; country/regional records drive the local expansion.',
      synthesis_approach: 'Global/European range up top, then local expansion weighting the country-specific records.',
    },
    createdAt: NOW,
  };
}

export const UK_DOSSIER_SEED: StoredDossier = {
  id: 'demo-dossier-istent-uk',
  libraryId: LIBRARY_ID,
  title: 'iStent infinite — Value Dossier: Open-Angle Glaucoma (United Kingdom)',
  region: 'United Kingdom',
  status: 'draft',
  createdAt: CREATED_AT,
  updatedAt: NOW,
  sections: cloneCountrySections('uk', 'uk', {
    // UK epi 1.2.1.1: main 38199528 (#10 King/TAGS) + 31740802 (#11 Kastner); supportive 35980843 (#2 Gallo Afflitto).
    '1.2.1.1': { content: epiVersion('uk', UK_EPI_CONTENT, 230), articleNumbers: [2, 10, 11], status: 'draft' },
  }),
};

export const DE_DOSSIER_SEED: StoredDossier = {
  id: 'demo-dossier-istent-de',
  libraryId: LIBRARY_ID,
  title: 'iStent infinite — Value Dossier: Open-Angle Glaucoma (Germany)',
  region: 'Germany',
  status: 'draft',
  createdAt: CREATED_AT,
  updatedAt: NOW,
  sections: cloneCountrySections('de', 'de', {
    // Germany epi 1.2.1.1: main 39670502 (#17 Voykov); supportive 35980843 (#2), 34127627 (#4 Founti), 33823158 (#6 Aspberg).
    '1.2.1.1': { content: epiVersion('de', DE_EPI_CONTENT, 250), articleNumbers: [2, 17, 4, 6], status: 'draft' },
  }),
};

/** The pre-baked portfolio: Global, UK, Germany. */
export const GLAUCOMA_DOSSIER_SEEDS: StoredDossier[] = [
  GLAUCOMA_DOSSIER_SEED,
  UK_DOSSIER_SEED,
  DE_DOSSIER_SEED,
];

/** Per-dossier writing context (Context Manager) seed. */
export const GLAUCOMA_DOSSIER_CONTEXT = {
  gvdDescription:
    'This GVD outlines the rationale and core value proposition for iStent infinite for early interventions in uncontrolled open-angle glaucoma. It is a structured, evidence-based dossier aligned to global payer and HTA expectations.',
  writingStyle:
    'Formal, scientific, and non-promotional. Statements must be strictly evidence-based and supported by referenced sources. Use clear, concise language with a logical narrative flow, avoiding redundancy and unsupported interpretation. Consistency in terminology and clarity in articulating the value proposition are essential.',
  valueStory:
    'iStent infinite is positioned as a minimally invasive surgical option for adults with open-angle glaucoma whose IOP is not adequately controlled on medical therapy. The value narrative centres on three pillars: (1) the size and burden of the uncontrolled / surgical-eligible OAG population across major markets; (2) the safety and IOP-lowering advantage of MIGS over trabeculectomy in moderate disease; and (3) the unmet need for an option positioned earlier, ahead of major incisional surgery.',
  communicationStrategy: '',
};
