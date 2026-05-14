'use strict';

const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/authenticate.middleware');
const { createCategorySchema, updateCategorySchema, deleteCategorySchema } = require('../schemas/category.schema');

const router = Router();

router.get('/', authenticate, categoryController.getCategories);
router.post('/', authenticate, validate(createCategorySchema), categoryController.createCategory);
router.patch('/:categoryId', authenticate, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:categoryId', authenticate, validate(deleteCategorySchema), categoryController.deleteCategory);

module.exports = router;
