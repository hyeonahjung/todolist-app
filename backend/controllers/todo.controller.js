'use strict';

const todoService = require('../services/todo.service');

async function createTodo(req, res, next) {
  try {
    const data = await todoService.createTodo(req.user.userId, req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getTodos(req, res, next) {
  try {
    const { categoryId, isCompleted, dueDateFrom, dueDateTo } = req.query;
    const filter = {};
    if (categoryId !== undefined) filter.categoryId = parseInt(categoryId, 10);
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';
    if (dueDateFrom !== undefined) filter.dueDateFrom = dueDateFrom;
    if (dueDateTo !== undefined) filter.dueDateTo = dueDateTo;

    const data = await todoService.getTodos(req.user.userId, filter);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function getTodoById(req, res, next) {
  try {
    const todoId = parseInt(req.params.todoId, 10);
    const data = await todoService.getTodoById(req.user.userId, todoId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const todoId = parseInt(req.params.todoId, 10);
    const data = await todoService.updateTodo(req.user.userId, todoId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const todoId = parseInt(req.params.todoId, 10);
    await todoService.deleteTodo(req.user.userId, todoId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function toggleCompletion(req, res, next) {
  try {
    const todoId = parseInt(req.params.todoId, 10);
    const data = await todoService.toggleCompletion(req.user.userId, todoId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createTodo, getTodos, getTodoById, updateTodo, deleteTodo, toggleCompletion };
