# Error Handling Rules

## Goal

Errors must be handled consistently across frontend and backend so that failures are diagnosable, safe, and predictable to users.

## Backend Rules

- Return the unified response envelope for handled errors.
- Do not leak stack traces, tokens, passwords, or sensitive headers in API responses.
- Validate input before database or third-party calls.
- Use the correct HTTP status for auth, validation, conflict, not-found, and server errors.
- Log enough context to debug, but redact sensitive values.

## Frontend Rules

- Centralize HTTP error handling in the request layer.
- Show user-facing messages that are concise and actionable.
- Distinguish between:
  - network failure
  - timeout
  - auth failure
  - rate limit
  - server error
- Avoid duplicate global and local error toasts for the same failure.

## Auth Errors

- Missing token: treat as unauthenticated
- Invalid or expired token: clear invalid session state and redirect according to route guard rules
- Permission denied: keep user informed without exposing internal policy detail

## Validation Errors

- Backend should return `400`
- Message should identify the invalid field or missing requirement when safe to do so
- Frontend forms should prioritize inline validation before request submission

## Third-Party and AI Service Errors

- Wrap upstream errors in stable internal messages
- Do not expose secret keys, upstream raw payloads, or internal retry details
- If fallback behavior exists, document it in the requirement and test it

## Logging Rules

- Remove or avoid raw token logging
- Remove or avoid full authorization header logging
- Remove or avoid sensitive request payload logging
- Use environment-aware logging verbosity

## Testing Rules For Errors

Each feature must include tests for:

- invalid input
- unauthenticated access when applicable
- upstream or database failure when applicable
- boundary conditions

## Known Repository Follow-Up

The current repository contains verbose auth and request logging patterns that should be reduced or normalized in future implementation work under the approved workflow.
