// This file handles signing in and out.
// It only sends the details to the backend and returns the answer.
// There is no pretend login here: without a backend nothing succeeds.

import { request } from "./api.js";

// This asks the backend who the current signed in user is.
// The browser sends the session cookie automatically.
// If nobody is signed in the backend answers with an error.
export function getSession() {
  return request("/auth/session");
}

// This sends the chosen role, email and password to the backend.
// The backend is the only thing that can accept or reject them.
// Whatever it replies is passed straight back to the screen.
export function login({ role, email, password }) {
  return request("/auth/login", { method: "POST", body: { role, email, password } });
}

// This sends a request for a new account to the backend.
// Approval is a backend decision, so the screen just reports
// whatever the server says happened.
export function signup({ role, name, email, password }) {
  return request("/auth/signup", { method: "POST", body: { role, name, email, password } });
}

// This asks the backend to end the current session.
// The backend clears the cookie, so the user is signed out
// everywhere rather than only in this browser tab.
export function logout() {
  return request("/auth/logout", { method: "POST" });
}
