// This file asks the backend to rank students for a placement cycle.

import { request } from "./api.js";
import { toQueryString } from "../lib/query.js";

// This sends the chosen filters, such as department, batch and
// minimum CGPA, to the backend and gets back the matching students
// in merit order. All the filtering happens on the server.
export function queryRanking(filters = {}) {
  const query = toQueryString(filters);
  return request(`/ranking${query ? `?${query}` : ""}`);
}
