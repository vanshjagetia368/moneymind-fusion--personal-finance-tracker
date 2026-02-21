const OLD_STATE_KEY = "moneymind_fusion_state_v2";
function applyUserState(username) {
  if (!username) return;

  // store active user in memory
  if (typeof AppState !== "undefined") {
    AppState.currentUser = username;
  }

  // load saved state for this user if function exists
  if (typeof loadUserState === "function") {
    loadUserState(username);
  }

  // refresh entire UI
  if (typeof refreshUI === "function") {
    refreshUI();
  }
}


function showAuthScreen() {
  document.getElementById("authScreen")?.classList.remove("hidden");
  document.getElementById("appRoot")?.classList.add("hidden");
}

function showApp() {
  document.getElementById("authScreen")?.classList.add("hidden");
  document.getElementById("appRoot")?.classList.remove("hidden");
  if (typeof refreshUI === "function") refreshUI();
}

function migrateOldData(username) {
  const raw = localStorage.getItem(OLD_STATE_KEY);
  if (!raw) return;
  try {
    const old = JSON.parse(raw);
    if (old.transactions?.length || old.budgets?.monthly && Object.keys(old.budgets.monthly).length) {
      const key = STATE_PREFIX + username;
      localStorage.setItem(key, raw);
      localStorage.removeItem(OLD_STATE_KEY);
    }
  } catch (_) {}
}

function initAuthUI() {
  const authScreen = document.getElementById("authScreen");
  const appRoot = document.getElementById("appRoot");
  const form = document.getElementById("authForm");
  const tabs = document.querySelectorAll(".auth-tab");
  const errorEl = document.getElementById("authError");
  const logoutBtn = document.getElementById("logoutBtn");

  let mode = "login";

  if (isLoggedIn()) {
    authScreen?.classList.add("hidden");
    appRoot?.classList.remove("hidden");
  } else {
    authScreen?.classList.remove("hidden");
    appRoot?.classList.add("hidden");
  }

  tabs?.forEach((tab) => {
    tab.addEventListener("click", () => {
      mode = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === mode));
      form.querySelector("button[type=submit]").textContent = mode === "login" ? "Log in" : "Sign up";
      document.getElementById("authPassword").autocomplete = mode === "login" ? "current-password" : "new-password";
      errorEl.textContent = "";
    });
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const username = document.getElementById("authUsername").value.trim();
    const password = document.getElementById("authPassword").value;
    if (!username || !password) {
      errorEl.textContent = "Please enter username and password";
      return;
    }
    try {
      if (mode === "signup") {
        await signup(username, password);
        migrateOldData(username);
        applyUserState(username);
        showToast("Account created! Welcome.");
      } else {
        await login(username, password);
        applyUserState(username);
        showToast("Welcome back!");
      }
      showApp();
      if (AppState?.ui?.theme === "light") document.documentElement.classList.add("theme-light");
    } catch (err) {
      errorEl.textContent = err.message || "Something went wrong";
    }
  });

  logoutBtn?.addEventListener("click", () => {
    logout();
    clearUserState();
    showAuthScreen();
    document.getElementById("authUsername").value = "";
    document.getElementById("authPassword").value = "";
    errorEl.textContent = "";
    showToast("Logged out");
  });
}
document.addEventListener("DOMContentLoaded", initAuthUI);