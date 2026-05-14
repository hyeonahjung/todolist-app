'use strict';

describe('db.js — pg Pool 연결', () => {
  let pool;

  beforeAll(() => {
    jest.resetModules();
    pool = require('../../backend/config/db');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('pool이 module.exports로 export된다', () => {
    expect(pool).toBeDefined();
    expect(typeof pool.query).toBe('function');
  });

  test('SELECT NOW() 쿼리가 성공한다', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeInstanceOf(Date);
  });

  test('pool에 max, idleTimeoutMillis, connectionTimeoutMillis 설정이 있다', () => {
    expect(pool.options.max).toBe(10);
    expect(pool.options.idleTimeoutMillis).toBe(30000);
    expect(pool.options.connectionTimeoutMillis).toBe(5000);
  });

  test('require 캐싱으로 동일 인스턴스를 반환한다 (싱글턴)', () => {
    // resetModules 없이 재 require → 동일 인스턴스
    const pool2 = require('../../backend/config/db');
    expect(pool2).toBe(pool);
  });
});
