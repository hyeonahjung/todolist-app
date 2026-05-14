'use strict';

jest.mock('../../backend/repositories/todo.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  toggleCompletion: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock('../../backend/repositories/category.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock('../../backend/errors/AppError', () => {
  class AppError extends Error {
    constructor(statusCode, code, message) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }
  return AppError;
});

const todoService = require('../../backend/services/todo.service');
const todoRepository = require('../../backend/repositories/todo.repository');
const categoryRepository = require('../../backend/repositories/category.repository');

const userId = '1';
const otherUserId = '2';

const defaultCategory = { category_id: '1', name: '일반', is_default: true, user_id: null };
const userCategory = { category_id: '10', name: '내카테고리', is_default: false, user_id: userId };
const otherCategory = { category_id: '20', name: '타인카테고리', is_default: false, user_id: otherUserId };

const mockTodo = {
  todo_id: '100',
  user_id: userId,
  category_id: '1',
  title: '테스트할일',
  description: null,
  due_date: null,
  is_completed: false,
  created_at: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('todoService.createTodo — BR-02, BR-03', () => {
  test('기본 카테고리로 할일 생성 → DTO 반환', async () => {
    categoryRepository.findById.mockResolvedValue(defaultCategory);
    todoRepository.create.mockResolvedValue(mockTodo);
    const result = await todoService.createTodo(userId, { title: '테스트할일', categoryId: 1 });
    expect(result.title).toBe('테스트할일');
    expect(result.todoId).toBe('100');
  });

  test('본인 소유 카테고리로 할일 생성 → 성공', async () => {
    categoryRepository.findById.mockResolvedValue(userCategory);
    todoRepository.create.mockResolvedValue(mockTodo);
    await expect(todoService.createTodo(userId, { title: '할일', categoryId: 10 })).resolves.toBeDefined();
  });

  test('타인 소유 카테고리 → 403 FORBIDDEN', async () => {
    categoryRepository.findById.mockResolvedValue(otherCategory);
    await expect(todoService.createTodo(userId, { title: '할일', categoryId: 20 })).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
    expect(todoRepository.create).not.toHaveBeenCalled();
  });

  test('존재하지 않는 카테고리 → 404', async () => {
    categoryRepository.findById.mockResolvedValue(null);
    await expect(todoService.createTodo(userId, { title: '할일', categoryId: 999 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('todoService.getTodos', () => {
  test('userId로 할일 목록 조회 → DTO 배열 반환', async () => {
    todoRepository.findAll.mockResolvedValue([mockTodo]);
    const result = await todoService.getTodos(userId, {});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('테스트할일');
    expect(todoRepository.findAll).toHaveBeenCalledWith(userId, {});
  });
});

describe('todoService.getTodoById — BR-02 소유권 검증', () => {
  test('본인 소유 할일 → DTO 반환', async () => {
    todoRepository.findById.mockResolvedValue(mockTodo);
    const result = await todoService.getTodoById(userId, 100);
    expect(result.todoId).toBe('100');
  });

  test('타인 소유 할일 → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...mockTodo, user_id: otherUserId });
    await expect(todoService.getTodoById(userId, 100)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  test('존재하지 않는 할일 → 404 NOT_FOUND', async () => {
    todoRepository.findById.mockResolvedValue(null);
    await expect(todoService.getTodoById(userId, 999)).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});

describe('todoService.updateTodo — BR-02 소유권 검증', () => {
  test('본인 소유 할일 수정 → 업데이트된 DTO 반환', async () => {
    todoRepository.findById.mockResolvedValue(mockTodo);
    todoRepository.updateById.mockResolvedValue({ ...mockTodo, title: '수정됨' });
    const result = await todoService.updateTodo(userId, 100, { title: '수정됨' });
    expect(result.title).toBe('수정됨');
  });

  test('타인 소유 할일 수정 → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...mockTodo, user_id: otherUserId });
    await expect(todoService.updateTodo(userId, 100, { title: '수정' })).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(todoRepository.updateById).not.toHaveBeenCalled();
  });

  test('카테고리 변경 시 타인 카테고리 → 403', async () => {
    todoRepository.findById.mockResolvedValue(mockTodo);
    categoryRepository.findById.mockResolvedValue(otherCategory);
    await expect(todoService.updateTodo(userId, 100, { categoryId: 20 })).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe('todoService.deleteTodo — BR-02 소유권 검증', () => {
  test('본인 소유 할일 삭제 → deleteById 호출', async () => {
    todoRepository.findById.mockResolvedValue(mockTodo);
    todoRepository.deleteById.mockResolvedValue();
    await todoService.deleteTodo(userId, 100);
    expect(todoRepository.deleteById).toHaveBeenCalledWith(100);
  });

  test('타인 소유 할일 삭제 → 403 FORBIDDEN', async () => {
    todoRepository.findById.mockResolvedValue({ ...mockTodo, user_id: otherUserId });
    await expect(todoService.deleteTodo(userId, 100)).rejects.toMatchObject({ statusCode: 403 });
    expect(todoRepository.deleteById).not.toHaveBeenCalled();
  });
});

describe('todoService.toggleCompletion — BR-02 소유권 검증', () => {
  test('본인 소유 할일 완료 토글 → is_completed 반전', async () => {
    todoRepository.findById.mockResolvedValue(mockTodo);
    todoRepository.toggleCompletion.mockResolvedValue({ ...mockTodo, is_completed: true });
    const result = await todoService.toggleCompletion(userId, 100);
    expect(result.isCompleted).toBe(true);
  });

  test('타인 소유 할일 토글 → 403', async () => {
    todoRepository.findById.mockResolvedValue({ ...mockTodo, user_id: otherUserId });
    await expect(todoService.toggleCompletion(userId, 100)).rejects.toMatchObject({ statusCode: 403 });
  });
});
