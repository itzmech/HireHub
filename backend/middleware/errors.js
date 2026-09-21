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

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return fail(res, 'Conflict: the resource already exists.', 409);
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  return fail(res, 'Unexpected server error.', 500);
}

module.exports = { asyncHandler, notFoundHandler, errorHandler };
