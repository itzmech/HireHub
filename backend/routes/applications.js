'use strict';

const express = require('express');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const ctrl = require('../controllers/applicationsController');

const router = express.Router();

// All application endpoints require authentication.
router.use(authenticateToken);

// User only — must be declared before the admin list route.
router.get('/mine', requireUser, asyncHandler(ctrl.myApplications));
router.post('/', requireUser, asyncHandler(ctrl.createApplication));

// Admin only
router.get('/', requireAdmin, asyncHandler(ctrl.listAllApplications));
router.patch('/:id', requireAdmin, asyncHandler(ctrl.updateApplicationStatus));
router.delete('/:id', requireAdmin, asyncHandler(ctrl.deleteApplication));

module.exports = router;
