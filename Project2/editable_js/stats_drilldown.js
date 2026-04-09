import {
  escapeHtml,
  inspectionOutcomeBucketId,
  isOutOfComplianceField,
} from "./utils.js";

const RISK_ROW_FILTERS = {
  rodent: (r) => isOutOfComplianceField(r.rodentInsects),
  contact: (r) => isOutOfComplianceField(r.foodContact),
  cold: (r) => isOutOfComplianceField(r.coldHolding),
};

function filterRowsForKey(data, key) {
  const [kind, ...rest] = key.split(":");
  const id = rest.join(":");
  if (kind === "outcome") {
    return data.filter((r) => inspectionOutcomeBucketId(r) === id);
  }
  if (kind === "risk") {
    const match = RISK_ROW_FILTERS[id];
    return match ? data.filter(match) : [];
  }
  return [];
}

/**
 * One-time wiring: stat cards with [data-stat-drilldown] open the slide-out table panel.
 * `getData` should return the current full dataset (e.g. () => appData).
 */
export function wireStatsDrilldown(getData) {
  const root = document.getElementById("stats-drilldown");
  if (!root) return;

  const titleEl = document.getElementById("stats-drilldown-title-text");
  const tbody = document.getElementById("stats-drilldown-tbody");
  const closeBtn = root.querySelector(".stats-drilldown__close");
  const backdrop = root.querySelector(".stats-drilldown__backdrop");

  function close() {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("stats-drilldown-open");
  }

  function openPanel(key, label) {
    const data = getData() || [];
    const rows = filterRowsForKey(data, key);
    if (titleEl) titleEl.textContent = label || "Records";
    if (tbody) {
      tbody.innerHTML = rows.length
        ? rows
            .map(
              (r) =>
                `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.city)}</td></tr>`
            )
            .join("")
        : `<tr><td colspan="2" class="stats-drilldown__empty">No matching rows.</td></tr>`;
    }
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("stats-drilldown-open");
    closeBtn?.focus();
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest(".info-icon")) return;
    const card = e.target.closest("[data-stat-drilldown]");
    if (!card || root.contains(e.target)) return;
    const key = card.getAttribute("data-stat-drilldown");
    const label = card.getAttribute("data-stat-label") || "";
    if (key) openPanel(key, label);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) {
      e.preventDefault();
      close();
      return;
    }
    const card = e.target.closest("[data-stat-drilldown]");
    if (!card || root.contains(e.target)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const key = card.getAttribute("data-stat-drilldown");
      const label = card.getAttribute("data-stat-label") || "";
      if (key) openPanel(key, label);
    }
  });

  closeBtn?.addEventListener("click", () => close());
  backdrop?.addEventListener("click", () => close());
}
