const main = document.getElementById("appMain");
const navButtons = document.querySelectorAll("[data-view]");
const fab = document.getElementById("fabAddTransaction");

function navigate(view) {
  if (!view) return;
  StateActions.setView(view);
  refreshUI();
}

function refreshUI() {
  if (!main) return;

  const view = AppState.ui.activeView;
  main.innerHTML = "";

  switch (view) {
    case "records":
      renderRecords();
      break;

    case "analysis":
      renderAnalytics();
      break;

    case "ai-insights":
      if (typeof renderAiInsights === "function") {
        renderAiInsights();
      }
      break;

    case "budgets":
      renderBudgets();
      break;

    case "accounts":
      renderAccounts();
      break;

    case "categories":
      renderCategoriesView();
      break;

    case "settings":
      renderSettingsView();
      break;

    default:
      StateActions.setView("records");
      renderRecords();
  }

  updateActiveNav();
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    navigate(view);
  });
});

if (fab) {
  fab.addEventListener("click", () => {
    if (typeof openTransactionModal === "function") {
      openTransactionModal();
    }
  });
}

function updateActiveNav() {
  navButtons.forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.view === AppState.ui.activeView
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!AppState.ui.activeView) {
    AppState.ui.activeView = "records";
  }

  refreshUI();
});