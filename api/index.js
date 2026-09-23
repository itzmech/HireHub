'use strict';

/**
 * Vercel serverless entry point.
 *
 * Vercel's Node runtime invokes this function for every request (see the
 * rewrites in vercel.json) and passes the original request path in req.url,
 * so the existing Express app handles API routes and the static frontend
 * exactly as it does with `npm start`.
 */

let app;
let bootError = null;

try {
  app = require('../backend/server');

  // Serverless cold-boot bootstrap: on Vercel the SQLite database starts EMPTY
  // (no admin, no jobs). When ADMIN_EMAIL/ADMIN_PASSWORD are configured, the
  // first invocation after a cold start ensures the admin account exists, and
  // SEED_DEMO_JOBS=1 optionally populates the jobs table. All steps are
  // idempotent; local development is unaffected. Seeding failures are logged
  // but do not take the API down — per-request handlers and /api/health/db
  // surface database problems instead.
  if (process.env.VERCEL) {
    try {
      const { ensureProductionSeed } = require('../backend/database/bootstrap');
      const result = ensureProductionSeed();
      if (result.admin !== 'skipped' || result.demoJobs !== 'skipped') {
        console.log('[bootstrap]', JSON.stringify(result));
      }
    } catch (err) {
      console.error('[bootstrap] failed:', err.message);
    }
  }
} catch (err) {
  bootError = err;
  console.error('[boot] API failed to initialize:', (err && err.stack) || err);
}

if (bootError) {
  // Surface the exact boot failure in the HTTP response (still a 500 — never
  // masquerade as success). Without this, a module-load crash is invisible
  // from the browser as an opaque platform FUNCTION_INVOCATION_FAILED 500.
  module.exports = function bootFailureHandler(req, res) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        success: false,
        message: 'API failed to initialize (serverless boot error).',
        errorType: bootError && bootError.name,
        errorMessage: bootError && bootError.message,
        errorStack:
          bootError && bootError.stack
            ? String(bootError.stack).split('\n').slice(0, 5)
            : undefined,
      })
    );
  };
} else {
  module.exports = app;
}
