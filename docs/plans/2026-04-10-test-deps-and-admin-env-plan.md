# Development Plan: Test Dependencies And Admin Env Example

## Status

- Date: 2026-04-10
- Feature: test dependency completion and admin env example update
- Status: Pending user approval

## 1. Goal

Make the repository test setup runnable and explicit by:

- ensuring Jest and Playwright dependency setup is complete
- ensuring test scripts point to valid local executables
- updating `.env.example` with fixed admin credential examples used by the admin module
- preserving existing app behavior and build behavior

## 2. Scope

### In Scope

- verify and correct `package.json` test dependency declarations
- install missing test dependencies if required
- verify or correct test scripts
- update `.env.example` with:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- document any required follow-up for Playwright browser installation if needed
- update `AGENTS.md` skill record after delivery

### Out of Scope

- changing business logic
- changing admin auth flow
- changing user auth flow
- refactoring test implementation logic
- adding unrelated environment variables

## 3. Task List

### Task 1: Validate Current Test Tooling State

Priority: P0

Steps:

1. Check whether `jest` and `@playwright/test` are present in `node_modules`
2. Check whether `.bin` executables exist
3. Confirm whether current `npm test` and `npm run test:e2e` scripts are valid

Dependencies:

- none

### Task 2: Update Requirement Support Docs

Priority: P0

Steps:

1. Add fixed admin credential examples to `.env.example`
2. Keep naming aligned with implemented admin module
3. Ensure values remain examples, not production secrets

Dependencies:

- Task 1

### Task 3: Test-First Verification

Priority: P0

Steps:

1. Run unit test entry command
2. Run E2E runner version or dry verification command if full browser execution is not yet available
3. Capture any dependency-related failures before implementation changes

Dependencies:

- Task 1
- Task 2

### Task 4: Dependency Completion

Priority: P0

Steps:

1. Install missing dependencies if local modules are incomplete
2. If needed, regenerate lockfile-consistent packages
3. Re-run verification commands

Dependencies:

- Task 3

### Task 5: Final Verification And Record Update

Priority: P1

Steps:

1. Confirm unit test command resolves Jest correctly
2. Confirm Playwright command resolves correctly
3. Update `AGENTS.md` skill record for this task

Dependencies:

- Task 4

## 4. Expected File Changes

- `package.json`
- `.env.example`
- `package-lock.json` if dependency installation changes the lockfile
- `AGENTS.md`

## 5. Dependency Graph

1. Plan approval
2. Tooling state validation
3. Env example update
4. Test command verification
5. Missing dependency installation
6. Re-verification
7. Skill record update

## 6. Test-First Execution Order

Per repository rule, after plan approval I will execute in this order:

1. Run unit-test entry verification first
2. Run E2E entry verification second
3. Only then modify dependency setup if verification shows missing runtime pieces
4. Re-run checks until test entry points are valid

## 7. Risks

- Installing packages may require network and sandbox escalation
- Playwright may still require browser binaries after package install
- Existing lockfile may drift from currently installed modules

## 8. Deliverables

- working test dependency declarations
- updated `.env.example`
- verified test command entry points
- updated `AGENTS.md` skill record
