'use strict';

const request = require('supertest');
const app = require('../../backend/app');
const pool = require('../../backend/config/db');

const testEmail = `user_routes_${Date.now()}@example.com`;
const testPassword = 'TestPass1';
const testName = '사용자테스트';

let accessToken;
let userId;

beforeAll(async () => {
  // 회원가입 + 로그인
  await request(app).post('/api/auth/register').send({ email: testEmail, password: testPassword, name: testName });
  const loginRes = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
  accessToken = loginRes.body.data.accessToken;
  userId = loginRes.body.data.user.userId;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['user_routes_%@example.com']);
  await pool.end();
});

describe('GET /api/users/me', () => {
  test('인증 후 → 200 + { userId, email, name }', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe(testName);
    expect(res.body.data).toHaveProperty('userId');
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  test('이름 수정 → 200 + 수정된 이름 반환', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '수정된이름' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('수정된이름');
  });

  test('비밀번호 변경 → 200', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: testPassword, newPassword: 'NewPass99' });
    expect(res.status).toBe(200);

    // 새 비밀번호로 로그인 확인
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass99' });
    expect(loginRes.status).toBe(200);
    accessToken = loginRes.body.data.accessToken;
  });

  test('현재 비밀번호 불일치 → 400', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongPass1', newPassword: 'AnotherPass1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  test('currentPassword만 전달(newPassword 없음) → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: testPassword });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).patch('/api/users/me').send({ name: '이름' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/me', () => {
  test('비밀번호 불일치 → 400', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: 'WrongPass1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  test('password 누락 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).delete('/api/users/me').send({ password: testPassword });
    expect(res.status).toBe(401);
  });

  test('올바른 비밀번호 → 204 + 계정 완전 삭제', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ password: 'NewPass99' });
    expect(res.status).toBe(204);

    // 탈퇴 후 로그인 시도 → 401
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass99' });
    expect(loginRes.status).toBe(401);
  });
});
