'use strict';

/**
 * Shared page shells + route guards (HireHub design).
 * Public pages:  UI.renderPublicNav('jobs' | 'applications')
 * Admin pages:   UI.renderAdminShell('dashboard' | 'manage-jobs' | 'admin-applications' | 'users')
 * Both include UI.renderFooter() targets (#footer) and guards.
 */

const UI = {
  /* ---------- Public shell ---------- */
  renderPublicNav(activeKey) {
    const mount = document.getElementById('navbar');
    if (!mount) return;

    const user = API.getUser();
    const logged = API.isLoggedIn();
    const page = activeKey || document.body.dataset.page;

    const navLink = (href, label, key) =>
      `<a href="${href}" class="${page === key ? 'active' : ''}">${label}</a>`;

    const nav = logged
      ? `${navLink('/index.html', 'Jobs', 'jobs')}
         ${API.isAdmin() ? '' : navLink('/applications.html', 'My Applications', 'applications')}`
      : navLink('/index.html', 'Jobs', 'jobs');

    const right = logged
      ? `<a href="/admin-dashboard.html" class="btn btn-ghost btn-sm" style="display:none" id="adminPortalLink">
           <span class="msi" style="font-size:16px">shield_person</span>Admin Portal</a>
         <div class="nav-user">
           <span class="avatar">${esc(initials(user?.name))}</span>
           <span class="who">
             <span class="name">${esc(user?.name || 'User')}</span>
             <span class="role">${esc(user?.role === 'admin' ? 'Admin' : 'Candidate')}</span>
           </span>
         </div>
         <button class="btn btn-secondary btn-sm" id="logoutBtn">Logout</button>`
      : `<a href="/login.html" class="btn btn-secondary btn-sm">Log in</a>
         <a href="/register.html" class="btn btn-primary btn-sm">Sign up</a>`;

    mount.innerHTML = `
      <header class="pub-header">
        <div class="inner">
          <div style="display:flex;align-items:center;gap:32px;min-width:0">
            <a class="brand" href="/index.html">${brandMark(36)}<span class="headline-sm" style="font-weight:700;letter-spacing:-0.02em">${brandText()}</span></a>
            <nav class="pub-nav">${nav}</nav>
          </div>
          <div class="nav-right">${right}</div>
        </div>
      </header>`;

    // Only expose the admin shortcut to admins (frontend convenience only; API is authoritative).
    const adminLink = document.getElementById('adminPortalLink');
    if (adminLink && API.isAdmin()) adminLink.style.display = 'inline-flex';

    this.bindLogout();
  },

  /* ---------- Admin shell (sidebar + topbar) ---------- */
  renderAdminShell(activeKey) {
    const sidebarMount = document.getElementById('sidebar');
    const topbarMount = document.getElementById('topbar');
    const user = API.getUser();

    const item = (href, icon, label, key) => `
      <a href="${href}" class="${activeKey === key ? 'active' : ''}">
        <span class="msi">${icon}</span><span>${label}</span>
      </a>`;

    if (sidebarMount) {
      sidebarMount.className = 'admin-sidebar';
      sidebarMount.innerHTML = `
        <div>
          <div class="side-head">
            <a class="brand" href="/admin-dashboard.html" style="gap:10px">
              ${brandMark(32)}<span class="headline-sm" style="font-weight:700;letter-spacing:-0.02em">${brandText()}</span>
            </a>
            <span class="admin-badge">ADMIN</span>
          </div>
          <nav class="side-nav">
            ${item('/admin-dashboard.html', 'dashboard', 'Dashboard', 'dashboard')}
            ${item('/manage-jobs.html', 'work_outline', 'Manage Jobs', 'manage-jobs')}
            ${item('/admin-applications.html', 'description', 'Applications', 'admin-applications')}
            ${item('/users.html', 'group', 'Users', 'users')}
          </nav>
        </div>
        <div>
          <nav class="side-nav">
            ${item('/index.html', 'arrow_back', 'Back to Portal', '__portal')}
          </nav>
        </div>`;
    }

    if (topbarMount) {
      topbarMount.innerHTML = `
        <header class="admin-topbar">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="menu-btn" id="menuBtn" aria-label="Toggle navigation">
              <span class="msi">menu</span>
            </button>
            <span class="crumb"><span class="msi">tune</span>Recruitment Operations Control Center</span>
          </div>
          <div class="nav-right">
            <div class="nav-user">
              <span class="avatar">${esc(initials(user?.name))}</span>
              <span class="who">
                <span class="name">${esc(user?.name || 'Admin')}</span>
                <span class="role">Admin</span>
              </span>
            </div>
            <button class="btn btn-secondary btn-sm" id="logoutBtn">
              <span class="msi" style="font-size:16px">logout</span>Logout</button>
          </div>
        </header>`;

      const menuBtn = document.getElementById('menuBtn');
      if (menuBtn && sidebarMount) {
        menuBtn.addEventListener('click', () => sidebarMount.classList.toggle('open'));
        document.addEventListener('click', (e) => {
          if (
            sidebarMount.classList.contains('open') &&
            !sidebarMount.contains(e.target) &&
            !menuBtn.contains(e.target)
          ) {
            sidebarMount.classList.remove('open');
          }
        });
      }
    }

    this.bindLogout();
  },

  /* ---------- Footer ---------- */
  renderFooter() {
    const mount = document.getElementById('footer');
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site">
        <div class="inner">
          <div class="links">
            <a href="/index.html">About HireHub</a><span class="dotsep">•</span>
            <a href="/index.html">Privacy Policy</a><span class="dotsep">•</span>
            <a href="/index.html">Terms of Service</a><span class="dotsep">•</span>
            <a href="/index.html">Support</a>
          </div>
          <div>© 2026 HireHub. All rights reserved.</div>
        </div>
      </footer>`;
  },

  bindLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        API.logout();
        window.location.href = '/index.html';
      });
    }
  },

  /** Redirect unauthenticated users to login. Returns the user object. */
  requireAuth() {
    if (!API.isLoggedIn()) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/login.html?next=${next}`);
      throw new Error('redirecting');
    }
    return API.getUser();
  },

  /** Require an authenticated admin (backend remains authoritative). */
  requireAdmin() {
    const user = this.requireAuth();
    if (user?.role !== 'admin') {
      window.location.replace('/index.html?denied=admin');
      throw new Error('redirecting');
    }
    return user;
  },

  /** Require an authenticated job-seeker (role "user"). */
  requireUser() {
    const user = this.requireAuth();
    if (user?.role !== 'user') {
      window.location.replace('/index.html?denied=user');
      throw new Error('redirecting');
    }
    return user;
  },

  /** Segmented pipeline bar + legend pills (admin dashboard). */
  pipelineBar(byStatus) {
    const total = byStatus.Pending + byStatus.Shortlisted + byStatus.Hired + byStatus.Rejected;
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    const defs = [
      ['Pending', 'seg-pending', byStatus.Pending],
      ['Shortlisted', 'seg-shortlisted', byStatus.Shortlisted],
      ['Hired', 'seg-hired', byStatus.Hired],
      ['Rejected', 'seg-rejected', byStatus.Rejected],
    ];
    const bar = defs
      .map(([label, cls, n]) =>
        n > 0 ? `<div class="${cls}" style="width:${pct(n)}%" title="${label}: ${n} (${pct(n)}%)"></div>` : '')
      .join('');
    const pills = defs
      .map(
        ([label, cls, n]) => `
        <div class="pill">
          <div class="lab"><span class="pd ${cls}"></span>${label}</div>
          <div class="val"><b>${n}</b><span>${pct(n)}%</span></div>
        </div>`
      )
      .join('');
    return { total, bar, pills };
  },
};
