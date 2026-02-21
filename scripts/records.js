let recordsFilters = { search: "", type: "", category: "", sort: "date-desc" };

function renderRecords() {
  const list = getFilteredTransactions({
    ...recordsFilters,
    month: AppState.ui.activeMonth,
    year: AppState.ui.activeYear,
  });
  const { income, expense, balance } = getComputedSummary(list);
  const categories = [...AppState.categories.income, ...AppState.categories.expense];

  main.innerHTML = `
    <div class="page">
      <div class="records-header">
        <h2>Records</h2>
        <div class="month-nav">
          <button class="btn secondary" onclick="navigateRecordsMonth(-1)">←</button>
          <span class="month-label">${new Date(AppState.ui.activeYear, AppState.ui.activeMonth).toLocaleString("default", { month: "long", year: "numeric" })}</span>
          <button class="btn secondary" onclick="navigateRecordsMonth(1)">→</button>
        </div>
      </div>
function renderRecords() {
  const income = AppState.transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = AppState.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  main.innerHTML = `
    <div class="page">
      <div class="records-summary">
        <div class="summary-item">
          <small>Income</small>
          <strong class="text-success">${formatCurrency(income)}</strong>
        </div>
        <div class="summary-item">
          <small>Expense</small>
          <strong class="text-danger">${formatCurrency(expense)}</strong>
        </div>
        <div class="summary-item">
          <small>Balance</small>
          <strong>${formatCurrency(balance)}</strong>
        </div>
      </div>
      <div class="filter-bar">
        <input type="search" placeholder="Search..." class="filter-search" id="recordsSearch" value="${escapeHtml(recordsFilters.search)}">
        <select id="recordsType" class="filter-select">
          <option value="">All types</option>
          <option value="income" ${recordsFilters.type === "income" ? "selected" : ""}>Income</option>
          <option value="expense" ${recordsFilters.type === "expense" ? "selected" : ""}>Expense</option>
        </select>
        <select id="recordsCategory" class="filter-select">
          <option value="">All categories</option>
          ${categories.map(c => `<option value="${escapeHtml(c)}" ${recordsFilters.category === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
        </select>
        <select id="recordsSort" class="filter-select">
          <option value="date-desc" ${recordsFilters.sort === "date-desc" ? "selected" : ""}>Newest first</option>
          <option value="date-asc" ${recordsFilters.sort === "date-asc" ? "selected" : ""}>Oldest first</option>
          <option value="amount-desc" ${recordsFilters.sort === "amount-desc" ? "selected" : ""}>Amount high→low</option>
          <option value="amount-asc" ${recordsFilters.sort === "amount-asc" ? "selected" : ""}>Amount low→high</option>
        </select>
      </div>
      <div class="transaction-list">
        ${list.length
          ? list.map(tx => `
              <div class="transaction-item">
                <div class="transaction-left">
                  <strong>${escapeHtml(tx.description)}</strong>
                  <small>${escapeHtml(tx.category || "—")} • ${formatDateShort(tx.createdAt)}</small>
                </div>
                <div class="transaction-right">
                  <span class="transaction-amount ${escapeHtml(tx.type)}">
                    ${tx.type === "income" ? "+" : "-"}${formatCurrency(tx.amount)}
                  </span>
                  <button onclick="openTransactionModal('${escapeHtml(tx.id)}')" title="Edit">✏️</button>
                  <button onclick="deleteTransaction('${escapeHtml(tx.id)}')" title="Delete">🗑️</button>
                </div>
              </div>
            `).join("")
          : `<div class="empty-state"><p>No transactions yet.</p><p class="subtitle">Add one with the + button</p></div>`}
      </div>
      <div class="monthly-history-section">
        <h3>Monthly History</h3>
        <p class="subtitle">Past months summary (all data is stored and preserved)</p>
        <div class="monthly-history-list">
          ${getMonthlyHistoryHTML()}
        </div>
      </div>
    </div>
  `;

  const searchEl = document.getElementById("recordsSearch");
  const typeEl = document.getElementById("recordsType");
  const catEl = document.getElementById("recordsCategory");
  const sortEl = document.getElementById("recordsSort");

  const applyFilters = () => {
    recordsFilters = { search: searchEl.value, type: typeEl.value, category: catEl.value, sort: sortEl.value };
    renderRecords();
  };
  if (searchEl) searchEl.addEventListener("input", debounce(applyFilters, 300));
  [typeEl, catEl, sortEl].forEach(el => el?.addEventListener("change", applyFilters));
}

function navigateRecordsMonth(delta) {
  let m = AppState.ui.activeMonth + delta;
  let y = AppState.ui.activeYear;
  if (m > 11) { m = 0; y++; }
  if (m < 0) { m = 11; y--; }
  StateActions.setMonthYear(m, y);
  renderRecords();
}
          <strong>${formatCurrency(income - expense)}</strong>
        </div>
      </div>
      <div class="transaction-list">
        ${AppState.transactions.map(tx => `
          <div class="transaction-item">
            <div class="transaction-left">
              <strong>${tx.description}</strong>
              ${tx.category ? `<small>${tx.category}</small>` : ""}
            </div>
            <div class="transaction-right">
              <span class="transaction-amount ${tx.type}">
                ${tx.type === "income" ? "+" : "-"}${formatCurrency(tx.amount)}
              </span>
              <button onclick="openTransactionModal('${tx.id}')">✏️</button>
              <button onclick="deleteTransaction('${tx.id}')">🗑️</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}
