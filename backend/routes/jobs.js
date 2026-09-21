'use strict';

const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const ctrl = require('../controllers/jobsController');

const router = express.Router();

// Public
router.get('/', asyncHandler(ctrl.listJobs));
router.get('/:id', asyncHandler(ctrl.getJob));

// Admin only
router.post('/', authenticateToken, requireAdmin, asyncHandler(ctrl.createJob));
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(ctrl.updateJob));
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(ctrl.deleteJob));

module.exports = router;
