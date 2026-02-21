function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const CURRENCY_MAP = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
};

function formatCurrency(amount) {
  const c = CURRENCY_MAP[AppState?.ui?.currency] || CURRENCY_MAP.INR;
  return c.symbol + Number(amount).toLocaleString(c.locale);
function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function getMonthKey() {
  return `${AppState.ui.activeYear}-${AppState.ui.activeMonth}`;
}

function escapeHtml(text) {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function debounce(fn, ms) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

function showToast(message, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} slide-up`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFilteredTransactions(filters = {}) {
  const { search = "", type = "", category = "", month = null, year = null, sort = "date-desc" } = filters;
  let list = [...AppState.transactions];

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(t => (t.description || "").toLowerCase().includes(s));
  }
  if (type) list = list.filter(t => t.type === type);
  if (category) list = list.filter(t => t.category === category);

  if (month != null && year != null) {
    list = list.filter(t => {
      const d = new Date(t.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }

  if (sort === "date-desc") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === "date-asc") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === "amount-desc") list.sort((a, b) => b.amount - a.amount);
  else if (sort === "amount-asc") list.sort((a, b) => a.amount - b.amount);

  return list;
}

function getComputedSummary(transactions) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

function getAccountStats(transactions, monthFilter = null, yearFilter = null) {
  const accounts = Object.keys(AppState?.accounts || {}).length ? Object.keys(AppState.accounts) : ["cash", "bank", "card"];
  const stats = {};
  accounts.forEach(id => {
    stats[id] = { balance: 0, income: 0, expense: 0, count: 0 };
  });
  transactions.forEach(tx => {
    const d = new Date(tx.createdAt);
    if (monthFilter != null && yearFilter != null && (d.getMonth() !== monthFilter || d.getFullYear() !== yearFilter)) return;
    const acc = tx.account in stats ? tx.account : "cash";
    stats[acc].count++;
    if (tx.type === "income") {
      stats[acc].income += tx.amount;
      stats[acc].balance += tx.amount;
    } else {
      stats[acc].expense += tx.amount;
      stats[acc].balance -= tx.amount;
    }
  });
  return stats;
}

function getExpenseByWeek(transactions, weeks = 8) {
  const now = new Date();
  const result = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * i);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const total = transactions
      .filter(t => t.type === "expense")
      .filter(t => {
        const dt = new Date(t.createdAt);
        return dt >= weekStart && dt <= weekEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
    const label = i === 0 ? "Now" : `${weeks - i}w`;
    result.push({
      label,
      fullLabel: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " - " + weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: total,
    });
  }
  return result;
}

function getExpenseByMonth(transactions, months = 6) {
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = transactions
      .filter(t => t.type === "expense")
      .filter(t => {
        const dt = new Date(t.createdAt);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
    result.push({
      label: d.toLocaleDateString(undefined, { month: "short" }),
      fullLabel: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      value: total,
    });
  }
  return result;
}

function getMonthlyHistoryHTML() {
  if (!AppState?.transactions?.length)
    return '<p class="empty-state">No transaction history yet</p>';
  const byMonth = {};
  AppState.transactions.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth[key]) byMonth[key] = { year: d.getFullYear(), month: d.getMonth(), list: [] };
    byMonth[key].list.push(t);
  });
  const entries = Object.values(byMonth).sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month
  );
  return entries.map(({ year, month, list }) => {
    const { income, expense, balance } = getComputedSummary(list);
    const label = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
    return `
      <div class="month-history-item">
        <strong>${escapeHtml(label)}</strong>
        <span class="text-success">${formatCurrency(income)}</span>
        <span class="text-danger">${formatCurrency(expense)}</span>
        <span>${formatCurrency(balance)}</span>
      </div>
    `;
  }).join("");
}