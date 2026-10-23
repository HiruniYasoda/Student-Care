import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root or current working dir if available
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  DEFAULT_TIMEZONE: z.string().default('Asia/Colombo'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Central Control Database
  CONTROL_DB_HOST: z.string().default('localhost'),
  CONTROL_DB_PORT: z.coerce.number().int().positive().default(5432),
  CONTROL_DB_NAME: z.string().default('student_care_control'),
  CONTROL_DB_USER: z.string().default('postgres'),
  CONTROL_DB_PASSWORD: z.string().default(''),
  CONTROL_DB_SSL: z.coerce.boolean().default(false),
  CONTROL_DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  CONTROL_DATABASE_URL: z.string().optional(),

  // Tenant School Database Defaults
  SCHOOL_DB_HOST_DEFAULT: z.string().default('localhost'),
  SCHOOL_DB_PORT_DEFAULT: z.coerce.number().int().positive().default(5432),
  SCHOOL_DB_USER_DEFAULT: z.string().default('postgres'),
  SCHOOL_DB_PASSWORD_DEFAULT: z.string().default(''),
  SCHOOL_DB_SSL_DEFAULT: z.coerce.boolean().default(false),
  SCHOOL_DB_POOL_MAX_PER_TENANT: z.coerce.number().int().positive().default(5),
  SCHOOL_DB_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // Allowed CORS Origins
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:8081')
    .transform((val) => val.split(',').map((origin) => origin.trim())),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(customEnv?: Record<string, unknown>): EnvConfig {
  const source = customEnv ?? process.env;
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const errorIssues = result.error.issues
      .map((i) => `[${i.path.join('.')}] ${i.message}`)
      .join(', ');
    throw new Error(`Environment configuration validation error: ${errorIssues}`);
  }

  return result.data;
}

export const env = validateEnv();
