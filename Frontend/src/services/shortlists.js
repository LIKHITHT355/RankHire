// This file handles shortlisting candidates for a job.

import { request } from "./api.js";

// This loads the current shortlist for one job posting.
export function getShortlists(jobId) {
  return request(`/jobs/${jobId}/shortlist`);
}

// This changes one candidate's shortlist status, for example
// moving them to shortlisted or rejected. The backend stores
// the change, so a page refresh shows the real state.
export function updateShortlist(jobId, applicationId, status) {
  return request(`/jobs/${jobId}/shortlist/${applicationId}`, {
    method: "PATCH",
    body: { status },
  });
}
