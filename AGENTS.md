# Instructions for AI Coding Agents — Student Care

Welcome to the **Student Care** codebase. As an AI coding agent working in this repository, you must strictly follow these architectural rules, conventions, and engineering standards.

---

## 1. Architecture & Folder Responsibilities

Student Care is organized as an **npm workspaces monorepo**:

```
student-care/
├── apps/
│   ├── web/           # Next.js web platform (Public site, Teacher, School Admin, Platform Admin)
│   └── mobile/        # React Native + Expo parent mobile app
├── services/
│   └── api/           # Node.js + Express + TypeScript REST API
├── packages/
│   └── shared-types/  # Canonical shared TypeScript interfaces and API response contracts
└── docs/
    ├── requirements/  # Business requirements & domain constraints
    ├── architecture/  # Architecture diagrams & routing blueprints
    └── decisions/     # Architecture Decision Records (ADRs)
```

### Critical Workspace Boundaries

- **No Direct App-to-App Dependencies:** `apps/web` and `apps/mobile` must never import directly from each other or from `services/api`.
- **Shared Types:** All shared data contracts, DTOs, and enum types must reside in `packages/shared-types` and be exported from `src/index.ts`.
- **Separation of Concerns:** Keep business logic, database routing, and API security in `services/api`. Keep UI, layout, and client state in `apps/web` and `apps/mobile`.

---

## 2. Multi-Tenant Database Separation Rules

- **Dedicated Database Per School:** Every school operates with its own dedicated PostgreSQL database. Never combine tenant records into a single shared table.
- **Central Control Database:** Used solely for global school registration, tenant status, routing metadata, and migration logs.
- **Zero Client Trust:** Never accept a database name, connection string, or unvalidated host parameter from client request payloads. Database connections must always be resolved server-side through `DatabaseRoutingManager`.
- **Timezone:** Always default to `Asia/Colombo` unless a school's configuration specifies an alternative.

---

## 3. Package Management & Tooling Conventions

- **Package Manager:** `npm` (with npm workspaces).
- **TypeScript:** Strict type checking is enabled across all workspaces (`strict: true`). Avoid using `any` — specify explicit types or generic constraints.
- **Naming Conventions:**
  - Files & Folders: `kebab-case` (e.g., `connection-manager.ts`, `error-handler.ts`).
  - React Components: `PascalCase` (e.g., `App.tsx`, `HomePage.tsx`).
  - Functions & Variables: `camelCase` (e.g., `validateEnv`, `getSchoolPool`).
  - Constants & Enums: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEZONE`, `USER_ROLES`).
- **Standard Commands:**
  - `npm run dev:api` — Start backend API development server.
  - `npm run dev:web` — Start Next.js web application.
  - `npm run dev:mobile` — Start Expo mobile development server.
  - `npm run build` — Build shared-types, API, and web bundles.
  - `npm run type-check` — Run TypeScript type verification across all workspaces.
  - `npm run test` — Run automated test suites.

---

## 4. Security & Privacy Expectations

- **Never Commit Secrets:** Real passwords, database connection strings, JWT secrets, or cryptographic keys must never be committed to git or placed in `.env.example`.
- **Sensitive Data Masking:** All logging must redact passwords, tokens, authorization headers, and connection secrets using `logger`.
- **Student Data Privacy (PII):** Student records, medical notes, attendance logs, and guardian contacts are strictly confidential. Do not expose personal information in logs or unauthenticated endpoints.

---

## 5. Development Etiquette for Coding Agents

1. **Inspect Before Changing:** Always inspect existing files, dependencies, and configuration before creating new abstractions or refactoring.
2. **Preserve User Code:** Never delete or rewrite existing functional modules unless explicitly instructed.
3. **No Destructive Operations:** Never delete git histories, drop databases, or perform destructive file migrations without explicit approval.
4. **Mandatory Verification:** Always test your changes with `npm run type-check`, `npm run test`, or `npm run build` before claiming completion.
