import { escapeHtml, MISSING_LABEL, inspectionStatusCell, formatDateOnly } from "./utils.js";
import { wireCityMultiselect } from "./city_multiselect.js";

let mapInstance = null;
let markerGroup = null;

function showExternal(data) {
  return `
    <div class="view-panel view-panel--map">
      <header class="view-panel__head view-panel__head--with-icon">
        <div class="view-panel__head-row">
          <h2 class="view-title"><i class="fa-solid fa-map-location-dot view-title__icon" aria-hidden="true"></i> Map View</h2>
          <p class="filter-results-heading" id="map-filter-results" aria-live="polite"></p>
        </div>
      </header>
      <div class="map-layout-stack">
        <div class="map-controls-band">
          <div class="filter-card card-surface filter-card--overlay-dropdown map-filter-card" role="search">
            <div class="filter-card__controls">
              <label class="visually-hidden" for="map-city-search">Filter City List</label>
              <div class="search-field">
                <i class="fa-solid fa-magnifying-glass search-field__icon" aria-hidden="true"></i>
                <input type="search" id="map-city-search" class="search-field__input" placeholder="Type City Name" autocomplete="off">
              </div>
              <details class="multi-dropdown">
                <summary class="multi-dropdown__summary">
                  <i class="fa-solid fa-list-ul multi-dropdown__summary-icon" aria-hidden="true"></i>
                  <span>Select Cities</span>
                  <i class="fa-solid fa-chevron-down multi-dropdown__chev" aria-hidden="true"></i>
                </summary>
                <div class="multi-dropdown__panel" id="map-checkbox-list"></div>
              </details>
            </div>
            <div class="multi-chips" id="map-chips"></div>
          </div>
        </div>
        <div class="map-stage">
          <div class="map-stage__map card-surface card-surface--pad-none">
            <div id="restaurant-map" class="restaurant-map" role="region" aria-label="Map of restaurant inspections"></div>
          </div>
        </div>
      </div>
    </div>`;
}

function destroyExternalMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markerGroup = null;
  }
}

function initExternalMap(data) {
  const el = document.getElementById("restaurant-map");
  if (!el || typeof L === "undefined") return;

  destroyExternalMap();

  mapInstance = L.map("restaurant-map").setView([38.95, -76.85], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapInstance);

  markerGroup = L.layerGroup().addTo(mapInstance);

  const cities = [
    ...new Set(data.map((r) => r.city).filter((c) => c && c !== MISSING_LABEL)),
  ].sort((a, b) => a.localeCompare(b));

  const searchInput = document.getElementById("map-city-search");
  const listEl = document.getElementById("map-checkbox-list");
  const chipsEl = document.getElementById("map-chips");
  const status = document.getElementById("map-filter-results");
  if (!searchInput || !listEl || !chipsEl) return;

  function redrawMulti(selected) {
    if (!markerGroup || !mapInstance) return;
    markerGroup.clearLayers();
    const pts = data.filter((r) => {
      if (r.lat == null || r.lon == null) return false;
      if (selected.size === 0) return true;
      return selected.has(r.city);
    });
    const bounds = [];
    for (const r of pts) {
      const resultHtml = inspectionStatusCell(r.inspectionResult);
      const m = L.marker([r.lat, r.lon]).bindPopup(
        `<div class="map-popup"><strong>${escapeHtml(r.name)}</strong><br>` +
          `${escapeHtml(r.city)}<br>` +
          `${formatDateOnly(r.inspectionDate)}<br>` +
          `${resultHtml}</div>`
      );
      markerGroup.addLayer(m);
      bounds.push([r.lat, r.lon]);
    }
    if (bounds.length) {
      mapInstance.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    }
    if (status) {
      status.textContent =
        selected.size === 0
          ? `${cities.length} cities`
          : `${selected.size} cities`;
    }
  }

  wireCityMultiselect({
    searchInput,
    listEl,
    chipsEl,
    statusEl: null,
    allCities: cities,
    onChange(selected) {
      redrawMulti(selected);
    },
  });

  setTimeout(() => mapInstance && mapInstance.invalidateSize(), 100);
}

export { initExternalMap, destroyExternalMap };
export default showExternal;
