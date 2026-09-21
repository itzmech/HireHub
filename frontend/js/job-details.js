'use strict';

/* Job details page — HireHub design: breadcrumb, header, attributes, description, sticky apply card. */

const jobId = Number(qsParam('id'));

function sectionTitle(label) {
  return `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="width:6px;height:16px;border-radius:9999px;background:var(--primary)"></span>
      <h2 class="overline" style="color:var(--ink-3);font-weight:700">${esc(label)}</h2>
    </div>`;
}

function renderJob(job, appliedState) {
  const box = document.getElementById('jobBox');
  const loggedIn = API.isLoggedIn();
  const isAdmin = API.isAdmin();
  const { applied, status } = appliedState;

  document.getElementById('crumbCompany').textContent = job.company;
  document.getElementById('crumbTitle').textContent = job.title;
  document.title = `${job.title} — HireHub`;

  let applyCard = '';
  if (!loggedIn) {
    applyCard = `
      <div class="alert alert-info" style="margin-bottom:0">
        <span class="msi">info</span>
        <div>
          <p class="t" style="font-weight:600;color:var(--ink)">Sign in to apply</p>
          <p class="small" style="margin-top:2px">
            <a href="/login.html?next=${encodeURIComponent('/job-details.html?id=' + jobId)}">Log in</a> or
            <a href="/register.html">create an account</a> to apply for this position.
          </p>
        </div>
      </div>`;
  } else if (isAdmin) {
    applyCard = `
      <div class="alert alert-info" style="margin-bottom:0">
        <span class="msi">shield_person</span>
        <div>
          <p class="t" style="font-weight:600;color:var(--ink)">Admins cannot apply</p>
          <p class="small" style="margin-top:2px">Manage this job from the <a href="/manage-jobs.html">Manage Jobs</a> panel.</p>
        </div>
      </div>`;
  } else if (applied) {
    applyCard = `
      <div class="kv-note" style="flex-direction:column;align-items:stretch;gap:8px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:8px">
          <span class="msi">task_alt</span>
          <p><b>You already applied</b> — status: ${statusBadge(status)}</p>
        </div>
        <p>Track it on <a href="/applications.html">My Applications</a>.</p>
      </div>
      <div style="display:flex;gap:8px">
        <a class="btn btn-secondary btn-block" href="/applications.html">View My Applications</a>
        <a class="btn btn-primary btn-block" href="/index.html">Explore More Jobs</a>
      </div>`;
  } else {
    applyCard = `
      <form id="applyForm" style="display:flex;flex-direction:column;gap:16px">
        <div class="kv-note">
          <span class="msi">description</span>
          <p>Your application is linked to <b>${esc(API.getUser()?.name || 'your profile')}</b> (${esc(API.getUser()?.email || '')}).</p>
        </div>
        <div class="field">
          <label for="applyNote">Add a note or cover letter <span class="hint">(Optional)</span></label>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="hint">Introduce yourself and highlight relevant experience…</span>
            <span class="overline" id="charCounter">0/500</span>
          </div>
          <textarea class="input" id="applyNote" maxlength="500" style="min-height:112px;background:rgba(241,245,249,0.4)"
            placeholder="Introduce yourself and highlight relevant experience…"></textarea>
        </div>
        <div class="kv-note">
          <span class="msi">shield</span>
          <p><b>One application permitted per role.</b> Your submission will be permanently logged against your HireHub profile.</p>
        </div>
        <button type="submit" class="btn btn-primary btn-block" id="submitBtn" style="padding:12px">
          <span class="msi">send</span><span>Submit Application</span>
        </button>
        <p class="muted small" style="text-align:center">
          By clicking apply, your profile details will be securely shared with ${esc(job.company)} recruiters.
        </p>
      </form>`;
  }

  box.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr;gap:32px;align-items:start" id="detailGrid">
      <!-- Left: job article -->
      <article class="card card-pad" style="display:flex;flex-direction:column;gap:32px">
        <header style="display:flex;flex-direction:column;gap:16px;border-bottom:1px solid rgba(189,201,198,0.2);padding-bottom:24px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div style="display:flex;gap:16px;min-width:0">
              <div class="job-logo" style="width:56px;height:56px;border-radius:var(--r-xl);background:var(--primary-soft);border:none">
                ${jobLogo(job)}
              </div>
              <div style="min-width:0">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <span class="headline-sm">${esc(job.company)}</span>
                  <span class="chip" style="padding:2px 8px"><span class="msi" style="font-size:14px;color:var(--primary)">verified</span>Verified Employer</span>
                </div>
                <h1 class="display-lg" style="margin-top:4px">${esc(job.title)}</h1>
              </div>
            </div>
            ${job.salary ? `
            <div style="text-align:right;flex-shrink:0">
              <div class="headline-md bold" style="color:var(--primary)">${esc(job.salary)}</div>
              <div class="small muted">Annual Compensation</div>
            </div>` : ''}
          </div>
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;color:var(--ink-3)">
            <span style="display:inline-flex;align-items:center;gap:6px"><span class="msi" style="color:var(--primary);font-size:18px">location_on</span>${esc(job.location)}</span>
            <span style="color:#cbd5e1">•</span>
            <span style="display:inline-flex;align-items:center;gap:6px"><span class="msi" style="color:var(--primary);font-size:18px">schedule</span>${esc(job.type)}</span>
            <span style="color:#cbd5e1">•</span>
            <span style="display:inline-flex;align-items:center;gap:6px"><span class="msi" style="color:var(--primary);font-size:18px">history</span>Posted ${esc(timeAgo(job.created_at))}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <span class="chip"><span class="msi">workspace_premium</span>${esc(job.type)} position</span>
            <span class="chip"><span class="msi">group</span>Open to applicants</span>
            ${job.salary ? `<span class="chip accent"><span class="msi">payments</span>${esc(job.salary)}</span>` : ''}
          </div>
        </header>

        <section style="display:flex;flex-direction:column;gap:12px">
          ${sectionTitle('About The Role')}
          <p style="color:var(--ink);font-size:1rem;line-height:1.6;white-space:pre-wrap">${esc(job.description)}</p>
        </section>
      </article>

      <!-- Right: sticky apply card -->
      <aside id="applyAside">
        <div class="card card-pad" id="applySticky" style="display:flex;flex-direction:column;gap:16px">
          <div style="border-bottom:1px solid rgba(189,201,198,0.2);padding-bottom:8px">
            <h2 class="headline-sm">Apply for this position</h2>
            <p class="small muted" style="margin-top:2px">${esc(job.company)} • ${esc(job.location)}</p>
          </div>
          ${applyCard}
        </div>
      </aside>
    </div>`;

  // Sticky behaviour on desktop (Stitch: aside sticky top-20)
  const grid = document.getElementById('detailGrid');
  const aside = document.getElementById('applyAside');
  const sticky = document.getElementById('applySticky');
  const enableSticky = () => {
    if (window.innerWidth >= 1024) {
      grid.style.gridTemplateColumns = 'minmax(0,1fr) 384px';
      aside.style.position = 'sticky';
      aside.style.top = '88px';
    } else {
      grid.style.gridTemplateColumns = '1fr';
      aside.style.position = 'static';
    }
  };
  enableSticky();
  window.addEventListener('resize', enableSticky);

  const form = document.getElementById('applyForm');
  if (form) {
    const note = document.getElementById('applyNote');
    const counter = document.getElementById('charCounter');
    note.addEventListener('input', () => { counter.textContent = `${note.value.length}/500`; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="msi">progress_activity</span><span>Transmitting…</span>';
      try {
        const res = await API.post('/api/applications', { job_id: jobId, note: note.value });
        toast('Application submitted!');
        openSuccessModal(job, res.application);
        renderJob(job, { applied: true, status: 'Pending' });
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="msi">send</span><span>Submit Application</span>';
      }
    });
  }
}

function openSuccessModal(job, application) {
  const modal = document.getElementById('successModal');
  document.getElementById('successCopy').textContent =
    `Your profile and cover note have been routed to ${job.company}'s recruitment team.`;
  document.getElementById('successRef').textContent =
    `Application Reference: #HH-${String(application?.id || 0).padStart(5, '0')}`;
  modal.style.display = 'flex';
  document.getElementById('closeSuccess').onclick = () => { modal.style.display = 'none'; };
}

async function initJobDetails() {
  UI.renderPublicNav('jobs');
  UI.renderFooter();

  if (!Number.isInteger(jobId) || jobId <= 0) {
    document.getElementById('jobBox').innerHTML = `
      <div class="empty-state">
        <div class="big-ico"><span class="msi">error</span></div>
        <h3>Invalid job link</h3>
        <p>The link you followed does not point to a valid job posting.</p>
        <div class="row"><a class="btn btn-primary" href="/index.html">Back to Jobs</a></div>
      </div>`;
    return;
  }

  try {
    const { job } = await API.get(`/api/jobs/${jobId}`, { auth: false });

    let appliedState = { applied: false, status: null };
    if (API.isLoggedIn() && !API.isAdmin()) {
      try {
        const mine = await API.get('/api/applications/mine?page_size=100');
        const existing = mine.applications.find((a) => a.job_id === jobId);
        if (existing) appliedState = { applied: true, status: existing.status };
      } catch { /* treat as not applied */ }
    }

    renderJob(job, appliedState);
  } catch (err) {
    document.getElementById('jobBox').innerHTML = `
      <div class="empty-state">
        <div class="big-ico"><span class="msi">work_off</span></div>
        <h3>${esc(err.status === 404 ? 'Job not found' : 'Something went wrong')}</h3>
        <p>${esc(err.message)}</p>
        <div class="row"><a class="btn btn-primary" href="/index.html">Back to Jobs</a></div>
      </div>`;
  }
}

initJobDetails();
