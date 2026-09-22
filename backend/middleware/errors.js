'use strict';

/**
 * Central error handler + async wrapper.
 * Produces consistent JSON error responses.
 */

const { fail } = require('../utils/helpers');

/** Wrap async route handlers so thrown errors reach the error handler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** 404 for unknown API routes. */
function notFoundHandler(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Malformed JSON body -> express.json throws SyntaxError with status 400
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return fail(res, 'Malformed JSON body.', 400);
  }

  // Errors that carry an explicit, safe-for-client status (e.g. missing
  // JWT_SECRET misconfiguration surfaced as 503).
  if (err.expose && err.status && Number.isInteger(err.status)) {
    return fail(res, err.message, err.status);
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return fail(res, 'Conflict: the resource already exists.', 409);
  }

  // Database layer failures get a specific, diagnosable status and log the
  // full server-side error (visible in Vercel function logs).
  if (
    err &&
    (err.code === 'ERR_DB_REQUEST_FAILED' ||
      err.code === 'SQLITE_CANTOPEN' ||
      err.code === 'SQLITE_READONLY' ||
      err.code === 'SQLITE_AUTH' ||
      err.code === 'SQLITE_CORRUPT' ||
      /^SQLITE_/.test(String(err.code || '')) ||
      err instanceof Error && err.message === 'Failed to open the database' ||
      err instanceof Error && /SQLite|database/i.test(err.message))
  ) {
    console.error(`[db] ${req.method} ${req.originalUrl}: code=${err.code || 'n/a'} message=${err.message}`);
    return fail(res, 'Database error. Verify the database is initialized and writable.', 503);
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  return fail(res, 'Unexpected server error.', 500);
}

module.exports = { asyncHandler, notFoundHandler, errorHandler };
