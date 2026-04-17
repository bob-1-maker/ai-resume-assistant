# Development Plan: User Login Network Error Fix

## Status

- Date: 2026-04-10
- Feature: Ordinary user login network error fix
- Status: Pending user approval
- Based on requirement: `docs/requirements/2026-04-10-user-login-network-fix.md`

## 1. Task List

1. Confirm the current ordinary user request-path implementation and local proxy expectation
2. Add or update tests that lock in the correct login request strategy
3. Add or update E2E coverage for ordinary user login success and invalid credentials
4. Implement the minimal frontend request-path fix and any necessary error handling refinement
5. Run targeted unit and E2E tests and iterate until they pass
6. Update `AGENTS.md` skill records after delivery

## 2. Priority

- P0: remove `ERR_CONNECTION_REFUSED` from the normal local ordinary user login path
- P0: align ordinary user API client with the existing project proxy strategy
- P1: improve transport-error feedback if current UX remains ambiguous

## 3. Expected Implementation Steps

1. Inspect ordinary user API wrappers, shared request utilities, login page behavior, and Vite proxy configuration.
2. Write or update unit tests first for the affected ordinary user login behavior.
3. Write or update E2E tests second for:
   - ordinary user login success
   - invalid ordinary user credentials
   - ordinary login request path using the expected API endpoint convention if practical
4. Implement the smallest safe code changes:
   - replace the hard-coded absolute base URL with the approved project-standard path strategy
   - keep register and current-user requests aligned with the same client
   - refine UI messaging for backend-unavailable cases if needed
5. Run targeted tests and verify no regressions in ordinary user auth flow.

## 4. Dependencies

- Approved requirement document
- Approved plan
- Existing Jest setup
- Existing Playwright setup
- Local frontend and backend startup path

## 5. Test Strategy

- Unit tests first in affected user controller or frontend-adjacent test scope as appropriate
- E2E tests second in a focused ordinary user auth spec
- Run the ordinary user controller tests and auth-related E2E tests before any broader suite
- If shared request configuration changes, run impacted regression checks for admin flow too

## 6. Risks

- Shared API-client changes could unintentionally affect register, current-user, or resume requests
- The repo currently mixes absolute and relative API base URLs, so a partial fix may leave similar issues elsewhere
- Ordinary user login may still fail after transport is fixed if the target account does not exist in the database, so business-error handling must stay clear
