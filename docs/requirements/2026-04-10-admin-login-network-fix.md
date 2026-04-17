# Requirement Draft: Admin Login Network Error Fix

## Status

- Date: 2026-04-10
- Feature: Admin login network error fix
- Status: Pending user approval

## 1. Feature Description

Fix the local admin login flow so that entering `admin / 123456` on the admin login page can complete successfully in the local development environment.

The current failure is not a normal credential rejection. The frontend reports `AxiosError: Network Error`, which indicates the login request does not complete normally. Based on current code inspection, the fix scope must cover both the admin API request path and the configured admin credential source so that the local experience is stable and predictable.

Confirmed constraints:

- Must preserve existing normal user login and registration behavior
- Must preserve existing admin route structure at `/admin-login` and `/admin`
- Must keep unified API response shape
- Must follow repository workflow: requirement approval -> plan approval -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Inputs

- Admin username entered from the admin login page
- Admin password entered from the admin login page
- Frontend admin API client request to `/api/admin/login`
- Backend fixed admin credential configuration from environment or fallback
- Local Vite dev server proxy configuration

### Expected Outputs

- Admin login request reaches the backend successfully in local development
- `admin / 123456` is accepted in the approved local environment configuration
- Successful login stores admin session state and redirects to `/admin`
- Invalid credentials return a handled business error instead of a transport-level network failure

## 3. Page Flow And API Flow

### Page Flow

- User opens `/admin-login`
- User enters username and password
- Frontend submits admin login request
- On success, frontend stores `adminToken` and `adminUser`
- Frontend redirects to `/admin`
- On failure, page shows a clear error message and stays on `/admin-login`

### API Flow

- Frontend calls `POST /api/admin/login`
- In local Vite mode, the request must be routed to the Node/Express backend correctly
- Backend validates the configured admin username and password
- Backend returns the standard response envelope for success or failure
- Frontend handles both success and backend business error responses without surfacing a raw network transport error for normal invalid-credential cases

## 4. Exception Scenarios

The fix must explicitly handle:

- Backend server not running
- Vite proxy or request base URL misconfiguration
- Admin API path mismatch between frontend and backend
- Missing admin credential environment variables
- Fallback admin password not matching the approved local login credential
- Empty username or password
- Wrong username or password
- Unexpected backend exception during login

## 5. Acceptance Criteria

- Using `admin / 123456` on the admin login page succeeds in the approved local setup
- The frontend no longer throws `AxiosError: Network Error` for the normal local login path when the backend is available
- Wrong admin credentials return a handled login failure message
- Existing normal user login flow remains functional
- Unit tests cover the admin login credential and error-path behavior affected by the fix
- E2E tests cover local admin login success and invalid-credential failure behavior

## 6. Scope Notes

- In scope: admin login transport/config fix, admin credential alignment for local development, regression tests
- Out of scope: admin backoffice feature expansion, user login redesign, unrelated UI restyling

## 7. Assumptions

- The reported failing page is the dedicated admin login page, not the normal user login page
- The desired local credential target is explicitly `admin / 123456`
- The backend service is expected to run on port `3001` in local development unless the implementation reveals a project-wide alternative convention
