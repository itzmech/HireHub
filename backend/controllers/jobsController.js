'use strict';

const { all, get, run } = require('../database/db');
const {
  success,
  fail,
  isNonEmptyString,
  pagination,
  ALLOWED_JOB_TYPES,
} = require('../utils/helpers');

/** Validate job payload; returns { errors, values }. */
function validateJobPayload(body, { partial = false } = {}) {
  const errors = [];
  const values = {};

  const fields = ['title', 'company', 'location', 'type', 'salary', 'description'];

  for (const field of fields) {
    const provided = Object.prototype.hasOwnProperty.call(body, field);
    if (!provided) {
      if (!partial) errors.push(`"${field}" is required.`);
      continue;
    }
    const raw = body[field];

    if (field === 'salary') {
      // Optional field; null/empty clears it.
      if (raw === null || (typeof raw === 'string' && raw.trim() === '')) {
        values.salary = null;
      } else if (isNonEmptyString(raw, 100)) {
        values.salary = raw.trim();
      } else {
        errors.push('"salary" must be a string of at most 100 characters.');
      }
      continue;
    }

    if (field === 'type') {
      if (!ALLOWED_JOB_TYPES.includes(raw)) {
        errors.push(`"type" must be one of: ${ALLOWED_JOB_TYPES.join(', ')}.`);
      } else {
        values.type = raw;
      }
      continue;
    }

    const maxLen = field === 'description' ? 5000 : 150;
    if (!isNonEmptyString(raw, maxLen)) {
      errors.push(`"${field}" is required (max ${maxLen} characters).`);
    } else {
      values[field] = raw.trim();
    }
  }

  return { errors, values };
}

/** GET /api/jobs — public, with search/filter/pagination. */
function listJobs(req, res) {
  const { search, location, type } = req.query;
  const { page, pageSize, offset } = pagination(req.query);

  const where = [];
  const params = [];

  if (search && typeof search === 'string' && search.trim()) {
    where.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
    const like = `%${search.trim()}%`;
    params.push(like, like, like);
  }
  if (location && typeof location === 'string' && location.trim()) {
    where.push('location LIKE ?');
    params.push(`%${location.trim()}%`);
  }
  if (type && typeof type === 'string' && type.trim()) {
    where.push('type = ?');
    params.push(type.trim());
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = get(`SELECT COUNT(*) AS c FROM jobs ${whereSql}`, params).c;

  const jobs = all(
    `SELECT id, title, company, location, type, salary, substr(description, 1, 180) AS snippet, created_at
     FROM jobs ${whereSql}
     ORDER BY datetime(created_at) DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return success(res, {
    jobs,
    pagination: { page, page_size: pageSize, total, total_pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

/** GET /api/jobs/:id — public. */
function getJob(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 'Invalid job id.', 400);
  }

  const job = get('SELECT * FROM jobs WHERE id = ?', [id]);
  if (!job) {
    return fail(res, 'Job not found.', 404);
  }

  return success(res, { job });
}

/** POST /api/jobs — admin only. */
function createJob(req, res) {
  const { errors, values } = validateJobPayload(req.body || {});
  if (errors.length) {
    return fail(res, errors.join(' '), 400);
  }

  const result = run(
    'INSERT INTO jobs (title, company, location, type, salary, description) VALUES (?, ?, ?, ?, ?, ?)',
    [values.title, values.company, values.location, values.type, values.salary ?? null, values.description]
  );

  const job = get('SELECT * FROM jobs WHERE id = ?', [result.lastInsertRowid]);
  return success(res, { message: 'Job created.', job }, 201);
}

/** PUT /api/jobs/:id — admin only. */
function updateJob(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 'Invalid job id.', 400);
  }

  const existing = get('SELECT * FROM jobs WHERE id = ?', [id]);
  if (!existing) {
    return fail(res, 'Job not found.', 404);
  }

  const { errors, values } = validateJobPayload(req.body || {}, { partial: true });
  if (errors.length) {
    return fail(res, errors.join(' '), 400);
  }
  if (Object.keys(values).length === 0) {
    return fail(res, 'No updatable fields provided.', 400);
  }

  const merged = { ...existing, ...values };
  run(
    'UPDATE jobs SET title = ?, company = ?, location = ?, type = ?, salary = ?, description = ? WHERE id = ?',
    [merged.title, merged.company, merged.location, merged.type, merged.salary, merged.description, id]
  );

  const job = get('SELECT * FROM jobs WHERE id = ?', [id]);
  return success(res, { message: 'Job updated.', job });
}

/** DELETE /api/jobs/:id — admin only. Applications cascade (FK ON DELETE CASCADE). */
function deleteJob(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return fail(res, 'Invalid job id.', 400);
  }

  const result = run('DELETE FROM jobs WHERE id = ?', [id]);
  if (result.changes === 0) {
    return fail(res, 'Job not found.', 404);
  }

  return success(res, { message: 'Job deleted.' });
}

module.exports = { listJobs, getJob, createJob, updateJob, deleteJob };
