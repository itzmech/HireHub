'use strict';

/* Admin dashboard — HireHub design: KPIs, pipeline breakdown, shortcuts, recent applications. */

async function loadDashboard() {
  const content = document.getElementById('content');

  try {
    const { totals, applications_by_status: byStatus, recent_applications: recent } =
      await API.get('/api/users/stats');

    const pipeline = UI.pipelineBar(byStatus);

    const kpi = (label, icon, value, sub) => `
      <div class="stat">
        <div class="stat-top">
          <span class="lbl">${label}</span>
          <span class="stat-icon"><span class="msi">${icon}</span></span>
        </div>
        <div class="num tnum">${value}</div>
        <div class="sub">${sub}</div>
      </div>`;

    content.innerHTML = `
      <!-- Title header -->
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <p class="lede">Platform metrics, recruitment pipeline, and job management overview.</p>
        </div>
        <div class="actions">
          <a class="btn btn-light" href="/admin-applications.html">
            <span class="msi">assignment_turned_in</span><span>Review Pipeline</span>
          </a>
          <a class="btn btn-primary" href="/manage-jobs.html?new=1">
            <span class="msi">add</span><span>Post New Job</span>
          </a>
        </div>
      </div>

      <!-- KPI grid -->
      <div class="stats-grid cols-4">
        ${kpi('Total Users', 'group', totals.users, `<span>All registered accounts</span>`)}
        ${kpi('Total Jobs', 'work_outline', totals.jobs, `<span><span class="k">${totals.jobs}</span> published listings</span>`)}
        ${kpi('Total Applications', 'description', totals.applications, `<span>Candidate submissions</span>`)}
        ${kpi('Pending Review', 'pending_actions', byStatus.Pending, `<span style="color:var(--ink-3)" class="medium">Immediate recruiter action needed</span>`)}
      </div>

      <!-- Pipeline + shortcuts -->
      <div style="display:grid;grid-template-columns:1fr;gap:24px;margin-bottom:24px" id="pipelineGrid">
        <div class="card card-pad">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px">
            <div>
              <h2 class="widget-title">Application Pipeline Breakdown</h2>
              <p class="widget-sub">Real-time candidate phase distributions across all requisitions</p>
            </div>
            <span class="chip tnum">${pipeline.total} Total</span>
          </div>
          <div class="seg-bar" style="margin:16px 0">${pipeline.bar || '<div style="width:100%"></div>'}</div>
          <div class="pipeline-pills">${pipeline.pills}</div>
          <div style="margin-top:24px;padding-top:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;background:var(--canvas);border-radius:var(--r-ctl);padding:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="msi" style="color:var(--primary)">insights</span>
              <span class="small medium" style="color:var(--ink)">HireHub pipeline: <b style="color:var(--primary)">${byStatus.Hired} hired</b> of ${pipeline.total} applications</span>
            </div>
            <span class="overline">Live from SQLite</span>
          </div>
        </div>

        <div class="card card-pad">
          <h2 class="widget-title">Fast Shortcuts</h2>
          <p class="widget-sub" style="margin-bottom:16px">Administrative operations &amp; workflow triggers</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <a class="shortcut" href="/manage-jobs.html?new=1">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="ico"><span class="msi">add_circle</span></span>
                <span class="txt"><span class="t">Post New Job Requisition</span><br/><span class="d">Create and publish open role</span></span>
              </div>
              <span class="msi">chevron_right</span>
            </a>
            <a class="shortcut" href="/admin-applications.html?status=Pending">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="ico alt"><span class="msi">assignment_turned_in</span></span>
                <span class="txt"><span class="t">Review ${byStatus.Pending} Pending</span><br/><span class="d">Batch screening queue</span></span>
              </div>
              <span class="msi">chevron_right</span>
            </a>
            <a class="shortcut" href="/users.html">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="ico dark"><span class="msi">admin_panel_settings</span></span>
                <span class="txt"><span class="t">Manage User Directory</span><br/><span class="d">Role permissions &amp; access</span></span>
              </div>
              <span class="msi">chevron_right</span>
            </a>
          </div>
          <div style="margin-top:16px;padding:12px;border-radius:var(--r-ctl);background:var(--surface-2);display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="width:8px;height:8px;border-radius:9999px;background:var(--primary)"></span>
              <span class="small muted">System Status: <b style="color:var(--ink)" class="medium">All APIs Operational</b></span>
            </div>
            <span class="overline">v2.0</span>
          </div>
        </div>
      </div>

      <!-- Recent applications -->
      <div class="card card-pad">
        <div style="display:flex;flex-direction:column;gap:12px;padding-bottom:16px" class="recent-head">
          <div>
            <h2 class="widget-title">Recent Applications</h2>
            <p class="widget-sub">Most recent candidate submissions awaiting or undergoing evaluation</p>
          </div>
          <a class="semibold" style="font-size:0.75rem;display:inline-flex;align-items:center;gap:4px" href="/admin-applications.html">
            View All (${pipeline.total}) <span class="msi" style="font-size:16px">arrow_forward</span>
          </a>
        </div>
        <div class="table-scroll">
          ${recent.length ? `
          <table class="data">
            <thead>
              <tr><th style="padding-left:0">Candidate</th><th>Job Title</th><th>Applied Date</th><th>Status</th><th style="text-align:right">Actions</th></tr>
            </thead>
            <tbody>
              ${recent.map((a) => `
                <tr>
                  <td style="padding-left:0">
                    <div style="display:flex;align-items:center;gap:12px">
                      <span class="avatar-initials" style="width:36px;height:36px;background:var(--primary-soft);color:var(--primary);font-size:0.75rem">${esc(initials(a.applicant_name))}</span>
                      <div>
                        <div class="semibold" style="color:var(--ink)">${esc(a.applicant_name)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="medium" style="color:var(--ink)">${esc(a.job_title)}</div>
                    <div class="small muted">${esc(a.job_company)}</div>
                  </td>
                  <td class="muted tnum">${esc(timeAgo(a.created_at))}</td>
                  <td>${statusBadge(a.status)}</td>
                  <td class="td-actions">
                    <a class="btn btn-secondary btn-sm" href="/admin-applications.html">Review</a>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>` : `
          <div class="empty-state" style="border:none;box-shadow:none">
            <div class="big-ico"><span class="msi">person_search</span></div>
            <h3>No applications yet</h3>
            <p>Candidate submissions will appear here as soon as they come in.</p>
          </div>`}
        </div>
      </div>`;

    // Two-column pipeline layout on wide screens (Stitch: 8/4 split).
    const pg = document.getElementById('pipelineGrid');
    const applySplit = () => {
      if (window.innerWidth >= 1024) {
        pg.style.gridTemplateColumns = 'minmax(0, 2fr) minmax(0, 1fr)';
      } else {
        pg.style.gridTemplateColumns = '1fr';
      }
    };
    applySplit();
    window.addEventListener('resize', applySplit);
  } catch (err) {
    content.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Couldn't load the dashboard</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

UI.requireAdmin();
UI.renderAdminShell('dashboard');
loadDashboard();
