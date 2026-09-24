'use strict';

/**
 * Serverless deployment verification (Vercel Node-runtime simulation).
 *
 * Vercel invokes api/index.js per request; this script does the same thing in
 *-process (http.createServer((req, res) => app(req, res))) against a fresh
 * temporary SQLite database, reproducing a cold serverless boot.
 *
 * Modes:
 *   probe-no-secret  — no JWT_SECRET (the reported production failure state);
 *                      expects health/jobs OK, auth endpoints 503 (not 500).
 *   probe-bootstrap  — with ADMIN_EMAIL/ADMIN_PASSWORD/SEED_DEMO_JOBS; expects
 *                      the cold-boot seed to create the admin + jobs, and to
 *                      be idempotent on a second boot.
 *   serve            — fully-configured long-running server for the API test
 *                      suite (node scripts/api-test.js).
 */

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const mode = process.argv[2];
const PORT = Number(process.env.PORT) || 3199;

// Mirror the Vercel runtime: no .env file exists there, so dotenv must not
// quietly re-supply JWT_SECRET (and other vars) from the repo checkout. dotenv
// resolves .env relative to the current working directory, so move to a temp
// dir before any application module is loaded.
process.chdir(os.tmpdir());
process.env.VERCEL = '1';
process.env.DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hirehub-verify-')), 'verify.db');
if (mode === 'probe-no-secret' || process.env.EPHEMERAL_JWT === '1') delete process.env.JWT_SECRET;
else process.env.JWT_SECRET = process.env.JWT_SECRET || 'verification-secret-not-for-production';

// Load the exact entry point Vercel executes (includes the cold-boot seed).
const app = require('../api/index');

function req(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      host: '127.0.0.1',
      port: PORT,
      path: url,
      method,
      headers: {
        ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
    const r = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

let passed = 0;
let failed = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${detail}`);
  }
}

async function main() {
  const server = http.createServer((req, res) => app(req, res));
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  console.log(`[verify] mode=${mode} node=${process.version} db=${process.env.DB_PATH}`);

  if (mode === 'serve') {
    console.log('[verify] READY — serverless simulation listening for the test suite');
    return; // keep running
  }

  if (mode === 'probe-no-secret') {
    // Production state with no JWT_SECRET on a plan without env vars:
    // auth must work via the per-instance ephemeral fallback secret.
    const health = await req('GET', '/api/health');
    ok('GET /api/health -> 200 (no boot crash)', health.status === 200, `got ${health.status}`);
    ok(
      'health reports ephemeral JWT mode',
      /"jwtMode":"ephemeral-per-instance"/.test(health.body),
      health.body.slice(0, 200)
    );

    const jobs = await req('GET', '/api/jobs');
    ok('GET /api/jobs -> 200 (SQLite schema initialized)', jobs.status === 200, `got ${jobs.status}`);

    const email = `probe-${Date.now()}@example.com`;
    const reg = await req('POST', '/api/auth/register', {
      name: 'Probe User',
      email,
      password: 'Password1!',
    });
    ok('POST /api/auth/register -> 201 (ephemeral secret signs token)', reg.status === 201, `got ${reg.status} ${reg.body.slice(0, 120)}`);
    const regToken = /"token":"([^"]+)"/.exec(reg.body);
    ok('register returns a JWT', Boolean(regToken), reg.body.slice(0, 120));

    // Same warm instance: the signed token must verify against the fallback secret.
    const mine = await req('GET', '/api/applications/mine', null, regToken ? regToken[1] : undefined);
    ok('registered token authenticates on protected route', mine.status === 200, `got ${mine.status} ${mine.body.slice(0, 120)}`);

    const login = await req('POST', '/api/auth/login', { email, password: 'Password1!' });
    ok('POST /api/auth/login -> 200 on warm instance', login.status === 200, `got ${login.status} ${login.body.slice(0, 120)}`);

    const badLogin = await req('POST', '/api/auth/login', { email, password: 'wrong' });
    ok('wrong password still rejected -> 401 (not 500)', badLogin.status === 401, `got ${badLogin.status}`);

    const noAuth = await req('GET', '/api/applications/mine');
    ok('protected route without token -> 401', noAuth.status === 401, `got ${noAuth.status}`);

    const healthDb = await req('GET', '/api/health/db');
    ok('GET /api/health/db -> 200 with writable/counts', healthDb.status === 200 && /"writable":true/.test(healthDb.body), `${healthDb.status} ${healthDb.body.slice(0, 140)}`);
  }

  if (mode === 'probe-bootstrap') {
    const login = await req('POST', '/api/auth/login', {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    ok('cold-boot admin seed: admin can log in', login.status === 200, `${login.status} ${login.body.slice(0, 100)}`);
    const token = login.status === 200 ? JSON.parse(login.body).data.token : null;

    const me = await req('GET', '/api/users/stats', null, token);
    ok('admin token works (RBAC reachable)', me.status === 200, `got ${me.status}`);

    const jobs = await req('GET', '/api/jobs');
    const jobCount = jobs.status === 200 ? JSON.parse(jobs.body).data.jobs.length : -1;
    ok('SEED_DEMO_JOBS populated the jobs table', jobCount >= 6, `count=${jobCount}`);

    // Idempotency: requiring the bootstrap module again in a new boot must
    // not duplicate anything (simulated here in-process; api/index.js runs it
    // once per cold boot).
    const { ensureProductionSeed } = require('../backend/database/bootstrap');
    const second = ensureProductionSeed();
    ok('second boot: admin idempotent (exists)', second.admin === 'exists', second.admin);
    ok('second boot: demo jobs not duplicated', second.demoJobs === 'already-present', second.demoJobs);
  }

  server.close();
  console.log(`[verify] ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('[verify] crashed:', err);
  process.exit(2);
});
