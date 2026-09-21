'use strict';

/**
 * Shared frontend API client + token storage + rendering helpers.
 * Token is kept in localStorage (key: jp_token), user info in jp_user.
 */

const API = {
  tokenKey: 'hh_token',
  userKey: 'hh_user',

  /** Migrate any pre-rebrand session keys. */
  init() {
    try {
      const t = localStorage.getItem('jp_token');
      const u = localStorage.getItem('jp_user');
      if (t && !localStorage.getItem(this.tokenKey)) localStorage.setItem(this.tokenKey, t);
      if (u && !localStorage.getItem(this.userKey)) localStorage.setItem(this.userKey, u);
      localStorage.removeItem('jp_token');
      localStorage.removeItem('jp_user');
    } catch { /* private mode */ }
  },

  getToken() {
    return localStorage.getItem(this.tokenKey);
  },
  setSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.userKey) || 'null');
    } catch {
      return null;
    }
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  isAdmin() {
    return this.getUser()?.role === 'admin';
  },
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  },

  /** Core request helper. Throws { status, message } on non-2xx. */
  async request(method, path, body, { auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw { status: 0, message: 'Cannot reach the server. Is it running?' };
    }

    let json = null;
    try { json = await res.json(); } catch { /* no body */ }

    // Expired/invalid session → clear and send to login.
    if (res.status === 401 && this.isLoggedIn() && path !== '/api/auth/login') {
      this.logout();
      window.location.href = '/login.html?expired=1';
      throw { status: 401, message: 'Session expired.' };
    }

    if (!res.ok) {
      throw { status: res.status, message: json?.message || `Request failed (${res.status})` };
    }
    return json.data;
  },

  get(path, opts) { return this.request('GET', path, undefined, opts); },
  post(path, body, opts) { return this.request('POST', path, body, opts); },
  put(path, body, opts) { return this.request('PUT', path, body, opts); },
  patch(path, body, opts) { return this.request('PATCH', path, body, opts); },
  del(path, opts) { return this.request('DELETE', path, undefined, opts); },
};

API.init();

/** Escape a string for safe HTML interpolation. */
function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** HireHub wordmark — from the approved Stitch wordmark design. */
function brandMark(size = 36) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0f766e"/>
      <path d="M11 12v12M25 12v12M11 18h14" stroke="#ffffff" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="25" cy="12" r="2.2" fill="#5eead4"/>
    </svg>`;
}

/** "Hire<Hub>" wordmark text with brand colours. */
function brandText() {
  return 'Hire<span style="color:var(--primary)">Hub</span>';
}

/** Two-letter initials for avatars. */
function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

/** Company logo initial for job cards. */
function jobLogo(job) {
  return esc((job?.company || '?').trim().charAt(0).toUpperCase());
}

/** "2h ago" style relative time. */
function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(String(iso).replace(' ', 'T') + (String(iso).includes('Z') || String(iso).includes('T') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return '';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
}

/** Status pill for the pipeline statuses. */
function statusBadge(status) {
  return `<span class="status-badge status-${esc(status)}"><span class="dot"></span>${esc(status)}</span>`;
}

/** Show a short-lived toast message (HireHub dark toast). */
function toast(message, type = 'success') {
  let host = document.getElementById('toast');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast';
    document.body.appendChild(host);
  }
  const item = document.createElement('div');
  item.className = `toast-item ${type}`;
  item.innerHTML = `<span class="msi">${type === 'error' ? 'error' : 'check_circle'}</span><span></span>`;
  item.querySelector('span:last-child').textContent = message;
  host.appendChild(item);
  setTimeout(() => item.remove(), 3500);
}

/** Read a query-string parameter. */
function qsParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Format an ISO date string for display. */
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(String(iso).replace(' ', 'T') + (String(iso).includes('Z') ? '' : 'Z'));
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
