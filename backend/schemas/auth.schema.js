'use strict';

const Joi = require('joi');

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(64)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
      .required()
      .messages({ 'string.pattern.base': '비밀번호는 영문자와 숫자를 각 1자 이상 포함해야 합니다.' }),
    name: Joi.string().min(1).max(50).required(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refreshSchema = {
  // Authorization 헤더로 refresh token을 받으므로 body 스키마 불필요
};

module.exports = { registerSchema, loginSchema, refreshSchema };
