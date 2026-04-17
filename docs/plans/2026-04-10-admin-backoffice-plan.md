# Development Plan: Admin Backoffice Module V1

## Status

- Date: 2026-04-10
- Feature: Admin backoffice module
- Status: Pending user approval
- Based on requirement: `docs/requirements/2026-04-10-admin-backoffice.md`

## 1. Goal

Implement a minimal admin backoffice module that:

- provides a separate admin login page at `/admin-login`
- authenticates a fixed admin account without database registration
- protects admin routes and admin APIs
- allows admins to view all resume records across users
- allows admins to delete resumes
- preserves existing user login, JWT auth, route behavior, and resume flows

## 2. Scope

### In Scope

- Admin login page and route
- Admin auth token or admin session strategy aligned with current JWT flow
- Admin route guard
- Admin backend login endpoint
- Admin backend resume list endpoint
- Admin backend resume delete endpoint
- Admin-only frontend resume list page
- Permission interception for non-admin access
- Unit tests
- E2E tests
- AGENTS skill record update after delivery

### Out of Scope

- User management
- Admin registration
- Admin role hierarchy
- Admin dashboard statistics
- Resume editing in admin side
- Announcement or configuration modules

## 3. Delivery Strategy

The work should be done in six implementation phases, but coding may only begin after this plan is approved.

### Phase 1: Admin Auth Design Stabilization

Priority: P0

Purpose:

- define how fixed admin credentials are loaded
- define how admin identity is represented in JWT or equivalent token payload
- avoid collision with current normal-user token logic

Expected steps:

1. Add admin credential configuration strategy using environment-backed fixed values with safe fallback conventions.
2. Define admin token payload shape.
3. Define backend middleware rule for admin-only access.
4. Define frontend storage key strategy for admin auth state.

Dependencies:

- approved requirement document

Expected files:

- `middleware/`
- `controllers/`
- `routes/`
- possibly `src/store/`
- possibly `src/router/`

### Phase 2: Backend Admin API Layer

Priority: P0

Purpose:

- introduce isolated `/api/admin/*` endpoints without disturbing user APIs

Expected steps:

1. Add admin route module.
2. Add admin controller module.
3. Add admin-only middleware or extend auth middleware safely.
4. Implement `POST /api/admin/login`.
5. Implement `GET /api/admin/resumes`.
6. Implement `DELETE /api/admin/resumes/:resume_id`.
7. Wire routes into server bootstrap.

Dependencies:

- Phase 1 auth design

Expected files:

- `routes/admin.js`
- `controllers/adminController.js`
- `middleware/`
- `server.js`

### Phase 3: Frontend Admin Entry And Guard

Priority: P0

Purpose:

- add isolated admin access without affecting current `/login` and `/`

Expected steps:

1. Add `/admin-login` route.
2. Add admin list route, likely `/admin` or `/admin/resumes`.
3. Extend router guard to differentiate normal user and admin access.
4. Add admin auth store or extend existing store with isolated admin state.
5. Add admin login API wrapper.

Dependencies:

- Phase 1 auth design
- backend login contract from Phase 2

Expected files:

- `src/router/index.ts`
- `src/store/`
- `src/api/`
- `src/views/`

### Phase 4: Frontend Admin Resume List

Priority: P1

Purpose:

- provide admin-facing read-only list with delete operation

Expected steps:

1. Add admin page for all resume records.
2. Render list table with basic fields from current resume schema.
3. Add loading, empty, and error states.
4. Add delete confirmation flow.
5. Refresh list after delete.

Dependencies:

- Phase 2 list and delete APIs
- Phase 3 admin routing and auth state

Expected files:

- `src/views/`
- `src/components/` if split into admin subcomponents
- `src/api/`
- `src/store/` if list state is centralized

### Phase 5: Unit Test First Implementation

Priority: P0

Purpose:

- define and implement regression-safe backend and frontend-adjacent tests before production changes are finalized

Expected steps:

1. Add backend controller tests for admin login success and failure.
2. Add backend controller tests for admin resume list success, empty state, and query failure.
3. Add backend controller tests for admin delete success, not found, and failure.
4. Add middleware tests for admin permission interception.
5. Update any affected auth tests if token payload behavior changes.

Dependencies:

- final API contract from Phases 1 and 2

Expected files:

- `tests/controllers/adminController.test.js`
- `tests/middleware/`
- possibly updates in existing auth-related tests

### Phase 6: E2E Test Definition And Execution Path

Priority: P0

Purpose:

- establish the required browser-level verification for the admin workflow

Expected steps:

1. Introduce an approved E2E framework because the repository does not currently have one configured.
2. Add E2E coverage for:
   - admin login success
   - admin route interception for unauthenticated access
   - non-admin blocked from admin page or API path
   - admin sees resume list
   - admin deletes a resume
3. Add or document the test script entry in `package.json`.

Dependencies:

- user approval of this plan
- test framework selection during implementation

Expected files:

- `package.json`
- `tests/e2e/`
- framework config file

## 4. Priority Summary

- P0: auth design, backend admin APIs, frontend admin routing, unit tests, E2E foundation
- P1: admin resume list UI polish and delete interaction

## 5. Dependency Graph

1. Requirement approval
2. Plan approval
3. Admin auth design
4. Backend admin API contract
5. Frontend admin route/store wiring
6. Unit tests
7. E2E framework and E2E tests
8. Production implementation refinement
9. Full test pass
10. AGENTS skill record update

## 6. Test-First Execution Order

Per project rule, execution order after plan approval must be:

1. Write unit tests for admin middleware and controller logic
2. Write E2E tests for admin login and admin resume list workflow
3. Implement backend and frontend code to satisfy those tests
4. Iterate until all relevant tests pass

## 7. Proposed Test Coverage

### Unit Tests

- fixed admin credential login success
- wrong admin username
- wrong admin password
- missing admin credentials
- admin token verification success
- missing admin token
- normal user token denied on admin route
- list all resumes success
- list all resumes empty result
- list all resumes database error
- delete resume success
- delete resume not found
- delete resume database error

### E2E Tests

- unauthenticated user opening admin route is redirected or blocked
- admin login with fixed credentials succeeds
- admin login with wrong credentials fails
- admin sees all resume records list
- admin can delete a resume from the list
- normal user flow still opens normal app and is not treated as admin

## 8. Technical Decisions To Use During Implementation

These are implementation recommendations for the approved build:

- Keep admin APIs under a dedicated `routes/admin.js` and `controllers/adminController.js`
- Prefer a dedicated admin middleware instead of overloading normal user checks everywhere
- Keep admin auth state isolated from normal user auth state to avoid breaking current `userToken` usage
- Reuse the unified API envelope defined in project docs
- Avoid changing existing user endpoints unless required for shared auth helpers

## 9. Risk List

- Current project has duplicated request wrappers and hard-coded API base URLs, which may complicate admin API integration.
- Current router guard only checks `userToken` in `localStorage`, so admin route isolation must be designed carefully.
- Current middleware and request code contain verbose debug logging; auth-related changes must avoid increasing sensitive log exposure.
- E2E tooling is not yet present, so test setup is part of the feature path.

## 10. Planned Deliverables

- Admin backend API code
- Admin frontend pages and route guards
- Unit tests
- E2E tests
- Minimal documentation updates if API or env setup changes
- `AGENTS.md` skill record update after completion
