'use strict';

const { Router } = require('express');
const todoController = require('../controllers/todo.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/authenticate.middleware');
const { createTodoSchema, updateTodoSchema, todoParamSchema, listTodosSchema } = require('../schemas/todo.schema');

const router = Router();

router.get('/', authenticate, validate(listTodosSchema), todoController.getTodos);
router.post('/', authenticate, validate(createTodoSchema), todoController.createTodo);
router.get('/:todoId', authenticate, validate(todoParamSchema), todoController.getTodoById);
router.patch('/:todoId', authenticate, validate(updateTodoSchema), todoController.updateTodo);
router.delete('/:todoId', authenticate, validate(todoParamSchema), todoController.deleteTodo);
router.patch('/:todoId/completion', authenticate, validate(todoParamSchema), todoController.toggleCompletion);

module.exports = router;
