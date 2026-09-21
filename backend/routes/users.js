'use strict';

const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const usersCtrl = require('../controllers/usersController');
const { dashboardStats } = require('../controllers/applicationsController');

const router = express.Router();

// All user-management endpoints are admin only.
router.use(authenticateToken, requireAdmin);

router.get('/', asyncHandler(usersCtrl.listUsers));
router.patch('/:id', asyncHandler(usersCtrl.updateUser));
router.delete('/:id', asyncHandler(usersCtrl.deleteUser));

// Dashboard summary (admin only).
router.get('/stats', asyncHandler(dashboardStats));

module.exports = router;
