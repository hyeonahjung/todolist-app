'use strict';

const pool = require('../config/db');

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT user_id, email, password, name, theme, language, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const { rows } = await pool.query(
    'SELECT user_id, email, name, theme, language, created_at FROM users WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function create({ email, password, name }) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING user_id, email, name, theme, language, created_at',
    [email, password, name]
  );
  return rows[0];
}

async function updateById(userId, { name, password, theme, language }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (password !== undefined) { fields.push(`password = $${idx++}`); values.push(password); }
  if (theme !== undefined) { fields.push(`theme = $${idx++}`); values.push(theme); }
  if (language !== undefined) { fields.push(`language = $${idx++}`); values.push(language); }

  if (fields.length === 0) return findById(userId);

  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING user_id, email, name, theme, language, created_at`,
    values
  );
  return rows[0] || null;
}

async function findByIdWithPassword(userId) {
  const { rows } = await pool.query(
    'SELECT user_id, email, password, name, theme, language, created_at FROM users WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function deleteById(userId) {
  await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
}

async function deleteByIdTransactional(userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM users WHERE user_id = $1', [userId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { findByEmail, findById, findByIdWithPassword, create, updateById, deleteById, deleteByIdTransactional };
