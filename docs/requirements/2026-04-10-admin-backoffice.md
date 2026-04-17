# Requirement Draft: Admin Backoffice Module

## Status

- Date: 2026-04-10
- Feature: Admin backoffice module
- Status: Requirement updated, pending final approval

## 1. Feature Description

Build an admin backoffice module on top of the current project without breaking the existing user login flow, JWT auth flow, frontend routing, or resume editing behavior.

The V1 scope is intentionally narrow and only covers administrator login, admin-only resume list viewing, resume deletion, and permission interception.

Current confirmed constraints:

- Must remain compatible with Vue 3 + Vite + TypeScript + Element Plus
- Must remain compatible with Node.js + Express + JWT + Turso
- Must not break existing login, auth, or route behavior
- Must follow requirement doc -> approved plan -> unit test -> E2E test -> implementation

## 2. Inputs / Outputs

### Confirmed Inputs

- Existing user login token
- Existing backend user/auth data
- Existing route guard mechanism
- Fixed admin username and password stored in server configuration

### Expected Outputs

- Separate admin login page at `/admin-login`
- Admin-only resume list page
- Admin-only route guard and API guard
- Admin-only backend APIs under `/api/admin/*`
- Resume read-only details in list context
- Resume delete capability

## 3. Page / Interface Logic

### Confirmed Logic

- Existing normal users continue using the current login and home flow
- Admin routes must be isolated from normal user routes and protected by auth and permission checks
- Admin login is independent from normal user login
- Admin entry route is `/admin-login`
- Admin home page should directly display the global resume list
- V1 admin UI manages resumes only

## 4. API Logic

### Confirmed Logic

- Continue using JWT authentication
- Continue using unified API response envelope
- Do not weaken current auth behavior
- Admin APIs use dedicated `/api/admin/*` namespace
- Admin account does not come from the database
- Admin account has one fixed identity only, with no registration flow
- Admin permissions are binary only: admin or non-admin

### Proposed V1 API Scope

- `POST /api/admin/login`
- `GET /api/admin/resumes`
- `DELETE /api/admin/resumes/:resume_id`

## 5. Exception Scenarios

The implementation must handle:

- Non-admin user attempts to access admin routes
- Missing token
- Expired or invalid token
- Admin API permission denied
- Empty admin datasets
- Database query failure
- Invalid filter or pagination input
- Fixed admin credential mismatch
- Normal user token attempts to call admin APIs
- Direct access to admin routes without admin session

## 6. Acceptance Criteria

- Admin can successfully enter the admin module after authentication
- Non-admin users cannot access admin pages or admin APIs
- Existing user login and resume flows continue to work as before
- Admin actions produce consistent API responses and user feedback
- Admin can view the full resume list across users
- Admin can delete a resume from the admin list
- Admin cannot edit resume content in V1
- Unit tests cover auth, permission, success, failure, and edge cases
- E2E tests cover admin entry, guarded access, and at least one core admin workflow

## 7. Confirmed V1 Scope

- Admin login
- Admin-only route guard and API permission interception
- View all resumes across the system
- Delete resumes
- Read-only access only, no resume editing

## 8. Fixed Business Rules

- Admin login route is `/admin-login`
- Admin login does not share the normal user login entry
- Admin credentials are fixed and do not rely on the database
- No admin registration flow
- Only one admin role exists in V1
- Admin manages resumes only
- Admin homepage lands directly on the all-resume list
- Backend admin APIs use `/api/admin/*`

## 9. Non-Goals For V1

Unless you explicitly include them, the first version should exclude:

- Complex RBAC
- Separate admin user management
- User management
- Statistics dashboard
- Announcement center
- System configuration center
- Admin UI theme redesign unrelated to the feature
- Batch import/export for admin data
- Resume editing from the admin side
