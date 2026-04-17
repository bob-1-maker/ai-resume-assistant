# AGENTS

## Scope

This file defines the permanent delivery workflow for all work in this repository.
It applies to feature development, bug fixes, refactors, and optimization tasks.

## Mandatory Workflow

1. Confirm the full requirement with the user before development starts.
2. Produce a structured requirement document and wait for user approval.
3. Generate or update project rules and related docs when the requirement changes scope or conventions.
4. Produce a development plan and wait for user approval before coding.
5. Write unit tests first.
6. Write end-to-end tests second.
7. Implement production code only after the test scope is defined.
8. Run tests, analyze failures, and iterate until all relevant tests pass.
9. Deliver code, unit tests, E2E tests, and a short implementation note.

No step above may be skipped unless the user explicitly narrows the task to documentation-only work.

## Requirement Document Format

Each requirement confirmation must include:

- Feature description
- Inputs and outputs
- Page flow and API flow
- Exception scenarios
- Acceptance criteria

Suggested file location for approved requirement docs:

- `docs/requirements/<yyyy-mm-dd>-<feature-name>.md`

## Plan Format

Each development plan must include:

- Task list
- Priority
- Expected implementation steps
- Dependencies
- Test strategy

Suggested file location for approved plans:

- `docs/plans/<yyyy-mm-dd>-<feature-name>.md`

## Test-First Rule

The repository default rule is test-first development.

Implementation order:

1. Unit test
2. E2E test
3. Production code

Minimum coverage per feature:

- Main success path
- Error path
- Boundary conditions

## Stack Constraints

Primary stack for ongoing development:

- Frontend: Vue 3, Vite, TypeScript, Element Plus
- Backend: Node.js, Express
- Database: Turso / libSQL
- Auth: JWT

Current repository reality that must be respected during migration work:

- Frontend code is mainly TypeScript and Vue SFC under `src/`
- Backend route, controller, and middleware files are mainly JavaScript under `routes/`, `controllers/`, and `middleware/`
- Unit testing currently uses Jest under `tests/`
- A formal E2E framework is not yet established in scripts and must be introduced through the standard workflow before feature-level E2E expansion

## Implementation Constraints

- Preserve existing functionality unless the approved requirement says otherwise.
- Continue the current auth direction: JWT, route guarding, and permission checks.
- Use unified API response shape and unified error handling.
- Prefer small, focused modules over expanding `server.js`.
- Avoid hard-coded environment-specific URLs.
- Keep comments concise and only where they add real value.

## Delivery Checklist

Every code delivery must include:

- Functional code
- Unit tests
- E2E tests
- Brief summary
- Runnable result with no known blocking errors

## Skill Record Rule

After each completed development task, update this file with a short skill record.

Each skill record should include:

- Date
- Requirement or feature name
- Key implementation skills used
- Test scope added or updated
- Reusable project conventions or lessons learned

Suggested location:

- Add a `## Skill Records` section at the end of this file

## Reference Docs

- `docs/development-standards.md`
- `docs/naming-conventions.md`
- `docs/directory-structure.md`
- `docs/api-spec.md`
- `docs/error-handling.md`

## Skill Records

- 2026-04-10: Project workflow baseline established. Skills used: repository rule formalization, API/error convention consolidation, requirement-plan-test-first process definition. Test scope: none, documentation-only. Reusable convention: all future tasks must follow requirement doc -> approved plan -> unit test -> E2E test -> implementation.
- 2026-04-10: Admin backoffice module V1 implemented. Skills used: isolated admin auth design, dedicated admin route namespace, frontend admin route guarding, read-only resume operations with delete action, Playwright E2E baseline setup. Test scope: admin controller unit tests, admin auth middleware unit tests, admin login and admin resume workflow E2E specs added. Reusable convention: keep admin session keys separate from normal user session keys to avoid breaking existing user login flow.
- 2026-04-10: Admin login local recovery fix implemented. Skills used: admin auth fallback alignment, controller boundary hardening, local environment contract clarification. Test scope: admin controller login/pagination/delete unit coverage updated for `admin / 123456`; admin backoffice E2E credential baseline updated. Reusable convention: when local admin credentials are intended for manual QA, define them explicitly in env examples and keep backend fallback values aligned with test fixtures.
- 2026-04-10: Ordinary user login network-path fix implemented. Skills used: frontend API client path correction, proxy-based local dev routing, browser-level auth regression coverage. Test scope: user API config unit test added; ordinary user login E2E success and invalid-credential coverage added. Reusable convention: browser clients in local development should prefer project-relative `/api` paths over hard-coded backend origins unless a cross-origin contract is explicitly required.
- 2026-04-12: PDF line structure recovery implemented. Skills used: pdf.js text-position reconstruction, line-based text normalization, parser integration hardening. Test scope: unit coverage added for PDF line reconstruction and parser wiring; existing frontend export/login/API regression tests re-run. Reusable convention: when parsing layout-heavy PDFs, preserve line boundaries from positioned text items before applying section-level extraction.
- 2026-04-12: Ordinary user login view recovery implemented. Skills used: missing-view root cause analysis, legacy login-page recovery, current auth-store compatibility preservation. Test scope: login route recovery unit coverage added and ordinary user auth E2E spec expanded for logged-in redirect. Reusable convention: when restoring old frontend pages, preserve current store/session contracts instead of reintroducing obsolete mock-login behavior.
- 2026-04-12: Resume PDF export layout fix implemented. Skills used: export-root isolation, image-readiness handling, manual A4 canvas slicing for PDF stability. Test scope: PDF export helper unit coverage added and preview export-root E2E coverage scaffolded. Reusable convention: for long resume layouts, prefer capturing a print-safe export root and slicing the rendered canvas into A4 pages instead of relying on automatic DOM page-break heuristics.
- 2026-04-13: Server AI module refactor implemented. Skills used: Express startup/app split, AI route-controller-service decomposition, cache/retry helper extraction, migration side-effect cleanup. Test scope: AI controller unit tests, AI service unit tests, and AI generate compatibility E2E coverage added. Reusable convention: keep `server.js` as a thin startup shell and place AI orchestration behind route/controller/service boundaries so provider and cache behavior stay independently testable.
- 2026-04-13: Phase 1 frontend boundary refactor implemented. Skills used: shared API client extraction, centralized auth session storage, resume persistence service extraction, ResumeBuilder view decomposition, admin auth middleware hardening. Test scope: frontend boundary refactor unit coverage added, PDF export renderer assertion updated, user auth E2E redirect coverage added, Jest E2E exclusion clarified, admin auth middleware coverage fixed. Reusable convention: front-end API modules should share one client factory and session storage helpers, while large page orchestrators should split header, edit, and preview responsibilities before adding more features.
- 2026-04-14: User login register entry implemented. Skills used: Vue auth-form state extension, Element Plus validation wiring, existing user-store registration flow reuse, Playwright auth-flow expansion. Test scope: login route recovery unit coverage expanded for register-entry contract; user auth E2E coverage expanded for register success and password-mismatch boundary behavior. Reusable convention: when backend auth capabilities already exist, prefer exposing them through the current entry page with minimal route churn and keep session writes exclusive to the login action.
