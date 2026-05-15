'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });

const REQUIRED_VARS = [
  'POSTGRES_CONNECTION_STRING',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  POSTGRES_CONNECTION_STRING: process.env.POSTGRES_CONNECTION_STRING,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
