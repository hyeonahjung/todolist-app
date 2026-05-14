'use strict';

const pool = require('../config/db');

async function findAll(userId, { categoryId, isCompleted, dueDateFrom, dueDateTo } = {}) {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (categoryId !== undefined) { conditions.push(`category_id = $${idx++}`); values.push(categoryId); }
  if (isCompleted !== undefined) { conditions.push(`is_completed = $${idx++}`); values.push(isCompleted); }
  if (dueDateFrom !== undefined) { conditions.push(`due_date >= $${idx++}`); values.push(dueDateFrom); }
  if (dueDateTo !== undefined) { conditions.push(`due_date <= $${idx++}`); values.push(dueDateTo); }

  const { rows } = await pool.query(
    `SELECT todo_id, user_id, category_id, title, description, due_date, is_completed, created_at
     FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function findById(todoId) {
  const { rows } = await pool.query(
    `SELECT todo_id, user_id, category_id, title, description, due_date, is_completed, created_at
     FROM todos WHERE todo_id = $1`,
    [todoId]
  );
  return rows[0] || null;
}

async function create({ userId, categoryId, title, description, dueDate }) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING todo_id, user_id, category_id, title, description, due_date, is_completed, created_at`,
    [userId, categoryId, title, description || null, dueDate || null]
  );
  return rows[0];
}

async function updateById(todoId, fields) {
  const cols = [];
  const values = [];
  let idx = 1;

  if (fields.title !== undefined) { cols.push(`title = $${idx++}`); values.push(fields.title); }
  if (fields.categoryId !== undefined) { cols.push(`category_id = $${idx++}`); values.push(fields.categoryId); }
  if (fields.description !== undefined) { cols.push(`description = $${idx++}`); values.push(fields.description || null); }
  if ('dueDate' in fields) { cols.push(`due_date = $${idx++}`); values.push(fields.dueDate || null); }

  if (cols.length === 0) return findById(todoId);

  values.push(todoId);
  const { rows } = await pool.query(
    `UPDATE todos SET ${cols.join(', ')} WHERE todo_id = $${idx}
     RETURNING todo_id, user_id, category_id, title, description, due_date, is_completed, created_at`,
    values
  );
  return rows[0] || null;
}

async function toggleCompletion(todoId) {
  const { rows } = await pool.query(
    `UPDATE todos SET is_completed = NOT is_completed WHERE todo_id = $1
     RETURNING todo_id, user_id, category_id, title, description, due_date, is_completed, created_at`,
    [todoId]
  );
  return rows[0] || null;
}

async function deleteById(todoId) {
  await pool.query('DELETE FROM todos WHERE todo_id = $1', [todoId]);
}

module.exports = { findAll, findById, create, updateById, toggleCompletion, deleteById };
