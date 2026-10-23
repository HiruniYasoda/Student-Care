# ADR 001: Separate PostgreSQL Database per School Tenant

## Status

Accepted

## Context

Student Care serves multiple independent schools, ranging from small private academies to large collegiate campuses. Student records include minors' personally identifiable information (PII), academic evaluations, guardian contact details, and biometric attendance records.

We evaluated three potential multi-tenancy models:

1. **Shared Database, Shared Schema (Row-Level Tenancy with `school_id` column on every table):** Relies strictly on application-level filtering or Postgres Row-Level Security (RLS).
2. **Shared Database, Separate Schemas (Schema-per-tenant):** One schema per school within a single PostgreSQL database instance.
3. **Separate Database per School (Database-per-tenant):** A dedicated PostgreSQL database for each school tenant, coordinated via a Central Control Database.

## Decision

We have selected **Separate Database per School (Database-per-tenant)** as the foundational operational architecture.

## Consequences & Rationale

### Positive

- **Guaranteed Isolation & Zero Cross-Tenant Data Leakage:** Even in the event of an application SQL injection or developer query mistake omitting a `WHERE` clause, records from other schools cannot be accessed because connection handles point to isolated databases.
- **Tenant-Level Backup and Disaster Recovery:** Individual schools can be backed up, restored, or exported independently without impacting or locking other institutions.
- **Independent Compliance & Geo-Fencing:** Individual institutions with custom compliance, data retention, or on-premise residency requirements can have their databases hosted on dedicated database instances or distinct storage volumes.
- **Simplified Tenant Offboarding:** When a school churns or requests data purging, the tenant database can be detached and archived cleanly without running complex deletion queries across billions of rows.

### Trade-offs & Mitigations

- **Connection Pool Overhead:** Managing distinct connection pools per school tenant requires intelligent dynamic pool lifecycle management and idle connection timeouts. The API's `DatabaseRoutingManager` limits connections per tenant and recycles idle pools.
- **Schema Migration Complexity:** Migrations must be run across all tenant databases sequentially or concurrently. A Central Control Database tracks migration versions for each registered school.
- **Cross-School Reporting:** Operational queries cannot join across schools. Cross-school aggregations will be handled in a later phase via an isolated reporting/analytics pipeline rather than direct cross-tenant operational joins.
