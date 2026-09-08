# Placement Management System – Rank Hire

A frontend-only web app for engineering-college training and placement management: merit ranking, opportunities, applications and announcements in one editorial, record-like interface.

## What this project is

This repository contains **only the frontend**. There is no server, no database, no authentication logic and no seeded data anywhere in it. Every screen is built to plug into an Express.js + MongoDB backend that you build and run separately.

Nothing on any screen is invented. If the backend address is not configured, each screen says:

> API connection pending. Set VITE_API_URL to connect Rank Hire to your Express backend.

## Tech stack

- React 19
- Vite
- JavaScript and JSX (all application code)
- Plain CSS design tokens plus utility classes (`src/styles.css`)
- TanStack Router for file-based routing (this platform's router; React Router is not used)
- lucide-react for icons

> Note: a few platform config files (`vite.config.ts`, `src/router.tsx`, `tsconfig.json`) are part of the project template and must stay as they are. All pages, components, services and helpers are plain `.jsx` / `.js`.

## What has been completed

**Public**
- [x] `/` landing page — logo, "Merit • Placement", hero "Merit, made visible.", role sections, principles block, footer
- [x] `/login` — role selector, email, password, loading and error states, no fake sign-in
- [x] `/signup` — account type selector, name, email, password, request access, loading and error states
- [x] 404 page for unknown addresses

**Placement office (TPO)**
- [x] `/tpo/dashboard` — overview stats with "—" placeholders when unknown
- [x] `/tpo/select-students` — department / batch / min CGPA filters, ranked results, CSV export
- [x] `/tpo/announcements` — list, create, publish, delete with confirmation
- [x] `/tpo/students` — directory table with CSV export
- [x] `/tpo/companies` — company list with industry, open roles, status
- [x] `/tpo/settings` — settings loaded and saved through the API only

**Student**
- [x] `/student/dashboard` — readiness overview
- [x] `/student/profile` — editable profile saved through the API
- [x] `/student/resume` — resume status and upload handoff
- [x] `/student/marksheets` — subjects, marks, credits, grade, grade point, SGPA and CGPA
- [x] `/student/jobs` — open roles, eligibility, deadline, apply
- [x] `/student/applications` — submitted applications and status
- [x] `/student/announcements` — read-only feed

**Company**
- [x] `/company/dashboard` — active roles, applications, shortlist summary
- [x] `/company/post-job` — full posting form
- [x] `/company/jobs` — own postings with status and applicant counts
- [x] `/company/jobs/:id/applicants` — applicant table, shortlist / reject actions, CSV export

**Shared**
- [x] API service layer in `src/services/`
- [x] VTU-style academic calculations in `src/lib/metrics.js`
- [x] Client-side CSV export in `src/lib/csv.js`
- [x] Six intentional states on every data screen: not configured, loading skeleton, data, empty, error, retry
- [x] Responsive sidebar / drawer shell, responsive tables, visible keyboard focus states
- [x] Plain-language comments under every meaningful block of code

## What is NOT included

- No Express server, API routes or controllers
- No MongoDB schemas, models, seed scripts or connection strings
- No real or fake authentication, no JWTs, no session simulation
- No mock students, companies, jobs, applications or announcements
- No business data in localStorage

The backend is yours to build and connect afterwards. **This frontend is not functional on its own** — it is ready to be wired up.

## How to connect your backend

1. Create a `.env` file at the project root.
2. Set the base URL of your Express server:

```
VITE_API_URL=http://localhost:5000/api
```

3. Restart the dev server.

The frontend expects:
- **Cookie-based sessions.** Every request is sent with `credentials: "include"`; no tokens are stored in the browser. Enable CORS on the backend with `credentials: true` and an explicit origin.
- **MongoDB** behind a REST API.

### Endpoints the frontend calls

| Method | Path | Used by |
| --- | --- | --- |
| GET | `/auth/session` | current session |
| POST | `/auth/login` | login |
| POST | `/auth/signup` | request access |
| POST | `/auth/logout` | sign out |
| GET | `/students` | TPO directory and dashboard |
| GET | `/students/:id` | single student |
| GET / PATCH | `/students/me` | student profile |
| GET / POST | `/students/me/resume` | resume status and upload (multipart) |
| GET | `/students/me/marksheets` | marksheets |
| GET | `/announcements` | notices |
| POST | `/announcements` | publish |
| DELETE | `/announcements/:id` | delete |
| GET | `/jobs` | job lists (`?status=open`, `?mine=true`) |
| GET | `/jobs/:id` | single job |
| POST | `/jobs` | post a role |
| POST | `/jobs/:id/applications` | apply |
| GET | `/jobs/:id/applications` | applicants |
| GET | `/applications` | student's applications |
| GET | `/jobs/:id/shortlist` | shortlist |
| PATCH | `/jobs/:id/shortlist/:applicationId` | shortlist status |
| GET | `/ranking` | merit query (`department`, `batch`, `minCgpa`) |
| GET | `/companies` | recruiters |
| GET / PATCH | `/settings` | cycle settings |

Errors should be returned as JSON with a `message` field; the frontend shows that message directly.

## Running locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```

## Folder structure

```
src/
  styles.css              design tokens: ink navy, paper, gold, fonts
  lib/
    metrics.js            VTU grades, SGPA, CGPA, ranking
    csv.js                client-side CSV export
  services/
    api.js                shared client, reads VITE_API_URL
    auth.js               session, login, signup, logout
    students.js           directory, profile, resume, marksheets
    announcements.js      notices
    jobs.js               jobs, applications, applicants
    ranking.js            merit query
    shortlists.js         shortlist actions
    settings.js           cycle settings and companies
  hooks/
    useApiData.js         loading / error / retry handling
  components/
    Shell.jsx             sidebar, drawer, top bar
    Primitives.jsx        headers, panels, tables, fields, badges
    DataState.jsx         not connected / loading / empty / error / retry
  routes/                 one file per page
```

## Grading scale

| Marks | Grade | Points |
| --- | --- | --- |
| 90–100 | O | 10 |
| 80–89 | A+ | 9 |
| 70–79 | A | 8 |
| 60–69 | B+ | 7 |
| 55–59 | B | 6 |
| 50–54 | C | 5 |
| 40–49 | P | 4 |
| 0–39 | F | 0 |

SGPA and CGPA are credit-weighted. Any incomplete or invalid input returns `null` rather than a wrong number.
