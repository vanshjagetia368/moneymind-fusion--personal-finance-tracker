const STATE_PREFIX = "moneymind_fusion_state_";

function defaultState() {
  return {
    ui: {
      activeView: "records",
      activeMonth: new Date().getMonth(),
      activeYear: new Date().getFullYear(),
      theme: "dark",
      currency: "INR",
      aiApiUrl: "http://localhost:3001",
    },
    accounts: {
      cash: { id: "cash", name: "Cash" },
      bank: { id: "bank", name: "Bank" },
      card: { id: "card", name: "Card" },
    },
    categories: {
      income: ["Salary", "Bonus", "Interest", "Other Income"],
      expense: ["Food", "Transport", "Rent", "Shopping", "Entertainment", "Other"],
    },
    budgets: { monthly: {} },
    transactions: [],
  };
}

let AppState = defaultState();

function getStateKey() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  return user ? STATE_PREFIX + user : null;
}

function loadState() {
  const key = getStateKey();
  if (!key) return defaultState();

  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaultState()));
    return defaultState();
  }

  return JSON.parse(raw);
}

function saveState() {
  const key = getStateKey();
  if (key) localStorage.setItem(key, JSON.stringify(AppState));
}

function applyUserState(username) {
  const key = STATE_PREFIX + username;
  const raw = localStorage.getItem(key);
  AppState = raw ? JSON.parse(raw) : defaultState();
}

function clearUserState() {
  AppState = defaultState();
}

AppState = loadState();

const StateActions = {
  setView(view) {
    AppState.ui.activeView = view;
    saveState();
  },
  setMonthYear(month, year) {
    AppState.ui.activeMonth = month;
    AppState.ui.activeYear = year;
    saveState();
  },
  setTheme(theme) {
    AppState.ui.theme = theme;
    document.documentElement.classList.toggle("theme-light", theme === "light");
    saveState();
  },
  setCurrency(currency) {
    AppState.ui.currency = currency;
    saveState();
  },
  setAiApiUrl(url) {
    AppState.ui.aiApiUrl = (url || "").trim();
    saveState();
  },
  addTransaction(tx) {
    AppState.transactions.push(tx);
    saveState();
  },
  updateTransaction(id, updated) {
    const i = AppState.transactions.findIndex(t => t.id === id);
    if (i !== -1) AppState.transactions[i] = updated;
    saveState();
  },
  deleteTransaction(id) {
    AppState.transactions = AppState.transactions.filter(t => t.id !== id);
    saveState();
  },
  addCategory(type, name) {
    if (!AppState.categories[type].includes(name)) {
      AppState.categories[type].push(name);
      saveState();
    }
  },
  removeCategory(type, name) {
    AppState.categories[type] =
      AppState.categories[type].filter(c => c !== name);
    saveState();
  },
  setBudget(category, amount) {
    const key = `${AppState.ui.activeYear}-${AppState.ui.activeMonth}`;
    AppState.budgets.monthly[key] ??= {};
    AppState.budgets.monthly[key][category] = Number(amount);
    saveState();
  },
};