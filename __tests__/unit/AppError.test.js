'use strict';

const AppError = require('../../backend/errors/AppError');

describe('AppError', () => {
  test('statusCode, code, message를 올바르게 저장한다', () => {
    const err = new AppError(400, 'VALIDATION_ERROR', '입력값이 올바르지 않습니다.');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('입력값이 올바르지 않습니다.');
  });

  test('Error를 상속한다', () => {
    const err = new AppError(404, 'NOT_FOUND', '없음');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  test('name이 AppError이다', () => {
    const err = new AppError(500, 'INTERNAL_ERROR', '서버 오류');
    expect(err.name).toBe('AppError');
  });

  test('stack trace가 존재한다', () => {
    const err = new AppError(401, 'UNAUTHORIZED', '인증 필요');
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('AppError');
  });

  test('instanceof 체크가 정상 동작한다', () => {
    const appErr = new AppError(403, 'FORBIDDEN', '금지');
    const nativeErr = new Error('일반 에러');
    expect(appErr instanceof AppError).toBe(true);
    expect(nativeErr instanceof AppError).toBe(false);
  });

  test('다양한 statusCode를 허용한다', () => {
    const codes = [400, 401, 403, 404, 409, 422, 500];
    codes.forEach((statusCode) => {
      const err = new AppError(statusCode, 'CODE', 'msg');
      expect(err.statusCode).toBe(statusCode);
    });
  });
});
