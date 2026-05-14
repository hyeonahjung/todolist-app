'use strict';

const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function logout(_req, res) {
  return res.status(200).json({ success: true, data: null });
}

async function refresh(req, res, next) {
  try {
    const data = await authService.refresh(req.headers['authorization']);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout, refresh };
