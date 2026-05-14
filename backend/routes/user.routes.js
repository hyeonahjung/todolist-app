'use strict';

const { Router } = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/authenticate.middleware');
const { updateMeSchema, deleteMeSchema } = require('../schemas/user.schema');

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validate(updateMeSchema), userController.updateMe);
router.delete('/me', authenticate, validate(deleteMeSchema), userController.deleteMe);

module.exports = router;
