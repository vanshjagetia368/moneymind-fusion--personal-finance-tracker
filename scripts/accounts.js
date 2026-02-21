let accountsMonthFilter = null;
let accountsYearFilter = null;

function renderAccounts() {
  const useFilter = accountsMonthFilter != null && accountsYearFilter != null;
  const list = useFilter
    ? getFilteredTransactions({ month: accountsMonthFilter, year: accountsYearFilter })
    : AppState.transactions;
  const stats = getAccountStats(AppState.transactions, accountsMonthFilter, accountsYearFilter);
  const totalBalance = Object.values(stats).reduce((s, a) => s + a.balance, 0);
  const maxBalance = Math.max(1, ...Object.values(stats).map(a => Math.abs(a.balance)));
  const monthLabel = useFilter
    ? new Date(accountsYearFilter, accountsMonthFilter).toLocaleString("default", { month: "long", year: "numeric" })
    : "All time";

  main.innerHTML = `
    <div class="page">
      <div class="records-header">
        <h2>Accounts</h2>
        <div class="accounts-filters">
          <div class="month-nav">
            <button class="btn secondary" onclick="navigateAccountsMonth(-1)">←</button>
            <span class="month-label">${escapeHtml(monthLabel)}</span>
            <button class="btn secondary" onclick="navigateAccountsMonth(1)">→</button>
          </div>
          <button class="btn secondary" onclick="toggleAccountsAllTime()">${useFilter ? "View all time" : "View by month"}</button>
        </div>
      </div>
      <div class="accounts-networth">
        <span>Total Net Worth</span>
        <strong class="${totalBalance >= 0 ? "text-success" : "text-danger"}">${formatCurrency(totalBalance)}</strong>
      </div>
      <div class="accounts-grid">
        ${Object.values(AppState.accounts).map(acc => {
          const s = stats[acc.id] || { balance: 0, income: 0, expense: 0, count: 0 };
          const barPct = Math.min(100, (Math.abs(s.balance) / maxBalance) * 100);
          const isCredit = acc.id === "card";
          return `
            <div class="account-card-enhanced">
              <div class="account-card-header">
                <strong>${escapeHtml(acc.name)}</strong>
                <span class="account-badge">${s.count} tx</span>
              </div>
              <div class="account-balance ${s.balance >= 0 ? "positive" : "negative"}">
                ${isCredit && s.balance < 0 ? "Due: " : ""}${formatCurrency(Math.abs(s.balance))}
              </div>
              <div class="account-breakdown">
                <span class="text-success">↑ ${formatCurrency(s.income)}</span>
                <span class="text-danger">↓ ${formatCurrency(s.expense)}</span>
              </div>
              <div class="account-bar">
                <div class="account-bar-fill" style="width:${barPct}%;background:${s.balance >= 0 ? "var(--color-success)" : "var(--color-danger)"}"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="accounts-recent">
        <h3>Recent transactions by account</h3>
        ${Object.values(AppState.accounts).map(acc => {
          const recent = AppState.transactions
            .filter(t => t.account === acc.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
          return `
            <div class="account-recent-card">
              <strong>${escapeHtml(acc.name)}</strong>
              ${recent.length ? recent.map(tx => `
                <div class="account-recent-item">
                  <span>${escapeHtml(tx.description)}</span>
                  <span class="amount ${tx.type}">${tx.type === "income" ? "+" : "-"}${formatCurrency(tx.amount)}</span>
                </div>
              `).join("") : '<p class="empty-state small">No transactions</p>'}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function navigateAccountsMonth(delta) {
  const now = new Date();
  const m = accountsMonthFilter ?? now.getMonth();
  const y = accountsYearFilter ?? now.getFullYear();
  let nm = m + delta;
  let ny = y;
  if (nm > 11) { nm = 0; ny++; }
  if (nm < 0) { nm = 11; ny--; }
  accountsMonthFilter = nm;
  accountsYearFilter = ny;
  renderAccounts();
}

function toggleAccountsAllTime() {
  if (accountsMonthFilter != null) {
    accountsMonthFilter = null;
    accountsYearFilter = null;
  } else {
    const now = new Date();
    accountsMonthFilter = now.getMonth();
    accountsYearFilter = now.getFullYear();
  }
  renderAccounts();
}
function renderAccounts() {
  const balances = {
    cash: 0,
    bank: 0,
    card: 0,
  };
  AppState.transactions.forEach(tx => {
    if (tx.type === "income") balances[tx.account] += tx.amount;
    else balances[tx.account] -= tx.amount;
  });
  main.innerHTML = `
    <div class="page">
      ${Object.values(AppState.accounts).map(acc => `
        <div class="account-card">
          <strong>${acc.name}</strong>
          <p>
            ${acc.id === "card"
              ? `Due: ${formatCurrency(Math.abs(balances.card))}`
              : `Balance: ${formatCurrency(balances[acc.id])}`}
          </p>
        </div>
      `).join("")}
    </div>
  `;
}
