// This file covers job postings and applications.
// Companies post jobs, students apply, and both sides
// read the resulting lists through these functions.

import { request } from "./api.js";

// This loads job postings from the backend.
// Filters can narrow the list, for example only jobs
// posted by the signed in company.
export function getJobs(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  ).toString();
  return request(`/jobs${query ? `?${query}` : ""}`);
}

// This loads the full details of one job posting.
export function getJob(id) {
  return request(`/jobs/${id}`);
}

// This publishes a new job posting for the signed in company.
// Everything typed into the form is sent in one go.
export function createJob(job) {
  return request("/jobs", { method: "POST", body: job });
}

// This submits an application from the signed in student to a job.
// The backend checks eligibility, so the app does not pretend
// an application succeeded on its own.
export function applyToJob(jobId) {
  return request(`/jobs/${jobId}/applications`, { method: "POST" });
}

// This loads the applications the signed in student has sent,
// together with the status the company gave each one.
export function getApplications() {
  return request("/applications");
}

// This loads everyone who applied to one particular job.
// Companies use it to review and shortlist candidates.
export function getApplicants(jobId) {
  return request(`/jobs/${jobId}/applications`);
}
