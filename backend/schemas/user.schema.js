'use strict';

const Joi = require('joi');

const passwordRule = Joi.string()
  .min(8)
  .max(64)
  .pattern(/(?=.*[a-zA-Z])(?=.*\d)/)
  .messages({ 'string.pattern.base': '비밀번호는 영문과 숫자를 모두 포함해야 합니다.' });

const updateMeSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    currentPassword: Joi.string().optional(),
    newPassword: passwordRule.optional(),
  }).and('currentPassword', 'newPassword'),
};

const deleteMeSchema = {
  body: Joi.object({
    password: Joi.string().required(),
  }),
};

module.exports = { updateMeSchema, deleteMeSchema };
