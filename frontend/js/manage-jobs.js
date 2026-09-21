'use strict';

/* Manage Jobs (admin) — HireHub design. */

let allJobs = [];
const jobModal = document.getElementById('jobModal');
const deleteModal = document.getElementById('deleteModal');
const manageState = { search: '', type: 'all' };

const TYPE_ICONS = {
  'Full-time': 'code',
  'Part-time': 'schedule',
  'Contract': 'handshake',
  'Internship': 'school',
  'Temporary': 'hourglass_top',
  'Remote': 'public',
};

function openModal(job = null) {
  document.getElementById('modalTitle').textContent = job ? 'Edit Job Requisition' : 'Post New Job';
  document.getElementById('modalSubmit').textContent = job ? 'Save Changes' : 'Post Requisition';
  document.getElementById('jobId').value = job ? job.id : '';
  document.getElementById('jTitle').value = job?.title || '';
  document.getElementById('jCompany').value = job?.company || '';
  document.getElementById('jLocation').value = job?.location || '';
  document.getElementById('jType').value = job?.type || 'Full-time';
  document.getElementById('jSalary').value = job?.salary || '';
  document.getElementById('jDescription').value = job?.description || '';
  document.getElementById('modalAlert').innerHTML = '';
  jobModal.style.display = 'flex';
}

function closeModal() {
  jobModal.style.display = 'none';
}

let pendingDeleteId = null;

function openDeleteModal(job) {
  pendingDeleteId = job.id;
  document.getElementById('deleteTargetJob').textContent = `“${job.title}”`;
  deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
  pendingDeleteId = null;
}

function visibleJobs() {
  let rows = allJobs;
  if (manageState.type !== 'all') rows = rows.filter((j) => j.type === manageState.type);
  if (manageState.search) {
    const q = manageState.search.toLowerCase();
    rows = rows.filter((j) =>
      j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
  }
  return rows;
}

function metricsStrip(jobs) {
  const withApps = 0; // per-job counts are not exposed by the API; totals come from the dashboard.
  return `
    <div class="stats-grid cols-4" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
      <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <span class="overline">Total Postings</span>
          <div class="num" style="margin-top:4px">${jobs.length}</div>
          <span class="small muted">All requisitions on the platform</span>
        </div>
        <div class="stat-icon" style="width:48px;height:48px"><span class="msi" style="font-size:26px">work_outline</span></div>
      </div>
      <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <span class="overline">Accepting Applications</span>
          <div class="num" style="margin-top:4px">${jobs.length}</div>
          <span class="small muted">Visible in the public directory</span>
        </div>
        <div class="stat-icon" style="width:48px;height:48px;background:rgba(189,236,226,0.5)"><span class="msi" style="font-size:26px">check_circle</span></div>
      </div>
      <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <span class="overline">Companies Hiring</span>
          <div class="num" style="margin-top:4px">${new Set(jobs.map((j) => j.company)).size}</div>
          <span class="small muted">Distinct employers</span>
        </div>
        <div class="stat-icon" style="width:48px;height:48px;background:rgba(156,242,232,0.4)"><span class="msi" style="font-size:26px">apartment</span></div>
      </div>
    </div>`;
}

function jobsTable(jobs) {
  if (!jobs.length) {
    const filtered = allJobs.length > 0;
    return `
      <div class="empty-state">
        <div class="big-ico"><span class="msi">work_off</span></div>
        <h3>No Job Requisitions Found</h3>
        <p>${filtered
          ? 'No job postings match your active search filters. Try clearing them.'
          : 'No positions have been published yet. Create the first requisition.'}</p>
        <div class="row">
          ${filtered ? '<button class="btn btn-secondary" id="clearAllFilters">Clear All Filters</button>' : ''}
          <button class="btn btn-primary" id="emptyNewJob">+ Post New Job</button>
        </div>
      </div>`;
  }

  return `
    <div class="table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th style="padding-left:24px">Job Role &amp; Discipline</th>
              <th>Company</th><th>Location</th><th>Type</th><th>Salary</th><th>Created</th>
              <th style="text-align:right;padding-right:24px">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${jobs.map((j) => `
              <tr>
                <td style="padding-left:24px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="job-logo" style="width:36px;height:36px;background:#e2e7ff;border:none">
                      <span class="msi" style="font-size:20px;color:var(--primary)">${TYPE_ICONS[j.type] || 'code'}</span>
                    </div>
                    <div style="min-width:0">
                      <a href="/job-details.html?id=${j.id}" class="semibold" style="color:var(--ink);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(j.title)}</a>
                      <span class="small muted tnum">Req #${String(j.id).padStart(3, '0')}</span>
                    </div>
                  </div>
                </td>
                <td class="medium" style="color:var(--ink)">${esc(j.company)}</td>
                <td class="muted"><span class="msi" style="font-size:16px;vertical-align:-3px">location_on</span> ${esc(j.location)}</td>
                <td>
                  <span class="chip" style="padding:3px 10px;font-weight:600">${esc(j.type)}</span>
                </td>
                <td class="semibold tnum" style="color:var(--ink)">${j.salary ? esc(j.salary) : '<span class="muted">—</span>'}</td>
                <td class="muted small tnum">${esc(fmtDate(j.created_at))}</td>
                <td class="td-actions" style="padding-right:24px">
                  <div class="inline">
                    <button class="icon-btn" data-edit="${j.id}" title="Edit Job"><span class="msi">edit</span></button>
                    <button class="icon-btn danger" data-del="${j.id}" title="Delete Job"><span class="msi">delete</span></button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:12px 24px;background:rgba(241,245,249,0.4);border-top:1px solid var(--border)">
        <span class="muted small">Showing <b style="color:var(--ink)">${jobs.length}</b> of <b style="color:var(--ink)">${allJobs.length}</b> job postings</span>
      </div>
    </div>`;
}

function bindRowActions() {
  document.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      // The list endpoint returns only a snippet; fetch the full record so the
      // edit form is prefilled completely (description is required).
      const id = Number(btn.dataset.edit);
      btn.disabled = true;
      try {
        const { job } = await API.get(`/api/jobs/${id}`);
        openModal(job);
      } catch (err) {
        toast(err.message, 'error');
      }
      btn.disabled = false;
    })
  );
  document.querySelectorAll('[data-del]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const job = allJobs.find((j) => j.id === Number(btn.dataset.del));
      openDeleteModal(job);
    })
  );
  const clear = document.getElementById('clearAllFilters');
  if (clear) clear.addEventListener('click', resetFilters);
  const emptyNew = document.getElementById('emptyNewJob');
  if (emptyNew) emptyNew.addEventListener('click', () => openModal());
}

function rerenderTable() {
  const zone = document.getElementById('tableZone');
  zone.innerHTML = jobsTable(visibleJobs());
  bindRowActions();
}

async function loadJobs() {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = '';

  try {
    const { jobs } = await API.get('/api/jobs?page_size=100');
    allJobs = jobs;

    document.getElementById('content').innerHTML = `
      <div class="page-head">
        <div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <h1>Manage Jobs</h1>
            <span class="head-count">${allJobs.length} total</span>
          </div>
          <p class="lede">Create, edit, and manage job listings across the platform.</p>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="newJobBtn">
            <span class="msi">add</span><span>Post New Job</span>
          </button>
        </div>
      </div>
      ${metricsStrip(allJobs)}
      <div class="card" style="padding:16px;margin-bottom:24px">
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
            <div class="input-icon" style="flex:1;min-width:240px;max-width:480px">
              <span class="msi">search</span>
              <input class="input fill" id="searchInput" placeholder="Search jobs by title or company…" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div class="select-wrap">
                <select class="input fill" id="typeFilter">
                  <option value="all">All Types</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Temporary</option>
                  <option>Remote</option>
                </select>
                <span class="msi chev">expand_more</span>
              </div>
              <button class="btn btn-ghost btn-sm" id="resetBtn">
                <span class="msi" style="font-size:16px">restart_alt</span><span>Clear filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="tableZone">${jobsTable(visibleJobs())}</div>`;

    document.getElementById('newJobBtn').addEventListener('click', () => openModal());
    document.getElementById('searchInput').addEventListener('input', (e) => {
      manageState.search = e.target.value.trim().toLowerCase();
      rerenderTable();
    });
    document.getElementById('typeFilter').addEventListener('change', (e) => {
      manageState.type = e.target.value;
      rerenderTable();
    });
    document.getElementById('resetBtn').addEventListener('click', resetFilters);

    bindRowActions();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Couldn't load jobs</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

function resetFilters() {
  manageState.search = '';
  manageState.type = 'all';
  const s = document.getElementById('searchInput');
  const t = document.getElementById('typeFilter');
  if (s) s.value = '';
  if (t) t.value = 'all';
  rerenderTable();
}

async function saveJob(e) {
  e.preventDefault();
  const alertBox = document.getElementById('modalAlert');
  const btn = document.getElementById('modalSubmit');
  btn.disabled = true;
  alertBox.innerHTML = '';

  const id = document.getElementById('jobId').value;
  const payload = {
    title: document.getElementById('jTitle').value,
    company: document.getElementById('jCompany').value,
    location: document.getElementById('jLocation').value,
    type: document.getElementById('jType').value,
    salary: document.getElementById('jSalary').value,
    description: document.getElementById('jDescription').value,
  };

  try {
    if (id) {
      await API.put(`/api/jobs/${id}`, payload);
      toast('Requisition updated successfully.');
    } else {
      await API.post('/api/jobs', payload);
      toast('Job requisition posted successfully.');
    }
    closeModal();
    loadJobs();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error" style="margin:0"><span class="msi">error</span><div><p class="t">Save failed</p><p class="small">${esc(err.message)}</p></div></div>`;
    btn.disabled = false;
  }
}

UI.requireAdmin();
UI.renderAdminShell('manage-jobs');

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
jobModal.addEventListener('click', (e) => { if (e.target === jobModal) closeModal(); });
document.getElementById('deleteCancel').addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });
document.getElementById('deleteConfirm').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const btn = document.getElementById('deleteConfirm');
  btn.disabled = true;
  try {
    await API.del(`/api/jobs/${pendingDeleteId}`);
    toast('Job requisition removed from registry.');
    closeDeleteModal();
    loadJobs();
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
  }
});
document.getElementById('jobForm').addEventListener('submit', saveJob);

loadJobs();

// Deep link: /manage-jobs.html?new=1 opens the Post modal (used by dashboard shortcut).
if (qsParam('new') === '1') {
  const tryOpen = () => {
    if (allJobs) openModal();
  };
  setTimeout(tryOpen, 400);
}
