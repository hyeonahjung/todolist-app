'use strict';

jest.mock('dotenv', () => ({ config: jest.fn() }));

beforeAll(() => {
  process.env.POSTGRES_CONNECTION_STRING = 'postgresql://test@localhost/test';
  process.env.JWT_ACCESS_SECRET = 'access_secret_test';
  process.env.JWT_REFRESH_SECRET = 'refresh_secret_test';
  process.env.BCRYPT_SALT_ROUNDS = '10';
});

describe('hash.util', () => {
  let hashUtil;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    hashUtil = require('../../backend/utils/hash.util');
  });

  test('hashPassword — 평문과 다른 해시를 반환한다', async () => {
    const hash = await hashUtil.hashPassword('MyPass123');
    expect(hash).not.toBe('MyPass123');
    expect(typeof hash).toBe('string');
  });

  test('hashPassword — bcrypt 해시 형식($2b$)을 반환한다', async () => {
    const hash = await hashUtil.hashPassword('MyPass123');
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  test('comparePassword — 일치 시 true를 반환한다', async () => {
    const hash = await hashUtil.hashPassword('Correct1');
    const result = await hashUtil.comparePassword('Correct1', hash);
    expect(result).toBe(true);
  });

  test('comparePassword — 불일치 시 false를 반환한다', async () => {
    const hash = await hashUtil.hashPassword('Correct1');
    const result = await hashUtil.comparePassword('Wrong999', hash);
    expect(result).toBe(false);
  });

  test('동일 평문을 두 번 해시하면 서로 다른 값이 나온다 (salt 적용)', async () => {
    const h1 = await hashUtil.hashPassword('SamePass1');
    const h2 = await hashUtil.hashPassword('SamePass1');
    expect(h1).not.toBe(h2);
  });
});
