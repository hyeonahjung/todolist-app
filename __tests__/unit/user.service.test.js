'use strict';

jest.mock('../../backend/repositories/user.repository', () => ({
  findById: jest.fn(),
  findByIdWithPassword: jest.fn(),
  updateById: jest.fn(),
  deleteByIdTransactional: jest.fn(),
}));

jest.mock('../../backend/utils/hash.util', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
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

const userService = require('../../backend/services/user.service');
const userRepository = require('../../backend/repositories/user.repository');
const { comparePassword, hashPassword } = require('../../backend/utils/hash.util');

const mockUser = {
  user_id: 1,
  email: 'test@example.com',
  name: '테스트',
  password: 'hashed_password',
  created_at: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('userService.getMe', () => {
  test('존재하는 userId → { userId, email, name } 반환', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    const result = await userService.getMe(1);
    expect(result).toEqual({ userId: 1, email: 'test@example.com', name: '테스트' });
  });

  test('존재하지 않는 userId → 404 AppError', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(userService.getMe(99)).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });
});

describe('userService.updateMe — 이름 수정', () => {
  test('name만 전달 → 업데이트된 사용자 반환', async () => {
    const updated = { ...mockUser, name: '새이름' };
    userRepository.updateById.mockResolvedValue(updated);
    const result = await userService.updateMe(1, { name: '새이름' });
    expect(result.name).toBe('새이름');
    expect(userRepository.updateById).toHaveBeenCalledWith(1, { name: '새이름' });
  });
});

describe('userService.updateMe — 비밀번호 변경', () => {
  test('올바른 currentPassword → 비밀번호 변경 성공', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('new_hashed');
    userRepository.updateById.mockResolvedValue(mockUser);

    await userService.updateMe(1, { currentPassword: 'OldPass1', newPassword: 'NewPass1' });

    expect(hashPassword).toHaveBeenCalledWith('NewPass1');
    expect(userRepository.updateById).toHaveBeenCalledWith(1, { password: 'new_hashed' });
  });

  test('currentPassword 불일치 → 400 INVALID_PASSWORD', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);

    await expect(
      userService.updateMe(1, { currentPassword: 'WrongPass1', newPassword: 'NewPass1' })
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_PASSWORD' });
  });

  test('이름 + 비밀번호 동시 변경 → updateById 1회 호출', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('new_hashed');
    userRepository.updateById.mockResolvedValue({ ...mockUser, name: '새이름' });

    await userService.updateMe(1, { name: '새이름', currentPassword: 'OldPass1', newPassword: 'NewPass1' });

    expect(userRepository.updateById).toHaveBeenCalledWith(1, { name: '새이름', password: 'new_hashed' });
  });
});

describe('userService.deleteMe', () => {
  test('올바른 비밀번호 → 트랜잭션 삭제 호출', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(true);
    userRepository.deleteByIdTransactional.mockResolvedValue();

    await userService.deleteMe(1, 'TestPass1');

    expect(userRepository.deleteByIdTransactional).toHaveBeenCalledWith(1);
  });

  test('비밀번호 불일치 → 400 INVALID_PASSWORD', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(mockUser);
    comparePassword.mockResolvedValue(false);

    await expect(userService.deleteMe(1, 'WrongPass1')).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_PASSWORD',
    });
    expect(userRepository.deleteByIdTransactional).not.toHaveBeenCalled();
  });

  test('존재하지 않는 사용자 → 404 NOT_FOUND', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(null);

    await expect(userService.deleteMe(99, 'pass')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });
});
