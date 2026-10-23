import { describe, it, expect } from 'vitest';
import { validateEnv } from '../config/env';

describe('Environment Variable Validation', () => {
  it('should apply valid defaults for local development', () => {
    const config = validateEnv({});

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(4000);
    expect(config.DEFAULT_TIMEZONE).toBe('Asia/Colombo');
    expect(config.ALLOWED_ORIGINS).toContain('http://localhost:3000');
  });

  it('should accept custom valid configurations', () => {
    const config = validateEnv({
      NODE_ENV: 'test',
      PORT: '5050',
      DEFAULT_TIMEZONE: 'Asia/Colombo',
      ALLOWED_ORIGINS: 'http://example.com,https://school.studentcare.lk',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(5050);
    expect(config.ALLOWED_ORIGINS).toEqual(['http://example.com', 'https://school.studentcare.lk']);
  });

  it('should reject invalid NODE_ENV values', () => {
    expect(() => {
      validateEnv({
        NODE_ENV: 'invalid-environment-value',
      });
    }).toThrow(/Environment configuration validation error/);
  });
});
