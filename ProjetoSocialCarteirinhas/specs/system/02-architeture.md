# ARCHITECTURE SPECIFICATION
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. Architectural Style

- Clean Architecture
- Modular Monolith
- REST-based internal API (Next.js Route Handlers)
- Server-side rendering capable
- Batch-processing oriented for PDF generation

The system will be implemented as a modular monolith using Next.js as the primary framework.  
All business logic must be isolated from framework-specific code.

---

## 2. Technology Stack

### Frontend

- Framework: Next.js (Nextjs router)
- Language: TypeScript
- State management: React Server Components + minimal client state (useState / optional Zustand if needed)
- Styling: TailwindCSS and Shadcn UI (via MCP)
- Form handling: React Hook Form
- File upload: Native browser API (multipart/form-data)
- Minimalistic design
---

### Backend

- Runtime: Node.js (via Next.js server runtime)
- Framework: Next.js Route Handlers
- Validation: Zod
- ORM: Prisma
- Database: Supabase (PostgreSQL)

The backend logic will live inside the Next.js application using Route Handlers, but must respect Clean Architecture boundaries.

---

### Infrastructure

- Containerization: Docker + Docker Compose
- Database: Supabase local instance via Docker
- Database Port: Dedicated local port (e.g. 54325) exclusive to this project
- Environment variables: .env.local
- File storage (initial): Local filesystem
- CI/CD: GitHub Actions (future)

---

## 3. Local Supabase Architecture

The system will run Supabase locally using Docker.

Requirements:

- Supabase container isolated per project
- Dedicated database port (e.g. 54325)
- Dedicated Studio port (e.g. 54326)
- No shared global Supabase instance
- Store the authentication key in the .env.local file

Docker services:

- supabase-db
- supabase-auth (optional if needed later)
- supabase-studio (optional)

Prisma will connect using:

DATABASE_URL=postgresql://user:password@localhost:54325/database_name

This ensures environment isolation per project.

---

## 4. Module Structure

All business features must be organized by module.

Example:

src/modules/<module-name>/
  domain/
  application/
  infrastructure/
  presentation/

Example modules:

- student
- id-card
- batch
- file-import

---

## 5. Layer Responsibilities

### Domain

- Entities
- Value Objects
- Business Rules
- Pure TypeScript
- No framework imports
- No database access

Domain must be framework-agnostic.

---

### Application

- Use cases
- Orchestration logic
- Transaction coordination
- Calls domain entities
- Depends only on domain interfaces

---

### Infrastructure

- Prisma repositories
- Supabase connection
- File storage implementation
- PDF generation service (e.g. PDFKit or similar)

Infrastructure implements interfaces defined in the domain layer.

---

### Presentation

- Next.js Route Handlers
- Controllers
- Request parsing
- Zod validation
- Response formatting

Presentation must not contain business rules.

---

## 6. Dependency Rules

- Domain must not depend on Infrastructure.
- Domain must not depend on Next.js.
- Application may depend on Domain only.
- Infrastructure may depend on Domain.
- Presentation may depend on Application.
- Controllers must not contain business logic.
- Validation must occur before use-case execution.

Dependency direction must always point inward (towards Domain).

---

## 7. Cross-Cutting Concerns

### Logging Strategy

- Structured logging
- Console logging in development
- Future support for external log service
- No sensitive data in logs

---

### Error Handling Strategy

- Centralized error formatter
- Domain errors mapped to HTTP errors
- Standard response format:

{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}

- No stack traces exposed in production

---

### Configuration Management

- Environment variables only
- Required variables:
  - DATABASE_URL
  - NEXT_PUBLIC_APP_URL
  - NODE_ENV

- No hardcoded secrets
- .env.local for development
- .env.production for production

---

## 8. File Processing Architecture

Spreadsheet processing flow:

1. User uploads CSV/XLSX.
2. File is validated.
3. Rows are parsed into domain entities.
4. Invalid rows are reported.
5. Valid rows are persisted.
6. ID cards are generated in batch.
7. Output generated as PDF.
8. PDF available for download.

Processing must be synchronous for small batches (< 1000 records).  
Future scalability may introduce background jobs.

---

## 9. Scalability Considerations

- Designed initially as modular monolith.
- Architecture must allow extraction of PDF generation to separate service in the future.
- Database designed to support up to 50,000 students without structural changes.
- No in-memory state for long-running operations.

---

## 10. Architectural Constraints

- Must run entirely in Docker.
- Must support local isolated Supabase instance.
- No direct Supabase SDK usage in domain layer.
- All database access must go through Prisma repositories.
- No business logic inside Next.js pages or components.