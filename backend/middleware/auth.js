'use strict';

const jwt = require('jsonwebtoken');

const { fail } = require('../utils/helpers');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required. See .env.example');
  process.exit(1);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/** Verify the Bearer token, attach req.user = { id, role, email }. */
function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return fail(res, 'Authentication required. Please log in.', 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
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
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

module.exports = { authenticateToken, requireAdmin, requireUser, signToken, JWT_EXPIRES_IN };
