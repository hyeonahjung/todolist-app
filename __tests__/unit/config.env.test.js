'use strict';

// dotenv를 모킹하여 .env 파일 재로드를 차단
jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('env.js — 환경변수 유효성 검사', () => {
  const REQUIRED = ['POSTGRES_CONNECTION_STRING', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

  const FULL_ENV = {
    POSTGRES_CONNECTION_STRING: 'postgresql://test@localhost/test',
    JWT_ACCESS_SECRET: 'test_access_secret',
    JWT_REFRESH_SECRET: 'test_refresh_secret',
    JWT_ACCESS_EXPIRES_IN: '1h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    BCRYPT_SALT_ROUNDS: '10',
    PORT: '3000',
    NODE_ENV: 'test',
  };

  beforeEach(() => {
    Object.assign(process.env, FULL_ENV);
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
  });

  afterEach(() => {
    Object.keys(FULL_ENV).forEach((k) => delete process.env[k]);
  });

  test('필수 변수가 모두 있으면 정상 로드된다', () => {
    const env = require('../../backend/config/env');
    expect(env.POSTGRES_CONNECTION_STRING).toBe('postgresql://test@localhost/test');
    expect(env.JWT_ACCESS_SECRET).toBe('test_access_secret');
    expect(env.JWT_REFRESH_SECRET).toBe('test_refresh_secret');
  });

  test('PORT 기본값은 3000이다', () => {
    delete process.env.PORT;
    const env = require('../../backend/config/env');
    expect(env.PORT).toBe(3000);
  });

  test('NODE_ENV 기본값은 development이다', () => {
    delete process.env.NODE_ENV;
    const env = require('../../backend/config/env');
    expect(env.NODE_ENV).toBe('development');
  });

  test('JWT_ACCESS_EXPIRES_IN 기본값은 1h이다', () => {
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    const env = require('../../backend/config/env');
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe('1h');
  });

  test('JWT_REFRESH_EXPIRES_IN 기본값은 7d이다', () => {
    delete process.env.JWT_REFRESH_EXPIRES_IN;
    const env = require('../../backend/config/env');
    expect(env.JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  test('BCRYPT_SALT_ROUNDS 기본값은 10이다 (숫자형)', () => {
    delete process.env.BCRYPT_SALT_ROUNDS;
    const env = require('../../backend/config/env');
    expect(env.BCRYPT_SALT_ROUNDS).toBe(10);
  });

  test.each(REQUIRED)('필수 변수 %s 누락 시 process.exit(1)을 호출한다', (key) => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    delete process.env[key];

    expect(() => require('../../backend/config/env')).toThrow('process.exit called');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    jest.spyOn(console, 'error').mockRestore();
  });

  test('필수 변수 누락 시 에러 메시지에 변수명이 포함된다', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    delete process.env.JWT_ACCESS_SECRET;

    try { require('../../backend/config/env'); } catch {}

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('JWT_ACCESS_SECRET')
    );

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('export 객체에 모든 필드가 포함된다', () => {
    const env = require('../../backend/config/env');
    expect(env).toHaveProperty('NODE_ENV');
    expect(env).toHaveProperty('PORT');
    expect(env).toHaveProperty('POSTGRES_CONNECTION_STRING');
    expect(env).toHaveProperty('JWT_ACCESS_SECRET');
    expect(env).toHaveProperty('JWT_ACCESS_EXPIRES_IN');
    expect(env).toHaveProperty('JWT_REFRESH_SECRET');
    expect(env).toHaveProperty('JWT_REFRESH_EXPIRES_IN');
    expect(env).toHaveProperty('BCRYPT_SALT_ROUNDS');
  });
});
