# Student Care — Azure PostgreSQL Flexible Server Preparation & Security Guide

**Target Cloud Provider:** Microsoft Azure  
**Service:** Azure Database for PostgreSQL Flexible Server  
**Architecture Topology:** Multi-Tenant Database Consolidation with Dedicated Instance Scalability

---

## 1. Azure Database for PostgreSQL Flexible Server Configuration

Azure Database for PostgreSQL Flexible Server is the selected managed database engine. It provides native PostgreSQL compatibility, granular compute/storage decoupling, zone-redundant high availability, and built-in connection pooling.

### 1.1 Compute & Storage Tiers

| Environment                | SKU / Tier                         | vCPU / RAM     | Storage                                   | High Availability | Backup Retention        |
| :------------------------- | :--------------------------------- | :------------- | :---------------------------------------- | :---------------- | :---------------------- |
| **Development & Testing**  | Burstable `Standard_B2s`           | 2 vCPU / 4 GB  | 32 GB Premium SSD                         | Disabled          | 7 days (Local)          |
| **Staging**                | General Purpose `Standard_D2ds_v5` | 2 vCPU / 8 GB  | 64 GB Premium SSD (Auto-grow)             | Same-Zone HA      | 14 days (Local)         |
| **Production (Initial)**   | General Purpose `Standard_D4ds_v5` | 4 vCPU / 16 GB | 256 GB Premium SSD (Auto-grow, 3000 IOPS) | Zone-Redundant HA | 35 days (Geo-Redundant) |
| **Production (Scale-out)** | Dedicated `Standard_D8ds_v5`       | 8 vCPU / 32 GB | 512 GB+ SSD                               | Zone-Redundant HA | 35 days (Geo-Redundant) |

### 1.2 Key Server Parameters

```ini
# Enforce SSL/TLS
require_secure_transport = on
ssl_min_protocol_version = TLSv1.2

# Timezone alignment
timezone = 'Asia/Colombo'

# Connection & Memory Limits
max_connections = 500
shared_buffers = '4GB'          # ~25% of RAM on 16GB tier
effective_cache_size = '12GB'   # ~75% of RAM
work_mem = '32MB'
maintenance_work_mem = '512MB'

# Query Monitoring
track_io_timing = on
pg_stat_statements.track = top
```

---

## 2. Multi-Database Consolidation vs Separate Servers

### Initial Model: Multi-Database Consolidation on Shared Server

- **Architecture:** Multiple school databases (`sc_school_sch_001`, `sc_school_sch_002`, ...) alongside the Central Control Database (`student_care_control`) reside on a single Azure Flexible Server cluster.
- **Benefits:**
  - Dramatically lowers infrastructure costs during initial regional onboarding.
  - Simplifies central monitoring and automated backup policies.
  - Shares underutilized compute across small and medium educational institutions.
- **Capacity Limits:** A single PostgreSQL cluster comfortably hosts 50–200 tenant databases provided total concurrent active connections and IOPS remain within tier limits.

### Scale-out Model: Dedicated Server Relocation

- When a large collegiate institution (e.g., 5,000+ students, multiple biometric gates) requires dedicated hardware:
  1. A new Azure Flexible Server instance is provisioned (`server_code = 'azure-pg-flex-dedicated-01'`).
  2. The school database is migrated using Azure Database Migration Service (DMS) or `pg_dump`/`pg_restore`.
  3. In the Central Control Database, the school's `server_id` pointer is updated to the new server's UUID.
  4. The API's `DatabaseRoutingManager` automatically resolves connections to the new host without requiring application code changes or server redeployment.

---

## 3. Network Architecture & Security Isolation

Public internet access to PostgreSQL Flexible Server must be **strictly disabled** in production.

```mermaid
graph TD
    subgraph Azure Virtual Network (VNet)
        subgraph App Subnet
            API["Student Care API Service<br/>(Azure App Service / ACA)"]
            Worker["Provisioning & ETL Worker"]
        end

        subgraph Private Endpoint Subnet
            PrivateEndpoint["Azure Private Endpoint / VNet Integration"]
        end

        subgraph Database Subnet (Delegated)
            FlexServer[("Azure PostgreSQL Flexible Server<br/>Private DNS: *.postgres.database.azure.com")]
        end

        API -->|Private IP / TLS 1.3| PrivateEndpoint
        Worker -->|Private IP / TLS 1.3| PrivateEndpoint
        PrivateEndpoint --> FlexServer
    end

    Internet((Public Internet)) -.->|BLOCKED by Azure Firewall| FlexServer
```

### Network Security Rules

1. **Virtual Network Integration:** The Flexible Server is injected directly into a delegated subnet (`Microsoft.DBforPostgreSQL/flexibleServers`) within the production Virtual Network.
2. **Deny Public Access:** `public_network_access` is set to `Disabled`.
3. **Internal Private DNS:** Resolution occurs via Azure Private DNS Zone (`privatelink.postgres.database.azure.com`).
4. **Network Security Groups (NSGs):** Only inbound traffic on port 5432 originating from the designated Application Subnet is permitted.

---

## 4. Database Role & Privilege Separation

Privilege separation prevents an application compromise from leading to database-level destruction or unauthorized schema alterations.

```sql
-- 1. Administrative Provisioning Role (used ONLY by background provisioning worker)
CREATE ROLE az_provisioner WITH LOGIN CREATEDB PASSWORD '<provisioner_secret_from_vault>';
GRANT CONNECT ON DATABASE postgres TO az_provisioner;

-- 2. Application Runtime Role (used by Express API for standard operations)
CREATE ROLE az_school_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '<app_secret_from_vault>';

-- Grants applied to each created tenant database:
-- GRANT CONNECT ON DATABASE sc_school_<id> TO az_school_app;
-- GRANT USAGE ON SCHEMA public TO az_school_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO az_school_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO az_school_app;

-- 3. Read-Only Analytics ETL Role (used ONLY by aggregated reporting worker)
CREATE ROLE az_readonly_etl WITH LOGIN NOSUPERUSER NOCREATEDB PASSWORD '<etl_secret_from_vault>';
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO az_readonly_etl;
```

---

## 5. Secret Management & Credential Lifecycle

- **Azure Key Vault:** All database passwords, encryption keys, and JWT signing keys are stored exclusively in an Azure Key Vault resource (`kv-studentcare-prod`).
- **Managed Identities:** The Express API and background workers authenticate to Azure Key Vault using Azure Managed Identities (MSI). No credentials or certificates are stored in code or repository configuration files.
- **Local Development Parity:** In local development, credentials are read from `.env` (git-ignored) with safe defaults pointing to local containerized instances.

---

## 6. Connection Pooling Strategy: Server-side vs Application-side

Student Care uses a two-tier pooling strategy to manage multi-tenant connections efficiently:

1. **Azure Flexible Server Built-in PgBouncer:**
   - Flexible Server provides built-in PgBouncer integration (transaction-level pooling).
   - Reduces connection overhead on PostgreSQL worker processes when hundreds of tenant connections are idle.
2. **Node.js Application Pool Management (`DatabaseRoutingManager`):**
   - Maintains cached tenant pools per active `schoolId` with conservative limits (`max: 5` per school in development/staging, `max: 15` in production).
   - Sets `idleTimeoutMillis = 30000` to automatically close connections for inactive schools outside school hours.

---

## 7. Azure Deployment Pre-Flight Checklist

Before provisioning production Azure infrastructure, the following regional and operational questions must be validated:

- [ ] **Azure Region Selection:**
  - Recommended: **Southeast Asia (Singapore)** or **Central India (Pune)** for lowest network latency to Sri Lanka (~30–45ms RTT).
- [ ] **Sri Lanka Data Residency & PDPA Compliance:**
  - Verify compliance with Sri Lanka Personal Data Protection Act No. 9 of 2022 regarding overseas processing of personal data (cross-border data transfer safeguards).
- [ ] **Azure Budget & Cost Controls:**
  - Establish monthly cost alerts and spending caps in Azure Cost Management.
- [ ] **Automated Backup & Geo-Replication:**
  - Enable Point-In-Time Restore (PITR) with minimum 14-day retention.
  - Test a dry-run database restore to verify recovery time objectives (RTO < 2 hours).
- [ ] **Diagnostic Logging:**
  - Forward PostgreSQL logs (`PostgreSQLLogs`) and metrics to Azure Log Analytics workspace (`law-studentcare-prod`).
  - Configure alerts for high CPU (>80%), storage usage (>85%), and active connection exhaustion (>80%).
