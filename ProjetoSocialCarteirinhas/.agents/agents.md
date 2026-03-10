# AGENT OPERATING MANUAL
Project: Projeto Social Carteirinhas
Version: 1.0
Status: Active

This document defines how AI agents must behave when generating,
modifying or reviewing code in this repository.

---

# 1. Source of Truth Hierarchy

When making decisions, follow this priority order:

1. specs/system/*
2. specs/features/*
3. This agents.md
4. .agents/skills
5. Local code context

If conflicts occur, higher priority documents override lower ones.

Never assume behavior outside defined specifications.

---

# 2. Architectural Enforcement Rules

The agent must:

- Follow Clean Architecture strictly.
- Respect modular monolith structure.
- Keep domain layer framework-agnostic.
- Avoid placing business logic in route handlers.
- Use Prisma as the only ORM.
- Use PostgreSQL (Supabase Docker) only.
- Never introduce external SaaS dependencies.
- Maintain single-user local system assumption.

The agent must not:

- Introduce authentication logic.
- Introduce RBAC.
- Introduce microservices.
- Introduce caching layers.
- Introduce unnecessary abstractions.
- Overengineer.

---

# 3. Code Generation Standards

## 3.1 Language & Typing

- Use TypeScript strict mode.
- Never use `any`.
- Prefer explicit types.
- Use Zod for validation.

---

## 3.2 Module Structure

Every new feature must follow:

src/modules/<feature>/
  domain/
  application/
  infrastructure/
  presentation/

No deviation allowed.

---

## 3.3 Layer Boundaries

- Domain cannot import Prisma.
- Domain cannot import Next.js.
- Application can depend only on Domain.
- Infrastructure implements domain interfaces.
- Presentation calls application layer only.

---

# 4. API Rules Enforcement

- All responses must use envelope format.
- Use correct HTTP status codes.
- Do not expose stack traces.
- Validate all input using Zod before use-case execution.

---

# 5. Performance Discipline

- Avoid N+1 queries.
- Do not load entire datasets unnecessarily.
- Process batch operations safely.
- Do not introduce in-memory global state.

---

# 6. Security Discipline

Because system is local and single-user:

- Do not implement authentication.
- Do not implement session logic.
- Do not implement rate limiting.
- Focus only on input validation and safe file handling.

---

# 7. Code Modification Policy

When modifying code:

- Do not break module boundaries.
- Do not refactor unrelated modules.
- Do not introduce new patterns unless explicitly requested.
- Preserve consistency with existing architecture.

---

# 8. Skill Usage

Skills are specialized execution procedures stored in:

specs/skills/

Rules:

- If a skill exists for a requested task, it must be used.
- Skills must respect system constraints.
- Skills must not override architectural rules.
- If no skill exists, follow architecture rules directly.
- Skills must not introduce new patterns.

Available skills:

- create-module
- create-usecase
- create-repository
- create-route
- generate-tests
- create-zod-schema

---

# 9. Refactoring Rules

Allowed:

- Improve readability.
- Improve typing.
- Improve performance within constraints.

Not allowed:

- Change architectural style.
- Introduce new infrastructure.
- Add authentication layer.
- Replace Prisma.

---

# 10. Error Handling Standard

Use structured error classes:

- DomainError
- ValidationError
- NotFoundError
- ConflictError

Map errors in presentation layer only.

---

# 11. Logging Rules

- Do not log entire student records.
- Do not log file contents.
- Log only operational events.

---

# 12. Decision Escalation

If architectural decision is unclear:

- Do not assume.
- Ask for clarification.
- Do not invent infrastructure.

---

# 13. Anti-Patterns to Avoid

- Fat controllers
- God services
- Direct Prisma calls in presentation
- Business logic inside PDF generator
- Cross-module imports

---

# 14. Future-Proofing Rules

Prepare for:

- Batch scaling
- Background processing
- Service extraction (PDF)

Do not implement them prematurely.

---

# 15. Agent Behavior Mode

Default behavior mode:

- Conservative
- Minimal
- Deterministic
- Specification-driven
- No creative deviations

Always prioritize correctness over cleverness.
