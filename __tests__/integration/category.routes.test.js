'use strict';

const request = require('supertest');
const app = require('../../backend/app');
const pool = require('../../backend/config/db');

const testEmail = `cat_routes_${Date.now()}@example.com`;
const testPassword = 'TestPass1';

let accessToken;
let userId;
let createdCategoryId;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ email: testEmail, password: testPassword, name: '카테고리테스터' });
  const loginRes = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
  accessToken = loginRes.body.data.accessToken;
  userId = loginRes.body.data.user.userId;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['cat_routes_%@example.com']);
  await pool.end();
});

describe('GET /api/categories', () => {
  test('인증 후 → 200 + 기본 카테고리 포함 배열 반환', async () => {
    const res = await request(app).get('/api/categories').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const names = res.body.data.map((c) => c.name);
    expect(names).toContain('일반');
    expect(names).toContain('업무');
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/categories', () => {
  test('유효한 이름 → 201 + 생성된 카테고리', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '테스트카테고리' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('테스트카테고리');
    expect(res.body.data.isDefault).toBe(false);
    createdCategoryId = res.body.data.categoryId;
  });

  test('중복 이름 → 409 DUPLICATE_CATEGORY', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '테스트카테고리' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_CATEGORY');
  });

  test('빈 이름 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('30자 초과 이름 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'a'.repeat(31) });
    expect(res.status).toBe(400);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).post('/api/categories').send({ name: '테스트' });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/categories/:categoryId', () => {
  test('본인 카테고리 수정 → 200 + 수정된 이름', async () => {
    const res = await request(app)
      .patch(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '수정된카테고리' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('수정된카테고리');
  });

  test('기본 카테고리 수정 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .patch('/api/categories/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '수정시도' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).patch(`/api/categories/${createdCategoryId}`).send({ name: '수정' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/categories/:categoryId', () => {
  test('기본 카테고리 삭제 → 403 FORBIDDEN', async () => {
    const res = await request(app)
      .delete('/api/categories/1')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('카테고리 삭제 + 할일 이동 흐름', async () => {
    // 새 카테고리 생성
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '삭제용카테고리' });
    const catId = catRes.body.data.categoryId;

    // 해당 카테고리에 할일 직접 삽입
    await pool.query(
      `INSERT INTO todos (user_id, category_id, title) VALUES ($1, $2, $3)`,
      [userId, catId, '삭제카테고리할일']
    );

    // 카테고리 삭제
    const delRes = await request(app)
      .delete(`/api/categories/${catId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(delRes.status).toBe(204);

    // 할일의 category_id가 1(일반)으로 변경되었는지 DB 직접 확인
    const { rows } = await pool.query(
      `SELECT category_id FROM todos WHERE user_id = $1 AND title = $2`,
      [userId, '삭제카테고리할일']
    );
    expect(rows[0].category_id.toString()).toBe('1');
  });

  test('본인 카테고리 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(204);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).delete('/api/categories/1');
    expect(res.status).toBe(401);
  });
});
