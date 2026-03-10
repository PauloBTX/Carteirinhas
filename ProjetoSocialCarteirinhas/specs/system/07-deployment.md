# DEPLOYMENT SPECIFICATION
Version: 1.0
Status: Active
Last Updated: 2026-02-20

---

## 1. Environment Model

The system operates in a single local environment only.

There are no staging or production environments.

All development, testing, and execution occur on the same local machine.

Environment characteristics:

- Runs locally via Node.js
- Database runs locally via Docker (Supabase)
- No public internet exposure required
- No cloud hosting

Environment type:
- Local Development Environment (LDE)

---

## 2. Execution Model

The system is started manually using:

1. Start database containers
   - docker-compose up

2. Run application
   - npm install (first time only)
   - npm run dev

The application must:

- Connect to local Supabase instance
- Fail fast if DATABASE_URL is invalid
- Log startup status clearly

---

## 3. Infrastructure Components

Local services:

- Next.js application server
- Supabase PostgreSQL container
- Optional Supabase Studio container

No external infrastructure is required.

---

## 4. Environment Variables

Required variables:

- DATABASE_URL
- NODE_ENV=development

Optional variables (if future auth is added):

- JWT_SECRET

Rules:

- Environment variables must be defined in .env.local
- Secrets must not be hardcoded
- .env.local must not be committed to version control

---

## 5. Database Management

Database runs locally via Docker.

Rules:

- Prisma migrations must be applied manually.
- Database reset must be possible via:
  - prisma migrate reset

The database is not shared across machines.

---

## 6. Build Strategy

The system may run in two modes:

Development:
- npm run dev

Production build simulation (optional):
- npm run build
- npm start

There is no automated deployment pipeline.

---

## 7. Backup Strategy

No automatic backup is required.

If backup is needed:

- Manual database dump via Docker
- Local file system backup of generated PDFs

---

## 8. Rollback Strategy

Rollback is manual.

Options:

- Restore database from local backup.
- Reset database via migration.
- Revert code using version control (Git).

There is no automated rollback mechanism.

---

## 9. Operational Constraints

- System must run fully offline.
- Must not depend on external SaaS services.
- Must work on a single developer machine.

---

## 10. Future Considerations

If the system becomes multi-user or publicly hosted:

- Introduce staging and production environments.
- Introduce CI/CD pipeline.
- Introduce managed database hosting.
- Implement automated backups.