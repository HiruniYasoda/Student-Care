# Student Care — Multi-School Management & Safety Platform

Student Care is an enterprise school management system designed for multi-institution isolation, security, and digital administration. The platform serves school administrators, teachers, parents, and students with strict data privacy and institutional independence.

---

## Architecture Highlights

- **Multi-Tenant Database Isolation:** Dedicated PostgreSQL database per school institution, ensuring zero cross-tenant data exposure.
- **Central Control Database:** Centralized registry for unique School IDs, routing metadata, license status, and schema migration tracking.
- **Single Monorepo:** Structured using npm workspaces across web, mobile, API, and shared types.
- **Default Timezone:** `Asia/Colombo` (configurable per institution).

---

## Repository Structure

```
student-care/
├── apps/
│   ├── web/               # Next.js 14 + TypeScript web portal
│   │                      # (Public Website, Teacher, School Admin, Platform Admin)
│   └── mobile/            # React Native + Expo parent mobile app
├── services/
│   └── api/               # Node.js + Express + TypeScript backend API
├── packages/
│   └── shared-types/      # Canonical TypeScript types & API contracts
├── docs/
│   ├── requirements/      # Requirements specification
│   ├── architecture/      # Architectural blueprints & diagrams
│   └── decisions/         # Architecture Decision Records (ADRs)
├── .env.example           # Documented configuration template
├── AGENTS.md              # Guidelines for AI coding agents
├── package.json           # Monorepo workspaces manifest
└── tsconfig.json          # Root TypeScript configuration
```

---

## Prerequisites

- **Node.js:** `v20.x` or higher (verified on `v24.11.x`)
- **npm:** `v10.x` or higher (verified on `v11.6.x`)
- **PostgreSQL:** `v14+` (required for operational databases; not required for foundation smoke tests)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install --prefer-offline
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

_(On Windows PowerShell: `Copy-Item .env.example .env`)_

Update the configuration variables in `.env` as needed. The API has built-in safe defaults for local development.

---

## Development Commands

| Command                | Action                                                                      |
| :--------------------- | :-------------------------------------------------------------------------- |
| `npm run dev:api`      | Starts the Express API in watch mode on port 4000 (`http://localhost:4000`) |
| `npm run dev:web`      | Starts the Next.js web application on port 3000 (`http://localhost:3000`)   |
| `npm run dev:mobile`   | Launches the Expo Metro bundler for the Parent Mobile App                   |
| `npm run build`        | Builds shared-types, API, and Web bundles                                   |
| `npm run type-check`   | Verifies TypeScript types across all workspaces                             |
| `npm run test`         | Runs automated test suites (API health check, environment validation)       |
| `npm run lint`         | Runs ESLint verification across workspaces                                  |
| `npm run format:check` | Verifies code style compliance across the project using Prettier            |
| `npm run format`       | Automatically formats files according to Prettier configuration             |
| `npm run clean`        | Removes compiled distribution directories (`dist/`, `.next/`)               |

---

## Verification & Health Check

When the API service is running, verify the health endpoint:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "student-care-api",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 42,
    "timezone": "Asia/Colombo"
  },
  "timestamp": "2026-10-23T11:30:00.000Z"
}
```

---

## Planned Future Milestones

- Central Control Database schema migrations and tenant provisioning routines.
- Role-based authentication (JWT issuance, refresh token rotation).
- Real-time biometric fingerprint attendance ingestion service.
- Mobile push notifications for parent arrival/departure alerts.
- Dedicated cross-school aggregated analytics pipeline.
