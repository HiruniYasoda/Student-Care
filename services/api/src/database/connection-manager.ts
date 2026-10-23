import { Pool, PoolConfig } from 'pg';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { SchoolDatabaseConfig, SchoolRegistryEntry } from '@student-care/shared-types';

/**
 * Safe Database Routing & Multi-Tenant Connection Manager.
 *
 * Implements architectural boundaries:
 * 1. Dedicated Central Control Database pool.
 * 2. Dedicated tenant database pool per school.
 * 3. Strict security: Database names and credentials are NEVER accepted from clients.
 *    They are resolved exclusively via the server-side control registry.
 */
export class DatabaseRoutingManager {
  private controlPool: Pool | null = null;
  private tenantPools: Map<string, Pool> = new Map();

  // Pattern for valid school identifier (e.g. 'sch_colombo_001')
  private static readonly SCHOOL_ID_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

  /**
   * Returns or initializes the Central Control Database connection pool.
   */
  public getControlPool(): Pool {
    if (!this.controlPool) {
      const config: PoolConfig = env.CONTROL_DATABASE_URL
        ? { connectionString: env.CONTROL_DATABASE_URL }
        : {
            host: env.CONTROL_DB_HOST,
            port: env.CONTROL_DB_PORT,
            database: env.CONTROL_DB_NAME,
            user: env.CONTROL_DB_USER,
            password: env.CONTROL_DB_PASSWORD,
            ssl: env.CONTROL_DB_SSL ? { rejectUnauthorized: false } : false,
            max: env.CONTROL_DB_POOL_MAX,
          };

      logger.info('Initializing Central Control Database connection pool', {
        database: env.CONTROL_DB_NAME,
        host: env.CONTROL_DB_HOST,
        port: env.CONTROL_DB_PORT,
      });

      this.controlPool = new Pool(config);
      this.controlPool.on('error', (err) => {
        logger.error('Unexpected error on idle Central Control Database client', err);
      });
    }

    return this.controlPool;
  }

  /**
   * Validates and returns a dedicated PostgreSQL connection pool for the specified school tenant.
   *
   * @param schoolId Verified school ID from authentication token or control registry
   * @param configOverride Optional server-resolved tenant database configuration
   */
  public async getSchoolPool(
    schoolId: string,
    configOverride?: Partial<SchoolDatabaseConfig>
  ): Promise<Pool> {
    if (!DatabaseRoutingManager.SCHOOL_ID_REGEX.test(schoolId)) {
      throw new Error(`Invalid school identifier format: '${schoolId}'`);
    }

    const existingPool = this.tenantPools.get(schoolId);
    if (existingPool) {
      return existingPool;
    }

    // Resolve tenant database configuration securely from server-side configuration/registry
    // Tenant database name is deterministically formatted by the server, never user input.
    const safeDbName =
      configOverride?.database ?? `sc_school_${schoolId.toLowerCase().replace(/-/g, '_')}`;

    const tenantConfig: PoolConfig = {
      host: configOverride?.host ?? env.SCHOOL_DB_HOST_DEFAULT,
      port: configOverride?.port ?? env.SCHOOL_DB_PORT_DEFAULT,
      database: safeDbName,
      user: configOverride?.user ?? env.SCHOOL_DB_USER_DEFAULT,
      password: configOverride?.password ?? env.SCHOOL_DB_PASSWORD_DEFAULT,
      ssl:
        (configOverride?.ssl ?? env.SCHOOL_DB_SSL_DEFAULT) ? { rejectUnauthorized: false } : false,
      max: configOverride?.poolMax ?? env.SCHOOL_DB_POOL_MAX_PER_TENANT,
      idleTimeoutMillis: configOverride?.idleTimeoutMillis ?? env.SCHOOL_DB_IDLE_TIMEOUT_MS,
    };

    logger.info(`Creating dedicated connection pool for school tenant '${schoolId}'`, {
      schoolId,
      database: safeDbName,
      host: tenantConfig.host,
    });

    const newPool = new Pool(tenantConfig);
    newPool.on('error', (err) => {
      logger.error(`Unexpected error on idle client for school tenant '${schoolId}'`, err);
    });

    this.tenantPools.set(schoolId, newPool);
    return newPool;
  }

  /**
   * Gracefully close all open connection pools (Control DB + all School tenant pools).
   */
  public async closeAll(): Promise<void> {
    logger.info('Shutting down all database connection pools...');

    if (this.controlPool) {
      await this.controlPool.end();
      this.controlPool = null;
    }

    const closePromises = Array.from(this.tenantPools.entries()).map(async ([schoolId, pool]) => {
      try {
        await pool.end();
      } catch (err) {
        logger.error(`Error closing pool for school tenant '${schoolId}'`, err);
      }
    });

    await Promise.all(closePromises);
    this.tenantPools.clear();
    logger.info('All database connection pools closed successfully.');
  }
}

export const dbManager = new DatabaseRoutingManager();
