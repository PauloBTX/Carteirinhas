# TESTING STRATEGY
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. Test Types

The system must implement three levels of testing:

### 1.1 Unit Tests (Domain & Application Layer)

Scope:
- Entities
- Value Objects
- Business rules
- Use cases

Characteristics:
- No database access
- No HTTP layer
- No external services
- Fully isolated

Examples:
- Validate spreadsheet row parsing
- Validate student entity rules
- Validate duplicate prevention logic
- Validate batch processing logic

---

### 1.2 Integration Tests (API & Infrastructure)

Scope:
- API routes
- Prisma repositories
- Database integration
- File processing flow

Characteristics:
- Runs against test database
- Uses real Prisma client
- May use Docker test database
- No mocking of core infrastructure

Examples:
- POST /api/v1/import returns 201
- Invalid file returns 400
- Duplicate student returns 409
- Batch creation persists records

---

### 1.3 End-to-End Tests (Optional for v1)

Scope:
- Full upload → processing → PDF generation → download flow

Characteristics:
- Simulates real user interaction
- Can use Playwright or Cypress
- Runs against running app instance

Examples:
- Upload CSV → PDF generated successfully
- Upload invalid file → error displayed

---

## 2. Coverage Requirements

Minimum coverage:

- Domain layer: 90%
- Application layer: 85%
- Infrastructure layer: 70%
- Overall project: 80%

Rules:

- Critical business rules must have 100% coverage.
- Coverage must not be artificially increased with meaningless tests.
- Snapshot tests are not a substitute for behavioral tests.

---

## 3. Testing Rules

### 3.1 Unit Test Rules

- No external service calls.
- No real database connections.
- Repositories must be mocked via interface.
- Test both success and failure paths.
- Test edge cases explicitly.
- Do not test framework behavior.

---

### 3.2 Integration Test Rules

- Must use dedicated test database.
- Test database must not be production database.
- Database must be cleaned between tests.
- Prisma migrations must run before test execution.

---

### 3.3 File Processing Rules

- Test invalid CSV structure.
- Test missing required columns.
- Test invalid data types.
- Test partial failure scenarios.
- Test large batch handling (at least 1000 rows simulation).

---

### 3.4 PDF Generation Rules

- Test PDF generation does not throw errors.
- Test PDF file exists after generation.
- Do not assert pixel-perfect layout in unit tests.
- Layout validation belongs to visual testing.

---

## 4. Naming Conventions

Test file naming:

- Unit tests: *.spec.ts
- Integration tests: *.int.spec.ts
- E2E tests: *.e2e.spec.ts

Folder structure example:

src/modules/student/
  domain/
  application/
  infrastructure/
  student.usecase.spec.ts
  student.repository.int.spec.ts

---

## 5. Test Environment

Environment variables for testing:

- DATABASE_URL_TEST
- NODE_ENV=test

Test database must be:

- Isolated
- Automatically migrated
- Automatically cleaned

Recommended tools:

- Jest or Vitest
- Supertest for API testing
- Prisma test client
- Playwright for E2E (optional)

---

## 6. Mocking Strategy

Allowed:
- Repository interfaces
- External API calls
- File system abstraction (if wrapped)

Not allowed:
- Mocking domain logic
- Mocking use-case orchestration
- Mocking Prisma in integration tests

---

## 7. Performance Testing (Optional v1)

For batch import:

- Must handle 1000 rows within acceptable time.
- Must not exceed memory threshold.

---

## 8. Regression Policy

- Every bug fix must include a test reproducing the bug.
- No feature merged without tests.
- Refactoring must preserve test coverage.

---

## 9. Continuous Integration

Pipeline must:

1. Install dependencies
2. Run lint
3. Run type-check
4. Run tests
5. Fail on coverage below threshold

Tests must block merge on failure.