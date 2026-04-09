import {
  escapeHtml,
  inspectionOutcomeBucketId,
  infoIconTooltip,
  isOutOfComplianceField,
} from "./utils.js";

function pct(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

const OUTCOMES_HEADING = "Inspection outcomes";
const OUTCOMES_TIP_ARIA =
  "Inspection outcomes, in everyday terms: each box is how many inspections in this list ended a certain way. The first number (in red) is the most serious. The rest cover other problems, inspections that passed, follow-up visits or paperwork, missing information, and other result labels.";
const OUTCOMES_TIP_BODY =
  "How inspections turned out: most serious first, then other issues, passes, follow-ups, missing info, and other labels.";

const RISK_HEADING = "Risk-factor fields";
const RISK_TIP_ARIA =
  "Risk-factor fields, in plain language: these percentages show how often an inspector noted a problem in three common food-safety areas: pests, surfaces that touch food, and keeping cold food at a safe temperature.";
const RISK_TIP_BODY =
  "How often those three food-safety issues showed up in this list of inspections.";

function statIcon(faClass) {
  return `<span class="stat-card__icon" aria-hidden="true"><i class="fa-solid ${faClass}"></i></span>`;
}

/** Interactive cards open a detail panel (click or keyboard). */
function stat(num, label, faIconClass, extraClass = "", drillKey = "") {
  const classes = [
    "stat-card",
    "card-surface",
    extraClass,
    drillKey ? "stat-card--interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const attrs = drillKey
    ? ` role="button" tabindex="0" data-stat-drilldown="${escapeHtml(drillKey)}" data-stat-label="${escapeHtml(label)}"`
    : "";
  return `
    <div class="${classes}"${attrs}>
      ${statIcon(faIconClass)}
      <div class="stat-card__body">
        <div class="stat-number">${escapeHtml(String(num))}</div>
        <div class="stat-label">${escapeHtml(label)}</div>
      </div>
    </div>`;
}

function showStats(data) {
  const n = data.length;

  const buckets = {
    critical: 0,
    non_compliant: 0,
    compliant: 0,
    administrative: 0,
    unspecified: 0,
    other: 0,
  };
  for (const row of data) {
    const id = inspectionOutcomeBucketId(row);
    buckets[id] = (buckets[id] || 0) + 1;
  }

  const rodentOut = data.filter((r) => isOutOfComplianceField(r.rodentInsects)).length;
  const contactOut = data.filter((r) => isOutOfComplianceField(r.foodContact)).length;
  const coldOut = data.filter((r) => isOutOfComplianceField(r.coldHolding)).length;

  const CRITICAL_LABEL = "Critical / immediate hazard";

  const outcomesInfo = infoIconTooltip(OUTCOMES_TIP_ARIA, OUTCOMES_TIP_BODY);
  const riskInfo = infoIconTooltip(RISK_TIP_ARIA, RISK_TIP_BODY);

  const rodentLabel = `Rodent / insect (${rodentOut} of ${n})`;
  const contactLabel = `Food-contact surfaces (${contactOut} of ${n})`;
  const coldLabel = `Cold holding (${coldOut} of ${n})`;

  return `
    <div class="view-panel view-panel--stats">
      <header class="view-panel__head view-panel__head--with-icon">
        <h2 class="view-title">
          <i class="fa-solid fa-chart-simple view-title__icon" aria-hidden="true"></i>
          Statistics View
        </h2>
      </header>

      <section class="stats-section" aria-labelledby="stats-outcomes-title">
        <h3 id="stats-outcomes-title" class="stats-section-title">
          <span>${OUTCOMES_HEADING}</span>
          <span class="stats-section-title__info">${outcomesInfo}</span>
        </h3>
        <div class="stats-grid">
          ${stat(buckets.critical, CRITICAL_LABEL, "fa-circle-exclamation", "stat-card--critical", "outcome:critical")}
          ${stat(buckets.non_compliant, "Non-compliant", "fa-triangle-exclamation", "", "outcome:non_compliant")}
          ${stat(buckets.administrative, "Follow-up & administrative", "fa-clipboard-list", "", "outcome:administrative")}
          ${stat(buckets.compliant, "Compliant", "fa-circle-check", "", "outcome:compliant")}
          ${stat(buckets.unspecified, "Unspecified / missing", "fa-circle-question", "", "outcome:unspecified")}
          ${stat(buckets.other, "Other outcomes", "fa-file-lines", "", "outcome:other")}
        </div>
      </section>

      <section class="stats-section" aria-labelledby="stats-risk-title">
        <h3 id="stats-risk-title" class="stats-section-title">
          <span>${RISK_HEADING}</span>
          <span class="stats-section-title__info">${riskInfo}</span>
        </h3>
        <div class="stats-grid">
          ${stat(`${pct(rodentOut, n)}%`, rodentLabel, "fa-bug", "", "risk:rodent")}
          ${stat(`${pct(contactOut, n)}%`, contactLabel, "fa-utensils", "", "risk:contact")}
          ${stat(`${pct(coldOut, n)}%`, coldLabel, "fa-temperature-low", "", "risk:cold")}
        </div>
      </section>
    </div>`;
}

export default showStats;
