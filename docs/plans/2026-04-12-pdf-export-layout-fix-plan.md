
# Development Plan: PDF Export Layout Fix

## Status

- Date: 2026-04-12
- Feature: Resume PDF export layout fix
- Status: Approved
- Based on requirement: `docs/requirements/2026-04-12-pdf-export-layout-fix.md`

## 1. Task List

1. Inspect the current PDF export capture target and template layout interactions
2. Add unit coverage for export target preparation and export option generation
3. Add E2E coverage for the export flow assumptions that can be observed from the page
4. Implement a print-safe PDF export path with image readiness handling
5. Adjust business template print and page-break behavior for A4 export stability
6. Run targeted tests and update `AGENTS.md` skill records after delivery

## 2. Priority

- P0: stop visibly broken page splitting in exported business-template PDFs
- P0: restore avatar rendering in exported PDF output
- P1: improve template-independent export stability for the other templates where possible

## 3. Expected Implementation Steps

1. Isolate the export root so PDF capture targets the actual resume content rather than the responsive preview shell.
2. Write unit tests first for:
   - locating the correct export root
   - waiting for image readiness before export
   - generating PDF options with print-safe page settings
3. Write E2E tests second for:
   - export button flow availability in preview mode
   - preview export target presence for the active template
   - export preparation hooks or DOM state that confirm the print-safe path is used
4. Implement the export fix:
   - prepare a dedicated export clone or print-safe root
   - wait for images to load before capture
   - replace the current `avoid-all` page-break strategy with safer content-aware rules
   - align export sizing with A4 dimensions without preview shell artifacts
5. Add any minimal template CSS adjustments needed for business-template page stability.
6. Run targeted Jest and Playwright checks, then verify the export path manually where sandbox limits prevent full PDF validation.

## 4. Dependencies

- Approved requirement document
- Existing `ExportComponent.vue` PDF export flow
- Existing resume template components
- Existing Jest and Playwright setup

## 5. Test Strategy

- Unit tests first in `tests/frontend`
- E2E tests second in `tests/e2e`
- Prefer assertions that verify DOM selection, export preparation, and route-to-export interactions without depending on local filesystem PDF inspection
- If sandbox restrictions block full browser worker execution, report the remaining manual verification step explicitly

## 6. Risks

- `html2pdf.js` pagination behavior may still impose limitations on very long multi-column content
- Print-specific CSS may slightly change preview/export parity if applied too broadly
- Cross-origin image behavior may still vary by browser if image URLs do not allow canvas capture
