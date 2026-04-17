# Development Plan: User Login Register Entry

## Status

- Date: 2026-04-14
- Feature: Ordinary user login page register entry
- Based on requirement: `docs/requirements/2026-04-14-user-login-register-entry.md`
- Status: Draft

## 1. Task List

1. Confirm the current `/login` page structure, ordinary user store/API contract, and existing auth regression coverage
2. Add or update unit coverage for the login page source so the register entry and critical registration fields are locked in
3. Add or update E2E coverage for the ordinary user auth page so the register path is exercised alongside the existing login flow
4. Implement the `/login` page register-entry UX by reusing the current `userStore.register(...)` capability
5. Run the relevant unit and E2E tests, analyze failures, and iterate until the affected suites pass
6. Update `AGENTS.md` skill record after delivery

## 2. Priority

- P0: expose a visible and usable ordinary user registration path on `/login`
- P0: preserve the current ordinary user login success/failure behavior
- P0: preserve the existing admin login entry and route-guard behavior
- P1: keep the page visually cohesive without expanding scope into a broader auth-page redesign

## 3. Expected Implementation Steps

1. Inspect `src/views/Login.vue`, `src/store/user.ts`, `src/api/user.ts`, and current auth tests to confirm the existing login/register contract and the safest insertion point for the register UI.
2. Write unit tests first, likely by extending the existing login page recovery/source regression test to assert:
   - `/login` still points to `Login.vue`
   - the login page source includes the visible register entry
   - the login page source includes confirm-password handling and keeps the admin-login link
3. Write E2E tests second in `tests/e2e/user-auth.spec.ts` for:
   - switching or opening the registration path from `/login`
   - successful registration using `POST /api/users/register` with a handled success outcome
   - a boundary or error-path scenario such as password mismatch or backend registration rejection
4. Implement production code in `src/views/Login.vue` by:
   - exposing a visible register option on the page
   - rendering registration inputs and validation
   - calling `userStore.register(username, password)`
   - returning the user to a valid login-ready state after registration success
   - preserving the existing login submit path and admin-login link
5. Run the targeted test suites and make any follow-up adjustments needed to keep login and register flows stable.

## 4. Dependencies

- Existing frontend auth store in `src/store/user.ts`
- Existing user API wrapper in `src/api/user.ts`
- Existing backend user registration endpoint `POST /api/users/register`
- Existing route guards in `src/router/index.ts`
- Existing Jest and Playwright test setup already used by the repository

## 5. Test Strategy

- Unit tests first:
  - extend frontend login-page regression coverage in `tests/frontend/loginRouteRecovery.test.js`
  - assert register-entry markup/contracts that should not regress
- E2E tests second:
  - extend `tests/e2e/user-auth.spec.ts`
  - cover registration success with request interception to `/api/users/register`
  - cover one handled validation or backend-failure scenario
- Production verification after implementation:
  - re-run the affected Jest test file(s)
  - re-run the affected Playwright user-auth spec

## 6. Risks And Mitigations

- Risk: page complexity increases and breaks the restored login flow
  - Mitigation: keep login submission logic intact and add registration as a parallel path instead of restructuring auth state broadly
- Risk: UI text or selectors become brittle for existing E2E login tests
  - Mitigation: update tests intentionally and keep stable button/link labels where possible
- Risk: registration success accidentally creates session state before login
  - Mitigation: continue using `userStore.register(...)` only for registration and keep session writes exclusive to `userStore.login(...)`
