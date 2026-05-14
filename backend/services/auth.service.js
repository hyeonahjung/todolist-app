'use strict';

const userRepo = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash.util');
const { signAccessToken, signRefreshToken, verifyToken } = require('../utils/jwt.util');
const env = require('../config/env');
const AppError = require('../errors/AppError');

async function register({ email, password, name }) {
  console.log(`[${new Date().toISOString()}] [AUTH] register attempt: ${email}`);
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    console.warn(`[${new Date().toISOString()}] [AUTH] register failed — duplicate email: ${email}`);
    throw new AppError(409, 'DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.');
  }

  const hashed = await hashPassword(password);
  const user = await userRepo.create({ email, password: hashed, name });
  console.log(`[${new Date().toISOString()}] [AUTH] register success: userId=${user.user_id}, email=${email}`);
  return { userId: user.user_id, email: user.email, name: user.name };
}

async function login({ email, password }) {
  console.log(`[${new Date().toISOString()}] [AUTH] login attempt: ${email}`);
  const user = await userRepo.findByEmail(email);
  if (!user) {
    console.warn(`[${new Date().toISOString()}] [AUTH] login failed — user not found: ${email}`);
    throw new AppError(401, 'UNAUTHORIZED', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    console.warn(`[${new Date().toISOString()}] [AUTH] login failed — wrong password: ${email}`);
    throw new AppError(401, 'UNAUTHORIZED', '이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const payload = { userId: user.user_id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user.user_id });
  console.log(`[${new Date().toISOString()}] [AUTH] login success: userId=${user.user_id}, email=${email}`);

  return {
    accessToken,
    refreshToken,
    user: { userId: user.user_id, email: user.email, name: user.name, theme: user.theme, createdAt: user.created_at },
  };
}

async function refresh(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token, env.JWT_REFRESH_SECRET);

  const user = await userRepo.findById(decoded.userId);
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', '사용자를 찾을 수 없습니다.');
  }

  const accessToken = signAccessToken({ userId: user.user_id, email: user.email });
  console.log(`[${new Date().toISOString()}] [AUTH] token refresh: userId=${user.user_id}`);
  return { accessToken };
}

module.exports = { register, login, refresh };
