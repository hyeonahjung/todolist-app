'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/authenticate.middleware');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;
