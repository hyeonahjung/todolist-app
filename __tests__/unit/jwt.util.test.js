'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

beforeAll(() => {
  process.env.POSTGRES_CONNECTION_STRING = 'postgresql://test@localhost/test';
  process.env.JWT_ACCESS_SECRET = 'access_secret_test';
  process.env.JWT_ACCESS_EXPIRES_IN = '1h';
  process.env.JWT_REFRESH_SECRET = 'refresh_secret_test';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  jest.resetModules();
  jest.mock('dotenv', () => ({ config: jest.fn() }));
});

describe('jwt.util', () => {
  let jwtUtil, AppError;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    jwtUtil = require('../../backend/utils/jwt.util');
    AppError = require('../../backend/errors/AppError');
  });

  test('signAccessToken이 JWT 문자열을 반환한다', () => {
    const token = jwtUtil.signAccessToken({ userId: 1, email: 'a@b.com' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('signRefreshToken이 JWT 문자열을 반환한다', () => {
    const token = jwtUtil.signRefreshToken({ userId: 1 });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('verifyToken — 유효한 Access Token에서 payload를 반환한다', () => {
    const payload = { userId: 42, email: 'x@y.com' };
    const token = jwtUtil.signAccessToken(payload);
    const decoded = jwtUtil.verifyToken(token, process.env.JWT_ACCESS_SECRET);
    expect(decoded.userId).toBe(42);
    expect(decoded.email).toBe('x@y.com');
  });

  test('verifyToken — 잘못된 시크릿에서 INVALID_TOKEN AppError를 throw한다', () => {
    const token = jwtUtil.signAccessToken({ userId: 1 });
    expect(() => jwtUtil.verifyToken(token, 'wrong_secret')).toThrow(AppError);
    expect(() => jwtUtil.verifyToken(token, 'wrong_secret')).toThrow('유효하지 않은 토큰');
  });

  test('verifyToken — 잘못된 시크릿 시 code가 INVALID_TOKEN이다', () => {
    const token = jwtUtil.signAccessToken({ userId: 1 });
    try {
      jwtUtil.verifyToken(token, 'wrong');
    } catch (err) {
      expect(err.code).toBe('INVALID_TOKEN');
      expect(err.statusCode).toBe(401);
    }
  });

  test('verifyToken — 만료 토큰에서 TOKEN_EXPIRED AppError를 throw한다', () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign({ userId: 1 }, process.env.JWT_ACCESS_SECRET, { expiresIn: '0s' });
    // 1ms 대기 후 만료 확인
    return new Promise((resolve) => setTimeout(resolve, 10)).then(() => {
      try {
        jwtUtil.verifyToken(expiredToken, process.env.JWT_ACCESS_SECRET);
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.code).toBe('TOKEN_EXPIRED');
        expect(err.statusCode).toBe(401);
      }
    });
  });

  test('verifyToken — 완전히 잘못된 문자열에서 INVALID_TOKEN을 throw한다', () => {
    expect(() => jwtUtil.verifyToken('not.a.token', process.env.JWT_ACCESS_SECRET)).toThrow(AppError);
  });
});
