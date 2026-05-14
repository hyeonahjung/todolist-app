'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

beforeAll(() => {
  process.env.POSTGRES_CONNECTION_STRING = 'postgresql://test@localhost/test';
  process.env.JWT_ACCESS_SECRET = 'access_secret_test';
  process.env.JWT_ACCESS_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_SECRET = 'refresh_secret_test';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.BCRYPT_SALT_ROUNDS = '10';
});

const Joi = require('joi');
const request = require('supertest');
const express = require('express');

function buildAuthApp() {
  jest.resetModules();
  jest.mock('dotenv', () => ({ config: jest.fn() }));
  const authenticate = require('../../backend/middlewares/authenticate.middleware');
  const AppError = require('../../backend/errors/AppError');

  const app = express();
  app.use(express.json());
  app.get('/protected', authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
  });
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  });
  return app;
}

function buildValidateApp(schema) {
  jest.resetModules();
  jest.mock('dotenv', () => ({ config: jest.fn() }));
  const validate = require('../../backend/middlewares/validate.middleware');
  const AppError = require('../../backend/errors/AppError');

  const app = express();
  app.use(express.json());
  app.post('/test', validate(schema), (req, res) => {
    res.json({ success: true, data: req.body });
  });
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) {
      const body = { success: false, error: { code: err.code, message: err.message } };
      if (err.details) body.error.details = err.details;
      return res.status(err.statusCode).json(body);
    }
    return res.status(500).json({ success: false });
  });
  return app;
}

describe('authenticate 미들웨어', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    app = buildAuthApp();
  });

  test('Authorization 헤더 없을 때 401 UNAUTHORIZED 반환', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Bearer 접두사 없을 때 401 반환', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Token abc');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('유효한 토큰 → req.user 설정 + next 호출', async () => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    const { signAccessToken } = require('../../backend/utils/jwt.util');
    const token = signAccessToken({ userId: 7, email: 'test@test.com' });
    app = buildAuthApp();
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(7);
    expect(res.body.data.email).toBe('test@test.com');
  });

  test('만료 토큰 → 401 TOKEN_EXPIRED 반환', async () => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign({ userId: 1 }, 'access_secret_test', { expiresIn: '0s' });
    app = buildAuthApp();
    await new Promise((r) => setTimeout(r, 10));
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  test('잘못된 토큰 문자열 → 401 INVALID_TOKEN 반환', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('validate 미들웨어', () => {
  const schema = {
    body: Joi.object({
      name: Joi.string().min(1).max(50).required(),
      age: Joi.number().integer().min(0).optional(),
    }),
  };

  test('유효한 body → 통과 (200)', async () => {
    const app = buildValidateApp(schema);
    const res = await request(app).post('/test').send({ name: '홍길동', age: 30 });
    expect(res.status).toBe(200);
  });

  test('필수 필드 누락 → 400 VALIDATION_ERROR', async () => {
    const app = buildValidateApp(schema);
    const res = await request(app).post('/test').send({ age: 30 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('유효성 오류 시 details 배열에 필드명과 메시지 포함', async () => {
    const app = buildValidateApp(schema);
    const res = await request(app).post('/test').send({});
    expect(res.body.error.details).toBeInstanceOf(Array);
    expect(res.body.error.details.length).toBeGreaterThan(0);
    expect(res.body.error.details[0]).toHaveProperty('field');
    expect(res.body.error.details[0]).toHaveProperty('message');
  });

  test('params 스키마 검사', async () => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    const validate = require('../../backend/middlewares/validate.middleware');
    const AppError = require('../../backend/errors/AppError');
    const appWithParams = express();
    appWithParams.use(express.json());
    appWithParams.get('/:id',
      validate({ params: Joi.object({ id: Joi.number().integer().required() }) }),
      (req, res) => res.json({ success: true })
    );
    // eslint-disable-next-line no-unused-vars
    appWithParams.use((err, _req, res, _next) => {
      if (err instanceof AppError) return res.status(err.statusCode).json({ success: false, error: { code: err.code } });
      return res.status(500).json({});
    });
    const res = await request(appWithParams).get('/abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
