function openTransactionModal() {
  const desc = prompt("Description?");
  const amount = Number(prompt("Amount?"));
  const type = prompt("Type (income/expense)?");

  if (!desc || !amount || !type) return;

  const tx = {
    id: generateId(),
    description: desc,
    amount,
    type,
    account: "cash",
    category: null,
    createdAt: new Date().toISOString(),
  };

  StateActions.addTransaction(tx);
  showToast("Transaction added");
  refreshUI();
}