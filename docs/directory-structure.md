# Directory Structure Rules

## Current Effective Structure

```text
src/                 Frontend Vue 3 + TypeScript application
controllers/         Express controllers
routes/              Express route modules
middleware/          Express middleware
config/              Database and runtime configuration
tests/               Jest unit tests
public/templates/    HTML and CSS resume templates
src-tauri/           Tauri desktop shell
server.js            Current backend entry and aggregated server logic
```

## Frontend Rules

- `src/views/` stores route-level pages.
- `src/components/` stores reusable or feature components.
- `src/components/templates/` stores resume template rendering components.
- `src/utils/` stores shared utility logic, request helpers, parsing helpers, and pure functions.
- `src/composables/` stores reusable Vue composition logic.
- `src/router/` stores route definitions and guards.
- `src/workers/` stores web worker code.

## Backend Rules

- `routes/` only defines request routing and middleware composition.
- `controllers/` handles request parsing, response shaping, and service orchestration.
- `middleware/` handles cross-cutting concerns such as auth.
- `config/` handles database, migration, and runtime config wiring.

## Expansion Rules

- New backend business logic should prefer `services/` when the logic is larger than simple controller orchestration.
- New persistent data access helpers should prefer `repositories/` or a similarly explicit layer if introduced.
- Avoid adding major feature logic directly into `server.js`.
- Avoid placing business logic in `src/views/` when it can live in components, composables, or utilities.

## Test Layout Rules

- Mirror source domains under `tests/` where practical.
- Controller tests go under `tests/controllers/`
- Middleware tests go under `tests/middleware/`
- Helper test doubles go under `tests/helpers/`
- When E2E tooling is introduced, place tests under `tests/e2e/`

## Documentation Layout Rules

- Project-wide norms: `docs/*.md`
- Approved requirements: `docs/requirements/`
- Approved plans: `docs/plans/`

## Build Artifact Rules

- Do not hand-edit `dist/`
- Do not add new source-of-truth files under build output directories
