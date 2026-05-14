'use strict';

const { verifyToken } = require('../utils/jwt.util');
const env = require('../config/env');
const AppError = require('../errors/AppError');

function authenticate(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', '인증이 필요합니다.'));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email };
    console.log(`[${new Date().toISOString()}] [AUTH] userId=${decoded.userId} authenticated`);
    return next();
  } catch (err) {
    console.warn(`[${new Date().toISOString()}] [AUTH] token verification failed: ${err.message}`);
    return next(err);
  }
}

module.exports = authenticate;
