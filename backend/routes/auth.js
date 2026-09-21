'use strict';

const express = require('express');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/register', asyncHandler(ctrl.register));
router.post('/login', asyncHandler(ctrl.login));

module.exports = { router, authenticateToken, requireAdmin, requireUser };
