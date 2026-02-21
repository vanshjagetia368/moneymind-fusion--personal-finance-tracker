function renderCategoriesView() {
  main.innerHTML = `
  appMain.innerHTML = `
    <div class="page categories-grid">
      ${["income", "expense"].map(type => `
        <div class="category-card">
          <h3>${type.toUpperCase()} Categories</h3>
          ${AppState.categories[type].map(cat => `
            <div class="category-item">
              <span>${cat}</span>
              <button onclick="removeCategory('${type}','${cat}')">🗑️</button>
            </div>
          `).join("")}
          <button class="btn secondary" onclick="addCategory('${type}')">Add</button>
        </div>
      `).join("")}
    </div>
  `;
}
function addCategory(type) {
  const name = prompt("Category name?");
  if (!name?.trim()) return;
  StateActions.addCategory(type, name.trim());
  showToast("Category added");
  refreshUI();
}
function removeCategory(type, name) {
  if (!confirm(`Remove "${name}"?`)) return;
  StateActions.removeCategory(type, name);
  showToast("Category removed");
  refreshUI();
  if (!name) return;
  AppState.categories[type].push(name);
  saveState();
refreshUI();
}
function removeCategory(type, name) {
  AppState.categories[type] = AppState.categories[type].filter(c => c !== name);
  saveState();
refreshUI();
}