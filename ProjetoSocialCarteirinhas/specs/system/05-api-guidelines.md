# API DESIGN GUIDELINES
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. API Style

- RESTful
- JSON only
- Stateless
- Resource-oriented endpoints
- No server-side session state

Base URL example:

/api/v1/

All endpoints must be grouped under versioned prefix.

Example:

/api/v1/students
/api/v1/batches
/api/v1/id-cards

---

## 2. Response Format Standard

All responses must follow the standardized envelope:

Success response:

{
  "data": {},
  "error": null
}

Error response:

{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}

Rules:

- "data" must always be present.
- "error" must always be present.
- Never return raw database objects without envelope.
- Never expose stack traces.
- Error codes must be machine-readable (UPPER_SNAKE_CASE).

---

## 3. Status Codes

- 200 OK → Successful retrieval
- 201 Created → Resource successfully created
- 202 Accepted → Batch processing started
- 204 No Content → Successful deletion
- 400 Bad Request → Validation error
- 401 Unauthorized → Authentication required
- 403 Forbidden → Insufficient permissions
- 404 Not Found → Resource not found
- 409 Conflict → Duplicate or business rule violation
- 422 Unprocessable Entity → Semantic validation error
- 500 Internal Server Error → Unexpected system failure

Rules:

- Do not misuse 200 for errors.
- Validation failures must not return 500.
- Business rule violations must return 409.

---

## 4. Versioning Strategy

Versioning method: URL versioning

Pattern:

/api/v1/resource

Rules:

- All public endpoints must include version prefix.
- Breaking changes require new version (v2).
- Non-breaking additions do not require new version.
- Old versions must remain functional during transition period.

Future consideration:
- Header-based versioning may be evaluated if needed.

---

## 5. Pagination Standard

Pagination is required for all list endpoints.

Query parameters:

?page=1
?limit=20
?sort=createdAt
?order=asc

Default page size:
- 20 records

Maximum page size:
- 100 records

Response format for paginated endpoints:

{
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 150,
      "totalPages": 8
    }
  },
  "error": null
}

Rules:

- Page numbering starts at 1.
- If page exceeds total pages, return empty items array.
- Pagination metadata must always be included.
- Sorting must be explicit; default sort is createdAt DESC.

---

## 6. Validation Rules

- All request payloads must be validated using Zod before use-case execution.
- Unknown fields must be rejected.
- Required fields must return 400 if missing.
- Validation errors must include a clear message.

Example validation error:

{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'name' is required"
  }
}

---

## 7. Batch Processing Endpoints

For batch operations (e.g. spreadsheet import):

- Endpoint may return 202 Accepted.
- Response must include batchId.

Example:

{
  "data": {
    "batchId": "uuid"
  },
  "error": null
}

Batch status endpoint:

GET /api/v1/batches/{id}

Must return:

- processing
- completed
- failed

---

## 8. File Upload Standard

- Content-Type: multipart/form-data
- Maximum file size: 10MB
- Accepted formats: CSV, XLSX
- Validation must occur before persistence

Invalid file format must return:

400 Bad Request
ERROR_CODE: INVALID_FILE_FORMAT

---

## 9. Security Considerations

- All protected routes must require authentication (if enabled in future).
- No sensitive data returned in responses.
- IDs must be UUIDs.
- Never expose internal database IDs if avoidable.

---

## 10. Naming Conventions

- Endpoints use plural nouns:
  - /students
  - /batches
  - /id-cards

- JSON fields use camelCase.
- Database fields use snake_case.
- Error codes use UPPER_SNAKE_CASE.

---

## 11. Idempotency Rules

- GET must be idempotent.
- DELETE must be idempotent.
- POST is not idempotent unless explicitly defined.
- Batch retry must not duplicate records.

---

## 12. Future Extensions

- Rate limiting
- API key authentication
- OpenAPI documentation generation