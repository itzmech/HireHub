'use strict';

/* Register page — HireHub auth design with live password checklist. */

function initRegister() {
  document.getElementById('headerMark').outerHTML = brandMark(32);
  document.getElementById('cardMark').outerHTML = brandMark(36);

  if (API.isLoggedIn()) {
    window.location.replace('/index.html');
    return;
  }

  const alertBox = document.getElementById('alertBox');
  const form = document.getElementById('registerForm');
  const successView = document.getElementById('successView');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const pwInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');

  const nameField = document.getElementById('nameField');
  const emailField = document.getElementById('emailField');
  const pwField = document.getElementById('pwField');
  const confirmField = document.getElementById('confirmField');

  const ruleLength = document.getElementById('ruleLength');
  const ruleSymbol = document.getElementById('ruleSymbol');

  // Password visibility toggles.
  const bindToggle = (btnId, inputId) => {
    document.getElementById(btnId).addEventListener('click', () => {
      const input = document.getElementById(inputId);
      const icon = document.querySelector(`#${btnId} .msi`);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      icon.textContent = show ? 'visibility_off' : 'visibility';
    });
  };
  bindToggle('togglePw', 'password');
  bindToggle('toggleConfirm', 'confirm');

  // Live checklist (Stitch behaviour).
  function evaluateRules() {
    const val = pwInput.value;
    const hasLen = val.length >= 8;
    const hasSym = /[0-9!@#$%^&*(),.?":{}|<>_\-\[\]\\\/~`+=;' ]/.test(val);
    ruleLength.classList.toggle('ok', hasLen);
    ruleLength.querySelector('.msi').textContent = hasLen ? 'check_circle' : 'radio_button_unchecked';
    ruleSymbol.classList.toggle('ok', hasSym);
    ruleSymbol.querySelector('.msi').textContent = hasSym ? 'check_circle' : 'radio_button_unchecked';
    checkMatch();
  }

  function checkMatch() {
    if (!confirmInput.value) {
      confirmField.classList.remove('invalid');
      document.getElementById('confirmErrText').textContent = 'Passwords do not match.';
      return;
    }
    confirmField.classList.toggle('invalid', pwInput.value !== confirmInput.value);
    document.getElementById('confirmErrText').textContent = 'Passwords do not match.';
  }

  pwInput.addEventListener('input', () => { pwField.classList.remove('invalid'); evaluateRules(); });
  confirmInput.addEventListener('input', checkMatch);
  nameInput.addEventListener('input', () => nameField.classList.remove('invalid'));
  emailInput.addEventListener('input', () => emailField.classList.remove('invalid'));

  function showAlert(title, message) {
    alertBox.innerHTML = `
      <div class="alert alert-error">
        <span class="msi">error</span>
        <div>
          <p class="t">${esc(title)}</p>
          <p class="small" style="margin-top:2px">${esc(message)}</p>
        </div>
      </div>`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.innerHTML = '';

    // Client-side validation (backend remains authoritative).
    let bad = false;
    if (!nameInput.value.trim()) { nameField.classList.add('invalid'); bad = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) { emailField.classList.add('invalid'); bad = true; }
    if (!pwInput.value) { pwField.classList.add('invalid'); bad = true; }
    if (confirmInput.value && pwInput.value !== confirmInput.value) { confirmField.classList.add('invalid'); bad = true; }
    if (bad) return;

    const btn = document.getElementById('registerBtn');
    const text = document.getElementById('regText');
    btn.disabled = true;
    text.textContent = 'Creating account…';

    try {
      await API.post('/api/auth/register', {
        name: nameInput.value,
        email: emailInput.value,
        password: pwInput.value,
      }, { auth: false });

      // Success view (Stitch) → then send to login.
      form.style.display = 'none';
      document.getElementById('formHeading').style.display = 'none';
      document.getElementById('formSub').style.display = 'none';
      successView.style.display = 'flex';
      setTimeout(() => { window.location.href = '/login.html?registered=1'; }, 1600);
    } catch (err) {
      if (err.status === 409) {
        showAlert('Email Already Registered',
          'An account with this email address already exists. Sign in or use a different email.');
      } else {
        showAlert('Registration failed', err.message);
      }
      btn.disabled = false;
      text.textContent = 'Create Account';
    }
  });
}

initRegister();
