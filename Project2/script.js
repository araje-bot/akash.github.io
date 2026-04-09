import showCategories, { initCategorySearch } from "./editable_js/template_category.js";
import showStats from "./editable_js/template_stats.js";
import showTable, { initTableCityFilter } from "./editable_js/template_table.js";
import showExternal, { initExternalMap, destroyExternalMap } from "./editable_js/template_external.js";
import loadData from "./editable_js/load_data.js";
import { escapeHtml } from "./editable_js/utils.js";
import { wireStatsDrilldown } from "./editable_js/stats_drilldown.js";

let appData = [];
const tableSortState = { key: "inspectionDate", dir: "desc" };

let dataDisplayEl;

function updateDisplay(content) {
  dataDisplayEl.innerHTML = content;
}

function updateButtonStates(activeView) {
  document.querySelectorAll(".nav-pill").forEach((button) => {
    button.classList.remove("active");
  });
  const btn = document.getElementById(`btn-${activeView}`);
  if (btn) btn.classList.add("active");
}

function showLoading() {
  updateDisplay('<div class="loading">Loading Data From API</div>');
}

function showError(message) {
  updateDisplay(`
    <div class="error">
      <h3>Error Loading Data</h3>
      <p>${escapeHtml(message)}</p>
      <button type="button" id="retry-load" class="btn btn-primary">Try Again</button>
    </div>`);
  document.getElementById("retry-load")?.addEventListener("click", () => location.reload());
}

function showExternalView() {
  updateDisplay(showExternal(appData));
  updateButtonStates("external");
  requestAnimationFrame(() => initExternalMap(appData));
}

function showTableView() {
  destroyExternalMap();
  updateDisplay(showTable(appData, tableSortState.key, tableSortState.dir));
  updateButtonStates("table");
  initTableCityFilter();
}

document.addEventListener("DOMContentLoaded", async () => {
  dataDisplayEl = document.getElementById("data-display");
  wireStatsDrilldown(() => appData);

  document.addEventListener("click", (e) => {
    document.querySelectorAll("details.multi-dropdown[open]").forEach((d) => {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });

  dataDisplayEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-table-sort]");
    if (!btn || !appData.length) return;
    const key = btn.getAttribute("data-table-sort");
    if (!key) return;
    destroyExternalMap();
    if (tableSortState.key === key) {
      tableSortState.dir = tableSortState.dir === "asc" ? "desc" : "asc";
    } else {
      tableSortState.key = key;
      tableSortState.dir = "asc";
    }
    updateDisplay(showTable(appData, tableSortState.key, tableSortState.dir));
    updateButtonStates("table");
    initTableCityFilter();
  });

  try {
    showLoading();
    appData = await loadData();
    console.log(`Loaded ${appData.length} items from API`);

    document.getElementById("btn-external").onclick = () => showExternalView();
    document.getElementById("btn-table").onclick = () => showTableView();
    document.getElementById("btn-categories").onclick = () => {
      destroyExternalMap();
      updateDisplay(showCategories(appData));
      updateButtonStates("categories");
      initCategorySearch();
    };
    document.getElementById("btn-stats").onclick = () => {
      destroyExternalMap();
      updateDisplay(showStats(appData));
      updateButtonStates("stats");
    };

    destroyExternalMap();
    updateDisplay(showCategories(appData));
    updateButtonStates("categories");
    initCategorySearch();
    console.log("Application ready");
  } catch (error) {
    console.error("Application failed to start:", error);
    showError(error.message || "Unknown Error");
  }
});
