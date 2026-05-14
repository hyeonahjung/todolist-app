'use strict';

const request = require('supertest');
const app = require('../../backend/app');
const pool = require('../../backend/config/db');

// 테스트용 고유 이메일 생성
const testEmail = `auth_test_${Date.now()}@example.com`;
const testPassword = 'TestPass1';
const testName = '테스트유저';

let accessToken;
let refreshToken;

afterAll(async () => {
  // 테스트 데이터 정리
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['auth_test_%@example.com']);
  await pool.end();
});

describe('POST /api/auth/register', () => {
  test('UC-01 — 정상 회원가입 → 201 + userId/email/name 반환', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: testPassword,
      name: testName,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe(testName);
  });

  test('중복 이메일 → 409 DUPLICATE_EMAIL', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: testPassword,
      name: testName,
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  test('이메일 형식 오류 → 400 VALIDATION_ERROR + details', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: testPassword,
      name: testName,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
  });

  test('비밀번호 8자 미만 → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@test.com',
      password: 'abc1',
      name: testName,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('비밀번호 영문+숫자 미포함 → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'noalpha@test.com',
      password: '12345678',
      name: testName,
    });
    expect(res.status).toBe(400);
  });

  test('이름 누락 → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'noname@test.com',
      password: testPassword,
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('UC-02 — 정상 로그인 → 200 + accessToken/refreshToken/user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(testEmail);

    // 다음 테스트를 위해 토큰 저장
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  test('잘못된 비밀번호 → 401 UNAUTHORIZED', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPass9',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('존재하지 않는 이메일 → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@noexist.com',
      password: testPassword,
    });
    expect(res.status).toBe(401);
  });

  test('이메일 누락 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: testPassword });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  test('UC-03 — 인증 후 로그아웃 → 200 + data:null', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  test('토큰 없이 로그아웃 → 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  test('유효한 Refresh Token → 200 + 새 accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  test('Refresh Token 없음 → 401', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  test('만료된 Refresh Token → 401', async () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ userId: 1 }, process.env.JWT_REFRESH_SECRET, { expiresIn: '0s' });
    await new Promise((r) => setTimeout(r, 10));
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});

describe('회원가입 → 로그인 → 보호 API 전체 흐름', () => {
  test('register → login → /health 접근 정상', async () => {
    const email = `flow_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Flow1234', name: '흐름테스트' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'Flow1234' });
    expect(loginRes.status).toBe(200);

    const token = loginRes.body.data.accessToken;
    const healthRes = await request(app).get('/health');
    expect(healthRes.status).toBe(200);

    // cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });
});
