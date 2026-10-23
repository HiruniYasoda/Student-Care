# Student Care — Architecture Overview

## 1. System Topology

```mermaid
graph TD
    ClientWeb["Web Platform (Next.js)<br/>Public, Teacher, School Admin, Platform Admin"]
    ClientMobile["Parent Mobile App (Expo / React Native)<br/>Parents & Guardians"]

    API["Backend API Service (Node.js + Express + TypeScript)<br/>Safe Tenant Routing & Business Logic"]

    ControlDB[("Central Control PostgreSQL<br/>School Registry & Routing Metadata")]
    SchoolDB1[("School A PostgreSQL<br/>Dedicated Tenant Database")]
    SchoolDB2[("School B PostgreSQL<br/>Dedicated Tenant Database")]
    SchoolDBN[("School N PostgreSQL<br/>Dedicated Tenant Database")]

    ClientWeb -->|HTTP / REST| API
    ClientMobile -->|HTTP / REST| API

    API -->|1. Authenticate & Lookup Routing| ControlDB
    API -->|2. Route to Dedicated Pool| SchoolDB1
    API -->|2. Route to Dedicated Pool| SchoolDB2
    API -->|2. Route to Dedicated Pool| SchoolDBN
```

## 2. Monorepo Organization

The project is structured as an npm workspaces monorepo:

- `apps/`
  - `web/`: Next.js 14+ application with App Router, Vanilla CSS, TypeScript.
  - `mobile/`: React Native application managed via Expo SDK, TypeScript.
- `services/`
  - `api/`: Express API with Zod validation, pg connection routing, structured logging, TypeScript.
- `packages/`
  - `shared-types/`: Central type definitions and API contracts imported across all workspaces.
- `docs/`
  - Architecture guides, requirements, and Architecture Decision Records (ADRs).

## 3. Safe Database Routing Pattern

### Central Control Database

Maintains:

- `schools`: Table recording `id`, `code`, `name`, `status`, `timezone`, `database_name`, and connection coordinates.
- System migration history and platform-wide configuration.

### Tenant Database Access Abstraction

1. Every incoming authenticated request contains a verified `schoolId` embedded in the cryptographically signed JWT session.
2. The `DatabaseRoutingManager` queries or utilizes cached routing coordinates for that `schoolId`.
3. An active `pg.Pool` connection pool is retrieved or established for that specific database name.
4. Client requests cannot specify arbitrary database names or connection strings. Any request with invalid format or unknown `schoolId` is rejected before any database operation.

## 4. Environment and Secrets Strategy

- Local development uses `.env` (derived from `.env.example`).
- Sensitive values (passwords, tokens, database URLs) are strictly excluded from git tracking via `.gitignore`.
- Production credentials should be injected via container environment variables or cloud secrets managers (e.g. AWS Secrets Manager, HashiCorp Vault).
