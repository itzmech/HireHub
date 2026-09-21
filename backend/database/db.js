'use strict';

/**
 * SQLite database layer using Node's built-in `node:sqlite` module
 * (stable since Node 22.5+). No native compilation required.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'jobportal.db');

// Ensure the database directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Schema — executed on every start (CREATE IF NOT EXISTS is idempotent).
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    name          TEXT     NOT NULL,
    email         TEXT     NOT NULL UNIQUE,
    password_hash TEXT     NOT NULL,
    role          TEXT     NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TEXT     NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    title       TEXT     NOT NULL,
    company     TEXT     NOT NULL,
    location    TEXT     NOT NULL,
    type        TEXT     NOT NULL,
    salary      TEXT,
    description TEXT     NOT NULL,
    created_at  TEXT     NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    job_id     INTEGER  NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note       TEXT,
    status     TEXT     NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shortlisted', 'Hired', 'Rejected')),
    created_at TEXT     NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_job_user
    ON applications (job_id, user_id);

  CREATE INDEX IF NOT EXISTS idx_applications_user ON applications (user_id);
  CREATE INDEX IF NOT EXISTS idx_applications_job ON applications (job_id);
  CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs (title);
`);

/** Run a statement that returns rows (SELECT). */
function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

/** Run a statement expected to return a single row (or undefined). */
function get(sql, params = []) {
  return db.prepare(sql).get(...params);
}

/** Run an INSERT/UPDATE/DELETE statement. */
function run(sql, params = []) {
  const info = db.prepare(sql).run(...params);
  return { lastInsertRowid: Number(info.lastInsertRowid), changes: Number(info.changes) };
}

/** Execute multiple statements inside a transaction. */
function tx(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { all, get, run, tx, DB_PATH };
