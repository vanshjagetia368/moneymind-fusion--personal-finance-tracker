const PIE_COLORS = [
  "#00ffe7", "#ff4ecd", "#00ff88", "#ff4e4e", "#ffc94e",
  "#7c3aed", "#06b6d4", "#f97316", "#22c55e", "#ec4899",
];

let analyticsPeriod = "month";
let analyticsMonthsBack = 6;

function renderAnalytics() {
  const list = getFilteredTransactions({
    month: AppState.ui.activeMonth,
    year: AppState.ui.activeYear,
  });
  const allList = AppState.transactions;
  const { income, expense, balance } = getComputedSummary(list);
  const total = income + expense || 1;

  const expenseByCat = {};
  list.filter(t => t.type === "expense").forEach(t => {
    const c = t.category || "Other";
    expenseByCat[c] = (expenseByCat[c] || 0) + t.amount;
  });
  const catEntries = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...catEntries.map(([, v]) => v));

  let deg = 0;
  const conicParts = catEntries.map(([name, amt], i) => {
    const pct = expense ? (amt / expense) * 100 : 0;
    const degStart = deg;
    deg += (pct / 100) * 360;
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${degStart}deg ${deg}deg`;
  });
  const conicGradient = conicParts.length ? `conic-gradient(${conicParts.join(", ")})` : "transparent";

  const trendData = analyticsPeriod === "week"
    ? getExpenseByWeek(allList, 8)
    : getExpenseByMonth(allList, analyticsMonthsBack);
  const maxTrend = Math.max(1, ...trendData.map(d => d.value));
  const chartHeight = 160;
  const chartWidth = 400;

  const monthLabel = new Date(AppState.ui.activeYear, AppState.ui.activeMonth).toLocaleString("default", { month: "long", year: "numeric" });

  const linePoints = trendData.map((d, i) => {
    const x = (i / Math.max(1, trendData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 20 - (d.value / maxTrend) * (chartHeight - 40);
    return `${x},${y}`;
  }).join(" ");

  main.innerHTML = `
    <div class="page">
      <div class="records-header">
        <h2>Analysis</h2>
        <div class="analytics-controls">
          <div class="month-nav">
            <button class="btn secondary" onclick="navigateAnalyticsMonth(-1)">←</button>
            <span class="month-label">${escapeHtml(monthLabel)}</span>
            <button class="btn secondary" onclick="navigateAnalyticsMonth(1)">→</button>
          </div>
          <select class="filter-select" id="analyticsPeriod" onchange="setAnalyticsPeriod(this.value)">
            <option value="week" ${analyticsPeriod === "week" ? "selected" : ""}>Last 8 weeks</option>
            <option value="month" ${analyticsPeriod === "month" ? "selected" : ""}>Last 6 months</option>
          </select>
        </div>
      </div>
      <div class="analytics-kpis">
        <div class="analytics-kpi">
          <span>Income</span>
          <strong class="text-success">${formatCurrency(income)}</strong>
        </div>
        <div class="analytics-kpi">
          <span>Expense</span>
          <strong class="text-danger">${formatCurrency(expense)}</strong>
        </div>
        <div class="analytics-kpi">
          <span>Balance</span>
          <strong class="${balance >= 0 ? "text-success" : "text-danger"}">${formatCurrency(balance)}</strong>
        </div>
      </div>
      <div class="analytics-card chart-card">
        <h3>Expense trend</h3>
        <div class="chart-container">
          <svg class="line-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
            ${trendData.map((d, i) => {
              const x = (i / Math.max(1, trendData.length - 1)) * (chartWidth - 40) + 20;
              const barHeight = (d.value / maxTrend) * (chartHeight - 40);
              const y = chartHeight - 20 - barHeight;
              return `<rect x="${x - 4}" y="${y}" width="8" height="${barHeight}" fill="var(--color-accent-primary)" opacity="0.8" rx="2"/>`;
            }).join("")}
            <polyline fill="none" stroke="var(--color-accent-secondary)" stroke-width="2" points="${linePoints}"/>
          </svg>
          <div class="chart-labels">
            ${trendData.map(d => `<span title="${escapeHtml(d.fullLabel)}">${escapeHtml(d.label)}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>Income vs Expense</h3>
          <div class="bar-chart">
            <div class="bar income" style="height:${(income / total) * 100}%"></div>
            <div class="bar expense" style="height:${(expense / total) * 100}%"></div>
          </div>
          <small>Income ${formatCurrency(income)} | Expense ${formatCurrency(expense)}</small>
        </div>
        <div class="analytics-card">
          <h3>Net balance</h3>
          <p class="kpi-value ${balance >= 0 ? "text-success" : "text-danger"}">${formatCurrency(balance)}</p>
        </div>
      </div>
      <div class="analytics-card analytics-full">
        <h3>Expense by category</h3>
        <div class="analytics-charts-row">
          <div class="pie-chart-container">
            <div class="pie-chart" style="background: ${conicGradient}" aria-hidden="true"></div>
            <ul class="pie-legend">
              ${catEntries.map(([name, amt], i) => `
                <li><span class="legend-dot" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>
                ${escapeHtml(name)}: ${formatCurrency(amt)}</li>
              `).join("")}
            </ul>
          </div>
          <div class="bar-chart-horizontal">
            ${catEntries.map(([name, amt], i) => `
              <div class="bar-row">
                <span class="bar-label">${escapeHtml(name)}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${(amt / maxCat) * 100}%;background:${PIE_COLORS[i % PIE_COLORS.length]}"></div></div>
                <span class="bar-value">${formatCurrency(amt)}</span>
              </div>
            `).join("")}
          </div>
        </div>
        ${catEntries.length === 0 ? '<p class="empty-state">No expenses this month</p>' : ""}
      </div>
    </div>
  `;
}

function setAnalyticsPeriod(val) {
  analyticsPeriod = val;
  renderAnalytics();
}

function navigateAnalyticsMonth(delta) {
  let m = AppState.ui.activeMonth + delta;
  let y = AppState.ui.activeYear;
  if (m > 11) { m = 0; y++; }
  if (m < 0) { m = 11; y--; }
  StateActions.setMonthYear(m, y);
  renderAnalytics();
}
function renderAnalytics() {
  const income = AppState.transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = AppState.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const total = income + expense || 1;
  appMain.innerHTML = `
    <div class="page analytics-grid">
      <div class="analytics-card">
        <h3>Income vs Expense</h3>
        <div class="bar-chart">
          <div class="bar income" style="height:${income / total * 100}%"></div>
          <div class="bar expense" style="height:${expense / total * 100}%"></div>
        </div>
        <small>Income ${formatCurrency(income)} | Expense ${formatCurrency(expense)}</small>
      </div>
    </div>
  `;
}
