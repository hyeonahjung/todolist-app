'use strict';

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

const categoryService = require('../../backend/services/category.service');
const categoryRepository = require('../../backend/repositories/category.repository');

const defaultCategory = { category_id: '1', name: '일반', is_default: true, user_id: null };
const userCategory = { category_id: '10', name: '내카테고리', is_default: false, user_id: '5' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('categoryService.getCategories', () => {
  test('기본 + 사용자 카테고리 DTO 배열 반환', async () => {
    categoryRepository.findAll.mockResolvedValue([defaultCategory, userCategory]);
    const result = await categoryService.getCategories('5');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ categoryId: '1', name: '일반', isDefault: true });
    expect(result[1]).toEqual({ categoryId: '10', name: '내카테고리', isDefault: false });
  });
});

describe('categoryService.createCategory', () => {
  test('정상 생성 → DTO 반환', async () => {
    categoryRepository.create.mockResolvedValue(userCategory);
    const result = await categoryService.createCategory('5', { name: '내카테고리' });
    expect(result.name).toBe('내카테고리');
    expect(categoryRepository.create).toHaveBeenCalledWith({ name: '내카테고리', userId: '5' });
  });

  test('중복 이름(DB 23505) → 409 DUPLICATE_CATEGORY', async () => {
    const dbErr = new Error('duplicate');
    dbErr.code = '23505';
    categoryRepository.create.mockRejectedValue(dbErr);
    await expect(categoryService.createCategory('5', { name: '중복' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_CATEGORY',
    });
  });
});

describe('categoryService.updateCategory', () => {
  test('본인 카테고리 수정 → 업데이트된 DTO 반환', async () => {
    categoryRepository.findById.mockResolvedValue(userCategory);
    categoryRepository.updateById.mockResolvedValue({ ...userCategory, name: '수정됨' });
    const result = await categoryService.updateCategory('5', 10, { name: '수정됨' });
    expect(result.name).toBe('수정됨');
  });

  test('기본 카테고리 수정 → 403 FORBIDDEN', async () => {
    categoryRepository.findById.mockResolvedValue(defaultCategory);
    await expect(categoryService.updateCategory('5', 1, { name: '수정' })).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
  });

  test('타인 소유 카테고리 → 404 NOT_FOUND', async () => {
    categoryRepository.findById.mockResolvedValue({ ...userCategory, user_id: '99' });
    await expect(categoryService.updateCategory('5', 10, { name: '수정' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });

  test('존재하지 않는 카테고리 → 404', async () => {
    categoryRepository.findById.mockResolvedValue(null);
    await expect(categoryService.updateCategory('5', 999, { name: '수정' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('중복 이름 수정(DB 23505) → 409 DUPLICATE_CATEGORY', async () => {
    categoryRepository.findById.mockResolvedValue(userCategory);
    const dbErr = new Error('duplicate');
    dbErr.code = '23505';
    categoryRepository.updateById.mockRejectedValue(dbErr);
    await expect(categoryService.updateCategory('5', 10, { name: '중복' })).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_CATEGORY',
    });
  });
});

describe('categoryService.deleteCategory', () => {
  test('본인 카테고리 삭제 → deleteById 호출', async () => {
    categoryRepository.findById.mockResolvedValue(userCategory);
    categoryRepository.deleteById.mockResolvedValue();
    await categoryService.deleteCategory('5', 10);
    expect(categoryRepository.deleteById).toHaveBeenCalledWith(10);
  });

  test('기본 카테고리 삭제 → 403 FORBIDDEN', async () => {
    categoryRepository.findById.mockResolvedValue(defaultCategory);
    await expect(categoryService.deleteCategory('5', 1)).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN',
    });
    expect(categoryRepository.deleteById).not.toHaveBeenCalled();
  });

  test('타인 소유 카테고리 삭제 → 404 NOT_FOUND', async () => {
    categoryRepository.findById.mockResolvedValue({ ...userCategory, user_id: '99' });
    await expect(categoryService.deleteCategory('5', 10)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
