# ADR 004: Automated, Idempotent School Provisioning Lifecycle

## Status

Accepted

## Context

School creation in Student Care is performed exclusively by Platform Administrators and involves several non-trivial database operations:

1. Validating institutional metadata.
2. Allocating a physical PostgreSQL database.
3. Executing sequential versioned schema migrations.
4. Seeding default configuration (academic years, grades, grading scales, initial admin roles).
5. Running automated smoke tests.
6. Activating the school in the Central Control Database.

In PostgreSQL, DDL commands such as `CREATE DATABASE` cannot execute inside a multi-statement transaction block (`BEGIN ... COMMIT`). If a worker crashes or network interruption occurs during migration execution, an incomplete database could become orphaned.

## Decision

We adopt a **state-machine-driven, idempotent provisioning lifecycle** coordinated via the Central Control Database table `provisioning_jobs`.

## Core Provisions

1. **Explicit Step Checkpointing:** The provisioning job tracks its progress (`DATABASE_CREATION` -> `SCHEMA_MIGRATION` -> `DEFAULT_DATA_SEEDING` -> `INTEGRITY_VERIFICATION` -> `TENANT_ACTIVATION`).
2. **Re-entrant Database Allocation:** Before issuing `CREATE DATABASE`, the worker queries `pg_database`. If the target database already exists, it advances directly to migration checks.
3. **Transactional Migration Batches:** While `CREATE DATABASE` runs outside a transaction, each schema migration file executes within its own discrete `BEGIN ... COMMIT` transaction and is recorded in the tenant migration history.
4. **Quarantine On Failure:** If provisioning fails, the school remains in `PENDING_PROVISION` status and the job is marked `FAILED` with diagnostics. Active status is only awarded after smoke test verification passes.
5. **Safe Cleanup:** Unactivated orphaned databases can be purged by platform admins using a guarded routine that strictly prevents dropping any school with `ACTIVE` status.
