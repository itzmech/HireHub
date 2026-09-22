'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { notFoundHandler, errorHandler } = require('./middleware/errors');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const usersRoutes = require('./routes/users');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---- CORS ---------------------------------------------------------------
// Allowed origins come from CORS_ORIGINS (comma-separated). In development,
// any localhost/127.0.0.1 origin is permitted for convenience.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // curl / same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// ---- Body parsing -------------------------------------------------------
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ---- API routes ---------------------------------------------------------
app.use('/api/auth', authRoutes.router);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes); // includes /api/users/stats

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

// Deployment/database diagnostics: confirms the API is live, the SQLite schema
// initialized, and SELECT/INSERT round-trips work in the current runtime.
app.get('/api/health/db', (req, res) => {
  try {
    const db = require('./database/db');
    db.run(
      "INSERT INTO jobs (title, company, location, type, salary, description) VALUES ('__healthcheck__', '__healthcheck__', '__healthcheck__', 'Full-time', NULL, 'Temporary diagnostic row; deleted immediately.')"
    );
    const row = db.get("SELECT COUNT(*) AS n FROM jobs WHERE title = '__healthcheck__'");
    db.run("DELETE FROM jobs WHERE title = '__healthcheck__'");
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'sqlite',
        writable: row.n === 1,
        userCount: db.get('SELECT COUNT(*) AS n FROM users').n,
        jobCount: db.get('SELECT COUNT(*) AS n FROM jobs').n,
        persistent: !process.env.VERCEL,
      },
    });
  } catch (err) {
    console.error('[health/db]', err.code || '', err.message);
    res.status(503).json({ success: false, message: `Database unavailable: ${err.code || err.message}` });
  }
});

// ---- Static frontend ----------------------------------------------------
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR, { extensions: ['html'] }));

// ---- Error handling -----------------------------------------------------
app.use(notFoundHandler); // API 404s (JSON)
app.use(errorHandler);

// Start the HTTP server only when this file is run directly
// (`npm start` / `npm run dev`). When imported (e.g. by the Vercel serverless
// entry in api/index.js), the app is exported without binding a port.
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`HireHub API + frontend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
