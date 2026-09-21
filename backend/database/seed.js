'use strict';

/**
 * Seed script — creates the initial admin account.
 *
 * Usage:
 *   ADMIN_NAME="Portal Admin" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="strong-pass" npm run seed
 *
 * Credentials come from environment variables; a production password is
 * never hard-coded in source. If variables are missing, an interactive
 * prompt is used.
 */

const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const { get, run, DB_PATH } = require('./db');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  let name = process.env.ADMIN_NAME;
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Admin credentials not fully provided via environment.');
    console.log(`Database: ${DB_PATH}\n`);
    name = name || (await ask('Admin name [Portal Admin]: ')) || 'Portal Admin';
    email = email || (await ask('Admin email: '));
    password = password || (await ask('Admin password: '));
  }

  name = (name || 'Portal Admin').trim();
  email = (email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Error: a valid admin email is required.');
    process.exit(1);
  }
  if (typeof password !== 'string' || password.length < 6) {
    console.error('Error: admin password must be at least 6 characters.');
    process.exit(1);
  }

  const existing = get('SELECT id, role FROM users WHERE email = ?', [email]);
  if (existing) {
    if (existing.role !== 'admin') {
      run('UPDATE users SET role = ? WHERE id = ?', ['admin', existing.id]);
      console.log(`Existing user #${existing.id} (${email}) promoted to admin.`);
    } else {
      console.log(`Admin already exists: ${email} (user #${existing.id}). Nothing to do.`);
    }
    process.exit(0);
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, 'admin']
  );
  console.log(`Admin created: ${name} <${email}> (user #${result.lastInsertRowid})`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
