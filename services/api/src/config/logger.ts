import { env } from './env';

const SENSITIVE_KEYS = new RegExp(
  'password|secret|token|key|authorization|bearer|cookie|control_db_password|school_db_password',
  'i'
);

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Redact connection strings with embedded passwords (postgres://user:pass@host)
    return data.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1***$3');
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.test(key)) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitize(value);
      }
    }
    return sanitizedObj;
  }
  return data;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  const currentThreshold = LEVELS[env.LOG_LEVEL as LogLevel] ?? 1;
  return LEVELS[level] >= currentThreshold;
}

export const logger = {
  debug(message: string, context?: unknown) {
    if (shouldLog('debug')) {
      console.debug(
        `[DEBUG] [${new Date().toISOString()}] ${message}`,
        context ? sanitize(context) : ''
      );
    }
  },
  info(message: string, context?: unknown) {
    if (shouldLog('info')) {
      console.info(
        `[INFO]  [${new Date().toISOString()}] ${message}`,
        context ? sanitize(context) : ''
      );
    }
  },
  warn(message: string, context?: unknown) {
    if (shouldLog('warn')) {
      console.warn(
        `[WARN]  [${new Date().toISOString()}] ${message}`,
        context ? sanitize(context) : ''
      );
    }
  },
  error(message: string, error?: unknown) {
    if (shouldLog('error')) {
      console.error(
        `[ERROR] [${new Date().toISOString()}] ${message}`,
        error ? sanitize(error) : ''
      );
    }
  },
};
