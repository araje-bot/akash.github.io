import { escapeHtml, inspectionTableRowHtml } from "./utils.js";

const VISIT_GROUPS = [
  {
    id: "comprehensive",
    label: "Full routine inspections",
    matchValues: ["Comprehensive"],
  },
  {
    id: "reinspection",
    label: "Return visits & follow-up",
    matchValues: ["Re-inspection", "Re-inspection Phone/ Verification"],
  },
  {
    id: "monitoring",
    label: "Monitoring visits",
    matchValues: ["Monitoring"],
  },
  {
    id: "complaint",
    label: "Complaints & illness-related",
    matchValues: ["Food Complaint", "Single Foodborne Illness"],
  },
  {
    id: "opening",
    label: "New ownership & pre-opening",
    matchValues: ["Pre-Opening Inspection", "Change Of Ownership"],
  },
  {
    id: "other_misc",
    label: "Other or unspecified labels",
    matchValues: ["Other", "N/A", "Default"],
  },
];

function visitGroupIdForRow(row) {
  const t = String(row.inspectionType ?? "").trim();
  for (const g of VISIT_GROUPS) {
    if (g.matchValues.includes(t)) return g.id;
  }
  return "uncategorized";
}

const CATEGORY_TABLE_HEAD = `
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">City</th>
              <th scope="col">Date</th>
              <th scope="col">Compliance</th>
            </tr>
          </thead>`;

function categoryTableInnerHtml(rows) {
  const body = rows.map((r) => inspectionTableRowHtml(r)).join("");
  return `${CATEGORY_TABLE_HEAD}<tbody>${body}</tbody>`;
}

function showCategories(data) {
  const groups = {};
  for (const g of VISIT_GROUPS) {
    groups[g.id] = [];
  }
  groups.uncategorized = [];

  for (const row of data) {
    const id = visitGroupIdForRow(row);
    (groups[id] ?? groups.uncategorized).push(row);
  }

  const UNCATEGORIZED = {
    id: "uncategorized",
    label: "Other labels in the file",
    matchValues: [],
  };
  const allBuckets = [
    ...VISIT_GROUPS,
    ...(groups.uncategorized.length ? [UNCATEGORIZED] : []),
  ];
  const presentBuckets = allBuckets
    .filter((b) => (groups[b.id] || []).length > 0)
    .sort((a, b) => groups[b.id].length - groups[a.id].length);

  const firstId = presentBuckets[0]?.id ?? "";

  const navHtml = presentBuckets
    .map((bucket, idx) => {
      const n = groups[bucket.id].length;
      const isFirst = idx === 0;
      const bid = escapeHtml(bucket.id);
      return `
        <button type="button" class="category-nav__btn${isFirst ? " is-active" : ""}" data-category-nav="${bid}" id="category-nav-${bid}" role="tab" aria-selected="${isFirst ? "true" : "false"}" aria-controls="category-pane-${bid}" tabindex="${isFirst ? "0" : "-1"}">
          <span class="category-nav__label">${escapeHtml(bucket.label)}</span>
          <span class="category-nav__count">${n}</span>
        </button>`;
    })
    .join("");

  const panesHtml = presentBuckets
    .map((bucket, idx) => {
      const items = groups[bucket.id];
      const isFirst = idx === 0;
      const bid = escapeHtml(bucket.id);
      const tableInner = categoryTableInnerHtml(items);
      return `
      <div class="category-detail-pane${isFirst ? " is-active" : ""}" data-category-pane="${bid}" id="category-pane-${bid}" role="tabpanel" aria-labelledby="category-nav-${bid}">
        <div class="category-detail__scroll card-surface table-scroll">
          <table class="restaurant-table" aria-label="Inspections in this visit type">${tableInner}</table>
        </div>
      </div>`;
    })
    .join("");

  const firstCount = firstId ? groups[firstId].length : 0;

  return `
    <div class="view-panel view-panel--category" id="category-panels" data-category-default="${escapeHtml(firstId)}">
      <header class="view-panel__head view-panel__head--category">
        <div class="view-panel__head-row">
          <h2 class="view-title">Category-wise Inspections</h2>
          <p class="filter-results-heading" id="category-filter-results" aria-live="polite">${firstCount} records · ${presentBuckets[0] ? escapeHtml(presentBuckets[0].label) : ""}</p>
        </div>
      </header>
      <div class="category-split">
        <nav class="category-nav card-surface" aria-label="Visit type categories">${navHtml}</nav>
        <div class="category-detail">${panesHtml}</div>
      </div>
    </div>`;
}

export function initCategorySearch() {
  const panel = document.querySelector(".view-panel--category");
  if (!panel) return;

  const buttons = [...panel.querySelectorAll("[data-category-nav]")];
  const panes = [...panel.querySelectorAll("[data-category-pane]")];
  const status = document.getElementById("category-filter-results");

  function labelFor(id) {
    const btn = buttons.find((b) => b.getAttribute("data-category-nav") === id);
    return btn?.querySelector(".category-nav__label")?.textContent?.trim() ?? "";
  }

  function selectCategory(id) {
    buttons.forEach((btn) => {
      const on = btn.getAttribute("data-category-nav") === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.setAttribute("tabindex", on ? "0" : "-1");
    });
    panes.forEach((pane) => {
      const on = pane.getAttribute("data-category-pane") === id;
      pane.classList.toggle("is-active", on);
    });

    const activeBtn = buttons.find((b) => b.classList.contains("is-active"));
    const n = activeBtn?.querySelector(".category-nav__count")?.textContent ?? "0";
    const lab = labelFor(id);
    if (status) {
      status.textContent = lab ? `${n} records · ${lab}` : `${n} records`;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => selectCategory(btn.getAttribute("data-category-nav") || ""));
  });

  function navIndexAfterKey(i, key, len) {
    switch (key) {
      case "ArrowDown":
        return Math.min(i + 1, len - 1);
      case "ArrowUp":
        return Math.max(i - 1, 0);
      case "Home":
        return 0;
      case "End":
        return len - 1;
      default:
        return null;
    }
  }

  const navEl = panel.querySelector(".category-nav");
  navEl?.addEventListener("keydown", (e) => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    const next = navIndexAfterKey(i, e.key, buttons.length);
    if (next === null) return;
    e.preventDefault();
    buttons[next].focus();
    selectCategory(buttons[next].getAttribute("data-category-nav") || "");
  });
}

export default showCategories;
