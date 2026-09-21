'use strict';

/* My Applications (user only) — refined HireHub design. */

const mineState = { filter: 'all', search: '' };

const NEXT_STEP = {
  Pending: { icon: 'hourglass_empty', label: 'Under review', cls: 'muted medium' },
  Shortlisted: { icon: 'event', label: 'Technical interview', cls: 'medium', color: 'var(--primary)' },
  Hired: { icon: 'task_alt', label: 'Offer accepted', cls: 'medium', color: '#166534' },
  Rejected: { icon: 'cancel', label: 'Application closed', cls: 'muted medium' },
};

function summaryCards(counts, total) {
  const card = (label, dot, n, sub) => `
    <div class="stat" style="padding:20px">
      <div class="stat-top" style="margin-bottom:16px">
        <span class="lbl">${label}</span>
        ${dot ? `<span style="width:8px;height:8px;border-radius:9999px;${dot}"></span>` : ''}
      </div>
      <div class="num">${n}</div>
      <div class="sub">${sub}</div>
    </div>`;
  return `
    <div class="stats-grid cols-4">
      ${card('Total Applications', '', total, `<span>Across ${new Set(mineAll.map((a) => a.company)).size} companies</span>`)}
      ${card('Pending', 'background:#f59e0b', counts.Pending, '<span>Awaiting review</span>')}
      ${card('Shortlisted', 'background:#0ea5e9', counts.Shortlisted, '<span>Moving forward</span>')}
      ${card('Hired', 'background:#22c55e', counts.Hired, '<span>Offer accepted</span>')}
    </div>`;
}

function overviewBar(counts, total) {
  const seg = (label, cls, n) =>
    n > 0 ? `<div class="${cls}" style="flex:${n}" title="${label}: ${n}"></div>` : '';
  return `
    <div class="card" style="padding:16px;margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
        <span class="headline-sm" style="font-size:0.875rem">Application Status Overview</span>
        <span class="muted small tnum">${total} total submission${total === 1 ? '' : 's'} tracked</span>
      </div>
      <div class="seg-bar sm">
        ${seg('Pending', 'seg-pending', counts.Pending)}
        ${seg('Shortlisted', 'seg-shortlisted', counts.Shortlisted)}
        ${seg('Hired', 'seg-hired', counts.Hired)}
        ${seg('Rejected', 'seg-rejected', counts.Rejected)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid rgba(189,201,198,0.2)" class="legend-grid">
        ${[['Pending', 'seg-pending', counts.Pending], ['Shortlisted', 'seg-shortlisted', counts.Shortlisted],
           ['Hired', 'seg-hired', counts.Hired], ['Rejected', 'seg-rejected', counts.Rejected]]
          .map(([l, c, n]) => `
          <div style="display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:9999px" class="${c}"></span>
            <span class="medium" style="color:var(--ink)">${l}</span>
            <span class="small muted tnum" style="margin-left:auto;background:var(--surface-2);border-radius:4px;padding:1px 6px">${n}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function filterTabs(counts) {
  const tab = (key, label, n) => `
    <button class="filter-tab" data-filter="${key}" style="${mineState.filter === key ? activeTabStyle() : idleTabStyle()}">
      ${label} <span class="tab-count" style="${mineState.filter === key ? 'background:var(--primary);color:#fff' : ''}">${n}</span>
    </button>`;
  return `
    <div style="display:flex;align-items:center;gap:4px;overflow-x:auto" id="filterTabs">
      ${tab('all', 'All', mineAll.length)}
      ${tab('Pending', 'Pending', counts.Pending)}
      ${tab('Shortlisted', 'Shortlisted', counts.Shortlisted)}
      ${tab('Hired', 'Hired', counts.Hired)}
      ${tab('Rejected', 'Rejected', counts.Rejected)}
    </div>`;
}

function activeTabStyle() {
  return 'background:var(--primary-soft);color:var(--primary)';
}
function idleTabStyle() {
  return 'background:transparent;color:var(--ink-3)';
}

function applicationsTable(list) {
  if (!list.length) {
    return `
      <div class="empty-state" style="margin-top:16px">
        <div class="big-ico"><span class="msi">work_outline</span></div>
        <h3>No applications ${mineAll.length ? 'match your filters' : 'yet'}</h3>
        <p>${mineAll.length
          ? "We couldn't find any applications matching your filters. Try clearing the search or picking another status."
          : "You haven't applied to any jobs yet. Browse open positions across top companies and track them here in real time."}</p>
        <div class="row">
          ${mineAll.length ? '<button class="btn btn-secondary" id="resetFiltersBtn">Reset Filters</button>' : ''}
          <a class="btn btn-primary" href="/index.html"><span class="msi">search</span><span>Browse Jobs</span></a>
        </div>
      </div>`;
  }

  return `
    <div class="table-card" style="margin-top:16px">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th style="padding-left:24px">Job</th><th>Company</th><th>Location</th>
              <th>Applied Date</th><th>Status</th><th>Next Step</th><th style="text-align:right;padding-right:24px">Action</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((a) => {
              const step = NEXT_STEP[a.status] || NEXT_STEP.Pending;
              return `
              <tr>
                <td style="padding-left:24px">
                  <div style="display:flex;align-items:center;gap:12px;min-width:0">
                    <div class="job-logo" style="width:32px;height:32px;font-size:0.75rem">${esc((a.company || '?').charAt(0).toUpperCase())}</div>
                    <div style="min-width:0">
                      <a href="/job-details.html?id=${a.job_id}" class="semibold" style="color:var(--ink);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.title)}</a>
                      <span class="muted small">${esc(a.type || '')}${a.note ? ' • has note' : ''}</span>
                    </div>
                  </div>
                </td>
                <td class="medium" style="color:var(--ink)">${esc(a.company)}</td>
                <td class="muted small" style="white-space:nowrap"><span class="msi" style="font-size:15px;color:var(--ink-4);vertical-align:-3px">location_on</span> ${esc(a.location)}</td>
                <td class="muted small" style="white-space:nowrap">${esc(fmtDate(a.created_at))}</td>
                <td>${statusBadge(a.status)}</td>
                <td style="white-space:nowrap">
                  <span class="small medium ${step.cls}" style="${step.color ? `color:${step.color}` : ''}">
                    <span class="msi" style="font-size:15px;vertical-align:-3px">${step.icon}</span> ${step.label}
                  </span>
                </td>
                <td class="td-actions" style="padding-right:24px">
                  <a class="semibold" href="/job-details.html?id=${a.job_id}">View Job</a>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:12px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <span class="muted small">Showing <b style="color:var(--ink)">${list.length}</b> of <b style="color:var(--ink)">${mineAll.length}</b> total applications</span>
      </div>
    </div>`;
}

let mineAll = [];

function visibleRows() {
  let rows = mineAll;
  if (mineState.filter !== 'all') rows = rows.filter((a) => a.status === mineState.filter);
  if (mineState.search) {
    const q = mineState.search.toLowerCase();
    rows = rows.filter((a) =>
      a.title.toLowerCase().includes(q) || a.company.toLowerCase().includes(q));
  }
  return rows;
}

function rerenderTable() {
  const counts = { Pending: 0, Shortlisted: 0, Hired: 0, Rejected: 0 };
  for (const a of mineAll) counts[a.status] = (counts[a.status] || 0) + 1;

  const tabsWrap = document.getElementById('filterTabs');
  if (tabsWrap) {
    tabsWrap.outerHTML = `<div id="filterTabs" style="display:flex;align-items:center;gap:4px;overflow-x:auto">${filterTabs(counts)}</div>`;
    bindTabs();
  }
  document.getElementById('tableZone').innerHTML = applicationsTable(visibleRows());
  const reset = document.getElementById('resetFiltersBtn');
  if (reset) reset.addEventListener('click', resetFilters);
}

function bindTabs() {
  document.querySelectorAll('#filterTabs .filter-tab').forEach((b) =>
    b.addEventListener('click', () => {
      mineState.filter = b.dataset.filter;
      rerenderTable();
    })
  );
}

function resetFilters() {
  mineState.filter = 'all';
  mineState.search = '';
  document.getElementById('tableSearch').value = '';
  rerenderTable();
}

async function loadMine() {
  const content = document.getElementById('content');
  try {
    const { applications } = await API.get('/api/applications/mine?page_size=100');
    mineAll = applications;

    if (!mineAll.length) {
      content.innerHTML = `
        <div class="empty-state" style="margin-top:8px">
          <div class="big-ico"><span class="msi">work_outline</span></div>
          <h3>No applications yet</h3>
          <p>You haven't applied to any jobs yet. Browse open positions across top companies and track them here in real time.</p>
          <div class="row"><a class="btn btn-primary" href="/index.html"><span class="msi">search</span><span>Browse Jobs</span></a></div>
        </div>`;
      return;
    }

    const counts = { Pending: 0, Shortlisted: 0, Hired: 0, Rejected: 0 };
    for (const a of mineAll) counts[a.status] = (counts[a.status] || 0) + 1;

    content.innerHTML = `
      ${summaryCards(counts, mineAll.length)}
      ${overviewBar(counts, mineAll.length)}
      <div class="card" style="margin-top:16px">
        <div style="padding:14px 24px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:12px" id="toolbar">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div id="filterTabs" style="display:flex;align-items:center;gap:4px;overflow-x:auto">${filterTabs(counts)}</div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div class="input-icon" style="width:240px;max-width:100%">
                <span class="msi">search</span>
                <input class="input" id="tableSearch" style="padding:6px 12px 6px 34px;font-size:0.75rem"
                  placeholder="Search applications by title or company…" />
              </div>
              <button class="btn btn-secondary btn-sm" id="btnReset">
                <span class="msi" style="font-size:14px">restart_alt</span><span>Reset</span>
              </button>
            </div>
          </div>
        </div>
        <div id="tableZone">${applicationsTable(visibleRows())}</div>
      </div>`;

    bindTabs();
    document.getElementById('tableSearch').addEventListener('input', (e) => {
      mineState.search = e.target.value.trim().toLowerCase();
      rerenderTable();
    });
    document.getElementById('btnReset').addEventListener('click', resetFilters);
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Couldn't load applications</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

UI.requireUser();
UI.renderPublicNav('applications');
UI.renderFooter();
loadMine();
