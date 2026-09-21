'use strict';

const bcrypt = require('bcryptjs');
const { get, run } = require('../database/db');
const { signToken } = require('../middleware/auth');
const { success, fail, normalizeEmail, isNonEmptyString } = require('../utils/helpers');

const BCRYPT_ROUNDS = 10;

/** POST /api/auth/register — public. Always creates a "user" role account. */
function register(req, res) {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isNonEmptyString(name, 100)) {
    return fail(res, 'Name is required (max 100 characters).', 400);
  }
  if (!email) {
    return fail(res, 'A valid email address is required.', 400);
  }
  if (password.length < 6 || password.length > 100) {
    return fail(res, 'Password must be between 6 and 100 characters.', 400);
  }

  const existing = get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return fail(res, 'An account with this email already exists.', 409);
  }

  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  // Role is hard-coded server-side; the client can never set it.
  const result = run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, 'user']
  );

  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
  const token = signToken(user);

  return success(res, { message: 'Registration successful.', token, user }, 201);
}

/** POST /api/auth/login — public. Returns a signed JWT. */
function login(req, res) {
  const body = req.body || {};
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return fail(res, 'Email and password are required.', 400);
  }

  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return fail(res, 'Invalid email or password.', 401);
  }

  const matches = bcrypt.compareSync(password, user.password_hash);
  if (!matches) {
    return fail(res, 'Invalid email or password.', 401);
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
  const token = signToken(safeUser);

  return success(res, { message: 'Login successful.', token, user: safeUser });
}

module.exports = { register, login };
