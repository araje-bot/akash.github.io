import { escapeHtml } from "./utils.js";

/**
 * Search narrows the checkbox list; chips show selections with remove (×).
 * Values in `allCities` are stable ids; optional `optionLabels[id]` is shown in the UI.
 * onChange(selected: Set<string>, { filteredLen })
 */
export function wireCityMultiselect({
  searchInput,
  listEl,
  chipsEl,
  statusEl,
  allCities,
  optionLabels,
  onChange,
}) {
  const selected = new Set();

  function labelFor(id) {
    return (optionLabels && optionLabels[id]) || id;
  }

  function matchesQuery(id, q) {
    if (!q) return true;
    const ql = q.toLowerCase();
    if (id.toLowerCase().includes(ql)) return true;
    return labelFor(id).toLowerCase().includes(ql);
  }

  function notifyChange(filteredLen) {
    const fl = typeof filteredLen === "number" ? filteredLen : allCities.length;
    if (statusEl) {
      statusEl.textContent =
        selected.size === 0 ? String(allCities.length) : String(selected.size);
    }
    onChange(selected, { filteredLen: fl });
  }

  function renderChips() {
    if (!chipsEl) return;
    const sorted = [...selected].sort((a, b) => a.localeCompare(b));
    chipsEl.innerHTML = sorted
      .map((id) => {
        const lab = labelFor(id);
        return `
      <span class="multi-chip">
        <span class="multi-chip__text">${escapeHtml(lab)}</span>
        <button type="button" class="multi-chip__remove" data-remove-city="${escapeHtml(id)}" aria-label="remove ${escapeHtml(lab)}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>`;
      })
      .join("");

    chipsEl.querySelectorAll(".multi-chip__remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-remove-city");
        if (id) selected.delete(id);
        renderList();
        renderChips();
      });
    });
  }

  function renderList() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = q ? allCities.filter((id) => matchesQuery(id, q)) : [...allCities];
    listEl.innerHTML = filtered
      .map(
        (id) => `
      <label class="multi-opt">
        <input type="checkbox" value="${escapeHtml(id)}" ${selected.has(id) ? "checked" : ""} />
        <span class="multi-opt__label">${escapeHtml(labelFor(id))}</span>
      </label>`
      )
      .join("");

    listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        if (cb.checked) selected.add(cb.value);
        else selected.delete(cb.value);
        renderChips();
        notifyChange(filtered.length);
      });
    });

    notifyChange(filtered.length);
  }

  searchInput.addEventListener("input", renderList);
  renderList();
  renderChips();

  return {
    getSelected: () => selected,
    clear: () => {
      selected.clear();
      renderList();
      renderChips();
    },
  };
}
