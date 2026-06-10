import type { ProductEntry } from './types';

/* ─── EFFICACY ─── */

export interface EfficacySummary {
  primaryEndpointResult: string | null;
  relativeImprovement: string | null;
  trialName: string | null;
  notes: string | null;
}

export function getEfficacySummary(product: ProductEntry): EfficacySummary {
  if (product.isFictional && product.alnyxData) {
    const ps = product.alnyxData.pivotalStudies[0];
    if (!ps) {
      return {
        primaryEndpointResult: null,
        relativeImprovement: null,
        trialName: null,
        notes: 'Pre-launch — Phase 2 data only',
      };
    }
    return {
      primaryEndpointResult: ps.primaryResult,
      relativeImprovement: null,
      trialName: ps.trialName,
      notes: `${ps.phase} · ${ps.trialType.toLowerCase().includes('single-arm') ? 'Single-arm' : 'Comparative'} · N=${
        ps.population.match(/N=(\d+)/)?.[1] ?? 'N/A'
      }`,
    };
  }

  const studies = product.pivotalStudies;
  if (studies.length === 0) {
    return {
      primaryEndpointResult: null,
      relativeImprovement: null,
      trialName: null,
      notes: 'No pivotal study data available in Nuro',
    };
  }

  const best = studies.find((s) => s.relativeImprovementPercentage) ?? studies[0];
  return {
    primaryEndpointResult: best.trialResultsInvestigationalArm ?? null,
    relativeImprovement:
      best.relativeImprovementPercentage ?? best.relativeImprovement ?? null,
    trialName: best.indicatedPopulation?.slice(0, 60) ?? null,
    notes: best.trialType ?? null,
  };
}

/* ─── SAFETY ─── */

export interface SafetySummary {
  text: string;
}

export function getSafetySummary(product: ProductEntry): SafetySummary {
  if (product.isFictional && product.alnyxData) {
    return {
      text: 'CRS predominantly Grade 1-2 (85% of events). Onset typically early (cycle 1-2) and manageable with standard intervention. No treatment-related deaths.',
    };
  }
  const text: Record<string, string> = {
    Tecvayli:
      'CRS (most low grade), ICANS (predominantly low grade), infections common. Step-up dosing mitigates Grade 3+ CRS.',
    Elrexfio: 'CRS and ICANS profile in line with bispecific class. Step-up dosing protocol.',
    Talvey:
      'Distinct AE profile vs BCMA bispecifics (skin, nail, taste). Lower haematologic toxicity.',
    Lynozyfic:
      'CRS and ICANS profile typical for BCMA bispecifics. Early data suggests manageable.',
    Carvykti:
      'CRS (most low grade), neurotoxicity (incl. movement and neurocognitive). Single-treatment toxicity.',
    Abecma: 'CRS and neurotoxicity typical for CAR-T. Single-treatment toxicity.',
    Blenrep:
      'Distinct AE: keratopathy (visual changes), thrombocytopenia. Monitoring with ophthalmic exams required.',
  };
  return { text: text[product.brandName] ?? 'Safety profile per label.' };
}

/* ─── DOSING & ADMIN ─── */

export interface DosingSummary {
  route: string;
  schedule: string;
  notes: string | null;
}

export function getDosingSummary(product: ProductEntry): DosingSummary {
  if (product.isFictional && product.alnyxData) {
    const d = product.alnyxData.dosingAndAdministration;
    return {
      route: d.route,
      schedule: `${d.dose} · ${d.schedule}`,
      notes: d.notes,
    };
  }
  const dosing: Record<string, DosingSummary> = {
    Tecvayli: {
      route: 'SC',
      schedule: '1.5 mg/kg weekly → biweekly → monthly (step-up phase)',
      notes: 'Continuous treatment until progression',
    },
    Elrexfio: {
      route: 'SC',
      schedule: '76 mg weekly → biweekly (step-up phase)',
      notes: 'Continuous treatment until progression',
    },
    Talvey: {
      route: 'SC',
      schedule: '0.4 mg/kg weekly or 0.8 mg/kg biweekly',
      notes: 'Continuous treatment until progression',
    },
    Lynozyfic: {
      route: 'SC',
      schedule: 'Step-up dosing then weekly maintenance',
      notes: 'Continuous treatment until progression',
    },
    Carvykti: {
      route: 'IV',
      schedule: 'Single infusion after lymphodepletion',
      notes: 'One-time treatment; long manufacturing lead time',
    },
    Abecma: {
      route: 'IV',
      schedule: 'Single infusion after lymphodepletion',
      notes: 'One-time treatment; manufacturing lead time',
    },
    Blenrep: {
      route: 'IV',
      schedule: '2.5 mg/kg every 3 weeks',
      notes: 'Continuous; withdrawn from US/EU markets',
    },
  };
  return dosing[product.brandName] ?? { route: '—', schedule: '—', notes: null };
}

/* ─── HRQOL ─── */

export function getHrqolSummary(product: ProductEntry): string {
  if (product.isFictional && product.alnyxData) {
    return 'Phase 2 EORTC QLQ-C30 data: significant improvements in pain and disease symptoms vs baseline.';
  }
  const text: Record<string, string> = {
    Tecvayli:
      'EORTC QLQ-C30 and EQ-5D-5L data published; improvements in symptoms and overall HRQoL.',
    Elrexfio: 'HRQoL endpoints reported in MagnetisMM trials.',
    Talvey: 'Limited HRQoL data published to date.',
    Lynozyfic: 'HRQoL data emerging.',
    Carvykti:
      'CARTITUDE-1 reported significant HRQoL improvements; benchmark for CAR-T HRQoL evidence.',
    Abecma: 'KarMMa-3 HRQoL data published.',
    Blenrep: 'HRQoL data per DREAMM trials.',
  };
  return text[product.brandName] ?? '—';
}

/* ─── REAL-WORLD EVIDENCE ─── */

export function getRwdSummary(product: ProductEntry): string {
  if (product.isFictional && product.alnyxData) {
    return 'Pre-launch — no RWD yet.';
  }
  const text: Record<string, string> = {
    Tecvayli:
      'Multiple RWD studies published; supportive of pivotal trial efficacy in real-world populations.',
    Elrexfio: 'Emerging RWD; early indications consistent with trial outcomes.',
    Talvey: 'Limited RWD; data accruing.',
    Lynozyfic: 'Very limited RWD given recent launch.',
    Carvykti:
      'Extensive RWD published; supportive of CARTITUDE-1 efficacy. Notable real-world toxicity findings.',
    Abecma: 'RWD published; supports trial efficacy though with shorter PFS in real-world populations.',
    Blenrep: 'RWD published prior to market withdrawal.',
  };
  return text[product.brandName] ?? '—';
}

/* ─── ITC ─── */

export function getItcSummary(product: ProductEntry): string {
  if (product.isFictional && product.alnyxData) {
    return 'Pre-launch — ITCs to be conducted ahead of Phase 3 readout and HTA submissions.';
  }
  const text: Record<string, string> = {
    Tecvayli:
      'Extensive ITC work submitted to payers (NMA vs daratumumab, pomalidomide-based regimens). Mixed reception — some agencies accepted, others questioned methodology.',
    Elrexfio: 'ITCs submitted to multiple HTA bodies; ICER and PFS comparisons performed.',
    Talvey: 'ITCs submitted; GPRC5D target makes comparator selection challenging.',
    Lynozyfic: 'Limited ITC work to date given recent launch.',
    Carvykti: 'Comprehensive ITC programme; widely accepted by HTA bodies.',
    Abecma: 'ITC vs standard of care (KarMMa-3 comparator); accepted by most HTA bodies.',
    Blenrep: 'ITC submissions made; methodology challenges noted by some agencies.',
  };
  return text[product.brandName] ?? '—';
}

/* ─── ECONOMIC / HTA OUTCOMES ─── */

export interface HtaOutcomeCounts {
  total: number;
  recommended: number;
  restricted: number;
  notRecommended: number;
  other: number;
  byAgency: { agency: string; outcome: string; date: string | null }[];
}

export function getHtaSummary(product: ProductEntry): HtaOutcomeCounts {
  if (product.isFictional && product.alnyxData) {
    return {
      total: 0,
      recommended: 0,
      restricted: 0,
      notRecommended: 0,
      other: 0,
      byAgency: [],
    };
  }
  const outcomes = product.htaOutcomes;
  let recommended = 0;
  let restricted = 0;
  let notRecommended = 0;
  let other = 0;
  const byAgency: { agency: string; outcome: string; date: string | null }[] = [];

  for (const o of outcomes) {
    const oc = (o.assessmentOutcome ?? '').toLowerCase();
    if (
      oc.includes('not recommended') ||
      oc.includes('not reimbursed') ||
      oc.includes('rejected') ||
      oc.includes('terminated') ||
      oc.includes('smr insufficient')
    ) {
      notRecommended++;
    } else if (oc.includes('with restrictions') || oc.includes('restrictions to label')) {
      restricted++;
    } else if (
      oc.includes('recommended') ||
      oc.includes('positive') ||
      oc.includes('considerable') ||
      oc.includes('important added') ||
      oc.includes('asmr i') ||
      oc.includes('asmr ii') ||
      oc.includes('asmr iii') ||
      oc.includes('asmr iv') ||
      oc.includes('list c') ||
      oc.includes('similar efficacy')
    ) {
      recommended++;
    } else {
      other++;
    }
    byAgency.push({
      agency: o.htaAgency,
      outcome: o.assessmentOutcome ?? '—',
      date: o.assessmentDate ?? o.dateOfPublication ?? null,
    });
  }

  return {
    total: outcomes.length,
    recommended,
    restricted,
    notRecommended,
    other,
    byAgency,
  };
}
