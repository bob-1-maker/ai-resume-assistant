# Requirement Draft: PDF Export Layout Fix

## Status

- Date: 2026-04-12
- Feature: Resume PDF export layout fix
- Status: Approved

## 1. Feature Description

Fix the resume PDF export layout so that exported PDF output remains visually aligned with the on-screen preview and follows stable A4 pagination rules.

Current inspection shows that preview rendering and PDF export do not share a print-specific layout contract. The export flow captures the responsive `.resume-preview` container with `html2pdf.js` and `html2canvas`, while also forcing `pagebreak: { mode: 'avoid-all' }`. This causes long two-column layouts to split poorly, creates large blank regions, and can omit the avatar image during capture.

Confirmed constraints:

- Must preserve the existing template-driven preview experience
- Must preserve current export entry points from preview mode
- Must keep PDF export working in the current browser-based implementation
- Must follow repository workflow: approved requirement -> approved plan -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Inputs

- Current resume data rendered in preview mode
- Active template component, especially the business template
- Avatar image source from resume basic info
- Existing PDF export trigger from `ExportComponent.vue`

### Expected Outputs

- Exported PDF keeps a stable A4 page width and sensible page breaks
- Two-column business template content no longer breaks into visibly mismatched left/right fragments
- Avatar image is present in the exported PDF when available in preview
- Exported PDF remains close in structure and spacing to the previewed resume

## 3. Page Flow And API Flow

### Page Flow

- User enters preview mode
- User clicks export PDF
- Frontend prepares a print-safe export target
- Frontend waits for the export target resources, especially images, to be ready
- Frontend exports a PDF using print-safe dimensions and page rules
- User receives a PDF whose structure closely matches preview

### API Flow

- No backend API contract changes are required
- The fix remains fully frontend-side inside the current export flow

## 4. Exception Scenarios

The fix must explicitly handle:

- Avatar image not fully loaded before export starts
- Cross-origin or delayed image rendering during html-to-canvas capture
- Two-column template sections spanning multiple pages
- Long content that exceeds one A4 page
- Responsive preview wrappers interfering with print layout capture

## 5. Acceptance Criteria

- Business template PDF export no longer shows large unexpected blank areas between pages
- Sidebar and main content no longer split in obviously broken positions for the same page segment
- Avatar image exports successfully when it is visible in preview
- Exported PDF uses consistent A4 layout sizing
- Unit tests cover the updated export preparation logic
- E2E coverage validates the export flow assumptions that can be asserted in-browser

## 6. Scope Notes

- In scope: PDF export DOM selection, export preparation, image readiness handling, page-break strategy, business template print stability
- Out of scope: redesigning resume content, replacing the export library entirely, or changing backend behavior

## 7. Assumptions

- The browser preview is the intended source of truth for resume layout
- The business template is the highest-priority broken case and should be fixed first
- The current export stack (`html2pdf.js` + `html2canvas`) should be retained unless a blocker is discovered during implementation
