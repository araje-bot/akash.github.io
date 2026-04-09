import {
  cityFilterRowAttrs,
  inspectionTableRowHtml,
} from "./utils.js";
import { wireCityMultiselect } from "./city_multiselect.js";

const SORT_KEYS = {
  name: (r) => r.name,
  city: (r) => r.city,
  inspectionDate: (r) => r.inspectionDate,
  inspectionResult: (r) => r.inspectionResult,
};

function sortRows(rows, sortKey, sortDir) {
  const get = SORT_KEYS[sortKey] || SORT_KEYS.name;
  const dir = sortDir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const cmp = String(get(a)).localeCompare(String(get(b)), undefined, { sensitivity: "base" });
    return dir * cmp;
  });
}

function showTable(data, sortKey = "name", sortDir = "asc") {
  const sorted = sortRows(data, sortKey, sortDir);
  const dirHint = sortDir === "asc" ? "\u2191" : "\u2193";

  const rowsHtml = sorted
    .map((r) => inspectionTableRowHtml(r, cityFilterRowAttrs(r)))
    .join("");

  return `
    <div class="view-panel view-panel--table">
      <header class="view-panel__head view-panel__head--with-icon">
        <div class="view-panel__head-row">
          <h2 class="view-title"><i class="fa-solid fa-table view-title__icon" aria-hidden="true"></i> Table View</h2>
          <p class="filter-results-heading" id="table-filter-results" aria-live="polite"></p>
        </div>
      </header>
      <div class="filter-card card-surface filter-card--overlay-dropdown" role="search">
        <div class="filter-card__controls">
          <label class="visually-hidden" for="table-city-search">Filter City List</label>
          <div class="search-field">
            <i class="fa-solid fa-magnifying-glass search-field__icon" aria-hidden="true"></i>
            <input type="search" id="table-city-search" class="search-field__input" placeholder="Type City Name" autocomplete="off">
          </div>
          <details class="multi-dropdown">
            <summary class="multi-dropdown__summary">
              <i class="fa-solid fa-list-ul multi-dropdown__summary-icon" aria-hidden="true"></i>
              <span>Select Cities</span>
              <i class="fa-solid fa-chevron-down multi-dropdown__chev" aria-hidden="true"></i>
            </summary>
            <div class="multi-dropdown__panel" id="table-checkbox-list"></div>
          </details>
        </div>
        <div class="multi-chips" id="table-chips"></div>
      </div>
      <div class="table-scroll card-surface">
        <table class="restaurant-table">
          <thead>
            <tr>
              <th scope="col"><button type="button" class="table-sort" data-table-sort="name" aria-label="Sort By Name">Name ${sortKey === "name" ? dirHint : ""}</button></th>
              <th scope="col"><button type="button" class="table-sort" data-table-sort="city" aria-label="Sort By City">City ${sortKey === "city" ? dirHint : ""}</button></th>
              <th scope="col"><button type="button" class="table-sort" data-table-sort="inspectionDate" aria-label="Sort By Inspection Date">Date ${sortKey === "inspectionDate" ? dirHint : ""}</button></th>
              <th scope="col"><button type="button" class="table-sort" data-table-sort="inspectionResult" aria-label="Sort By Compliance">Compliance ${sortKey === "inspectionResult" ? dirHint : ""}</button></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;
}

export function initTableCityFilter() {
  const tbody = document.querySelector(".restaurant-table tbody");
  const input = document.getElementById("table-city-search");
  const listEl = document.getElementById("table-checkbox-list");
  const chipsEl = document.getElementById("table-chips");
  const status = document.getElementById("table-filter-results");
  if (!tbody || !input || !listEl || !chipsEl) return;

  const rows = [...tbody.querySelectorAll("tr")];
  const allCities = [
    ...new Set(rows.map((tr) => tr.getAttribute("data-city") || "").filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  wireCityMultiselect({
    searchInput: input,
    listEl,
    chipsEl,
    statusEl: null,
    allCities,
    onChange(selected) {
      let visible = 0;
      rows.forEach((tr) => {
        const city = tr.getAttribute("data-city") || "";
        const show = selected.size === 0 || selected.has(city);
        tr.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      if (status) {
        if (selected.size === 0) {
          status.textContent = `${rows.length} restaurants`;
        } else {
          status.textContent = `${visible} restaurants`;
        }
      }
    },
  });
}

export default showTable;
