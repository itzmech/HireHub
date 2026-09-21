'use strict';

/* Admin Applications — HireHub design with triage drawer. */

let allApplications = [];
let counts = { Pending: 0, Shortlisted: 0, Hired: 0, Rejected: 0 };
const filterState = { status: '', search: '' };
const STATUSES = ['Pending', 'Shortlisted', 'Hired', 'Rejected'];

const DECISION_SUB = {
  Pending: 'Hold for team check',
  Shortlisted: 'Advance to interview',
  Hired: 'Prepare onboarding',
  Rejected: 'Send rejection mail',
};
const DECISION_DOT = {
  Pending: '#f59e0b',
  Shortlisted: '#6366f1',
  Hired: '#22c55e',
  Rejected: '#ef4444',
};

/* ---------- Triage drawer ---------- */
let drawerAppId = null;
let drawerStatus = 'Pending';

function openDrawer(app) {
  drawerAppId = app.id;
  drawerStatus = app.status;
  document.getElementById('drawerInitials').textContent = initials(app.applicant_name);
  document.getElementById('drawerName').textContent = app.applicant_name;
  document.getElementById('drawerRole').textContent = app.job_title;
  document.getElementById('drawerCompany').textContent = app.job_company;
  document.getElementById('drawerNote').textContent = app.note
    ? `“${app.note}”`
    : 'No cover note was submitted with this application.';
  renderDecisionButtons();
  document.getElementById('drawerBackdrop').classList.add('open');
  document.getElementById('drawerPanel').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawerBackdrop').classList.remove('open');
  document.getElementById('drawerPanel').classList.remove('open');
  drawerAppId = null;
}

function renderDecisionButtons() {
  const wrap = document.getElementById('decisionButtons');
  wrap.innerHTML = STATUSES.map((s) => `
    <button class="decision-btn ${s === drawerStatus ? 'selected' : ''}" data-status="${s}">
      <span class="pd" style="background:${DECISION_DOT[s]}"></span>
      <span><span class="t">${s}</span><br/><span class="d">${DECISION_SUB[s]}</span></span>
    </button>`).join('');
  wrap.querySelectorAll('.decision-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      drawerStatus = btn.dataset.status;
      renderDecisionButtons();
    })
  );
}

document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerCancel').addEventListener('click', closeDrawer);
document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);

document.getElementById('drawerSave').addEventListener('click', async () => {
  if (!drawerAppId) return;
  const btn = document.getElementById('drawerSave');
  btn.disabled = true;
  try {
    await API.patch(`/api/applications/${drawerAppId}`, { status: drawerStatus });
    toast(`Application moved to “${drawerStatus}”`);
    closeDrawer();
    loadApps();
  } catch (err) {
    toast(err.message, 'error');
  }
  btn.disabled = false;
});

/* ---------- Metrics ---------- */
function metricCards() {
  const card = (label, icon, iconBg, iconColor, value, pill, sub) => `
    <div class="stat">
      <div class="stat-top" style="margin-bottom:12px">
        <span class="overline" style="font-weight:600">${label}</span>
        <span class="stat-icon" style="width:32px;height:32px;background:${iconBg};color:${iconColor}">
          <span class="msi" style="font-size:18px">${icon}</span>
        </span>
      </div>
      <div class="num tnum">${value}</div>
      <div class="sub">${pill ? pill : ''} ${sub}</div>
    </div>`;

  return `
    <div class="stats-grid cols-5">
      ${card('Total Pipeline', 'view_list', 'var(--surface-2)', 'var(--primary)',
        counts.Pending + counts.Shortlisted + counts.Hired + counts.Rejected, '', `<span>Across all postings</span>`)}
      ${card('Pending Review', 'pending', '#fef3c7', '#b45309',
        counts.Pending, `<span class="status-badge status-Pending"><span class="dot"></span>Requires Action</span>`, '')}
      ${card('Shortlisted', 'bookmark', '#e0e7ff', '#4338ca',
        counts.Shortlisted, '', `<span>Invited to interview round</span>`)}
      ${card('Hired Candidates', 'verified', '#dcfce7', '#047857',
        counts.Hired, '', `<span>Offers accepted</span>`)}
      ${card('Rejected', 'block', '#fee2e2', '#be123c',
        counts.Rejected, '', `<span>Applications closed</span>`)}
    </div>`;
}

/* ---------- Table ---------- */
function applicationsTable(list) {
  if (!list.length) {
    return `
      <div class="empty-state">
        <div class="big-ico"><span class="msi">person_search</span></div>
        <h3>No candidate applications found</h3>
        <p>We couldn't find any applications matching your selected filters or search terms. Try clearing parameters.</p>
        <div class="row"><button class="btn btn-secondary" id="emptyReset">Clear All Filters</button></div>
      </div>`;
  }

  return `
    <div class="table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th style="padding-left:24px">Applicant</th>
              <th>Job Applied</th>
              <th>Company</th>
              <th>Applied</th>
              <th style="max-width:220px">Application Note</th>
              <th>Status</th>
              <th style="text-align:right;padding-right:24px">Triage Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((a) => `
              <tr data-id="${a.id}">
                <td style="padding-left:24px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <span class="avatar-initials" style="width:40px;height:40px;background:var(--primary-soft);color:var(--primary);font-size:0.875rem">${esc(initials(a.applicant_name))}</span>
                    <div style="min-width:0">
                      <span class="semibold" style="color:var(--ink);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.applicant_name)}</span>
                      <span class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">${esc(a.applicant_email)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="semibold" style="color:var(--ink)">${esc(a.job_title)}</div>
                  <span class="small muted tnum">Req #${String(a.job_id).padStart(3, '0')}</span>
                </td>
                <td><span style="display:flex;align-items:center;gap:6px"><span class="msi" style="font-size:16px;color:var(--ink-3)">apartment</span>${esc(a.job_company)}</span></td>
                <td>
                  <div class="medium tnum" style="color:var(--ink)">${esc(fmtDate(a.created_at))}</div>
                  <div class="small muted">${esc(timeAgo(a.created_at))}</div>
                </td>
                <td style="max-width:220px">
                  <span class="small muted" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                    ${a.note ? `“${esc(a.note)}”` : '—'}
                  </span>
                </td>
                <td>${statusBadge(a.status)}</td>
                <td class="td-actions" style="padding-right:24px">
                  <div class="inline">
                    <div class="select-wrap">
                      <select class="input" style="padding:5px 26px 5px 8px;font-size:0.75rem;font-weight:600" data-app="${a.id}" data-current="${esc(a.status)}">
                        ${STATUSES.map((s) => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                      </select>
                      <span class="msi chev" style="font-size:16px">expand_more</span>
                    </div>
                    <button class="icon-btn" data-drawer="${a.id}" title="Full Candidate Details">
                      <span class="msi">open_in_new</span>
                    </button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:12px 24px;background:rgba(241,245,249,0.3);border-top:1px solid var(--border)">
        <span class="muted small">Showing <b style="color:var(--ink)">${list.length}</b> of <b style="color:var(--ink)">${allApplications.length}</b> applications</span>
      </div>
    </div>`;
}

function bindTableActions() {
  document.querySelectorAll('select[data-app]').forEach((sel) =>
    sel.addEventListener('change', async () => {
      const id = sel.dataset.app;
      const newStatus = sel.value;
      sel.disabled = true;
      try {
        await API.patch(`/api/applications/${id}`, { status: newStatus });
        toast(`Candidate updated to ${newStatus}`);
      } catch (err) {
        toast(err.message, 'error');
      }
      sel.disabled = false;
      loadApps(); // refresh badges + metric counts
    })
  );
  document.querySelectorAll('[data-drawer]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const app = allApplications.find((a) => a.id === Number(btn.dataset.drawer));
      if (app) openDrawer(app);
    })
  );
  const reset = document.getElementById('emptyReset');
  if (reset) reset.addEventListener('click', resetFilters);
}

function rerenderTable() {
  let rows = allApplications;
  if (filterState.status) rows = rows.filter((a) => a.status === filterState.status);
  if (filterState.search) {
    const q = filterState.search.toLowerCase();
    rows = rows.filter((a) =>
      a.applicant_name.toLowerCase().includes(q) ||
      a.applicant_email.toLowerCase().includes(q) ||
      a.job_title.toLowerCase().includes(q));
  }
  document.getElementById('tableZone').innerHTML = applicationsTable(rows);
  bindTableActions();
}

/* ---------- Load ---------- */
async function loadApps() {
  const alertBox = document.getElementById('alertBox');
  try {
    const qs = new URLSearchParams({ page_size: '100' });
    if (filterState.status) qs.set('status', filterState.status);
    const data = await API.get(`/api/applications?${qs}`);
    allApplications = data.applications;
    counts = data.counts;

    // Preserve search when reloading after a status change.
    const searchSnapshot = filterState.search;

    const content = document.getElementById('content');
    if (!document.getElementById('pageHeader')) {
      content.innerHTML = `
        <div class="page-head" id="pageHeader">
          <div>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <h1 class="display-lg">Applications</h1>
              <span class="head-count" id="activeCount">${allApplications.length} active</span>
            </div>
            <p class="lede">Review, manage, and audit candidate applications submitted across all published job requisitions.</p>
          </div>
          <div class="actions">
            <button class="btn btn-light" id="refreshBtn">
              <span class="msi">sync</span><span>Refresh Pipeline</span>
            </button>
          </div>
        </div>
        ${metricCards()}
        <div class="card" style="padding:16px;margin-bottom:24px" id="filterBar">
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
            <div class="input-icon" style="flex:1;min-width:240px;max-width:480px">
              <span class="msi">search</span>
              <input class="input fill" id="searchInput" placeholder="Search applicant name, email, or role…" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div class="select-wrap">
                <select class="input fill" id="statusFilter">
                  <option value="">All Statuses</option>
                  ${STATUSES.map((s) => `<option value="${s}">${s === 'Pending' ? 'Pending Review' : s}</option>`).join('')}
                </select>
                <span class="msi chev">expand_more</span>
              </div>
              <button class="icon-btn" id="resetBtn" title="Reset Filters"><span class="msi">restart_alt</span></button>
            </div>
          </div>
        </div>
        <div id="tableZone"></div>`;

      document.getElementById('refreshBtn').addEventListener('click', loadApps);
      document.getElementById('searchInput').addEventListener('input', (e) => {
        filterState.search = e.target.value.trim().toLowerCase();
        rerenderTable();
      });
      document.getElementById('statusFilter').addEventListener('change', (e) => {
        filterState.status = e.target.value;
        rerenderTable();
      });
      document.getElementById('resetBtn').addEventListener('click', resetFilters);
      document.getElementById('searchInput').value = searchSnapshot;
    } else {
      const active = document.getElementById('activeCount');
      if (active) active.textContent = `${allApplications.length} active`;
      const statusSel = document.getElementById('statusFilter');
      if (statusSel) statusSel.value = filterState.status;
    }

    rerenderTable();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Couldn't load applications</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

function resetFilters() {
  filterState.status = '';
  filterState.search = '';
  const s = document.getElementById('searchInput');
  const st = document.getElementById('statusFilter');
  if (s) s.value = '';
  if (st) st.value = '';
  rerenderTable();
}

UI.requireAdmin();
UI.renderAdminShell('admin-applications');

// Deep link support: /admin-applications.html?status=Pending (dashboard shortcut).
const deepStatus = qsParam('status');
if (deepStatus && STATUSES.includes(deepStatus)) filterState.status = deepStatus;

loadApps();
