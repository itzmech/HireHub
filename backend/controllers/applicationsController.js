'use strict';

const { all, get, run } = require('../database/db');
const { success, fail, pagination, ALLOWED_STATUSES } = require('../utils/helpers');

/** Valid id guard. */
function intId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** POST /api/applications — user only. Status is always "Pending". */
function createApplication(req, res) {
  const body = req.body || {};
  const jobId = intId(body.job_id);
  if (!jobId) {
    return fail(res, 'A valid "job_id" is required.', 400);
  }

  let note = null;
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== 'string' || body.note.trim().length > 1000) {
      return fail(res, '"note" must be a string of at most 1000 characters.', 400);
    }
    note = body.note.trim() || null;
  }

  const job = get('SELECT id FROM jobs WHERE id = ?', [jobId]);
  if (!job) {
    return fail(res, 'Job not found.', 404);
  }

  const duplicate = get('SELECT id FROM applications WHERE user_id = ? AND job_id = ?', [req.user.id, jobId]);
  if (duplicate) {
    return fail(res, 'You have already applied to this job.', 409);
  }

  // Client can never choose the initial status — hard-coded server-side.
  const result = run(
    "INSERT INTO applications (job_id, user_id, note, status) VALUES (?, ?, ?, 'Pending')",
    [jobId, req.user.id, note]
  );

  const application = get('SELECT * FROM applications WHERE id = ?', [result.lastInsertRowid]);
  return success(res, { message: 'Application submitted.', application }, 201);
}

/** GET /api/applications/mine — user only. Only the caller's applications. */
function myApplications(req, res) {
  const { page, pageSize, offset } = pagination(req.query);

  const total = get('SELECT COUNT(*) AS c FROM applications WHERE user_id = ?', [req.user.id]).c;
  const applications = all(
    `SELECT a.id, a.job_id, a.note, a.status, a.created_at,
            j.title, j.company, j.location, j.type, j.salary
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = ?
     ORDER BY datetime(a.created_at) DESC, a.id DESC
     LIMIT ? OFFSET ?`,
    [req.user.id, pageSize, offset]
  );

  return success(res, {
    applications,
    pagination: { page, page_size: pageSize, total, total_pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

/** GET /api/applications — admin only, joined with applicant + job info. */
function listAllApplications(req, res) {
  const { status } = req.query;
  const { page, pageSize, offset } = pagination(req.query);

  const where = [];
  const params = [];
  if (status && ALLOWED_STATUSES.includes(status)) {
    where.push('a.status = ?');
    params.push(status);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = get(`SELECT COUNT(*) AS c FROM applications a ${whereSql}`, params).c;

  const applications = all(
    `SELECT a.id, a.job_id, a.user_id, a.note, a.status, a.created_at,
            u.name AS applicant_name, u.email AS applicant_email,
            j.title AS job_title, j.company AS job_company, j.location AS job_location
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     ${whereSql}
     ORDER BY datetime(a.created_at) DESC, a.id DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const byStatus = all('SELECT status, COUNT(*) AS count FROM applications GROUP BY status');
  const counts = { Pending: 0, Shortlisted: 0, Hired: 0, Rejected: 0 };
  for (const row of byStatus) counts[row.status] = row.count;

  return success(res, {
    applications,
    counts,
    pagination: { page, page_size: pageSize, total, total_pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

/** PATCH /api/applications/:id — admin only. Update status. */
function updateApplicationStatus(req, res) {
  const id = intId(req.params.id);
  if (!id) {
    return fail(res, 'Invalid application id.', 400);
  }

  const status = (req.body || {}).status;
  if (!ALLOWED_STATUSES.includes(status)) {
    return fail(res, `"status" must be one of: ${ALLOWED_STATUSES.join(', ')}.`, 400);
  }

  const existing = get('SELECT * FROM applications WHERE id = ?', [id]);
  if (!existing) {
    return fail(res, 'Application not found.', 404);
  }

  run('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
  const application = get(
    `SELECT a.id, a.job_id, a.user_id, a.note, a.status, a.created_at,
            u.name AS applicant_name, u.email AS applicant_email,
            j.title AS job_title, j.company AS job_company
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = ?`,
    [id]
  );

  return success(res, { message: 'Application status updated.', application });
}

/** DELETE /api/applications/:id — admin only (extra utility). */
function deleteApplication(req, res) {
  const id = intId(req.params.id);
  if (!id) {
    return fail(res, 'Invalid application id.', 400);
  }
  const result = run('DELETE FROM applications WHERE id = ?', [id]);
  if (result.changes === 0) {
    return fail(res, 'Application not found.', 404);
  }
  return success(res, { message: 'Application deleted.' });
}

/** GET /api/stats — admin only. Dashboard summary counts. */
function dashboardStats(req, res) {
  const totals = {
    users: get('SELECT COUNT(*) AS c FROM users').c,
    jobs: get('SELECT COUNT(*) AS c FROM jobs').c,
    applications: get('SELECT COUNT(*) AS c FROM applications').c,
  };
  const byStatus = all('SELECT status, COUNT(*) AS count FROM applications GROUP BY status');
  const counts = { Pending: 0, Shortlisted: 0, Hired: 0, Rejected: 0 };
  for (const row of byStatus) counts[row.status] = row.count;

  const recentApplications = all(
    `SELECT a.id, a.status, a.created_at, u.name AS applicant_name,
            j.title AS job_title, j.company AS job_company
     FROM applications a
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     ORDER BY datetime(a.created_at) DESC, a.id DESC
     LIMIT 8`
  );

  return success(res, { totals, applications_by_status: counts, recent_applications: recentApplications });
}

module.exports = { createApplication, myApplications, listAllApplications, updateApplicationStatus, deleteApplication, dashboardStats };
