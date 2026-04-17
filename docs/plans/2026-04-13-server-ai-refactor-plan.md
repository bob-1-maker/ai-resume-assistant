# Server AI Refactor Plan

## Task List

1. Establish target backend module boundaries for startup, AI routes, AI controllers, AI services, cache services, and provider adapters
2. Add unit tests for the new AI controller and service boundaries before production refactor
3. Add or update E2E coverage to verify `/api/ai/*` compatibility remains intact
4. Implement backend startup split into lightweight app/bootstrap modules
5. Move AI route definitions into a dedicated route module
6. Move AI request parsing and response shaping into a dedicated controller module
7. Move cache access, retry logic, prompt construction, and provider calls into dedicated service modules
8. Remove duplicate startup side effects such as repeated migration execution if present
9. Run targeted unit and E2E tests, fix regressions, and finalize delivery notes

## Priority

- P0: Preserve existing API behavior and route compatibility
- P0: Reduce `server.js` responsibility to startup and wiring only
- P0: Keep Redis-disabled and provider-failure fallback behavior working
- P1: Improve testability and module boundaries for AI logic
- P1: Remove duplicate migration side effects during startup
- P2: Prepare structure for later backend service/repository expansion

## Expected Implementation Steps

1. Inspect current AI endpoints in `server.js` and group reusable concerns:
   - route registration
   - request validation
   - prompt construction
   - provider invocation
   - retry logic
   - cache lookup/write
   - fallback logic
2. Create target files for:
   - `server/app.js`
   - `server/index.js` or equivalent startup entry
   - `routes/ai.js`
   - `controllers/aiController.js`
   - `services/ai/aiService.js`
   - `services/ai/promptBuilders.js`
   - `services/ai/providers/*.js`
   - `services/cache/*.js`
   - `services/http/requestWithRetry.js`
3. Write unit tests first for:
   - controller input validation and unified response behavior
   - service success path
   - provider failure path
   - Redis unavailable boundary behavior
4. Write E2E or API-level compatibility coverage for at least one AI endpoint path
5. Move implementation in small slices, keeping route path and response schema unchanged
6. Update startup flow so environment loading, DB connectivity checks, and migrations happen once in the correct place
7. Run Jest and Playwright coverage related to the changed areas
8. Fix regressions and prepare concise implementation notes

## Dependencies

- Existing Express app and middleware stack in `server.js`
- Existing Turso configuration in `config/turso.js`
- Existing migration behavior in `config/migrations.js`
- Existing AI API environment variables in `.env` usage
- Existing frontend reliance on current `/api/ai/*` route paths and response shape
- Existing Jest and Playwright setup in `package.json`, `jest.config.cjs`, and `playwright.config.ts`

## Test Strategy

### Unit Tests First

- Add `tests/controllers/aiController.test.js`
- Add `tests/services/ai/aiService.test.js`
- Add `tests/services/cache/cacheService.test.js` if cache logic is extracted enough to justify direct testing

Minimum scenarios:

- Main success path: valid AI request returns expected unified response
- Error path: missing required input returns `400`
- Error path: provider failure returns controlled server error or fallback result
- Boundary condition: Redis disabled or unavailable does not block request completion

### E2E Tests Second

- Add or update a Playwright spec that verifies at least one AI endpoint compatibility path remains stable from the frontend perspective

Minimum scenarios:

- Main success path with mocked backend/provider behavior
- Error path for invalid AI input or mocked failure response
- Boundary condition showing route compatibility remains unchanged

### Verification

- Run targeted Jest suites for new controller/service tests
- Run relevant existing backend controller tests to catch regression spillover
- Run targeted Playwright spec for AI compatibility

