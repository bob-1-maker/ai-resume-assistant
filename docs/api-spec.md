# API Specification

## Base Rule

- Frontend should call backend through `/api` or environment-driven base URLs.
- Do not hard-code local development origins in feature code.

## Response Shape

All backend JSON responses should follow the same envelope:

```json
{
  "code": 200,
  "msg": "ok",
  "data": {}
}
```

## Success Responses

- `code`: business-aligned status code, usually matching HTTP semantics
- `msg`: concise readable message
- `data`: response payload object, array, or `null`

## Error Responses

```json
{
  "code": 400,
  "msg": "validation failed",
  "data": null
}
```

## HTTP Semantics

- `200` for successful query, update, or delete operations that return normally
- `201` for newly created resources when creation semantics are explicit
- `400` for request validation failures
- `401` for missing or invalid authentication
- `403` for permission-denied scenarios
- `404` for missing resources
- `409` for conflict scenarios
- `429` for rate limiting
- `500` for unhandled server errors

## Authentication Rules

- Protected endpoints must require JWT Bearer token authentication.
- Frontend route protection must remain aligned with backend protection.
- Token retrieval and injection must be centralized instead of repeated across multiple wrappers.

## Endpoint Design Rules

- Keep endpoints resource-oriented.
- Use route modules by domain.
- Keep AI-related endpoints grouped consistently.
- Validate request body, query, and params before core processing.

## Pagination Rules

When list endpoints are paginated, return:

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## Frontend Request Rules

- Use a shared request client.
- Keep timeout, auth header, retry, and global error behavior centralized.
- Distinguish user-facing errors from silent internal retries.

## Contract Change Rule

Any endpoint contract change requires:

- Requirement document update
- Plan approval
- Unit test update
- E2E test update
- Documentation update in this file if the public shape changes
