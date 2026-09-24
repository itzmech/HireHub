'use strict';

/**
 * Opt-in production bootstrap for serverless deploys (Vercel).
 *
 * The SQLite schema is created automatically at boot (db.js), but the runtime
 * starts with an EMPTY database: no admin account and no job listings. This
 * module lets a deployment seed an initial admin and optional demo content
 * from environment variables — idempotent, never hard-coding credentials.
 *
 * Activated by ADMIN_PASSWORD (see below):
 *   ADMIN_PASSWORD                -> ensure the demo admin account exists
 *   ADMIN_EMAIL (optional)        -> overrides the default admin@demo.com
 *   ADMIN_NAME (optional)         -> display name (default "Portal Admin")
 *   SEED_DEMO_JOBS=1              -> insert sample jobs if the table is empty
 *
 * Local development is unaffected: local uses `npm run seed` against a
 * persistent database file.
 */

const bcrypt = require('bcryptjs');
const { get, run } = require('./db');

const DEMO_JOBS = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Nimbus Labs',
    location: 'Chennai, India',
    type: 'Full-time',
    salary: '₹18,00,000 – ₹24,00,000',
    description:
      'Own the customer-facing web experience at Nimbus Labs. You will build accessible, high-performance interfaces in close partnership with design, drive the component library, and mentor engineers across the frontend guild.\n\nWhat you bring: 5+ years building production JavaScript, deep CSS knowledge, an eye for detail, and experience shipping to real users at scale.',
  },
  {
    title: 'Backend Engineer (Node.js)',
    company: 'Nimbus Labs',
    location: 'Remote — India',
    type: 'Remote',
    salary: '₹16,00,000 – ₹22,00,000',
    description:
      'Design and operate the APIs that power our platform. You will work with Node.js, relational databases, and event pipelines, with a strong focus on reliability, observability, and developer experience.\n\nWhat you bring: solid REST/API design, SQL fluency, and a track record of running services in production.',
  },
  {
    title: 'Product Designer',
    company: 'Kite & Co.',
    location: 'Bengaluru, India',
    type: 'Full-time',
    salary: '₹12,00,000 – ₹18,00,000',
    description:
      'Shape the end-to-end product experience — from discovery and flows to polished, developer-ready design systems. You will partner daily with engineering and own quality down to the last pixel.',
  },
  {
    title: 'Data Analyst',
    company: 'Brightpath Analytics',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹9,00,000 – ₹14,00,000',
    description:
      'Turn product and business data into decisions. Build dashboards, define metrics with stakeholders, and partner with engineering on instrumentation and data quality.',
  },
  {
    title: 'DevOps Intern',
    company: 'Brightpath Analytics',
    location: 'Hyderabad, India',
    type: 'Internship',
    salary: '₹30,000 / month',
    description:
      'A 6-month internship for engineers who want to learn modern infrastructure: CI/CD pipelines, containers, monitoring, and cloud fundamentals, working alongside a senior platform team.',
  },
  {
    title: 'Customer Success Manager',
    company: 'Kite & Co.',
    location: 'Mumbai, India',
    type: 'Full-time',
    salary: null,
    description:
      'Be the voice of our customers. Onboard new accounts, drive adoption, gather structured feedback for the product team, and own renewal outcomes for your book of business.',
  },
];

function ensureProductionSeed() {
  const results = { admin: 'skipped', demoJobs: 'skipped' };

  // --- Admin account -------------------------------------------------------
  // Deterministic demo admin: setting ADMIN_PASSWORD is enough — the email
  // defaults to admin@demo.com (override with ADMIN_EMAIL). Idempotent: an
  // existing account is never duplicated, modified, or promoted. The plaintext
  // password exists only in the environment; the database stores a bcrypt hash
  // and no log line ever contains the password value.
  const email = (process.env.ADMIN_EMAIL || 'admin@demo.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    if (typeof password !== 'string' || password.length < 6) {
      // Mirror the registration policy; skip rather than seed an unusable
      // account. The value itself is never logged.
      results.admin = 'skipped-weak-password';
    } else if (get('SELECT id FROM users WHERE email = ?', [email])) {
      results.admin = 'exists';
    } else {
      const hash = bcrypt.hashSync(password, 10);
      run(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
        [process.env.ADMIN_NAME || 'Portal Admin', email, hash]
      );
      results.admin = 'created';
    }
  }

  // --- Demo job listings ----------------------------------------------------
  if (process.env.SEED_DEMO_JOBS === '1') {
    const { n } = get('SELECT COUNT(*) AS n FROM jobs');
    if (n > 0) {
      results.demoJobs = 'already-present';
    } else {
      for (const j of DEMO_JOBS) {
        run(
          'INSERT INTO jobs (title, company, location, type, salary, description) VALUES (?, ?, ?, ?, ?, ?)',
          [j.title, j.company, j.location, j.type, j.salary, j.description]
        );
      }
      results.demoJobs = `created(${DEMO_JOBS.length})`;
    }
  }

  return results;
}

module.exports = { ensureProductionSeed };
