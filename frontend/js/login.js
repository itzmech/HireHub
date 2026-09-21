'use strict';

/* Login page — HireHub auth design. */

function initLogin() {
  // Brand marks (shared SVG injected via JS so pages stay static).
  document.getElementById('headerMark').outerHTML = brandMark(32);
  document.getElementById('cardMark').outerHTML = brandMark(44);

  // Already signed in? Leave.
  if (API.isLoggedIn()) {
    window.location.replace(API.isAdmin() ? '/admin-dashboard.html' : '/index.html');
    return;
  }

  const alertBox = document.getElementById('alertBox');
  const emailField = document.getElementById('emailField');
  const emailInput = document.getElementById('email');

  if (qsParam('expired') === '1') {
    alertBox.innerHTML = '<div class="alert alert-info"><span class="msi">info</span><div><p class="t" style="font-weight:600;color:var(--ink)">Session expired</p><p class="small">Please log in again to continue.</p></div></div>';
  }
  if (qsParam('registered') === '1') {
    alertBox.innerHTML = '<div class="alert alert-success"><span class="msi">check_circle</span><div><p class="t" style="font-weight:600;color:var(--ink)">Account created!</p><p class="small">Please sign in with your new credentials.</p></div></div>';
  }

  // Password visibility toggle (Stitch behaviour).
  document.getElementById('togglePw').addEventListener('click', () => {
    const pw = document.getElementById('password');
    const icon = document.querySelector('#togglePw .msi');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    icon.textContent = show ? 'visibility_off' : 'visibility';
  });

  emailInput.addEventListener('input', () => emailField.classList.remove('invalid'));

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const text = document.getElementById('loginText');
    const icon = document.getElementById('loginIcon');
    alertBox.innerHTML = '';

    // Client-side format check (backend remains authoritative).
    const emailVal = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailField.classList.add('invalid');
      emailInput.focus();
      return;
    }

    btn.disabled = true;
    icon.textContent = 'progress_activity';
    icon.style.animation = 'spin 1s linear infinite';
    text.textContent = 'Signing in…';

    try {
      const data = await API.post('/api/auth/login', {
        email: emailVal,
        password: document.getElementById('password').value,
      }, { auth: false });
      API.setSession(data.token, data.user);
      toast(`Welcome back, ${data.user.name}!`);

      const next = qsParam('next');
      if (next && next.startsWith('/')) {
        window.location.href = next;
      } else if (data.user.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/index.html';
      }
    } catch (err) {
      alertBox.innerHTML = `
        <div class="alert alert-error" style="margin-bottom:0">
          <span class="msi">error</span>
          <div>
            <p class="t">Authentication failed</p>
            <p class="small">${esc(err.message)}</p>
          </div>
        </div>`;
      btn.disabled = false;
      icon.style.animation = '';
      icon.textContent = 'login';
      text.textContent = 'Sign In';
    }
  });
}

initLogin();
