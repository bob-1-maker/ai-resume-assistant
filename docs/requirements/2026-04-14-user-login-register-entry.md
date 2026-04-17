# Requirement Draft: User Login Register Entry

## Status

- Date: 2026-04-14
- Feature: Ordinary user login page register entry
- Status: Draft

## 1. Feature Description

Add a visible register option to the ordinary user login page at `/login` so that new users can discover and complete account registration from the existing authentication entry instead of only seeing the login form.

Current inspection shows that the backend already exposes `POST /api/users/register`, and the frontend already has `userStore.register(username, password)`, but `src/views/Login.vue` currently only renders the login form and an admin-login link.

Confirmed constraints:

- Must preserve the current ordinary user login flow based on `POST /api/users/login`
- Must reuse the existing ordinary user registration API and store action where practical
- Must preserve existing route guarding behavior for `/`, `/login`, `/admin-login`, and `/admin`
- Must not break the current admin login entry
- Must follow repository workflow: approved requirement -> approved plan -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Inputs

- Frontend route request to `/login`
- Username and password entered for ordinary user login
- Username, password, and confirm-password inputs for ordinary user registration
- Existing frontend ordinary user auth store and API client
- Existing backend user registration endpoint and unified response envelope

### Expected Outputs

- `/login` visibly exposes both login and registration actions for ordinary users
- A new user can submit registration from the login page flow
- Successful registration gives a clear success message and leaves the user in a valid next step for login
- Registration validation and backend failures are handled on the page without breaking the login flow
- Existing admin-login entry remains available

## 3. Page Flow And API Flow

### Page Flow

- User opens `/login`
- Page renders the ordinary user login form and a visible registration entry
- User chooses the registration path
- Page shows the registration inputs needed by the existing backend contract
- User submits registration
- On success, page shows a handled success state and guides the user back into the login path
- On failure, page shows a handled error and stays in the registration flow
- Existing login path remains available throughout

### API Flow

- Login path continues to call `userStore.login(username, password)`
- Store continues to call `POST /api/users/login`
- Registration path calls `userStore.register(username, password)`
- Store calls `POST /api/users/register`
- Backend returns the standard response envelope for both flows
- Frontend continues using the existing ordinary user session storage strategy only after login success

## 4. Exception Scenarios

The change must explicitly handle:

- Empty login inputs blocked by form validation
- Empty registration inputs blocked by form validation
- Registration confirm-password mismatch blocked before request submission
- Duplicate username or backend registration rejection
- Invalid login credentials
- Existing logged-in ordinary user visiting `/login` and being redirected by the existing route guard
- Existing admin users continuing to use `/admin-login` without regression

## 5. Acceptance Criteria

- `/login` clearly exposes a registration option for ordinary users
- Users can complete registration from the `/login` page flow using the existing backend registration contract
- Successful registration returns a handled success state and leaves the page ready for login
- Registration validation errors and backend failures are shown without crashing the page
- Existing ordinary user login still succeeds and redirects to `/`
- Existing admin-login link remains visible and functional
- Unit tests cover the new register-entry behavior and its critical validation state
- E2E tests cover the visible register path plus at least one success or handled-failure registration scenario

## 6. Scope Notes

- In scope: expose ordinary user registration from `/login`, add validation/UX wiring needed for that flow, add regression coverage
- Out of scope: backend auth redesign, admin login redesign, permission-model changes, unrelated auth-page restyling

## 7. Assumptions

- The existing `POST /api/users/register` endpoint is the approved registration backend contract
- The registration path should remain lightweight and should not auto-login unless the approved plan later says otherwise
- The current login-page visual style should be preserved unless a small adjustment is needed to fit the registration entry cleanly
