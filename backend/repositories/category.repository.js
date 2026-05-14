'use strict';

const pool = require('../config/db');

async function findAll(userId) {
  const { rows } = await pool.query(
    `SELECT category_id, name, is_default, user_id
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY category_id ASC`,
    [userId]
  );
  return rows;
}

async function findById(categoryId) {
  const { rows } = await pool.query(
    'SELECT category_id, name, is_default, user_id FROM categories WHERE category_id = $1',
    [categoryId]
  );
  return rows[0] || null;
}

async function create({ name, userId }) {
  const { rows } = await pool.query(
    'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING category_id, name, is_default, user_id',
    [name, userId]
  );
  return rows[0];
}

async function updateById(categoryId, { name }) {
  const { rows } = await pool.query(
    'UPDATE categories SET name = $1 WHERE category_id = $2 RETURNING category_id, name, is_default, user_id',
    [name, categoryId]
  );
  return rows[0] || null;
}

async function deleteById(categoryId) {
  await pool.query('DELETE FROM categories WHERE category_id = $1', [categoryId]);
}

module.exports = { findAll, findById, create, updateById, deleteById };
