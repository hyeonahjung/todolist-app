'use strict';

const Joi = require('joi');

const categoryIdParam = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
});

const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(30).required(),
  }),
};

const updateCategorySchema = {
  params: categoryIdParam,
  body: Joi.object({
    name: Joi.string().min(1).max(30).required(),
  }),
};

const deleteCategorySchema = {
  params: categoryIdParam,
};

module.exports = { createCategorySchema, updateCategorySchema, deleteCategorySchema };
