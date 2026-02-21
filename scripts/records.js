function renderRecords() {
  const list = getFilteredTransactions({
    month: AppState.ui.activeMonth,
    year: AppState.ui.activeYear,
  });

  const { income, expense, balance } = getComputedSummary(list);

  main.innerHTML = `
    <div class="page">
      <div class="records-summary">
        <div><small>Income</small><strong>${formatCurrency(income)}</strong></div>
        <div><small>Expense</small><strong>${formatCurrency(expense)}</strong></div>
        <div><small>Balance</small><strong>${formatCurrency(balance)}</strong></div>
      </div>

      <div class="transaction-list">
        ${list.length ? list.map(tx => `
          <div class="transaction-item">
            <strong>${escapeHtml(tx.description)}</strong>
            <span>${formatCurrency(tx.amount)}</span>
          </div>
        `).join("") : "<p>No transactions</p>"}
      </div>
    </div>
  `;
}