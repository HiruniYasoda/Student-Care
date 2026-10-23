import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('API Foundation & Health Check', () => {
  it('GET /health should return 200 and healthy status payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toMatchObject({
      status: 'ok',
      service: 'student-care-api',
      timezone: 'Asia/Colombo',
    });
    expect(response.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /unknown-endpoint should return 404 with standardized error payload', async () => {
    const response = await request(app).get('/api/v1/non-existent-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatchObject({
      code: 'ROUTE_NOT_FOUND',
    });
    expect(response.body.error.message).toContain('non-existent-endpoint');
  });
});
