# SYSTEM CONSTRAINTS
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. Technical Constraints

- ORM restricted to: Prisma
- Database restricted to: PostgreSQL (via Supabase local Docker instance)
- State management restricted to: React built-in state (useState/useReducer) and Server Components. Zustand allowed only if complexity increases.
- Styling restricted to: TailwindCSS and Shadcn UI (via MCP)
- Component library restricted to: shadcn/ui
- Language restricted to: TypeScript (strict mode enabled)

No usage of:

- Supabase JS SDK inside domain layer
- Direct SQL queries outside Prisma
- Any usage of `any` type in TypeScript
- Global mutable in-memory state
- External SaaS dependencies
- Server-side sessions
- MongoDB or other NoSQL databases

---

## 2. Architectural Constraints

- Must follow Clean Architecture principles.
- Must be implemented as a Modular Monolith.
- Domain layer must not depend on framework code.
- No business logic in controllers or route handlers.
- All modules must be isolated and self-contained.
- Database access must occur only through repository implementations.
- PDF generation must be isolated in infrastructure layer.
- No cross-module direct database access.
- Dependency direction must always point inward (toward domain).

---

## 3. Operational Constraints

- System must run locally on a single machine.
- Database must run in Docker container.
- Application must run via Node.js locally.
- Must support Linux-based environments.
- Must not require cloud infrastructure.
- Must work fully offline.
- Must not require staging or production environment separation.

---

## 4. Security Constraints

- No sensitive data stored in plain text.
- No exposure of stack traces in API responses.
- Environment variables must not be committed.
- File uploads must be validated before processing.
- Maximum upload size: 10MB.

---

## 5. Performance Constraints

- System must handle at least 1000 student records per batch.
- Batch processing must not rely on in-memory global state.
- No blocking synchronous loops for heavy processing.
- PDF generation must not exceed reasonable memory usage.

---

## 6. Future Considerations

The current architecture must allow:

- Multi-tenant support without rewriting domain logic.
- API versioning without breaking existing routes.
- Extraction of PDF generation into separate service.
- Migration from local database to managed PostgreSQL service.
- Introduction of background job processing.