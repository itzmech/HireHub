'use strict';

/**
 * Shared helpers: consistent JSON responses and input validation.
 */

const ALLOWED_ROLES = ['user', 'admin'];
const ALLOWED_STATUSES = ['Pending', 'Shortlisted', 'Hired', 'Rejected'];
const ALLOWED_JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary',
  'Remote',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function success(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400, extra = {}) {
  return res.status(status).json({ success: false, message, ...extra });
}

/** Normalize an email; returns null if invalid. */
function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const value = email.trim().toLowerCase();
  return EMAIL_RE.test(value) ? value : null;
}

function isNonEmptyString(value, maxLen = 255) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLen;
}

/** Parse page/page_size for list endpoints; returns sane defaults. */
function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 50));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

module.exports = {
  ALLOWED_ROLES,
  ALLOWED_STATUSES,
  ALLOWED_JOB_TYPES,
  success,
  fail,
  normalizeEmail,
  isNonEmptyString,
  pagination,
};
