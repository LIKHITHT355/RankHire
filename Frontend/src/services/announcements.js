// This file deals with placement announcements.
// Students read them and the placement office writes them.

import { request } from "./api.js";

// This loads all announcements that the signed in user may see.
// The backend decides which ones are visible for each role.
export function getAnnouncements() {
  return request("/announcements");
}

// This publishes a new announcement written by the placement office.
// It sends the title and the body text to the backend.
export function createAnnouncement({ title, body }) {
  return request("/announcements", { method: "POST", body: { title, body } });
}

// This removes an announcement permanently.
// The screen always asks for confirmation before calling this,
// because the action cannot be undone.
export function deleteAnnouncement(id) {
  return request(`/announcements/${id}`, { method: "DELETE" });
}
