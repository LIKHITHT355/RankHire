# Rank Hire — React Router version

Placement Management System for engineering colleges. Frontend only.

This folder is a standalone React + Vite app that uses **React Router**
(`react-router-dom`) for all navigation. It contains the same pages, styling,
service layer and academic calculations as the main app.

## Run it

Copy this folder out on its own, then:

```bash
npm install
cp .env.example .env      # set VITE_API_URL to your Express backend
npm run dev               # http://localhost:5173
npm run build
```

## Stack

React, Vite, JavaScript/JSX, plain CSS tokens with Tailwind utilities,
React Router, lucide-react. No TypeScript in the app code.

## Routes

| Path | Page file |
| --- | --- |
| `/` | `pages/Landing.jsx` |
| `/login` | `pages/Login.jsx` |
| `/signup` | `pages/Signup.jsx` |
| `/tpo/dashboard` | `pages/TpoDashboard.jsx` |
| `/tpo/select-students` | `pages/TpoSelectStudents.jsx` |
| `/tpo/announcements` | `pages/TpoAnnouncements.jsx` |
| `/tpo/students` | `pages/TpoStudents.jsx` |
| `/tpo/companies` | `pages/TpoCompanies.jsx` |
| `/tpo/settings` | `pages/TpoSettings.jsx` |
| `/student/dashboard` | `pages/StudentDashboard.jsx` |
| `/student/profile` | `pages/StudentProfile.jsx` |
| `/student/resume` | `pages/StudentResume.jsx` |
| `/student/marksheets` | `pages/StudentMarksheets.jsx` |
| `/student/jobs` | `pages/StudentJobs.jsx` |
| `/student/applications` | `pages/StudentApplications.jsx` |
| `/student/announcements` | `pages/StudentAnnouncements.jsx` |
| `/company/dashboard` | `pages/CompanyDashboard.jsx` |
| `/company/post-job` | `pages/CompanyPostJob.jsx` |
| `/company/jobs` | `pages/CompanyJobsIndex.jsx` |
| `/company/jobs/:id/applicants` | `pages/CompanyJobsIdApplicants.jsx` |
| anything else | `pages/NotFound.jsx` |

All routes are declared in `src/App.jsx`.

## Folder structure

```
index.html
vite.config.js
src/
  main.jsx
  App.jsx          all routes
  styles.css
  pages/           one file per screen
  components/      shell, tables, cards, states
  hooks/           useApiData
  lib/             metrics.js (VTU grading), csv.js
  services/        api.js, auth.js, students.js, announcements.js,
                   jobs.js, ranking.js, shortlists.js, settings.js
```

## Not included

No backend server, no database, no real authentication. Every screen reads
from your Express + MongoDB backend through `VITE_API_URL`, using cookie
sessions (`credentials: "include"`). When the variable is missing, screens
show "API connection pending" instead of invented data.
