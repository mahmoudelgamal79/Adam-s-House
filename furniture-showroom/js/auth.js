const USERS_KEY = 'adams-house-users';

// ── Login rate-limiting ────────────────────────────────────────────────────
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

function checkLoginLock() {
  const data = JSON.parse(localStorage.getItem('adams-house-login-lock') || '{}');
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    const mins = Math.ceil((data.lockedUntil - Date.now()) / 60000);
    return `Too many failed attempts. Try again in ${mins} minute(s).`;
  }
  return null;
}

function recordFailedAttempt() {
  const data = JSON.parse(localStorage.getItem('adams-house-login-lock') || '{}');
  data.attempts = (data.attempts || 0) + 1;
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS;
    data.attempts = 0;
  }
  localStorage.setItem('adams-house-login-lock', JSON.stringify(data));
}

function clearLoginLock() {
  localStorage.removeItem('adams-house-login-lock');
}

// ── Password hashing (Web Crypto API — built into every browser) ───────────
async function hashPassword(password) {
  const encoder   = new TextEncoder();
  const data      = encoder.encode(password);
  const hashBuf   = await crypto.subtle.digest('SHA-256', data);
  const hashArr   = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Auth helpers ───────────────────────────────────────────────────────────
function getReturnUrl() {
  return new URLSearchParams(window.location.search).get('return') || 'home.html';
}

function redirectIfLoggedIn() {
  if (getCustomer()) window.location.href = getReturnUrl();
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// ── Customer sign-in ───────────────────────────────────────────────────────
async function signInCustomer(email, password) {
  const lockMsg = checkLoginLock();
  if (lockMsg) return { ok: false, error: lockMsg };

  const hashed = await hashPassword(password);
  const user   = getUsers().find(u => u.email === email && u.password === hashed);

  if (!user) {
    recordFailedAttempt();
    return { ok: false, error: 'Invalid email or password.' };
  }

  clearLoginLock();
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify({
    name: user.name, email: user.email, phone: user.phone, loggedIn: true
  }));
  return { ok: true };
}

// ── Customer registration ──────────────────────────────────────────────────
async function registerCustomer({ name, phone, email, password }) {
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const hashed = await hashPassword(password);
  users.push({ name, phone, email, password: hashed });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, email, phone, loggedIn: true }));
  return { ok: true };
}

function authLink(path) {
  const ret = getReturnUrl();
  return ret === 'home.html' ? path : `${path}?return=${encodeURIComponent(ret)}`;
}