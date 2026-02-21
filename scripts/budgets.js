function renderBudgets() {
  const key = getMonthKey();
  const monthLabel = new Date(AppState.ui.activeYear, AppState.ui.activeMonth).toLocaleString("default", { month: "long", year: "numeric" });

  main.innerHTML = `
    <div class="page">
      <div class="records-header">
        <h2>Budgets</h2>
        <div class="month-nav">
          <button class="btn secondary" onclick="navigateBudgetsMonth(-1)">←</button>
          <span class="month-label">${monthLabel}</span>
          <button class="btn secondary" onclick="navigateBudgetsMonth(1)">→</button>
        </div>
      </div>
      ${AppState.categories.expense.map(cat => {
        const spent = AppState.transactions
          .filter(t => t.category === cat && t.type === "expense" &&
            new Date(t.createdAt).getMonth() === AppState.ui.activeMonth &&
            new Date(t.createdAt).getFullYear() === AppState.ui.activeYear)
          .reduce((s, t) => s + t.amount, 0);
        const limit = AppState.budgets.monthly[key]?.[cat] || 0;
        const pct = limit ? Math.min((spent / limit) * 100, 150) : 0;
        const overBudget = limit && spent > limit;
        return `
          <div class="budget-item ${overBudget ? "budget-over" : ""}">
            <div class="budget-header">
              <strong>${escapeHtml(cat)}</strong>
              <button class="btn secondary btn-sm" data-cat="${escapeHtml(cat)}" onclick="setBudget(this.dataset.cat)">Set</button>
            </div>
            <div class="budget-progress">
              <span style="width:${pct}%;background:${overBudget ? "var(--color-danger)" : "var(--color-accent-primary)"}"></span>
            </div>
            <small>${formatCurrency(spent)} / ${limit ? formatCurrency(limit) : "No budget"}${overBudget ? " (over)" : ""}</small>
  appMain.innerHTML = `
    <div class="page">
      ${AppState.categories.expense.map(cat => {
        const spent = AppState.transactions
          .filter(t => t.category === cat && t.type === "expense")
          .reduce((s, t) => s + t.amount, 0);
        const limit = AppState.budgets.monthly[key]?.[cat] || 0;
        return `
          <div class="budget-item">
            <strong>${cat}</strong>
            <div class="budget-progress">
              <span style="width:${limit ? Math.min(spent / limit * 100, 100) : 0}%"></span>
            </div>
            <small>${formatCurrency(spent)} / ${limit ? formatCurrency(limit) : "No budget"}</small>
            <button class="btn secondary" onclick="setBudget('${cat}')">Set Budget</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function navigateBudgetsMonth(delta) {
  let m = AppState.ui.activeMonth + delta;
  let y = AppState.ui.activeYear;
  if (m > 11) { m = 0; y++; }
  if (m < 0) { m = 11; y--; }
  StateActions.setMonthYear(m, y);
  renderBudgets();
}

function setBudget(cat) {
  const val = prompt("Monthly budget for " + cat + "?");
  if (val == null || val === "") return;
  StateActions.setBudget(cat, val);
  showToast("Budget updated");
function setBudget(cat) {
  const val = prompt("Monthly budget?");
  if (!val) return;
  const key = getMonthKey();
  AppState.budgets.monthly[key] ??= {};
  AppState.budgets.monthly[key][cat] = Number(val);
  saveState();
  refreshUI();
}