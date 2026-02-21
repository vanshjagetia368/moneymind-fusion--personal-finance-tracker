let editingTransactionId = null;

function getTxDateLocal(tx) {
  if (!tx?.createdAt) return "";
  const d = new Date(tx.createdAt);
  return d.toISOString().slice(0, 16);
}

function openTransactionModal(id = null) {
  editingTransactionId = id;
  const tx = id ? AppState.transactions.find(t => t.id === id) : null;
  const dateVal = getTxDateLocal(tx) || new Date().toISOString().slice(0, 16);
function openTransactionModal(id = null) {
  editingTransactionId = id;
  const tx = id ? AppState.transactions.find(t => t.id === id) : null;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" onclick="closeTransactionModal()"></div>
    <div class="modal scale-in">
      <h3>${id ? "Edit" : "Add"} Transaction</h3>
      <div class="input-group">
        <label>Description</label>
        <input id="txDesc" placeholder="e.g. Lunch" value="${escapeHtml(tx?.description || "")}">
      </div>
      <div class="input-group">
        <label>Amount</label>
        <input id="txAmount" type="number" step="0.01" min="0" placeholder="0.00" value="${tx?.amount ?? ""}">
      </div>
      <div class="input-group">
        <label>Date & Time</label>
        <input id="txDate" type="datetime-local" value="${escapeHtml(dateVal)}">
        <input id="txDesc" value="${tx?.description || ""}">
      </div>
      <div class="input-group">
        <label>Amount</label>
        <input id="txAmount" type="number" value="${tx?.amount || ""}">
      </div>
      <div class="input-group">
        <label>Type</label>
        <select id="txType">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div class="input-group">
        <label>Account</label>
        <select id="txAccount">
          ${Object.values(AppState.accounts).map(a =>
            `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`
            `<option value="${a.id}">${a.name}</option>`
          ).join("")}
        </select>
      </div>
      <div class="input-group" id="categoryGroup">
        <label>Category</label>
        <select id="txCategory">
         
        </select>
      </div>
      <button class="btn" onclick="saveTransaction()">Save</button>
    </div>
  `);
  document.getElementById("txType").value = tx?.type || "expense";
  document.getElementById("txAccount").value = tx?.account || "cash";
  document.getElementById("txCategory").value = tx?.category || "";
  toggleCategoryVisibility();
  document.getElementById("txType").addEventListener("change", toggleCategoryVisibility);

  const onKey = (e) => {
    if (e.key === "Escape") {
      document.removeEventListener("keydown", onKey);
      closeTransactionModal();
    }
  };
  document.addEventListener("keydown", onKey);
}
function toggleCategoryVisibility() {
  const type = document.getElementById("txType").value;
  const categorySelect = document.getElementById("txCategory");
  const rawCategories =
  type === "income"
    ? AppState.categories.income
    : AppState.categories.expense;
const categories = rawCategories
  .filter(c => c !== "Others")
  .sort()
  .concat(rawCategories.includes("Others") ? ["Others"] : []);
  categorySelect.innerHTML = categories
    .map(c => `<option value="${c}">${c}</option>`)
    .join("");
}
function closeTransactionModal() {
  document.querySelectorAll(".modal, .modal-backdrop").forEach(e => e.remove());
  editingTransactionId = null;
}
function saveTransaction() {
  const dateInput = document.getElementById("txDate");
  const createdAt = dateInput?.value
    ? new Date(dateInput.value).toISOString()
    : (editingTransactionId
        ? AppState.transactions.find(t => t.id === editingTransactionId)?.createdAt
        : new Date().toISOString());

  const tx = {
    id: editingTransactionId || generateId(),
    description: document.getElementById("txDesc").value.trim(),
    amount: Number(document.getElementById("txAmount").value),
    type: document.getElementById("txType").value,
    account: document.getElementById("txAccount").value,
    category: document.getElementById("txCategory").value || null,
    createdAt,
  };
  if (!tx.description || tx.amount <= 0) {
    showToast("Please enter valid description and amount", "warning");
  const tx = {
    id: editingTransactionId || generateId(),
    description: txDesc.value.trim(),
    amount: Number(txAmount.value),
    type: txType.value,
    account: txAccount.value,
    category: txCategory.value || null,
    createdAt: editingTransactionId
      ? AppState.transactions.find(t => t.id === editingTransactionId).createdAt
      : new Date().toISOString()
  };
  if (!tx.description || tx.amount <= 0) {
    alert("Please enter valid description and amount");
    return;
  }
  if (editingTransactionId) {
    StateActions.updateTransaction(tx.id, tx);
    showToast("Transaction updated");
  } else {
    StateActions.addTransaction(tx);
    showToast("Transaction added");
  } else {
    StateActions.addTransaction(tx);
  }
  closeTransactionModal();
  refreshUI();
}
function deleteTransaction(id) {
  if (!confirm("Delete transaction?")) return;
  StateActions.deleteTransaction(id);
  showToast("Transaction deleted");
  refreshUI();
}
  refreshUI();
}
