import { request } from "./api.js";

export function getMailInbox() {
  return request("/api/mail");
}

export function getMailEmail(uid) {
  return request(`/api/mail/${uid}`);
}

export function forwardMailEmail(uid) {
  return request(`/api/mail/${uid}/forward`, { method: "POST" });
}
