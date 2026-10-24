# ADR 003: Selection of Azure Database for PostgreSQL Flexible Server

## Status

Accepted

## Context

Student Care requires a managed cloud relational database platform that can host multiple independent tenant databases, support the default institutional timezone (`Asia/Colombo`), provide high availability, enforce zero public exposure via private networking, and support automated Point-in-Time Restore (PITR) for disaster recovery.

We evaluated three potential cloud database hosting solutions:

1. **Azure Database for PostgreSQL Flexible Server:** Fully managed PostgreSQL service with zone-redundant high availability, VNet private injection, built-in PgBouncer, and customizable compute tiers (Burstable, General Purpose, Memory Optimized).
2. **Amazon RDS for PostgreSQL (AWS):** Industry standard managed PostgreSQL with similar feature sets.
3. **Self-Hosted PostgreSQL on Virtual Machines (IaaS / Docker):** Maximum configuration control, but incurs significant operational overhead for backup management, OS patching, failover orchestration, and compliance maintenance.

## Decision

We have selected **Azure Database for PostgreSQL Flexible Server** as the cloud database platform for Student Care.

## Consequences & Rationale

### Positive

- **Native Multi-Database Support:** Azure Flexible Server allows creating and managing dozens to hundreds of independent PostgreSQL databases on a single server instance, dramatically reducing initial multi-tenant infrastructure costs.
- **Private Virtual Network Injection:** The database cluster is deployed directly into an Azure Virtual Network delegated subnet, eliminating public IP exposure and enforcing private endpoint access.
- **Built-in PgBouncer:** Built-in connection pooling handles bursts of concurrent connections from web, mobile, and IoT biometric ingestion workloads without overloading PostgreSQL worker processes.
- **Timezone and Collation Native Support:** Fully supports `Asia/Colombo` server-level configuration and UTF-8 encoding.
- **Enterprise Disaster Recovery:** Automated daily backups with configurable retention (up to 35 days) and Point-in-Time Restore (PITR).

### Trade-offs & Mitigations

- **Cross-Border Latency:** Azure does not currently operate an in-country data center in Sri Lanka. Deployments must target nearby regions (e.g. Southeast Asia / Singapore or Central India / Pune), which provide typical round-trip latency of 30–45ms.
- **Privileged Command Restrictions:** Azure restricts superuser (`postgres`) access. Administrative operations (such as `CREATE DATABASE`) are executed via a custom administrator role (`az_provisioner`) adhering to cloud-native privilege separation.
