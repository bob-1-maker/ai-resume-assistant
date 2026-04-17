# Requirement Draft: User Login View Recovery

## Status

- Date: 2026-04-12
- Feature: Ordinary user login view recovery
- Status: Approved

## 1. Feature Description

Restore the missing ordinary user login view so that the frontend can start successfully and the `/login` route remains available for the existing ordinary user authentication flow.

Current inspection shows that `src/router/index.ts` still routes `/login` to `../views/Login.vue`, while `src/views/Login.vue` is missing from the workspace. This causes Vite import resolution to fail during startup.

Confirmed constraints:

- Must preserve the current ordinary user auth flow based on `/api/users/login`
- Must preserve existing route guarding behavior for `/`, `/login`, `/admin-login`, and `/admin`
- Must follow repository workflow: approved requirement -> approved plan -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Inputs

- Frontend route request to `/login`
- Username and password submitted from the ordinary user login form
- Existing ordinary user auth store and API client
- Existing route guards based on `userToken`

### Expected Outputs

- Vite can resolve all route-linked view imports during startup
- `/login` renders a working ordinary user login page
- Successful login stores the existing ordinary user session keys and redirects to `/`
- Invalid credentials remain handled on `/login`

## 3. Page Flow And API Flow

### Page Flow

- User opens `/login`
- Login page renders without import errors
- User submits username and password
- Frontend calls the existing ordinary user login store action
- On success, frontend stores session state and redirects to `/`
- On failure, page shows a handled error and stays on `/login`

### API Flow

- Login page calls the existing `userStore.login(username, password)` action
- Store calls `POST /api/users/login`
- Backend returns the standard response envelope
- Frontend uses the existing `userToken` and `userInfo` storage strategy

## 4. Exception Scenarios

The fix must explicitly handle:

- Missing `Login.vue` causing Vite startup failure
- Empty username or password blocked by form validation
- Invalid ordinary user credentials
- Existing user session visiting `/login` and being redirected by route guard

## 5. Acceptance Criteria

- `npm run dev` no longer fails on `../views/Login.vue` import resolution
- `/login` renders a working ordinary user login page
- Successful ordinary user login redirects to `/`
- Invalid credentials remain on `/login` and do not create session state
- Unit tests cover the restored login view and route linkage
- E2E tests cover success, handled failure, and logged-in redirect behavior

## 6. Scope Notes

- In scope: restore missing ordinary user login view, keep route linkage valid, add regression coverage
- Out of scope: redesigning auth UX, changing backend auth rules, or modifying admin login behavior

## 7. Assumptions

- The missing ordinary user login view was removed unintentionally rather than intentionally retired
- The current `/api/users/login` contract remains the intended login API
- The existing `userToken` and `userInfo` keys remain the approved session keys
