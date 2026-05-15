'use strict';

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.POSTGRES_CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  client_encoding: 'UTF8',
});

pool.query('SELECT NOW()').then(() => {
  console.log('Database connected');
}).catch((err) => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});

module.exports = pool;
