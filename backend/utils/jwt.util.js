'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../errors/AppError');

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError(401, 'TOKEN_EXPIRED', '토큰이 만료되었습니다.');
    }
    throw new AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다.');
  }
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
