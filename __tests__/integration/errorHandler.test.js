'use strict';

const request = require('supertest');
const express = require('express');
const AppError = require('../../backend/errors/AppError');

// 에러 핸들러만 독립적으로 테스트하기 위해 미니 앱 구성
function buildTestApp({ nodeEnv } = {}) {
  const app = express();
  app.use(express.json());

  if (nodeEnv) process.env.NODE_ENV = nodeEnv;

  // 테스트용 라우트
  app.get('/throw-app-error', (_req, _res, next) => {
    next(new AppError(422, 'VALIDATION_ERROR', '유효성 검사 실패'));
  });
  app.get('/throw-native-error', (_req, _res, next) => {
    next(new Error('예상치 못한 에러'));
  });

  // 실제 앱과 동일한 에러 핸들러 로직
  app.use((_req, _res, next) => {
    next(new AppError(404, 'NOT_FOUND', '요청한 경로를 찾을 수 없습니다.'));
  });
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.',
        ...(isProd ? {} : { stack: err.stack }),
      },
    });
  });

  return app;
}

describe('전역 에러 핸들러', () => {
  let originalNodeEnv;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('AppError → { success:false, error:{code,message} } 형태로 응답한다', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/throw-app-error');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('유효성 검사 실패');
  });

  test('AppError 응답에 stack 필드가 없다', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/throw-app-error');
    expect(res.body.error.stack).toBeUndefined();
  });

  test('일반 Error → 500 + INTERNAL_ERROR 코드로 응답한다', async () => {
    const app = buildTestApp({ nodeEnv: 'development' });
    const res = await request(app).get('/throw-native-error');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  test('NODE_ENV=development 일 때 stack 필드가 포함된다', async () => {
    const app = buildTestApp({ nodeEnv: 'development' });
    const res = await request(app).get('/throw-native-error');
    expect(res.body.error.stack).toBeDefined();
  });

  test('NODE_ENV=production 일 때 stack 필드가 없다', async () => {
    const app = buildTestApp({ nodeEnv: 'production' });
    const res = await request(app).get('/throw-native-error');
    expect(res.body.error.stack).toBeUndefined();
  });

  test('존재하지 않는 라우트 → 404 + NOT_FOUND 응답', async () => {
    const app = buildTestApp();
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('실제 app 모듈의 404 처리가 동일하게 동작한다', async () => {
    const app = require('../../backend/app');
    const res = await request(app).get('/not-exists');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
