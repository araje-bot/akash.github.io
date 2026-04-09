/**
 * Safe text for HTML and display fallbacks.
 */
export const MISSING_LABEL = "-";

export function escapeHtml(text) {
  if (text == null) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

/** Use when a field has no usable value; shows a dash. */
export function displayOrMissing(value) {
  if (value == null || value === "" || value === "------") return MISSING_LABEL;
  const s = String(value);
  if (s === "N/A" || s === "n/a") return MISSING_LABEL;
  return s;
}

/** Strip time from ISO-style dates for display (YYYY-MM-DD when possible). */
export function formatDateOnly(value) {
  if (value == null || value === "" || value === MISSING_LABEL) return MISSING_LABEL;
  const s = String(value).trim();
  const isoDay = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDay) return isoDay[1];
  const d = Date.parse(s);
  if (!Number.isNaN(d)) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return s;
}

/** Outcome bucket from inspection result text (stats + drilldown filters). */
export function inspectionOutcomeBucketId(row) {
  const raw = String(row.inspectionResult ?? "").trim();
  const res = raw.toLowerCase();
  const missing =
    !raw || raw === MISSING_LABEL || res === "n/a" || res === "------";

  if (missing) return "unspecified";
  if (res.includes("critical")) return "critical";
  if (res.includes("non-compliant") || res.includes("non compliant")) return "non_compliant";
  if (
    res.includes("compliant") &&
    !res.includes("non-compliant") &&
    !res.includes("non compliant")
  ) {
    return "compliant";
  }
  if (res.includes("reopened") || res.includes("compliance schedule")) return "administrative";
  return "other";
}

/** True when a checklist field is recorded as out of compliance. */
export function isOutOfComplianceField(value) {
  return String(value ?? "").toLowerCase().includes("out of compliance");
}

export function complianceStatusKind(text) {
  const t = String(text ?? "").toLowerCase().trim();
  if (!t || t === "-") return "neutral";
  if (t.includes("critical")) return "critical";
  if (t.includes("non-compliant") || t.includes("non compliant")) return "noncompliant";
  if (t.includes("out of compliance")) return "noncompliant";
  if (t.includes("compliant") && !t.includes("non-compliant") && !t.includes("non compliant")) {
    return "compliant";
  }
  if (t.includes("violation")) return "noncompliant";
  return "neutral";
}

export function statusDotHtml(kind, rawText) {
  const safe = escapeHtml(String(rawText ?? ""));
  const k = kind || "neutral";
  return `<span class="status-dot status-dot--${k}" title="${safe}" aria-label="${safe}"></span>`;
}

/** Missing / placeholder values: show dash only (no status dot). */
function isDashOnlyStatus(text) {
  const raw = text == null ? "" : String(text).trim();
  if (!raw) return true;
  if (raw === MISSING_LABEL) return true;
  if (raw === "------") return true;
  const low = raw.toLowerCase();
  if (low === "n/a") return true;
  return false;
}

export function inspectionStatusCell(text) {
  const safe = escapeHtml(String(text ?? MISSING_LABEL));
  if (isDashOnlyStatus(text)) {
    return `<span class="status-cell status-cell--plain">${safe}</span>`;
  }
  const kind = complianceStatusKind(text);
  return `<span class="status-cell">${statusDotHtml(kind, text)}<span class="status-cell__text">${safe}</span></span>`;
}

/** Attributes on each table row for city multiselect filtering (table view). */
export function cityFilterRowAttrs(r) {
  return `data-city="${escapeHtml(r.city)}" data-city-lower="${escapeHtml(String(r.city).toLowerCase())}"`;
}

/** One table row: name, city, date, compliance. Optional `trAttrs` for extra attributes on `<tr>`. */
export function inspectionTableRowHtml(r, trAttrs = "") {
  const open = trAttrs ? `<tr ${trAttrs}>` : "<tr>";
  return `${open}
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.city)}</td>
      <td>${escapeHtml(formatDateOnly(r.inspectionDate))}</td>
      <td>${inspectionStatusCell(r.inspectionResult)}</td>
    </tr>`;
}

const STATUS_TRUNC = 42;

/** Shorter in-card display: truncates long results; full text in hover/focus info tip. */
export function inspectionStatusCellTruncated(text) {
  const fullRaw = String(text ?? MISSING_LABEL);
  if (isDashOnlyStatus(text)) {
    return `<span class="status-cell status-cell--plain">${escapeHtml(fullRaw)}</span>`;
  }
  const kind = complianceStatusKind(text);
  const safeFull = escapeHtml(fullRaw);
  const dot = statusDotHtml(kind, text);
  if (fullRaw.length <= STATUS_TRUNC) {
    return `<span class="status-cell">${dot}<span class="status-cell__text">${safeFull}</span></span>`;
  }
  const short = escapeHtml(fullRaw.slice(0, STATUS_TRUNC)) + "…";
  const aria = `Full inspection result: ${fullRaw}`;
  return `<span class="status-cell status-cell--compact">${dot}<span class="status-cell__text">${short}</span>${infoIconInline(aria, fullRaw)}</span>`;
}

/**
 * Circle-info control; shows tip on hover/focus. Keep tipPlain concise enough for aria-label.
 */
export function infoIconInline(ariaLabelFull, tipPlain) {
  return `<span class="info-icon info-icon--inline" tabindex="0" role="button" aria-label="${escapeHtml(ariaLabelFull)}">
    <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
    <span class="info-icon__tip" aria-hidden="true">${escapeHtml(tipPlain)}</span>
  </span>`;
}

export function infoIconTooltip(ariaLabelFull, tipPlainMultiline) {
  return `<span class="info-icon" tabindex="0" role="button" aria-label="${escapeHtml(ariaLabelFull)}">
    <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
    <span class="info-icon__tip" aria-hidden="true">${escapeHtml(tipPlainMultiline)}</span>
  </span>`;
}
