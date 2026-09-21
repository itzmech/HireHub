'use strict';

/* Users management (admin) — HireHub design. */

let allUsers = [];
const usersState = { search: '' };
const userModal = document.getElementById('userModal');
const userDeleteModal = document.getElementById('userDeleteModal');

function openUserModal(user) {
  document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('editUserId').value = user.id;
  document.getElementById('uName').value = user.name;
  document.getElementById('uEmail').value = user.email;
  document.getElementById('uRole').value = user.role;
  document.getElementById('userModalAlert').innerHTML = '';
  userModal.style.display = 'flex';
}

function closeUserModal() {
  userModal.style.display = 'none';
}

let pendingDeleteId = null;
function openDeleteModal(user) {
  pendingDeleteId = user.id;
  document.getElementById('deleteTargetUser').textContent = `“${user.name}”`;
  userDeleteModal.style.display = 'flex';
}
function closeDeleteModal() {
  userDeleteModal.style.display = 'none';
  pendingDeleteId = null;
}

function visibleUsers() {
  if (!usersState.search) return allUsers;
  const q = usersState.search.toLowerCase();
  return allUsers.filter((u) =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
}

function usersTable(users) {
  const me = API.getUser();

  if (!users.length) {
    return `
      <div class="empty-state">
        <div class="big-ico"><span class="msi">group_off</span></div>
        <h3>No users found</h3>
        <p>${allUsers.length ? 'No accounts match your search.' : 'No accounts are registered yet.'}</p>
      </div>`;
  }

  return `
    <div class="table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th style="padding-left:24px">User</th>
              <th>Role</th>
              <th>Joined</th>
              <th style="text-align:right;padding-right:24px">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u) => `
              <tr>
                <td style="padding-left:24px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <span class="avatar-initials" style="width:40px;height:40px;background:var(--primary-soft);color:var(--primary);font-size:0.875rem">${esc(initials(u.name))}</span>
                    <div style="min-width:0">
                      <span class="semibold" style="color:var(--ink);display:flex;align-items:center;gap:6px">
                        ${esc(u.name)}
                        ${u.id === me?.id ? '<span class="chip accent" style="padding:1px 8px;font-size:0.6875rem">You</span>' : ''}
                      </span>
                      <span class="small muted">${esc(u.email)}</span>
                    </div>
                  </div>
                </td>
                <td><span class="role-badge role-${esc(u.role)}">${esc(u.role)}</span></td>
                <td class="muted small tnum">${esc(fmtDate(u.created_at))}</td>
                <td class="td-actions" style="padding-right:24px">
                  <div class="inline">
                    <button class="icon-btn" data-edit="${u.id}" title="Edit user"><span class="msi">edit</span></button>
                    <button class="icon-btn danger" data-del="${u.id}" title="Delete user"
                      ${u.id === me?.id ? 'disabled style="opacity:0.35;cursor:not-allowed" data-blocked="1"' : ''}>
                      <span class="msi">delete</span>
                    </button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:12px 24px;background:rgba(241,245,249,0.4);border-top:1px solid var(--border)">
        <span class="muted small">Showing <b style="color:var(--ink)">${users.length}</b> of <b style="color:var(--ink)">${allUsers.length}</b> registered users</span>
      </div>
    </div>`;
}

function bindRowActions() {
  document.querySelectorAll('[data-edit]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const user = allUsers.find((u) => u.id === Number(btn.dataset.edit));
      openUserModal(user);
    })
  );
  document.querySelectorAll('[data-del]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.blocked) {
        toast('You cannot delete your own account.', 'error');
        return;
      }
      const user = allUsers.find((u) => u.id === Number(btn.dataset.del));
      openDeleteModal(user);
    })
  );
}

function rerenderTable() {
  document.getElementById('tableZone').innerHTML = usersTable(visibleUsers());
  bindRowActions();
}

async function loadUsers() {
  const alertBox = document.getElementById('alertBox');
  alertBox.innerHTML = '';

  try {
    const { users } = await API.get('/api/users?page_size=100');
    allUsers = users;
    const admins = allUsers.filter((u) => u.role === 'admin').length;
    const seekers = allUsers.filter((u) => u.role === 'user').length;

    document.getElementById('content').innerHTML = `
      <div class="page-head">
        <div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <h1>Users</h1>
            <span class="head-count">${allUsers.length} registered</span>
          </div>
          <p class="lede">Manage registered accounts, roles, and access.</p>
        </div>
      </div>

      <div class="stats-grid cols-4" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <span class="overline">Total Users</span>
            <div class="num" style="margin-top:4px">${allUsers.length}</div>
            <span class="small muted">All registered accounts</span>
          </div>
          <div class="stat-icon" style="width:48px;height:48px"><span class="msi" style="font-size:26px">group</span></div>
        </div>
        <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <span class="overline">Candidates</span>
            <div class="num" style="margin-top:4px">${seekers}</div>
            <span class="small muted">Job-seeker accounts</span>
          </div>
          <div class="stat-icon" style="width:48px;height:48px;background:rgba(189,236,226,0.5)"><span class="msi" style="font-size:26px">person</span></div>
        </div>
        <div class="stat" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <span class="overline">Administrators</span>
            <div class="num" style="margin-top:4px">${admins}</div>
            <span class="small muted">Full platform access</span>
          </div>
          <div class="stat-icon" style="width:48px;height:48px;background:#e0e7ff"><span class="msi" style="font-size:26px;color:#4338ca">shield_person</span></div>
        </div>
      </div>

      <div class="card" style="padding:16px;margin-bottom:24px">
        <div class="input-icon" style="max-width:480px">
          <span class="msi">search</span>
          <input class="input fill" id="userSearch" placeholder="Search users by name or email…" />
        </div>
      </div>

      <div id="tableZone">${usersTable(visibleUsers())}</div>`;

    document.getElementById('userSearch').addEventListener('input', (e) => {
      usersState.search = e.target.value.trim().toLowerCase();
      rerenderTable();
    });

    bindRowActions();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error"><span class="msi">error</span><div><p class="t">Couldn't load users</p><p class="small">${esc(err.message)}</p></div></div>`;
  }
}

async function saveUser(e) {
  e.preventDefault();
  const alertBox = document.getElementById('userModalAlert');
  const btn = document.getElementById('userModalSubmit');
  btn.disabled = true;
  alertBox.innerHTML = '';

  const id = document.getElementById('editUserId').value;
  try {
    await API.patch(`/api/users/${id}`, {
      name: document.getElementById('uName').value,
      email: document.getElementById('uEmail').value,
      role: document.getElementById('uRole').value,
    });
    toast('User updated successfully.');
    closeUserModal();
    loadUsers();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error" style="margin:0"><span class="msi">error</span><div><p class="t">Update failed</p><p class="small">${esc(err.message)}</p></div></div>`;
  } finally {
    btn.disabled = false;
  }
}

UI.requireAdmin();
UI.renderAdminShell('users');

document.getElementById('userModalClose').addEventListener('click', closeUserModal);
document.getElementById('userModalCancel').addEventListener('click', closeUserModal);
userModal.addEventListener('click', (e) => { if (e.target === userModal) closeUserModal(); });
document.getElementById('userDeleteCancel').addEventListener('click', closeDeleteModal);
userDeleteModal.addEventListener('click', (e) => { if (e.target === userDeleteModal) closeDeleteModal(); });
document.getElementById('userDeleteConfirm').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const btn = document.getElementById('userDeleteConfirm');
  btn.disabled = true;
  try {
    await API.del(`/api/users/${pendingDeleteId}`);
    toast('User deleted.');
    closeDeleteModal();
    loadUsers();
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
  }
});
document.getElementById('userForm').addEventListener('submit', saveUser);

loadUsers();
