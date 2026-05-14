'use strict';

const todoRepository = require('../repositories/todo.repository');
const categoryRepository = require('../repositories/category.repository');
const AppError = require('../errors/AppError');

function toDto(row) {
  return {
    todoId: row.todo_id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
  };
}

async function verifyTodoOwnership(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  if (String(todo.user_id) !== String(userId)) throw new AppError(403, 'FORBIDDEN', '접근 권한이 없습니다.');
  return todo;
}

async function createTodo(userId, { title, categoryId, description, dueDate }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (!category.is_default && String(category.user_id) !== String(userId)) {
    throw new AppError(403, 'FORBIDDEN', '접근할 수 없는 카테고리입니다.');
  }

  const row = await todoRepository.create({ userId, categoryId, title, description, dueDate });
  console.log(`[${new Date().toISOString()}] [TODO] created: todoId=${row.todo_id}, title="${title}", userId=${userId}`);
  return toDto(row);
}

async function getTodos(userId, filter) {
  const rows = await todoRepository.findAll(userId, filter);
  return rows.map(toDto);
}

async function getTodoById(userId, todoId) {
  const todo = await verifyTodoOwnership(userId, todoId);
  return toDto(todo);
}

async function updateTodo(userId, todoId, fields) {
  await verifyTodoOwnership(userId, todoId);

  if (fields.categoryId !== undefined) {
    const category = await categoryRepository.findById(fields.categoryId);
    if (!category) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
    if (!category.is_default && String(category.user_id) !== String(userId)) {
      throw new AppError(403, 'FORBIDDEN', '접근할 수 없는 카테고리입니다.');
    }
  }

  const updated = await todoRepository.updateById(todoId, fields);
  console.log(`[${new Date().toISOString()}] [TODO] updated: todoId=${todoId}, fields=${Object.keys(fields).join(',')}, userId=${userId}`);
  return toDto(updated);
}

async function deleteTodo(userId, todoId) {
  await verifyTodoOwnership(userId, todoId);
  await todoRepository.deleteById(todoId);
  console.log(`[${new Date().toISOString()}] [TODO] deleted: todoId=${todoId}, userId=${userId}`);
}

async function toggleCompletion(userId, todoId) {
  await verifyTodoOwnership(userId, todoId);
  const updated = await todoRepository.toggleCompletion(todoId);
  console.log(`[${new Date().toISOString()}] [TODO] completion toggled: todoId=${todoId}, isCompleted=${updated.is_completed}, userId=${userId}`);
  return toDto(updated);
}

module.exports = { createTodo, getTodos, getTodoById, updateTodo, deleteTodo, toggleCompletion };
