// This file asks the backend to rank students for a placement cycle.

import { request } from "./api.js";

// This sends the chosen filters, such as department, batch and
// minimum CGPA, to the backend and gets back the matching students
// in merit order. All the filtering happens on the server.
export function queryRanking(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  ).toString();
  return request(`/ranking${query ? `?${query}` : ""}`);
}
