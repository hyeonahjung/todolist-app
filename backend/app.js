'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(path.join(__dirname, '../swagger/swagger.json'));
const AppError = require('./errors/AppError');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const todoRoutes = require('./routes/todo.routes');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

const swaggerRouter = express.Router();
swaggerUi.serve.forEach((mw) => swaggerRouter.use(mw));
swaggerRouter.get('/', swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerRouter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/todos', todoRoutes);

// 404 — 존재하지 않는 라우트
app.use((_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', '요청한 경로를 찾을 수 없습니다.'));
});

// 전역 에러 핸들러
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err instanceof AppError) {
    console.warn(`[${new Date().toISOString()}] [WARN] ${req.method} ${req.originalUrl} → ${err.statusCode} ${err.code}: ${err.message}`);
    const body = { success: false, error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } };
    return res.status(err.statusCode).json(body);
  }

  console.error(`[${new Date().toISOString()}] [ERROR] ${req.method} ${req.originalUrl} → 500 INTERNAL_ERROR`, err);
  const isProd = process.env.NODE_ENV === 'production';
  const body = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
      ...(isProd ? {} : { stack: err.stack }),
    },
  };
  return res.status(500).json(body);
});

module.exports = app;
