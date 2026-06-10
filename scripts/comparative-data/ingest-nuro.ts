// scripts/comparative-data/ingest-nuro.ts
//
// Orchestration plan for Nuro MCP ingestion.
//
// This file is NOT a re-runnable script. The actual ingestion is performed by
// Claude Code at authoring time via its connected Nuro MCP tools, with the
// resulting structured JSON written to:
//   src/data/comparative-data/products-nuro.json
//
// Re-running the ingestion: ask Claude Code to repeat the plan below in a
// fresh session that has the Nuro MCP connected.
//
// ---- INGESTION PLAN ----
//
// PRODUCTS TO INGEST (7 real R/R MM products):
export const PRODUCTS = [
  'Tecvayli',  // teclistamab — bispecific BCMA × CD3
  'Elrexfio',  // elranatamab — bispecific BCMA × CD3
  'Talvey',    // talquetamab — bispecific GPRC5D × CD3
  'Lynozyfic', // linvoseltamab — bispecific BCMA × CD3
  'Carvykti',  // cilta-cel — CAR-T
  'Abecma',    // ide-cel — CAR-T
  'Blenrep',   // belantamab mafodotin — ADC
] as const
//
// FOR EACH PRODUCT, CALL THESE NURO TOOLS:
//   1. nuro_get_regulatory_approvals({ brandName: PRODUCT })
//   2. nuro_get_hta_outcomes({ brandName: PRODUCT })
//   3. nuro_get_pivotal_studies({ brandName: PRODUCT, indicationName: 'Multiple myeloma' })
//
// NOTES ON THE PIVOTAL STUDIES CALL:
//   - Previous testing showed nuro_get_pivotal_studies(brandName='Tecvayli')
//     without indication filter timed out. Always pass
//     indicationName='Multiple myeloma' as filter.
//   - If a specific product's call times out, retry once. If the second
//     attempt fails, write `pivotalStudies: []` for that product and note in
//     `ingestionNotes`.
//
// PACING:
//   Pace calls — issue the 3 calls per product in parallel, but move to the
//   next product sequentially. Do not fan out all 21 calls at once.
//
// OUTPUT STRUCTURE:
//   src/data/comparative-data/products-nuro.json
//   {
//     "ingestedAt": "<ISO timestamp>",
//     "products": [
//       {
//         "brandName": "Tecvayli",
//         "regulatoryApprovals": [ ... normalised from Nuro response ... ],
//         "htaOutcomes":         [ ... normalised from Nuro response ... ],
//         "pivotalStudies":      [ ... normalised from Nuro response ... ],
//         "ingestionNotes":      "any retries or failures noted here"
//       },
//       ...
//     ]
//   }
//
// KEY RENAMING from raw Nuro response shape:
//   regulatoryApproval  → regulatoryApprovals  (rename and unwrap brand-level array)
//   htaAssessment       → htaOutcomes
//   pivotalStudies      → pivotalStudies       (no rename)
//
// FIELD-NAME QUIRKS (do NOT correct; match Nuro exactly):
//   - "assesmentType"   (sic, missing 's')
//   - "priceToBeReducedToBecomeCostEffetive" (sic, missing 'c')
