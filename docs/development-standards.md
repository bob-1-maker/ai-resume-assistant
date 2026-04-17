# Development Standards

## Purpose

This document defines the repository-wide engineering rules that every future task must follow.

## Delivery Process

1. Requirement confirmation
2. Structured requirement document
3. Rule and document update if needed
4. Development plan review
5. Unit tests first
6. E2E tests second
7. Production implementation
8. Test execution and iterative fixes
9. Final delivery

## Requirement Document Template

Each new requirement document must contain:

## 1. Feature Description

- Business goal
- User-facing behavior
- Non-goals when necessary

## 2. Inputs / Outputs

- User input
- API request payload
- API response payload
- Persisted data changes

## 3. Page / Interface Logic

- Frontend page flow
- State transitions
- Backend endpoint behavior
- Auth and permission impact

## 4. Exception Scenarios

- Validation failures
- Empty states
- Third-party dependency failures
- Auth failures
- Database failures

## 5. Acceptance Criteria

- Observable success behavior
- Observable failure behavior
- Required tests

## Coding Rules

- Frontend new code should default to TypeScript.
- Backend existing JavaScript modules may be extended incrementally, but new abstractions should be written with clear boundaries.
- Reuse existing utility layers before adding parallel wrappers.
- Do not hard-code `http://localhost:3001` in frontend request code; prefer relative `/api` or environment-based configuration.
- Any route or auth change must preserve current JWT-based flow unless the requirement explicitly changes it.
- Large logic additions to `server.js` are discouraged; prefer extracting routes and services.

## Testing Rules

- Unit tests must be created before implementation changes are finalized.
- E2E tests must cover the approved user path, not just internal functions.
- Each feature must cover success, failure, and edge conditions.
- Fixing a bug requires at least one regression test.

## Documentation Update Rules

Update docs when a task changes:

- API contract
- Directory conventions
- Naming conventions
- Error handling rules
- Environment variables
- Auth behavior

## Current Tooling Baseline

- Frontend build: Vite
- Frontend framework: Vue 3
- Frontend language: TypeScript
- UI library: Element Plus
- Backend runtime: Node.js + Express
- Database target: Turso / libSQL
- Unit test framework: Jest

## E2E Baseline

The repository currently has no formal E2E runner configured in `package.json`.
Before substantial feature work that requires browser-level verification, add and document an approved E2E framework through the standard requirement and plan flow.
