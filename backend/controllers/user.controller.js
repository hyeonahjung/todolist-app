'use strict';

const userService = require('../services/user.service');

async function getMe(req, res, next) {
  try {
    const data = await userService.getMe(req.user.userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const data = await userService.updateMe(req.user.userId, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    await userService.deleteMe(req.user.userId, req.body.password);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
