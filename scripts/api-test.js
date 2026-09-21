'use strict';

/**
 * End-to-end API test suite. Run with the server up:
 *   node scripts/api-test.js
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

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

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { status: res.status, json };
}

async function main() {
  console.log(`\nTesting API at ${BASE}\n`);

  // ---- health & public jobs ----
  const health = await req('GET', '/api/health');
  ok('GET /api/health -> 200', health.status === 200);

  const seedJob = await req('POST', '/api/jobs', {
    token: (await req('POST', '/api/auth/login', { body: { email: 'admin@jobportal.local', password: 'Admin@12345' } })).json.data.token,
    body: { title: 'Seed Job', company: 'SeedCo', location: 'Chennai', type: 'Full-time', salary: '10 LPA', description: 'Seeded via test script for baseline data.' },
  });
  ok('Admin can create job (201)', seedJob.status === 201, JSON.stringify(seedJob.json));
  const seedJobId = seedJob.json?.data?.job?.id;

  const jobs = await req('GET', '/api/jobs');
  ok('GET /api/jobs -> 200 with jobs array', jobs.status === 200 && Array.isArray(jobs.json?.data?.jobs));
  ok('Jobs response has no password exposure', JSON.stringify(jobs.json).includes('password') === false);

  const filtered = await req('GET', '/api/jobs?search=seed&location=chennai&type=Full-time');
  ok('GET /api/jobs?search&location&type filters', filtered.status === 200 && filtered.json.data.jobs.some((j) => j.id === seedJobId));

  const jobDetail = await req('GET', `/api/jobs/${seedJobId}`);
  ok('GET /api/jobs/:id -> 200', jobDetail.status === 200 && jobDetail.json.data.job.title === 'Seed Job');

  const job404 = await req('GET', '/api/jobs/999999');
  ok('GET /api/jobs/999999 -> 404', job404.status === 404);

  // ---- registration ----
  const uniq = Date.now();
  const reg = await req('POST', '/api/auth/register', {
    body: { name: 'Test User', email: `user${uniq}@test.com`, password: 'secret123' },
  });
  ok('POST /api/auth/register -> 201', reg.status === 201, JSON.stringify(reg.json));
  ok('Registered role is always "user"', reg.json?.data?.user?.role === 'user');
  ok('Register response has no password hash', !('password_hash' in (reg.json?.data?.user || {})));

  const regDup = await req('POST', '/api/auth/register', {
    body: { name: 'Test User', email: `user${uniq}@test.com`, password: 'secret123' },
  });
  ok('Duplicate email register -> 409', regDup.status === 409);

  const regBad = await req('POST', '/api/auth/register', {
    body: { name: '', email: 'not-an-email', password: '123' },
  });
  ok('Invalid registration -> 400', regBad.status === 400);

  const regRoleAttack = await req('POST', '/api/auth/register', {
    body: { name: 'Sneaky', email: `sneaky${uniq}@test.com`, password: 'secret123', role: 'admin' },
  });
  ok('Register with role=admin still gets "user"', regRoleAttack.status === 201 && regRoleAttack.json.data.user.role === 'user');

  // ---- login ----
  const badLogin = await req('POST', '/api/auth/login', { body: { email: `user${uniq}@test.com`, password: 'wrongpass' } });
  ok('Wrong password login -> 401', badLogin.status === 401);

  const userLogin = await req('POST', '/api/auth/login', { body: { email: `user${uniq}@test.com`, password: 'secret123' } });
  ok('User login -> 200 with token', userLogin.status === 200 && !!userLogin.json?.data?.token);
  const userToken = userLogin.json.data.token;

  const adminLogin = await req('POST', '/api/auth/login', { body: { email: 'admin@jobportal.local', password: 'Admin@12345' } });
  ok('Admin login -> 200 with token', adminLogin.status === 200 && adminLogin.json.data.user.role === 'admin');
  const adminToken = adminLogin.json.data.token;

  // ---- applications (user) ----
  const applyNoAuth = await req('POST', '/api/applications', { body: { job_id: seedJobId } });
  ok('Apply without token -> 401', applyNoAuth.status === 401);

  const apply = await req('POST', '/api/applications', { token: userToken, body: { job_id: seedJobId, note: 'I am interested.' } });
  ok('Apply -> 201 with status Pending', apply.status === 201 && apply.json.data.application.status === 'Pending', JSON.stringify(apply.json));

  const user2Login = await req('POST', '/api/auth/login', { body: { email: `sneaky${uniq}@test.com`, password: 'secret123' } });
  const user2Token = user2Login.json.data.token;

  const dupApply = await req('POST', '/api/applications', { token: userToken, body: { job_id: seedJobId } });
  ok('Duplicate application -> 409', dupApply.status === 409);

  const applyBadJob = await req('POST', '/api/applications', { token: userToken, body: { job_id: 999999 } });
  ok('Apply to nonexistent job -> 404', applyBadJob.status === 404);

  const mine = await req('GET', '/api/applications/mine', { token: userToken });
  ok('GET /api/applications/mine -> 200 with own applications', mine.status === 200 && mine.json.data.applications.length === 1 && mine.json.data.applications[0].job_id === seedJobId);

  const mineNoAuth = await req('GET', '/api/applications/mine');
  ok('GET /api/applications/mine without token -> 401', mineNoAuth.status === 401);

  // Isolation: user2 applied to nothing, must not see user1's applications.
  const mine2 = await req('GET', '/api/applications/mine', { token: user2Token });
  ok('Applications isolation (user2 sees none)', mine2.status === 200 && mine2.json.data.applications.length === 0);

  // ---- admin-only guards ----
  const applyAsAdmin = await req('POST', '/api/applications', { token: adminToken, body: { job_id: seedJobId } });
  ok('Admin cannot apply (403)', applyAsAdmin.status === 403);

  const mineAsAdmin = await req('GET', '/api/applications/mine', { token: adminToken });
  ok('Admin cannot access /mine (403)', mineAsAdmin.status === 403);

  const allAppsAsUser = await req('GET', '/api/applications', { token: userToken });
  ok('User cannot list all applications (403)', allAppsAsUser.status === 403);

  const allAppsNoAuth = await req('GET', '/api/applications');
  ok('List applications without token -> 401', allAppsNoAuth.status === 401);

  const createJobAsUser = await req('POST', '/api/jobs', { token: userToken, body: { title: 'X', company: 'Y', location: 'Z', type: 'Full-time', description: 'D' } });
  ok('User cannot create job (403)', createJobAsUser.status === 403);

  const patchAppAsUser = await req('PATCH', '/api/applications/1', { token: userToken, body: { status: 'Hired' } });
  ok('User cannot update application status (403)', patchAppAsUser.status === 403);

  const usersAsUser = await req('GET', '/api/users', { token: userToken });
  ok('User cannot list users (403)', usersAsUser.status === 403);

  // ---- admin: applications ----
  const allApps = await req('GET', '/api/applications', { token: adminToken });
  ok('Admin lists all applications with applicant info', allApps.status === 200 && allApps.json.data.applications.some((a) => a.applicant_email === `user${uniq}@test.com`));

  const appId = allApps.json.data.applications.find((a) => a.applicant_email === `user${uniq}@test.com`).id;
  const patch = await req('PATCH', `/api/applications/${appId}`, { token: adminToken, body: { status: 'Shortlisted' } });
  ok('Admin updates status -> 200 Shortlisted', patch.status === 200 && patch.json.data.application.status === 'Shortlisted');

  const patchBad = await req('PATCH', `/api/applications/${appId}`, { token: adminToken, body: { status: 'BribeAccepted' } });
  ok('Invalid status -> 400', patchBad.status === 400);

  const mineAfter = await req('GET', '/api/applications/mine', { token: userToken });
  ok('User sees updated status in /mine', mineAfter.json.data.applications[0].status === 'Shortlisted');

  // ---- admin: jobs CRUD ----
  const createJob = await req('POST', '/api/jobs', { token: adminToken, body: { title: 'Backend Engineer', company: 'Acme', location: 'Remote', type: 'Remote', salary: '$120k', description: 'Node.js APIs.' } });
  ok('Admin create job -> 201', createJob.status === 201);
  const newJobId = createJob.json.data.job.id;

  const badJob = await req('POST', '/api/jobs', { token: adminToken, body: { title: '', company: 'Acme', location: 'X', type: 'Wizard', description: 'D' } });
  ok('Create job with invalid fields -> 400', badJob.status === 400);

  const putJob = await req('PUT', `/api/jobs/${newJobId}`, { token: adminToken, body: { title: 'Senior Backend Engineer', salary: '$140k' } });
  ok('Admin edit job -> 200', putJob.status === 200 && putJob.json.data.job.title === 'Senior Backend Engineer');

  const delJob = await req('DELETE', `/api/jobs/${newJobId}`, { token: adminToken });
  ok('Admin delete job -> 200', delJob.status === 200);

  const delJob404 = await req('DELETE', `/api/jobs/${newJobId}`, { token: adminToken });
  ok('Delete missing job -> 404', delJob404.status === 404);

  // ---- admin: users ----
  const users = await req('GET', '/api/users', { token: adminToken });
  ok('Admin lists users, no password_hash', users.status === 200 && users.json.data.users.length >= 2 && !JSON.stringify(users.json).includes('password_hash'));

  const targetUser = users.json.data.users.find((u) => u.email === `user${uniq}@test.com`);
  const patchUser = await req('PATCH', `/api/users/${targetUser.id}`, { token: adminToken, body: { name: 'Renamed User', role: 'admin' } });
  ok('Admin updates user name/role -> 200', patchUser.status === 200 && patchUser.json.data.user.role === 'admin');

  const patchUserBack = await req('PATCH', `/api/users/${targetUser.id}`, { token: adminToken, body: { role: 'user' } });
  ok('Admin demotes user back -> 200', patchUserBack.status === 200);

  const patchSelfDemote = await req('PATCH', `/api/users/1`, { token: adminToken, body: { role: 'user' } });
  ok('Admin cannot demote self -> 400', patchSelfDemote.status === 400);

  const patchSelfDelete = await req('DELETE', '/api/users/1', { token: adminToken });
  ok('Admin cannot delete self -> 400', patchSelfDelete.status === 400);

  const patchUserBadRole = await req('PATCH', `/api/users/${targetUser.id}`, { token: adminToken, body: { role: 'superadmin' } });
  ok('Invalid role -> 400', patchUserBadRole.status === 400);

  const patchUserDupEmail = await req('PATCH', `/api/users/${targetUser.id}`, { token: adminToken, body: { email: 'admin@jobportal.local' } });
  ok('Duplicate email on update -> 409', patchUserDupEmail.status === 409);

  // ---- stats & misc ----
  const stats = await req('GET', '/api/users/stats', { token: adminToken });
  ok('Admin dashboard stats -> 200', stats.status === 200 && typeof stats.json.data.totals.users === 'number');

  const statsAsUser = await req('GET', '/api/users/stats', { token: userToken });
  ok('Stats as normal user -> 403', statsAsUser.status === 403);

  const unknown = await req('GET', '/api/unknown');
  ok('Unknown API route -> 404 JSON', unknown.status === 404 && unknown.json?.success === false);

  const delUser = await req('DELETE', `/api/users/${targetUser.id}`, { token: adminToken });
  ok('Admin deletes user -> 200', delUser.status === 200);

  const cascadeCheck = await req('GET', '/api/applications', { token: adminToken });
  ok('Cascade: deleted user applications removed', cascadeCheck.status === 200 && !cascadeCheck.json.data.applications.some((a) => a.applicant_email === `user${uniq}@test.com`));

  // ---- summary ----
  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
