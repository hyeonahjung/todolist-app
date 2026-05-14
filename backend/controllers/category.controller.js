'use strict';

const categoryService = require('../services/category.service');

async function getCategories(req, res, next) {
  try {
    const data = await categoryService.getCategories(req.user.userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const data = await categoryService.createCategory(req.user.userId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);
    const data = await categoryService.updateCategory(req.user.userId, categoryId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);
    await categoryService.deleteCategory(req.user.userId, categoryId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
