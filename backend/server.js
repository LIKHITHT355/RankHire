import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/students.routes.js";
import announcementRoutes from "./routes/announcements.routes.js";
import jobRoutes from "./routes/jobs.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import shortlistRoutes from "./routes/shortlists.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import companyRoutes from "./routes/companies.routes.js";
import applicationRoutes from "./routes/applications.routes.js";

const app = express();
const production = process.env.NODE_ENV === "production";

// This accepts browser calls only from the configured frontend address.
// Credentials are enabled so the browser can send the session cookie.
// JSON middleware then turns normal request bodies into JavaScript objects.
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// This stores login sessions in MongoDB instead of temporary server memory.
// The cookie is hidden from JavaScript and becomes secure on HTTPS production.
// SameSite lax supports normal same-site frontend and API development.
app.use(session({ name: "rankhire.sid", secret: process.env.SESSION_SECRET || "development-secret-change-me", resave: false, saveUninitialized: false, store: process.env.MONGODB_URI ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI }) : undefined, cookie: { httpOnly: true, secure: production, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 } }));
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes); app.use("/students", studentRoutes); app.use("/api/student", studentRoutes); app.use("/announcements", announcementRoutes); app.use("/jobs", jobRoutes); app.use("/applications", applicationRoutes); app.use("/ranking", rankingRoutes); app.use("/shortlists", shortlistRoutes); app.use("/settings", settingsRoutes); app.use("/companies", companyRoutes);

// This turns unexpected errors into the API's documented error shape.
// Validation errors become a helpful 400 instead of a generic server error.
// Other errors are logged locally while clients receive a safe message.
app.use((error, _req, res, _next) => { console.error(error); const status = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500; res.status(status).json({ error: { message: status === 400 ? error.message : "Internal server error", status } }); });

// This connects before listening so every request has a ready database.
// Startup failures are printed and stop the process with a failure code.
// PORT falls back to 5000 when it is not provided in the environment.
connectDatabase().then(() => app.listen(process.env.PORT || 5000, () => console.log(`Rank Hire API listening on ${process.env.PORT || 5000}`))).catch((error) => { console.error("Unable to start server:", error.message); process.exit(1); });
