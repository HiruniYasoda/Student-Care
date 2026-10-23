# ADR 002: Safe Database Access Abstraction and ORM Evaluation

## Status

Accepted

## Context

A multi-tenant architecture with hundreds of separate tenant databases requires dynamic connection management. Heavy traditional ORMs (like Prisma or TypeORM) often assume a static, single-database connection or compile-time schema generation, which creates operational friction when dynamically spawning or routing between dynamically registered tenant databases.

## Decision

For the initial development foundation, we implement a lightweight, robust database access abstraction based directly on the official PostgreSQL client (`pg`) and dynamic `Pool` management (`DatabaseRoutingManager`), rather than locking the platform into a static ORM.

## Rationale

1. **Dynamic Connection Pooling:** Node's `pg` driver natively allows creating, monitoring, and closing connection pools at runtime for different database names on demand.
2. **Minimal Overhead:** Eliminates heavy schema generation binaries and multi-process background engines that consume excessive server memory when managing multiple pools.
3. **Safe Server-Side Routing:** Centralizes connection string formatting on the server, enforcing that database names and host parameters are resolved exclusively through the Central Control registry.
4. **Future ORM/Query Builder Path:** Clean interfaces (`getControlPool()`, `getSchoolPool(schoolId)`) can easily power a lightweight query builder like Kysely or Drizzle in future feature stages without rewriting connection routing logic.
