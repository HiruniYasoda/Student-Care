# Student Care — System Requirements Specification

## 1. Overview and Purpose

Student Care is an enterprise school management and student safety platform designed to serve multiple educational institutions while preserving strict data privacy, regulatory compliance, and institutional autonomy.

The platform provides unified digital experiences for students, teachers, parents, school administrators, and platform administrators.

## 2. Multi-School Multi-Tenancy Architecture

- **Dedicated Tenant Database:** Each registered school operates with its own isolated PostgreSQL database. Under no circumstances may data from two distinct schools reside within the same table or operational database.
- **Central Control Database:** A dedicated system database storing:
  - School registry (School IDs, registration codes, official names).
  - Provisioning status (`PENDING_PROVISION`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`).
  - School-specific database routing coordinates and server reference parameters.
  - Cross-tenant system metadata and migration histories.
- **Timezone Management:** Default timezone is `Asia/Colombo`. Timezone is configurable per school registry entry.

## 3. Platform Components & Target Users

| Component             | Target Platform                | Target Users                                     | Responsibilities                                                                               |
| :-------------------- | :----------------------------- | :----------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Web Platform**      | Next.js + TypeScript           | Public, Teachers, School Admins, Platform Admins | Public discovery, teacher classroom workflows, administrative controls, multi-tenant registry. |
| **Parent Mobile App** | React Native + Expo            | Parents & Legal Guardians                        | Biometric attendance alerts, child progress tracking, school communications, announcements.    |
| **Backend API**       | Node.js + Express + TypeScript | All clients                                      | Unified RESTful API, authentication, tenant database connection routing, business logic.       |
| **Shared Types**      | TypeScript Package             | Internal                                         | Canonical interfaces, API contracts, response payloads, shared domain models.                  |

> [!NOTE]
> A separate teacher mobile application is **not** part of current platform scope. Teachers access their portal via the web application.

## 4. Key Functional Modules (Staged Rollout)

1. **Authentication & Authorization:** Role-based access control (Super Admin, School Admin, Teacher, Parent) with token issuance and tenant scope verification.
2. **Student & Classroom Management:** Student profiles, guardian mappings, classroom rosters, and academic grade progression.
3. **Attendance & Biometric Integration:** Daily attendance tracking supporting manual teacher input and future hardware biometric fingerprint terminal synchronization.
4. **Academics & Gradebooks:** Exam schedules, grading criteria, report card generation.
5. **Cross-School Analytics (Future Phase):** Dedicated isolated analytics pipeline for approved aggregated reporting without cross-school operational queries.

## 5. Security & Isolation Safeguards

- Client requests are prohibited from directly supplying database names or connection parameters.
- School identity must be extracted and validated from authenticated cryptographic tokens (JWTs) and matched against the Central Control Database.
- Credentials and database connection secrets must remain in server-side configuration or secrets managers.
