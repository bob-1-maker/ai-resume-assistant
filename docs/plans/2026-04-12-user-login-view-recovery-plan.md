# Development Plan: User Login View Recovery

## Status

- Date: 2026-04-12
- Feature: Ordinary user login view recovery
- Status: Approved
- Based on requirement: `docs/requirements/2026-04-12-user-login-view-recovery.md`

## 1. Task List

1. Confirm the existing ordinary user login store, API, and route guard expectations
2. Add unit coverage for `/login` route linkage and restored view presence
3. Add E2E coverage for ordinary user login success, invalid credentials, and logged-in redirect behavior
4. Recreate the minimal ordinary user login page using the current store and UI patterns
5. Run targeted tests and verify the startup path is restored
6. Update `AGENTS.md` skill records with the completed task

## 2. Priority

- P0: restore frontend startup by resolving the missing `/login` view import
- P0: preserve the current ordinary user login behavior
- P1: align the restored page with existing admin login presentation patterns where practical

## 3. Expected Implementation Steps

1. Inspect the current user store, user API client, and auth-related E2E coverage.
2. Write unit tests first to lock the expected route-to-view linkage and file presence.
3. Write E2E tests second for:
   - ordinary user login success
   - invalid credentials
   - redirect away from `/login` when an ordinary user session already exists
4. Implement the missing `src/views/Login.vue` page with:
   - Element Plus form validation
   - `useUserStore().login(...)`
   - success redirect to `/`
   - handled error feedback
5. Run the impacted test set and verify the startup issue is removed.

## 4. Dependencies

- Approved requirement document
- Existing Jest and Playwright setup
- Existing user store and user API client
- Existing route guard behavior in `src/router/index.ts`

## 5. Test Strategy

- Unit tests first in `tests/frontend`
- E2E tests second in `tests/e2e/user-auth.spec.ts`
- Run targeted Jest and Playwright checks after implementation
- Run a production build check if the targeted test pass confirms the missing import is fixed

## 6. Risks

- The restored view could drift from the expected session-key behavior if it bypasses the store
- Route guard messaging may still show legacy encoding artifacts that are unrelated to the missing file
- Additional missing views could surface after this first startup blocker is cleared
