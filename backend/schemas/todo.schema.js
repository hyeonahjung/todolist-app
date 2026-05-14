'use strict';

const Joi = require('joi');

const todoIdParam = Joi.object({
  todoId: Joi.number().integer().positive().required(),
});

const createTodoSchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    categoryId: Joi.number().integer().positive().required(),
    description: Joi.string().max(1000).optional().allow(''),
    dueDate: Joi.date().iso().min('now').optional(),
  }),
};

const updateTodoSchema = {
  params: todoIdParam,
  body: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    categoryId: Joi.number().integer().positive().optional(),
    description: Joi.string().max(1000).optional().allow(''),
    dueDate: Joi.date().iso().optional().allow(null),
  }),
};

const todoParamSchema = {
  params: todoIdParam,
};

const listTodosSchema = {
  query: Joi.object({
    categoryId: Joi.number().integer().positive().optional(),
    isCompleted: Joi.boolean().optional(),
    dueDateFrom: Joi.date().iso().optional(),
    dueDateTo: Joi.date().iso().optional(),
  }),
};

module.exports = { createTodoSchema, updateTodoSchema, todoParamSchema, listTodosSchema };
