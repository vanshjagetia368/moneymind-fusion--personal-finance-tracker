function renderSettingsView() {
  const theme = AppState.ui.theme || "dark";
  const currency = AppState.ui.currency || "INR";
  const aiApiUrl = AppState.ui.aiApiUrl || "http://localhost:3001";

  main.innerHTML = `
    <div class="page settings-grid">

      <div class="settings-card">
        <h3>Appearance</h3>
        <select id="themeSelect">
          <option value="dark" ${theme === "dark" ? "selected" : ""}>Dark</option>
          <option value="light" ${theme === "light" ? "selected" : ""}>Light</option>
        </select>
      </div>

      <div class="settings-card">
        <h3>Currency</h3>
        <select id="currencySelect">
          <option value="INR" ${currency === "INR" ? "selected" : ""}>₹ INR</option>
          <option value="USD" ${currency === "USD" ? "selected" : ""}>$ USD</option>
          <option value="EUR" ${currency === "EUR" ? "selected" : ""}>€ EUR</option>
          <option value="GBP" ${currency === "GBP" ? "selected" : ""}>£ GBP</option>
        </select>
      </div>

      <div class="settings-card">
        <h3>AI API URL</h3>
        <input type="url" id="aiApiUrlInput" value="${aiApiUrl}">
      </div>

      <div class="settings-card">
        <h3>Export</h3>
        <button class="btn" onclick="exportCSV()">Download CSV</button>
      </div>

      <div class="settings-card">
        <h3 class="text-danger">Danger Zone</h3>
        <button class="btn secondary" onclick="resetAllData()">Reset All Data</button>
      </div>

    </div>
  `;

  document.getElementById("themeSelect").onchange = e => {
    StateActions.setTheme(e.target.value);
  };

  document.getElementById("currencySelect").onchange = e => {
    StateActions.setCurrency(e.target.value);
  };

  document.getElementById("aiApiUrlInput").onblur = e => {
    StateActions.setAiApiUrl(e.target.value);
  };
}

function exportCSV() {
  if (!AppState.transactions.length) {
    alert("No transactions to export");
    return;
  }

  const headers = ["Description","Amount","Type","Category","Account","Date"];
  const rows = AppState.transactions.map(tx => [
    tx.description,
    tx.amount,
    tx.type,
    tx.category || "",
    tx.account,
    new Date(tx.createdAt).toLocaleString()
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "moneymind_export.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function resetAllData() {
  if (!confirm("Delete all data?")) return;
  localStorage.clear();
  location.reload();
}