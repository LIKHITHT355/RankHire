# Rank Hire backend

This is the Express.js and MongoDB API for the existing Rank Hire Placement Management System frontend. It provides accounts, student profiles, jobs, applications, announcements, rankings, shortlists, settings, and basic resume file storage. The frontend itself is not changed here.

## Stack

- Node.js and Express
- MongoDB with Mongoose
- bcrypt password hashing
- `express-session` with `connect-mongo` for cookie sessions
- CORS, dotenv, and multer uploads

## Setup

1. Copy `.env.example` to `.env` and add your MongoDB connection string.
2. Run `npm install` inside this `backend` folder.
3. Run `npm run dev` for development, or `npm start` for a regular server.

The API listens on port `5000` by default. Set `VITE_API_URL=http://localhost:5000` in the frontend environment. Set this backend's `CLIENT_URL` to the exact frontend origin (usually `http://localhost:5173`) so browser cookies and CORS work correctly.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port, default `5000` |
| `MONGODB_URI` | MongoDB connection string and session-store database |
| `SESSION_SECRET` | Long private secret used to sign session cookies |
| `CLIENT_URL` | Allowed frontend origin for credentialed CORS requests |
| `NODE_ENV` | Use `production` to enable secure cookies over HTTPS |

## Routes

| Area | Endpoints |
| --- | --- |
| Auth | `GET /auth/session`, `POST /auth/login`, `POST /auth/signup`, `POST /auth/logout` |
| Students | `GET /students`, `GET /students/:id`, `GET/PATCH /students/me`, `GET/POST /students/me/resume`, `GET /students/me/marksheets` |
| Announcements | `GET/POST /announcements`, `DELETE /announcements/:id` |
| Jobs and applications | `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `POST /jobs/:id/applications`, `GET /applications`, `GET /jobs/:id/applicants` |
| Ranking | `GET /ranking` |
| Shortlists | `GET/POST /shortlists` |
| Settings | `GET/PATCH /settings` |
| Companies | `GET /companies` |

For compatibility with the existing frontend, the API also supports `GET /jobs/:id/applications` for applicants, plus `GET /jobs/:id/shortlist` and `PATCH /jobs/:id/shortlist/:applicationId` for shortlist management.

Resume files are stored in `uploads/` and served at `/uploads/<file-name>`. Resume parsing/analysis, AI matching, and analytics are intentionally not included yet. The API never creates mock or seed business data; users create real accounts through signup.
