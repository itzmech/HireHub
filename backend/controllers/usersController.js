'use strict';

const { all, get, run } = require('../database/db');
const { success, fail, normalizeEmail, isNonEmptyString, pagination, ALLOWED_ROLES } = require('../utils/helpers');

function intId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** GET /api/users — admin only. Never exposes password hashes. */
function listUsers(req, res) {
  const { page, pageSize, offset } = pagination(req.query);

  const total = get('SELECT COUNT(*) AS c FROM users').c;
  const users = all(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC LIMIT ? OFFSET ?',
    [pageSize, offset]
  );

  return success(res, {
    users,
    pagination: { page, page_size: pageSize, total, total_pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

/** PATCH /api/users/:id — admin only. Update name/email/role. */
function updateUser(req, res) {
  const id = intId(req.params.id);
  if (!id) {
    return fail(res, 'Invalid user id.', 400);
  }

  const existing = get('SELECT * FROM users WHERE id = ?', [id]);
  if (!existing) {
    return fail(res, 'User not found.', 404);
  }

  const body = req.body || {};
  const updates = {};
  const errors = [];

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name, 100)) {
      errors.push('"name" must be a non-empty string (max 100 characters).');
    } else {
      updates.name = body.name.trim();
    }
  }

  if (body.email !== undefined) {
    const email = normalizeEmail(body.email);
    if (!email) {
      errors.push('"email" must be a valid email address.');
    } else {
      const clash = get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (clash) {
        return fail(res, 'Another account already uses this email.', 409);
      }
      updates.email = email;
    }
  }

  if (body.role !== undefined) {
    if (!ALLOWED_ROLES.includes(body.role)) {
      errors.push(`"role" must be one of: ${ALLOWED_ROLES.join(', ')}.`);
    } else {
      // Guard: an admin must not lock themselves out of the system.
      if (existing.role === 'admin' && body.role !== 'admin' && id === req.user.id) {
        return fail(res, 'You cannot demote your own admin account.', 400);
      }
      updates.role = body.role;
    }
  }

  if (errors.length) {
    return fail(res, errors.join(' '), 400);
  }
  if (Object.keys(updates).length === 0) {
    return fail(res, 'No updatable fields provided ("name", "email", "role").', 400);
  }

  const setSql = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  run(`UPDATE users SET ${setSql} WHERE id = ?`, [...Object.values(updates), id]);

  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
  return success(res, { message: 'User updated.', user });
}

/** DELETE /api/users/:id — admin only. Applications cascade via FK. */
function deleteUser(req, res) {
  const id = intId(req.params.id);
  if (!id) {
    return fail(res, 'Invalid user id.', 400);
  }

  // Guard: an admin must not delete their own account.
  if (id === req.user.id) {
    return fail(res, 'You cannot delete your own account.', 400);
  }

  const result = run('DELETE FROM users WHERE id = ?', [id]);
  if (result.changes === 0) {
    return fail(res, 'User not found.', 404);
  }

  return success(res, { message: 'User deleted.' });
}

module.exports = { listUsers, updateUser, deleteUser };
