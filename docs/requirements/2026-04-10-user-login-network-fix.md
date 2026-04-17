# Requirement Draft: User Login Network Error Fix

## Status

- Date: 2026-04-10
- Feature: Ordinary user login network error fix
- Status: Pending user approval

## 1. Feature Description

Fix the local ordinary user login flow so that the `/login` page can complete requests successfully in the local development environment instead of failing with `AxiosError: Network Error` and browser `ERR_CONNECTION_REFUSED`.

Current inspection shows that the ordinary user API client still uses a hard-coded absolute base URL pointing to `http://localhost:3001/api`. This bypasses the existing Vite `/api` proxy and makes the login flow fragile when the frontend runtime cannot directly reach that port.

Confirmed constraints:

- Must preserve existing register and login business behavior
- Must preserve existing backend route shape under `/api/users/*`
- Must preserve existing ordinary user auth state keys unless an approved change requires otherwise
- Must follow repository workflow: requirement approval -> plan approval -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Inputs

- Username and password entered on `/login`
- Frontend request for `POST /api/users/login`
- Local frontend runtime through Vite dev server on port `5174`
- Local backend Express service on port `3001`

### Expected Outputs

- Ordinary user login request reaches the backend successfully in local development
- Successful login stores ordinary user session data and redirects to `/`
- Invalid credentials produce a handled business failure instead of a transport-level connection refusal
- Register and current-user APIs continue to use the same stable request path strategy

## 3. Page Flow And API Flow

### Page Flow

- User opens `/login`
- User submits username and password
- Frontend sends login request through the project-standard API path strategy
- On success, frontend stores ordinary user auth state and redirects to `/`
- On failure, page shows a clear handled error and remains on `/login`

### API Flow

- Frontend calls `POST /api/users/login`
- In local Vite mode, the request should use the `/api` proxy instead of a hard-coded host where appropriate
- Backend validates ordinary user credentials from the database
- Backend returns the standard response envelope
- Frontend handles business errors and transport errors consistently

## 4. Exception Scenarios

The fix must explicitly handle:

- Backend server not running
- Frontend API client using an incorrect absolute URL
- Vite proxy mismatch
- Empty username or password
- Wrong username or password
- Backend exception during login
- Ordinary register or current-user API path regressions caused by shared API client changes

## 5. Acceptance Criteria

- The `/login` page no longer fails with `ERR_CONNECTION_REFUSED` in the approved local setup when backend service is available
- Ordinary user login uses the correct local API path strategy
- Invalid credentials return a handled login failure message instead of a raw connection refusal
- Ordinary user register and current-user APIs continue to function
- Unit tests cover the impacted login behavior and any shared request configuration logic that changes
- E2E tests cover ordinary user login success and invalid credential behavior in local development

## 6. Scope Notes

- In scope: ordinary user login request-path fix, related frontend request configuration cleanup, regression tests
- Out of scope: admin login redesign, ordinary/admin account permission redesign, unrelated UI restyling

## 7. Assumptions

- The intended local frontend entry is `http://localhost:5174` or `http://127.0.0.1:5174`
- The intended backend local service is `http://localhost:3001`
- The preferred local frontend-to-backend path convention is the same proxy-based `/api` approach already used by the admin client
