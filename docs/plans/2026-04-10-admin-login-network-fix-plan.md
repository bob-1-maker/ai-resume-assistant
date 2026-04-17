# Development Plan: Admin Login Network Error Fix

## Status

- Date: 2026-04-10
- Feature: Admin login network error fix
- Status: Pending user approval
- Based on requirement: `docs/requirements/2026-04-10-admin-login-network-fix.md`

## 1. Task List

1. Confirm the current admin login request path and backend route wiring
2. Define the intended local admin credential source for `admin / 123456`
3. Add or update unit tests for admin login success and failure cases
4. Add or update E2E tests for admin login success and invalid credential behavior
5. Implement the minimal frontend and backend changes needed to satisfy the tests
6. Run relevant unit and E2E tests and iterate until they pass
7. Update `AGENTS.md` skill records with the completed fix

## 2. Priority

- P0: eliminate transport-level admin login failure in local development
- P0: align local admin credential behavior with approved `admin / 123456`
- P1: improve login error messaging if the current UX is too opaque

## 3. Expected Implementation Steps

1. Inspect the admin login page, admin store, admin API wrapper, Vite proxy, backend admin route, and environment configuration to locate the exact transport mismatch.
2. Write or update unit tests first for:
   - admin login succeeds with approved local credentials
   - admin login rejects invalid credentials cleanly
   - admin login still returns a standard server error response on unexpected exceptions
3. Write or update E2E tests second for:
   - admin login success path
   - invalid admin credential path
   - optional regression around frontend handling of backend availability or response shape if needed
4. Implement the smallest safe code changes across frontend and backend:
   - request base URL or proxy alignment if needed
   - admin credential fallback/environment alignment if needed
   - login-page error handling refinement if needed
5. Run the relevant test suites and validate there is no regression in the admin login flow.

## 4. Dependencies

- Approved requirement document
- Approved development plan
- Existing Jest unit test setup
- Existing Playwright E2E setup
- Local backend and frontend development configuration

## 5. Test Strategy

- Unit tests first in `tests/controllers/adminController.test.js`
- E2E tests second in `tests/e2e/admin-backoffice.spec.ts` or a focused admin login spec
- Run targeted tests before any broader test pass
- If the implementation affects shared request configuration, run any impacted auth-related tests as a regression check

## 6. Risks

- The visible `Network Error` may hide multiple issues, not just one
- The desired credential `123456` currently does not match the inspected backend fallback password `admin123`
- Fixing only credentials without fixing request routing would still leave the user blocked
- Fixing only routing without aligning credentials would change the failure from transport error to auth rejection but still not meet the approved target
