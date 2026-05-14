'use strict';

const userRepository = require('../repositories/user.repository');
const { comparePassword, hashPassword } = require('../utils/hash.util');
const AppError = require('../errors/AppError');

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다.');
  return { userId: user.user_id, email: user.email, name: user.name, theme: user.theme };
}

async function updateMe(userId, { name, currentPassword, newPassword, theme }) {
  const updates = {};

  if (currentPassword && newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다.');
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      console.warn(`[${new Date().toISOString()}] [USER] password change failed — wrong current password: userId=${userId}`);
      throw new AppError(400, 'INVALID_PASSWORD', '현재 비밀번호가 일치하지 않습니다.');
    }
    updates.password = await hashPassword(newPassword);
  }

  if (name !== undefined) updates.name = name;
  if (theme !== undefined) updates.theme = theme;

  const updated = await userRepository.updateById(userId, updates);
  if (!updated) throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다.');
  console.log(`[${new Date().toISOString()}] [USER] profile updated: userId=${userId}, fields=${Object.keys(updates).join(',')}`);
  return { userId: updated.user_id, email: updated.email, name: updated.name, theme: updated.theme };
}

async function deleteMe(userId, password) {
  const user = await userRepository.findByIdWithPassword(userId);
  if (!user) throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다.');
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    console.warn(`[${new Date().toISOString()}] [USER] account deletion failed — wrong password: userId=${userId}`);
    throw new AppError(400, 'INVALID_PASSWORD', '비밀번호가 일치하지 않습니다.');
  }
  await userRepository.deleteByIdTransactional(userId);
  console.log(`[${new Date().toISOString()}] [USER] account deleted: userId=${userId}`);
}

module.exports = { getMe, updateMe, deleteMe };
