// This file reads and saves the placement office settings.
// Nothing is kept in the browser, so the backend is the
// only source of truth for these values.

import { request } from "./api.js";

// This loads the current settings from the backend.
export function getSettings() {
  return request("/settings");
}

// This saves the edited settings back to the backend.
// The screen shows success only after the server confirms it.
export function updateSettings(settings) {
  return request("/settings", { method: "PATCH", body: settings });
}

// This file also exposes companies, which the placement office
// reviews next to its settings. Keeping it here avoids an extra
// file for a single request.
export function getCompanies() {
  return request("/companies");
}
