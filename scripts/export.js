function renderSettingsView() {
  const theme = AppState.ui.theme || "dark";
  const currency = AppState.ui.currency || "INR";
  const aiApiUrl = AppState.ui.aiApiUrl || "http://localhost:3001";

  main.innerHTML = `
    <div class="page settings-grid">
      <div class="settings-card">
        <h3>Appearance</h3>
        <div class="input-group">
          <label>Theme</label>
          <select id="themeSelect">
            <option value="dark" ${theme === "dark" ? "selected" : ""}>Dark</option>
            <option value="light" ${theme === "light" ? "selected" : ""}>Light</option>
          </select>
        </div>
      </div>
      <div class="settings-card">
        <h3>AI Insights</h3>
        <div class="input-group">
          <label>API Server URL</label>
          <input type="url" id="aiApiUrlInput" placeholder="http://localhost:3001" value="${escapeHtml(aiApiUrl)}">
        </div>
        <p class="subtitle">Backend URL for AI suggestions. Run <code>npm start</code> in server/ folder.</p>
      </div>
      <div class="settings-card">
        <h3>Currency</h3>
        <div class="input-group">
          <label>Display Currency</label>
          <select id="currencySelect">
            <option value="INR" ${currency === "INR" ? "selected" : ""}>₹ Indian Rupee</option>
            <option value="USD" ${currency === "USD" ? "selected" : ""}>$ US Dollar</option>
            <option value="EUR" ${currency === "EUR" ? "selected" : ""}>€ Euro</option>
            <option value="GBP" ${currency === "GBP" ? "selected" : ""}>£ British Pound</option>
          </select>
        </div>
      </div>
      <div class="settings-card">
  main.innerHTML = `
    <div class="page settings-grid">
      <div class="settings-card">
        <h3>Export Data</h3>
        <button class="btn" onclick="exportCSV()">Download Full CSV</button>
        <p class="subtitle">Includes income, expenses, date & time</p>
      </div>
      <div class="settings-card">
        <h3>Import Data</h3>
        <input type="file" id="importFile" accept=".csv" class="file-input">
        <button class="btn secondary" onclick="document.getElementById('importFile').click()">Choose CSV File</button>
        <p class="subtitle">Import transactions from CSV (Description, Amount, Type, Category, Account, Date, Time)</p>
      </div>
      <div class="settings-card">
        <h3 class="text-danger">Danger Zone</h3>
        <button class="btn secondary" onclick="resetAllData()">Reset All Data</button>
        <p class="subtitle text-warning">This action cannot be undone</p>
      </div>
    </div>
  `;

  document.getElementById("themeSelect")?.addEventListener("change", (e) => {
    StateActions.setTheme(e.target.value);
    showToast("Theme updated");
  });
  document.getElementById("currencySelect")?.addEventListener("change", (e) => {
    StateActions.setCurrency(e.target.value);
    showToast("Currency updated");
  });
  document.getElementById("aiApiUrlInput")?.addEventListener("blur", (e) => {
    StateActions.setAiApiUrl(e.target.value);
    showToast("AI API URL saved");
  });
  document.getElementById("importFile")?.addEventListener("change", handleImportCSV);
        <h3 class="text-danger">Danger Zone</h3>
        <button class="btn secondary" onclick="resetAllData()">
          Reset All Data
        </button>
        <p class="subtitle text-warning">
          This action cannot be undone
        </p>
      </div>
    </div>
  `;
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
function exportCSV() {
  if (!AppState.transactions.length) {
    showToast("No transactions to export", "warning");
    alert("No transactions to export");
    return;
  }
  const headers = [
    "Description",
    "Amount",
    "Type",
    "Category",
    "Account",
    "Date",
    "Time",
  ];
  const rows = AppState.transactions.map(tx => [
    `"${tx.description}"`,
    tx.amount,
    tx.type,
    tx.category || "—",
    tx.account,
    formatDate(tx.createdAt),
    formatTime(tx.createdAt),
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `moneymind_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function resetAllData() {
  if (!confirm("This will permanently delete all your transaction data. Continue?")) return;
  const key = getStateKey();
  if (key) localStorage.removeItem(key);
  clearUserState();
  showToast("Data reset");
  refreshUI();
}

function handleImportCSV(e) {
  const file = e.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const text = ev.target?.result;
      if (!text) throw new Error("Empty file");
      const lines = text.trim().split("\n").map(l => l.trim());
      if (lines.length < 2) throw new Error("No data rows");
      const headers = lines[0].toLowerCase().replace(/"/g, "").split(",").map(h => h.trim());
      const descIdx = headers.findIndex(h => h.includes("desc"));
      const amtIdx = headers.findIndex(h => h.includes("amount"));
      const typeIdx = headers.findIndex(h => h.includes("type"));
      const catIdx = headers.findIndex(h => h.includes("category"));
      const accIdx = headers.findIndex(h => h.includes("account"));
      const dateIdx = headers.findIndex(h => h.includes("date"));
      const timeIdx = headers.findIndex(h => h.includes("time"));
      if (descIdx < 0 || amtIdx < 0) throw new Error("Need Description and Amount columns");

      function parseCSVRow(line) {
        const out = [];
        let cur = "";
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') inQ = !inQ;
          else if ((c === "," && !inQ) || c === "\n") { out.push(cur.trim().replace(/^"|"$/g, "")); cur = ""; }
          else cur += c;
        }
        out.push(cur.trim().replace(/^"|"$/g, ""));
        return out;
      }
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        const desc = row[descIdx] || "";
        const amt = parseFloat(String(row[amtIdx]).replace(/[^0-9.-]/g, ""));
        if (!desc || isNaN(amt) || amt <= 0) continue;
        const type = (row[typeIdx] || "expense").toLowerCase().includes("income") ? "income" : "expense";
        const category = row[catIdx] || null;
        const account = row[accIdx] || "cash";
        let createdAt = new Date().toISOString();
        if (dateIdx >= 0 && row[dateIdx]) {
          const dateStr = row[dateIdx];
          const timeStr = timeIdx >= 0 && row[timeIdx] ? row[timeIdx] : "00:00:00";
          const parsed = new Date(dateStr + " " + timeStr);
          if (!isNaN(parsed.getTime())) createdAt = parsed.toISOString();
        }
        const tx = { id: generateId(), description: desc, amount: amt, type, account, category, createdAt };
        StateActions.addTransaction(tx);
        count++;
      }
      showToast(`Imported ${count} transaction(s)`);
      e.target.value = "";
      refreshUI();
    } catch (err) {
      showToast(err.message || "Import failed", "warning");
    }
  };
  reader.readAsText(file);
}
  if (!confirm("This will permanently delete all data. Continue?")) return;
  localStorage.clear();
  location.reload();
}
