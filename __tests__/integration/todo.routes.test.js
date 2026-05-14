'use strict';

const request = require('supertest');
const app = require('../../backend/app');
const pool = require('../../backend/config/db');

const ts = Date.now();
const user1Email = `todo_u1_${ts}@example.com`;
const user2Email = `todo_u2_${ts}@example.com`;
const password = 'TestPass1';

let token1;
let token2;
let userId1;
let createdTodoId;

const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

beforeAll(async () => {
  // user1 등록 + 로그인
  await request(app).post('/api/auth/register').send({ email: user1Email, password, name: '유저1' });
  const r1 = await request(app).post('/api/auth/login').send({ email: user1Email, password });
  token1 = r1.body.data.accessToken;
  userId1 = r1.body.data.user.userId;

  // user2 등록 + 로그인
  await request(app).post('/api/auth/register').send({ email: user2Email, password, name: '유저2' });
  const r2 = await request(app).post('/api/auth/login').send({ email: user2Email, password });
  token2 = r2.body.data.accessToken;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`todo_u%_${ts}@example.com`]);
  await pool.end();
});

describe('POST /api/todos', () => {
  test('UC-08 — 제목 + 카테고리ID → 201 + 생성된 할일', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '첫번째할일', categoryId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('첫번째할일');
    expect(res.body.data.isCompleted).toBe(false);
    createdTodoId = res.body.data.todoId;
  });

  test('종료예정일 포함 생성 → 201', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '날짜있는할일', categoryId: 1, dueDate: tomorrow });
    expect(res.status).toBe(201);
    expect(res.body.data.dueDate).toBeTruthy();
  });

  test('제목 누락 → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('제목 100자 초과 → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: 'a'.repeat(101), categoryId: 1 });
    expect(res.status).toBe(400);
  });

  test('설명 1000자 초과 → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '할일', categoryId: 1, description: 'a'.repeat(1001) });
    expect(res.status).toBe(400);
  });

  test('과거 날짜 → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '할일', categoryId: 1, dueDate: '2020-01-01' });
    expect(res.status).toBe(400);
  });

  test('타인 소유 카테고리 → 403', async () => {
    // user2의 카테고리 생성
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: `타인카테고리_${ts}` });
    const otherCatId = catRes.body.data.categoryId;

    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '할일', categoryId: otherCatId });
    expect(res.status).toBe(403);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).post('/api/todos').send({ title: '할일', categoryId: 1 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/todos', () => {
  test('UC-12 — 등록일시 내림차순 전체 목록 → 200', async () => {
    const res = await request(app).get('/api/todos').set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('categoryId 필터 → 해당 카테고리 할일만 반환', async () => {
    const res = await request(app)
      .get('/api/todos?categoryId=1')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.categoryId.toString()).toBe('1'));
  });

  test('isCompleted=false 필터 → 미완료만 반환', async () => {
    const res = await request(app)
      .get('/api/todos?isCompleted=false')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((t) => expect(t.isCompleted).toBe(false));
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/todos/:todoId', () => {
  test('UC-13 — 본인 소유 상세 조회 → 200 + 전체 정보', async () => {
    const res = await request(app)
      .get(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.todoId).toBe(createdTodoId);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('isCompleted');
    expect(res.body.data).toHaveProperty('createdAt');
  });

  test('타인 토큰으로 접근 → 403', async () => {
    const res = await request(app)
      .get(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });

  test('존재하지 않는 ID → 404 NOT_FOUND', async () => {
    const res = await request(app)
      .get('/api/todos/9999999')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/todos/:todoId', () => {
  test('UC-09 — 제목 수정 → 200 + 수정된 할일', async () => {
    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '수정된할일' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('수정된할일');
  });

  test('타인 토큰으로 수정 → 403', async () => {
    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: '수정시도' });
    expect(res.status).toBe(403);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).patch(`/api/todos/${createdTodoId}`).send({ title: '수정' });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/todos/:todoId/completion', () => {
  test('UC-11 — 완료 토글 → 200 + isCompleted 변경', async () => {
    const before = await request(app)
      .get(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token1}`);
    const beforeState = before.body.data.isCompleted;

    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}/completion`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isCompleted).toBe(!beforeState);
  });

  test('타인 토큰으로 토글 → 403', async () => {
    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}/completion`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/todos/:todoId', () => {
  test('UC-10 — 본인 소유 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(204);
  });

  test('삭제된 할일 조회 → 404 NOT_FOUND', async () => {
    const res = await request(app)
      .get(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('타인 토큰으로 삭제 → 403', async () => {
    // 새 할일 생성 후 타인으로 삭제 시도
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '삭제테스트할일', categoryId: 1 });
    const newTodoId = createRes.body.data.todoId;

    const res = await request(app)
      .delete(`/api/todos/${newTodoId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });

  test('인증 없이 → 401', async () => {
    const res = await request(app).delete(`/api/todos/${createdTodoId}`);
    expect(res.status).toBe(401);
  });
});
