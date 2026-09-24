# Job Portal / Mini LMS

A full-stack job portal where **users** browse and apply for jobs and **admins** manage jobs, applications, and users.

**Stack:** HTML5/CSS3/Vanilla JS · Node.js + Express · SQLite (via Node's built-in `node:sqlite`) · JWT · bcrypt

---

## Quick start

```bash
npm install
cp .env.example .env          # then set JWT_SECRET (see below)
npm run seed                  # create the initial admin account
npm start                     # serves API + frontend on http://localhost:3000
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The seed script reads `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` from `.env` (or prompts interactively if unset). If the admin email already exists, it promotes that account to `admin` instead of failing. Public registration **always** creates `user`-role accounts.

> Requires Node.js ≥ 22.5 (uses the built-in `node:sqlite` module — no native build step).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | **Required.** JWT signing secret |
| `JWT_EXPIRES_IN` | Token TTL (default `8h`) |
| `CORS_ORIGINS` | Comma-separated allowed origins for production |
| `DB_PATH` | Custom SQLite file location |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed script credentials |

`.env` is git-ignored — never commit secrets.

## Pages

| Page | Path | Access |
| --- | --- | --- |
| Jobs listing / search | `/` | Public |
| Job details + apply | `/job-details.html?id=N` | Public (apply = user) |
| Login / Register | `/login.html`, `/register.html` | Public |
| My Applications | `/applications.html` | User |
| Admin Dashboard | `/admin-dashboard.html` | Admin |
| Manage Jobs | `/manage-jobs.html` | Admin |
| Applications review | `/admin-applications.html` | Admin |
| Users management | `/users.html` | Admin |

## API overview

Consistent responses: `{ "success": true, "data": … }` / `{ "success": false, "message": "…" }`.

### Auth (public)
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | Always creates `user` role; 409 on duplicate email |
| POST | `/api/auth/login` | Returns JWT + safe user object |

### Jobs
| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/jobs?search=&location=&type=&page=` | Public |
| GET | `/api/jobs/:id` | Public (404 if missing) |
| POST | `/api/jobs` | Admin |
| PUT | `/api/jobs/:id` | Admin |
| DELETE | `/api/jobs/:id` | Admin (applications cascade) |

### Applications
| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/applications` | User — status forced to `Pending`; duplicate = 409 |
| GET | `/api/applications/mine` | User — own applications only |
| GET | `/api/applications?status=` | Admin — includes applicant + job info |
| PATCH | `/api/applications/:id` | Admin — status ∈ Pending/Shortlisted/Hired/Rejected |
| DELETE | `/api/applications/:id` | Admin |

### Users & stats (admin)
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/users` | No password hashes |
| PATCH | `/api/users/:id` | name / email / role (valid roles only) |
| DELETE | `/api/users/:id` | Applications cascade |
| GET | `/api/users/stats` | Dashboard counts + recent applications |

Health check: `GET /api/health`.

## Security

- bcrypt password hashing (10 rounds) — plaintext never stored or returned
- JWT (`HS256`) in `Authorization: Bearer` headers; secret from env only
- Middleware chain: `authenticateToken` → `requireAdmin` / `requireUser`
- All SQL uses prepared statements (`node:sqlite` parameter binding)
- Duplicate applications blocked by a DB unique index + explicit 409 check
- Roles/statuses validated server-side against allow-lists; client-supplied `role`/`status` on registration/apply are ignored
- Consistent 400/401/403/404/409/500 JSON errors via central error handler
- CORS restricted to configured origins (localhost allowed in dev)
- Self-protection: admins cannot demote or delete their own account

## Tests

With the server running:

```bash
node scripts/api-test.js
```

51 end-to-end checks covering registration, login, RBAC guards, duplicate prevention, CRUD, cascade deletes, and error codes.

## Project structure

```
job-portal/
├── backend/
│   ├── server.js               # Express app: CORS, routes, static hosting
│   ├── database/
│   │   ├── db.js               # SQLite layer + schema (FKs, cascade, unique index)
│   │   ├── jobportal.db        # created at runtime (git-ignored)
│   │   └── seed.js             # initial admin from env vars
│   ├── routes/                 # auth, jobs, applications, users
│   ├── controllers/            # request handlers + validation
│   ├── middleware/             # JWT auth, RBAC, error handling
│   └── utils/helpers.js        # responses, validation, constants
├── frontend/
│   ├── *.html                  # 9 pages (4 public + 1 user + 4 admin)
│   ├── css/style.css
│   └── js/                     # api client, navbar/guards, per-page scripts
├── scripts/api-test.js         # end-to-end API test suite
├── api/index.js                # Vercel serverless entry (wraps the Express app)
├── vercel.json                 # Vercel: static output + /api rewrites
├── .env.example
└── package.json
```

## Deployment notes

- Serve behind a reverse proxy (nginx/Caddy) with TLS; set `CORS_ORIGINS` to your frontend origin.
- The Express server hosts both the API and the static frontend, so a single origin works out of the box.
- Back up `backend/database/jobportal.db` (WAL mode enabled); or point `DB_PATH` at persistent storage.
- Run `npm run seed` once during provisioning to create the first admin.

### Deploying to Vercel

The repo ships with Vercel configuration (`vercel.json` + `api/index.js`), so importing the project into Vercel works with defaults:

- **Frontend** — the `frontend/` directory is deployed as static output and served from the CDN at `/` (pages like `/login` resolve via a rewrite to `/login.html`).
- **API** — every `/api/*` request is routed to `api/index.js`, a Node 22 serverless function that wraps the existing Express app (`backend/server.js`) unchanged.
- **Environment variables** — set `JWT_SECRET` in Project → Settings → Environment Variables (plus `JWT_EXPIRES_IN` if you want a different token TTL). `CORS_ORIGINS` is not needed because the frontend and API share one origin.
- **Initial admin + demo data** — on a fresh Vercel deployment the SQLite database starts empty. Set `ADMIN_PASSWORD` as an environment variable to have the demo admin (`admin@demo.com` by default; override the email with `ADMIN_EMAIL`) created automatically on the first cold boot — idempotent: the account is only created if that email is not already present, and existing users are never promoted. Optionally set `SEED_DEMO_JOBS=1` to populate the jobs table on an empty database. Local development is unaffected (`npm run seed`). Note: on Vercel the SQLite database is ephemeral (per cold start), so a seeded admin only survives within a warm instance — durable production data requires the hosted-DB swap described below.

**SQLite limitation on Vercel:** serverless deployments get an ephemeral, read-only-filesystem sandbox. The database is created under `/tmp` per cold start, so the schema works and reads succeed, but **any data written (users, jobs, applications) does not persist** between invocations, and concurrent function instances see separate databases. This is fine for a local/demo deployment of the API surface, but for real production data on Vercel you must swap `backend/database/db.js` to a hosted database (e.g. Turso/libSQL, which is SQLite-compatible, or Neon/Supabase Postgres) — the query layer is small and isolated, so only that one file needs to change. `DB_PATH` remains available for persistent-disk hosts (Fly.io, Railway volumes, VPS).
