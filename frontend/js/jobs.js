'use strict';

/* Home / Jobs page — HireHub listing design: ribbon search, sidebar type filter, cards, pagination. */

const jobsState = { page: 1, totalPages: 1 };

const TYPE_FILTERS = ['Full-time', 'Remote', 'Part-time', 'Contract', 'Internship', 'Temporary'];

function jobCardSkeleton() {
  return `
    <div class="skel-job" aria-hidden="true">
      <div style="display:flex;gap:16px;align-items:center">
        <div class="skeleton-box" style="width:48px;height:48px;border-radius:var(--r-ctl);flex-shrink:0"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div class="skeleton-box skel-line" style="width:55%"></div>
          <div class="skeleton-box skel-line" style="width:35%"></div>
        </div>
      </div>
      <div class="skeleton-box skel-line" style="width:70%"></div>
      <div class="skeleton-box skel-line" style="width:90%"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <div class="skeleton-box skel-line" style="width:30%"></div>
        <div class="skeleton-box" style="width:110px;height:36px;border-radius:var(--r-ctl)"></div>
      </div>
    </div>`;
}

function jobCard(job) {
  const snippet = job.snippet || '';
  const more = snippet.length >= 180 ? '…' : '';
  const posted = timeAgo(job.created_at);
  return `
    <article class="job-card">
      <div class="top">
        <div class="idbox">
          <div class="job-logo">${jobLogo(job)}</div>
          <div style="min-width:0">
            <a href="/job-details.html?id=${job.id}"><h3>${esc(job.title)}</h3></a>
            <div class="co-line">
              <span class="co">${esc(job.company)}</span>
              <span style="color:#cbd5e1">•</span>
              <span class="chip" style="padding:2px 8px">${esc(job.type)}</span>
            </div>
          </div>
        </div>
        <a class="icon-btn" href="/job-details.html?id=${job.id}" aria-label="View job">
          <span class="msi">arrow_forward</span>
        </a>
      </div>
      <div class="badges">
        <span class="chip"><span class="msi">location_on</span>${esc(job.location)}</span>
        <span class="chip"><span class="msi">schedule</span>${esc(job.type)}</span>
        ${job.salary ? `<span class="chip salary-chip"><span class="msi">payments</span>${esc(job.salary)}</span>` : ''}
        <span class="chip live-chip"><span style="width:6px;height:6px;border-radius:9999px;background:var(--primary)"></span>Actively Hiring</span>
      </div>
      <p class="desc">${esc(snippet)}${more}</p>
      <div class="foot">
        <span class="posted"><span class="msi">history</span>Posted ${esc(posted)}</span>
        <a class="btn btn-primary" href="/job-details.html?id=${job.id}">
          <span>View Job</span><span class="msi">arrow_forward</span>
        </a>
      </div>
    </article>`;
}

function renderTypeFilter() {
  const wrap = document.getElementById('typeOpts');
  wrap.innerHTML = TYPE_FILTERS.map(
    (t) => `
    <label>
      <span class="left">
        <input type="checkbox" value="${esc(t)}" class="type-cb" />
        <span>${esc(t)}</span>
      </span>
    </label>`
  ).join('');
  wrap.querySelectorAll('.type-cb').forEach((cb) =>
    cb.addEventListener('change', () => {
      jobsState.page = 1;
      loadJobs();
    })
  );
}

function selectedTypes() {
  return [...document.querySelectorAll('.type-cb:checked')].map((cb) => cb.value);
}

async function loadJobs() {
  const list = document.getElementById('jobsList');
  const pager = document.getElementById('pager');
  const alertBox = document.getElementById('alertBox');
  const found = document.getElementById('foundCount');
  const pageInfo = document.getElementById('pageInfo');
  list.innerHTML = jobCardSkeleton().repeat(4);
  pager.style.display = 'none';
  alertBox.innerHTML = '';

  const params = new URLSearchParams();
  const search = document.getElementById('fSearch').value.trim();
  const location = document.getElementById('fLocation').value.trim();
  const types = selectedTypes();
  if (search) params.set('search', search);
  if (location) params.set('location', location);
  if (types.length === 1) params.set('type', types[0]);
  params.set('page', String(jobsState.page));

  try {
    const data = await API.get(`/api/jobs?${params.toString()}`, { auth: false });
    const { jobs, pagination } = data;
    jobsState.totalPages = pagination.total_pages;

    found.textContent = `${pagination.total} job${pagination.total === 1 ? '' : 's'} found`;
    pageInfo.textContent = `Showing page ${pagination.page} of ${pagination.total_pages}`;

    if (!jobs.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="big-ico"><span class="msi">work_off</span></div>
          <h3>No jobs found</h3>
          <p>No job postings match your active search filters. Try clearing filters or a different keyword.</p>
          <div class="row">
            <button class="btn btn-secondary" id="emptyClear">Clear All Filters</button>
            <a class="btn btn-primary" href="/register.html">Create an account</a>
          </div>
        </div>`;
      document.getElementById('emptyClear').addEventListener('click', clearFilters);
      return;
    }

    list.innerHTML = jobs.map(jobCard).join('');

    if (pagination.total_pages > 1) {
      pager.style.display = 'flex';
      const parts = [];
      for (let p = 1; p <= pagination.total_pages; p++) {
        if (p <= 2 || p > pagination.total_pages - 1 || Math.abs(p - pagination.page) <= 1) {
          parts.push(`<button class="${p === pagination.page ? 'current' : ''}" data-page="${p}">${p}</button>`);
        } else if (parts[parts.length - 1] !== '<span class="ell">…</span>') {
          parts.push('<span class="ell">…</span>');
        }
      }
      pager.innerHTML = `
        <button id="prevBtn" ${pagination.page <= 1 ? 'disabled' : ''}>
          <span class="msi">chevron_left</span><span>Previous</span>
        </button>
        <div class="pages">${parts.join('')}</div>
        <button id="nextBtn" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>
          <span>Next</span><span class="msi">chevron_right</span>
        </button>`;
      pager.querySelectorAll('[data-page]').forEach((b) =>
        b.addEventListener('click', () => {
          jobsState.page = Number(b.dataset.page);
          loadJobs();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
      );
      document.getElementById('prevBtn').onclick = () => { jobsState.page--; loadJobs(); };
      document.getElementById('nextBtn').onclick = () => { jobsState.page++; loadJobs(); };
    }
  } catch (err) {
    list.innerHTML = '';
    alertBox.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Something went wrong</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

function clearFilters() {
  document.getElementById('fSearch').value = '';
  document.getElementById('fLocation').value = '';
  document.querySelectorAll('.type-cb').forEach((cb) => (cb.checked = false));
  jobsState.page = 1;
  loadJobs();
}

function initJobsPage() {
  UI.renderPublicNav('jobs');
  UI.renderFooter();

  // Keep the location field width sane on desktop (matches Stitch's w-80 field).
  const locBox = document.getElementById('locBox');
  const applyLocWidth = () => { locBox.style.maxWidth = window.innerWidth >= 768 ? '320px' : 'none'; };
  applyLocWidth();
  window.addEventListener('resize', applyLocWidth);

  renderTypeFilter();

  if (API.isLoggedIn() && !API.isAdmin()) {
    document.getElementById('verifiedStrip').style.display = 'flex';
    document.getElementById('verifiedCount').textContent = 'Track every application under My Applications';
  }

  document.getElementById('filters').addEventListener('submit', (e) => {
    e.preventDefault();
    jobsState.page = 1;
    loadJobs();
  });

  document.getElementById('clearFilters').addEventListener('click', clearFilters);

  // Mobile: filters panel collapses behind a toggle button.
  const fToggle = document.getElementById('filterToggle');
  const fPanel = document.getElementById('filterPanel');
  if (fToggle && fPanel) {
    fToggle.addEventListener('click', () => {
      const open = fPanel.classList.toggle('open');
      fToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('#trending button').forEach((b) =>
    b.addEventListener('click', () => {
      document.getElementById('fSearch').value = b.dataset.q;
      jobsState.page = 1;
      loadJobs();
    })
  );

  // Render access-denied notices after loadJobs completes — loadJobs clears the
  // alert box at the start of each fetch, which would otherwise wipe the banner.
  loadJobs().then(() => {
    if (qsParam('denied') === 'admin') {
      document.getElementById('alertBox').innerHTML =
        '<div class="alert alert-error"><span class="msi">shield</span><div><p class="t">Admin access required</p><p class="small">Sign in with an administrator account to use the Admin Portal.</p></div></div>';
    }
    if (qsParam('denied') === 'user') {
      document.getElementById('alertBox').innerHTML =
        '<div class="alert alert-error"><span class="msi">shield</span><div><p class="t">Candidate accounts only</p><p class="small">That page is only available to job-seeker accounts.</p></div></div>';
    }
  });
}

initJobsPage();
