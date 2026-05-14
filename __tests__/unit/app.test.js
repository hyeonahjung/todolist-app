'use strict';

const request = require('supertest');
const app = require('../../backend/app');

describe('App 기본 동작', () => {
  test('GET /health → 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('존재하지 않는 경로 → 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
