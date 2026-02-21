const STATE_PREFIX = "moneymind_fusion_state_";

const defaultState = () => ({
const STATE_KEY = "moneymind_fusion_state_v2";
const defaultState = {
  ui: {
    activeView: "records",
    activeMonth: new Date().getMonth(),
    activeYear: new Date().getFullYear(),
    theme: "dark",
    currency: "INR",
    aiApiUrl: "http://localhost:3001",
  },
  accounts: {
    cash: { id: "cash", name: "Cash", balance: 0 },
    bank: { id: "bank", name: "Bank", balance: 0 },
    card: { id: "card", name: "Card", balance: 0 },
    card: { id: "card", name: "Card", balance: 0 }, // credit account
  },
  categories: {
    income: ["Salary", "Bonus", "Interest", "Other Income"],
    expense: [
      "Food",
      "Transport",
      "Rent",
      "Shopping",
      "Entertainment",
      "Education",
      "Health",
      "Other",
    ],
  },
  budgets: {
    monthly: {},
  },
  transactions: [],
});

let _saveTimeout = null;

function getStateKey() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  return user ? STATE_PREFIX + user : null;
}

function loadStateForUser(username) {
  const key = STATE_PREFIX + username;
  const raw = localStorage.getItem(key);
  if (!raw) {
    const state = JSON.parse(JSON.stringify(defaultState()));
    localStorage.setItem(key, JSON.stringify(state));
    return state;
  }
  const parsed = JSON.parse(raw);
  if (!parsed.ui) parsed.ui = {};
  parsed.ui.theme = parsed.ui.theme || "dark";
  parsed.ui.currency = parsed.ui.currency || "INR";
  parsed.ui.aiApiUrl = parsed.ui.aiApiUrl || "http://localhost:3001";
  return parsed;
}

function loadState() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) return JSON.parse(JSON.stringify(defaultState()));
  return loadStateForUser(user);
}

function saveStateImmediate() {
  const key = getStateKey();
  if (key) localStorage.setItem(key, JSON.stringify(AppState));
}

function saveState() {
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(saveStateImmediate, 150);
}

function applyUserState(username) {
  const state = loadStateForUser(username);
  Object.keys(AppState).forEach((k) => delete AppState[k]);
  Object.assign(AppState, state);
}

function clearUserState() {
  Object.keys(AppState).forEach((k) => delete AppState[k]);
  Object.assign(AppState, defaultState());
}

const AppState = loadState();

};
function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) {
    localStorage.setItem(STATE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }
  return JSON.parse(raw);
}
function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(AppState));
}
const AppState = loadState();
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
    AppState.ui.aiApiUrl = (url || "").trim() || "http://localhost:3001";
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
    AppState.categories[type] = AppState.categories[type].filter(c => c !== name);
    saveState();
  },
  setBudget(category, amount) {
    const key = getMonthKey();
    AppState.budgets.monthly[key] ??= {};
    AppState.budgets.monthly[key][category] = Number(amount);
    saveState();
  },
};