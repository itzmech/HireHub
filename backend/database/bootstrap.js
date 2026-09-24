'use strict';

/**
 * Serverless cold-boot seed (Vercel).
 *
 * The SQLite schema is created automatically at boot (db.js), but the runtime
 * starts with an EMPTY database: no admin account and no job listings. This
 * module makes every fresh database immediately demo-ready:
 *
 *   ADMIN_PASSWORD (optional env)  -> admin password override
 *   ADMIN_EMAIL (optional env)     -> admin email override (default admin@demo.com)
 *   ADMIN_NAME (optional env)      -> display name (default "Demo Admin")
 *
 * When the overrides are absent, a deterministic DEMO admin is seeded
 * (admin@demo.com / DemoAdmin@123) so free-tier deployments without
 * environment-variable support still get a working admin. DEMO CREDENTIALS ARE
 * PUBLIC (this repo is public): set ADMIN_PASSWORD/ADMIN_EMAIL in the hosting
 * environment to override them, or set DISABLE_DEMO_ADMIN=1 to skip seeding
 * entirely. Idempotent: an existing account is never duplicated or modified.
 * Only the bcrypt hash is stored; the plaintext never appears in logs, APIs,
 * or frontend code.
 *
 * Local development is unaffected: local uses `npm run seed` against a
 * persistent database file.
 */

const bcrypt = require('bcryptjs');
const { get, run } = require('./db');

// Public demo credentials, overridable via environment. The plaintext lives
// only here (server-side seed) and in the database as a bcrypt hash.
const DEMO_ADMIN = {
  email: 'admin@demo.com',
  password: 'DemoAdmin@123',
  name: 'Demo Admin',
};

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
  // Deterministic seed: every fresh/empty database gets a working admin.
  // Environment overrides take precedence over the public demo defaults;
  // DISABLE_DEMO_ADMIN=1 skips admin seeding entirely. Idempotent: an existing
  // account is never duplicated, modified, or promoted. Weak configured
  // passwords (<6 chars, mirroring the registration policy) are skipped rather
  // than seeded. The plaintext value is never logged.
  const disabled = process.env.DISABLE_DEMO_ADMIN === '1';
  const email = (process.env.ADMIN_EMAIL || DEMO_ADMIN.email).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || DEMO_ADMIN.password;
  const name = process.env.ADMIN_NAME || DEMO_ADMIN.name;
  if (disabled && !process.env.ADMIN_PASSWORD) {
    results.admin = 'disabled';
  } else if (typeof password !== 'string' || password.length < 6) {
    results.admin = 'skipped-weak-password';
  } else if (get('SELECT id FROM users WHERE email = ?', [email])) {
    results.admin = 'exists';
  } else {
    const hash = bcrypt.hashSync(password, 10);
    run(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      [name, email, hash]
    );
    results.admin = 'created';
  }

  // --- Demo job listings ----------------------------------------------------
  // Fresh databases ship with sample listings so the demo is never a blank
  // jobs page. SEED_DEMO_JOBS=0 opts out; otherwise auto-seed only when empty.
  if (process.env.SEED_DEMO_JOBS === '0') {
    results.demoJobs = 'disabled';
  } else {
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
