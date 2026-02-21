function buildFinancialSummary() {
  const list = getFilteredTransactions({
    month: AppState.ui.activeMonth,
    year: AppState.ui.activeYear,
  });
  const { income, expense, balance } = getComputedSummary(list);

  const expenseByCat = {};
  list.filter(t => t.type === "expense").forEach(t => {
    const c = t.category || "Other";
    expenseByCat[c] = (expenseByCat[c] || 0) + t.amount;
  });

  const key = getMonthKey();
  const budgets = AppState.budgets.monthly[key] || {};
  const budgetStatus = Object.entries(budgets).map(([cat, limit]) => ({
    category: cat,
    budget: limit,
    spent: expenseByCat[cat] || 0,
    overBudget: (expenseByCat[cat] || 0) > limit,
  }));

  const currency = AppState.ui.currency || "INR";

  return {
    period: new Date(AppState.ui.activeYear, AppState.ui.activeMonth).toLocaleString("default", { month: "long", year: "numeric" }),
    income,
    expense,
    balance,
    currency,
    expenseByCategory: expenseByCat,
    budgetStatus,
    transactionCount: list.length,
  };
}

async function fetchAISuggestions() {
  const url = (AppState.ui.aiApiUrl || "http://localhost:3001").replace(/\/$/, "");
  const fullSummary = buildFinancialSummary();
  const summary = {
    income: fullSummary.income,
    expenses: fullSummary.expense,
    categories: fullSummary.expenseByCategory,
    savingsRate: fullSummary.income
      ? parseFloat((((fullSummary.income - fullSummary.expense) / fullSummary.income) * 100).toFixed(1))
      : 0,
    currency: fullSummary.currency,
  };
  const res = await fetch(`${url}/api/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ summary }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data.suggestions;
}

function parseSuggestionsToHtml(text) {
  if (!text) return "<p>No suggestions available.</p>";
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length === 0) return `<p>${escapeHtml(text)}</p>`;
  return "<ul>" + lines.map(line => {
    const cleaned = line.replace(/^[-*•]\s*/, "").trim();
    return cleaned ? `<li>${escapeHtml(cleaned)}</li>` : "";
  }).filter(Boolean).join("") + "</ul>";
}

function renderAiInsights() {
  const summary = buildFinancialSummary();
  const apiUrl = AppState.ui.aiApiUrl || "http://localhost:3001";
  const monthLabel = new Date(AppState.ui.activeYear, AppState.ui.activeMonth).toLocaleString("default", { month: "long", year: "numeric" });

  main.innerHTML = `
    <div class="page">
      <div class="records-header">
        <h2>🤖 AI Insights</h2>
        <div class="month-nav">
          <button class="btn secondary" onclick="navigateAiInsightsMonth(-1)">←</button>
          <span class="month-label">${escapeHtml(monthLabel)}</span>
          <button class="btn secondary" onclick="navigateAiInsightsMonth(1)">→</button>
        </div>
      </div>
      <div class="ai-summary-cards">
        <div class="ai-summary-card">
          <span>Income</span>
          <strong class="text-success">${formatCurrency(summary.income)}</strong>
        </div>
        <div class="ai-summary-card">
          <span>Expense</span>
          <strong class="text-danger">${formatCurrency(summary.expense)}</strong>
        </div>
        <div class="ai-summary-card">
          <span>Balance</span>
          <strong class="${summary.balance >= 0 ? "text-success" : "text-danger"}">${formatCurrency(summary.balance)}</strong>
        </div>
      </div>
      <div class="ai-suggestions-card">
        <h3>Personalized spending suggestions</h3>
        <p class="subtitle">AI advice based on your spending patterns and budgets</p>
        <div id="aiSuggestionsContent" class="ai-suggestions-content">
          <p class="ai-placeholder">Click below to get AI-powered suggestions.</p>
        </div>
        <button id="aiGetSuggestions" class="btn">Get suggestions</button>
        <p id="aiError" class="auth-error"></p>
      </div>
      <p class="ai-disclaimer">Configure the API URL in Settings. Run the server with your OpenAI API key.</p>
    </div>
  `;

  const btn = document.getElementById("aiGetSuggestions");
  const contentEl = document.getElementById("aiSuggestionsContent");
  const errorEl = document.getElementById("aiError");

  btn?.addEventListener("click", async () => {
    errorEl.textContent = "";
    btn.disabled = true;
    btn.textContent = "Loading...";
    contentEl.innerHTML = '<p class="ai-loading">Analyzing your finances...</p>';
    try {
      const suggestions = await fetchAISuggestions();
      contentEl.innerHTML = parseSuggestionsToHtml(suggestions);
      showToast("Suggestions loaded");
    } catch (err) {
      contentEl.innerHTML = '<p class="ai-placeholder">Could not load suggestions.</p>';
      errorEl.textContent = err.message || "Request failed";
      showToast(err.message || "Failed", "warning");
    } finally {
      btn.disabled = false;
      btn.textContent = "Get suggestions";
    }
  });
}

function navigateAiInsightsMonth(delta) {
  let m = AppState.ui.activeMonth + delta;
  let y = AppState.ui.activeYear;
  if (m > 11) { m = 0; y++; }
  if (m < 0) { m = 11; y--; }
  StateActions.setMonthYear(m, y);
  renderAiInsights();
}
