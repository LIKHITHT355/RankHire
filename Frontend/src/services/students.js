// This file covers everything about students.
// Reading the directory, reading one student, updating a profile,
// handing over a resume and fetching marksheets.

import { request } from "./api.js";

// This loads the full student directory from the backend.
// Optional filters such as department or batch are added to the
// address so the server can do the filtering for us.
export function getStudents(filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  ).toString();
  return request(`/students${query ? `?${query}` : ""}`);
}

// This loads one student record using their id.
// It is used on detail screens where only a single
// student needs to be shown.
export function getStudent(id) {
  return request(`/students/${id}`);
}

// This loads the profile of whoever is currently signed in.
// The backend works out who that is from the session cookie.
export function getMyProfile() {
  return request("/students/me");
}

// This saves changes the student made to their own profile.
// Only the fields that were edited are sent across.
// The backend decides what is allowed to change.
export function updateProfile(profile) {
  return request("/api/student/profile", { method: "POST", body: profile });
}

// This reads the current resume status for the signed in student.
// It tells the screen whether a resume already exists on record.
export function getResume() {
  return request("/students/me/resume");
}

// This hands a resume file over to the backend.
// The file is sent as a form upload, which is the usual way
// files travel to an Express server.
export function uploadResume(file) {
  const form = new FormData();
  form.append("resume", file);
  return request("/students/me/resume", { method: "POST", body: form });
}

// This loads the semester marksheets for the signed in student.
// The subjects, marks and credits come back from the backend and
// the app only does the SGPA and CGPA maths on top of them.
export function getMarksheets() {
  return request("/students/me/marksheets");
}
