// This file is the single place where the app talks to the backend.
// It reads the backend address from an environment setting,
// sends the request with the session cookie, and turns the answer
// into either plain data or a clear error message.

// This reads the backend address that was set when the app started.
// Nothing is hard coded, so the same build can point at any server.
// If it is blank, the app knows the backend is not connected yet.
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// This message is shown everywhere the app needs the backend
// but no address has been provided. Keeping it in one place
// means every screen says exactly the same thing.
export const API_NOT_CONFIGURED_MESSAGE =
  "API connection pending. Set VITE_API_URL to connect Rank Hire to your Express backend.";

// This simple check tells any screen whether a backend address exists.
// Screens use it to decide between showing the "not connected" notice
// and actually trying to load data.
export function isApiConfigured() {
  return API_URL.length > 0;
}

// This is a special kind of error the app throws when a request fails.
// It carries the status number from the server so screens can react,
// for example by asking the user to sign in again.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// This function performs one request to the backend.
// It adds the base address, sends cookies so the session works,
// and reads the reply. Any failure becomes a clear error message
// instead of a confusing crash somewhere else in the app.
export async function request(path, options = {}) {
  if (!isApiConfigured()) throw new ApiError(API_NOT_CONFIGURED_MESSAGE, 0);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || "GET",
      credentials: "include",
      headers: isFormData ? options.headers : { "Content-Type": "application/json", ...options.headers },
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the backend. Check that it is running.", 0);
  }

  // This part reads the reply body. Some servers answer with JSON
  // and some with plain text, so both are handled. If the status
  // says the request failed, the message from the server is used.
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }
  return data;
}
