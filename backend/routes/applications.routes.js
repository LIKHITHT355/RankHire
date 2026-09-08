import { Router } from "express";
import { myApplications } from "../controllers/jobs.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

// This route exposes only the signed-in student's own applications.
// It is separate from job routes because the frontend calls /applications.
// Authentication and role checks run before the controller reads MongoDB.
const router = Router();
router.get("/", requireAuth, requireRole("student"), myApplications);
export default router;
