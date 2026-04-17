# Server AI Refactor Requirement

## Feature Description

Refactor the backend entry implementation so that `server.js` no longer directly carries AI routes, cache wiring, rate limiting rules, prompt construction, retry logic, and third-party provider calls in a single file.

The target is to split backend responsibilities into a startup layer, route layer, controller layer, and service layer while preserving all current user-facing behavior and API compatibility.

## Inputs And Outputs

### Inputs

- Current backend entry file: `server.js`
- Existing backend modules under `routes/`, `controllers/`, `middleware/`, and `config/`
- Current AI endpoints under `/api/ai/*`
- Current Redis optional cache behavior
- Current third-party AI provider integration behavior

### Outputs

- A lightweight backend startup entry focused on app bootstrapping
- Dedicated AI route module
- Dedicated AI controller module
- Dedicated service modules for AI orchestration, cache access, retry behavior, prompt building, and provider adapters
- Test coverage for the new backend split without changing the public API contract

## Page Flow And API Flow

### Page Flow

No frontend page flow changes are required.

Existing flows must remain unchanged:

- User login -> home -> resume editing -> save/export
- Admin login -> admin resume list -> delete resume

### API Flow

Current target backend flow after refactor:

1. `server` startup module initializes environment, database connection checks, and migration execution
2. `app` module creates and configures the Express application
3. `/api/ai/*` requests are routed through a dedicated AI route module
4. AI route handlers invoke AI controller methods
5. AI controllers validate request input and delegate to AI service methods
6. AI services orchestrate cache lookup, provider selection, retry logic, fallback behavior, and response normalization
7. Controllers return the existing unified API response shape

## Exception Scenarios

- Redis is disabled by configuration
- Redis is enabled but connection fails
- Third-party AI provider returns an invalid payload
- Third-party AI provider times out
- Third-party AI provider returns an HTTP error
- Request body is missing required AI input fields
- Cache lookup or cache write fails
- Migration execution is triggered more than once during startup
- Refactor accidentally changes current response shape or route path

## Acceptance Criteria

- `server.js` or its replacement startup entry only contains startup and wiring responsibilities
- AI route definitions are moved to a dedicated route module
- AI request parsing and response shaping are moved to a dedicated controller module
- AI orchestration logic is moved to dedicated service modules
- Cache access is isolated from route/controller code
- Third-party provider call details are isolated from route/controller code
- Existing `/api/ai/*` paths remain compatible with the frontend
- Existing response shape remains compatible with the frontend
- Existing non-AI backend routes continue to work as before
- Unit tests are added or updated for main success path, error path, and boundary conditions
- E2E coverage is added or updated for at least one AI API compatibility path before production code migration is finalized

