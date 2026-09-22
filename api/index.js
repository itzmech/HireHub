'use strict';

/**
 * Vercel serverless entry point.
 *
 * Vercel's Node runtime invokes this function for every request (see the
 * rewrites in vercel.json) and passes the original request path in req.url,
 * so the existing Express app handles API routes and the static frontend
 * exactly as it does with `npm start`.
 */

const app = require('../backend/server');

// Serverless cold-boot bootstrap: on Vercel the SQLite database starts EMPTY
// (no admin, no jobs). When ADMIN_EMAIL/ADMIN_PASSWORD are configured, the
// first invocation after a cold start ensures the admin account exists, and
// SEED_DEMO_JOBS=1 optionally populates the jobs table. All steps are
// idempotent; local development is unaffected.
try {
  if (process.env.VERCEL) {
    const { ensureProductionSeed } = require('../backend/database/bootstrap');
    const result = ensureProductionSeed();
    if (result.admin !== 'skipped' || result.demoJobs !== 'skipped') {
      console.log('[bootstrap]', JSON.stringify(result));
    }
  }
} catch (err) {
  console.error('[bootstrap] failed:', err.message);
}

module.exports = app;
