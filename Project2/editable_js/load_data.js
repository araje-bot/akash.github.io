import { displayOrMissing } from "./utils.js";

function normalizeFeature(feature) {
  const p = feature.properties || {};
  const coords = feature.geometry?.coordinates;
  const lon = Array.isArray(coords) ? coords[0] : null;
  const lat = Array.isArray(coords) ? coords[1] : null;

  const line1 = p.address_line_1;
  const line2 = p.address_line_2;
  const parts = [line1, line2].filter(
    (x) => x && x !== "------" && String(x).trim() !== ""
  );
  const address = parts.length ? parts.join(", ") : null;

  return {
    id: displayOrMissing(p[":id"] || p.establishment_id),
    name: displayOrMissing(p.name),
    city: displayOrMissing(p.city),
    state: displayOrMissing(p.state),
    zip: displayOrMissing(p.zip),
    address: displayOrMissing(address),
    inspectionDate: displayOrMissing(p.inspection_date),
    inspectionResult: displayOrMissing(p.inspection_results),
    inspectionType: displayOrMissing(p.inspection_type),
    category: displayOrMissing(p.category),
    establishmentId: displayOrMissing(p.establishment_id),
    owner: displayOrMissing(p.owner),
    properHandWashing: displayOrMissing(p.proper_hand_washing),
    rodentInsects: displayOrMissing(p.rodent_and_insects),
    foodContact: displayOrMissing(p.food_contact_surfaces_and),
    coldHolding: displayOrMissing(p.cold_holding_temperature),
    lat,
    lon,
  };
}

async function loadData() {
  const url = "./data.json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`could not load ${url} (${response.status})`);
  }

  const geo = await response.json();
  if (!geo.features || !Array.isArray(geo.features)) {
    throw new Error("data.json is missing a features array");
  }

  return geo.features.map(normalizeFeature);
}

export default loadData;
