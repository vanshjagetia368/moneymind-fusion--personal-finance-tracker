const AUTH_SESSION_KEY = "moneymind_session";
const AUTH_USERS_KEY = "moneymind_users";

async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setSession(username) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username }));
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function isLoggedIn() {
  return !!getStoredSession()?.username;
}

function getCurrentUser() {
  return getStoredSession()?.username || null;
}

async function signup(username, password) {
  const u = String(username).trim().toLowerCase();
  const users = getUsers();
  if (!u || u.length < 2) throw new Error("Username must be at least 2 characters");
  if (String(password).length < 4) throw new Error("Password must be at least 4 characters");
  if (users[u]) throw new Error("Username already exists");
  const hash = await hashPassword(password);
  users[u] = { passwordHash: hash, createdAt: new Date().toISOString() };
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  setSession(u);
}

async function login(username, password) {
  const u = String(username).trim().toLowerCase();
  const users = getUsers();
  const user = users[u];
  if (!user) throw new Error("User not found");
  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) throw new Error("Incorrect password");
  setSession(u);
}

function logout() {
  clearSession();
}
