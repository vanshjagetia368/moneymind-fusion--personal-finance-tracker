function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatCurrency(amount) {
  const currency = AppState?.ui?.currency || "INR";
  const map = {
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" },
  };
  const c = map[currency] || map.INR;
  return c.symbol + Number(amount).toLocaleString(c.locale);
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast slide-up";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function getFilteredTransactions({ search = "", type = "", category = "", month, year }) {
  return AppState.transactions.filter(t => {
    const d = new Date(t.createdAt);
    if (month != null && d.getMonth() !== month) return false;
    if (year != null && d.getFullYear() !== year) return false;
    if (type && t.type !== type) return false;
    if (category && t.category !== category) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

function getComputedSummary(list) {
  const income = list.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = list.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}