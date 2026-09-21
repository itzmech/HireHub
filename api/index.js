'use strict';

/**
 * Vercel serverless entry point.
 *
 * Vercel's Node runtime invokes this function for every request (see the
 * rewrites in vercel.json) and passes the original request path in req.url,
 * so the existing Express app handles API routes and the static frontend
 * exactly as it does with `npm start`.
 */

module.exports = require('../backend/server');
