'use strict';

const jwt = require('jsonwebtoken');

const { fail } = require('../utils/helpers');

// NOTE: JWT_SECRET is read lazily (at request time, via jwtSecret()). It must
// never be required at module-load time: on serverless platforms a missing
// secret must produce a clear JSON error — not a module-load crash that makes
// every API route fail with an opaque 500.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Ephemeral per-instance fallback secret, generated once per cold boot when
// JWT_SECRET is not configured (e.g. hosting plans without env-var support).
// Security properties: never hard-coded, never committed, never logged, unique
// per instance. Trade-off (inherent to any secretless deployment): tokens do
// not survive a cold start, so all users must log in again when an instance
// restarts. Setting JWT_SECRET in the environment always takes precedence and
// restores stable tokens.
const EPHEMERAL_SECRET = require('crypto').randomBytes(48).toString('hex');

/**
 * Resolve the JWT secret at request time.
 * Order: process.env.JWT_SECRET → per-instance ephemeral random secret.
 * On serverless platforms a missing secret must never crash the runtime.
 */
function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.JWT_ALLOW_EPHEMERAL === '0') {
    const err = new Error(
      'JWT_SECRET is not configured. Set it in the environment (Vercel: Project Settings → Environment Variables) and redeploy.'
    );
    err.status = 503;
    err.expose = true;
    throw err;
  }
  return EPHEMERAL_SECRET;
}

/** Verify the Bearer token, attach req.user = { id, role, email }. */
function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return fail(res, 'Authentication required. Please log in.', 401);
  }

  try {
    const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] });
    if (!payload || typeof payload.id !== 'number' || !payload.role) {
      return fail(res, 'Invalid token payload.', 401);
    }
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid or malformed token.';
    return fail(res, message, 401);
  }
}

/** Allow only authenticated admins. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, 'Admin access required.', 403);
  }
  return next();
}

/** Allow only authenticated job seekers (role "user"). */
function requireUser(req, res, next) {
  if (!req.user || req.user.role !== 'user') {
    return fail(res, 'This action is only available to registered job-seeker accounts.', 403);
  }
  return next();
}

/** Sign a JWT for the given user row. */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret(),
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

module.exports = { authenticateToken, requireAdmin, requireUser, signToken, JWT_EXPIRES_IN };
