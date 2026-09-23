import { Router } from "express";
import multer from "multer";
import os from "os";
import path from "path";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { getByUserId, upload } from "../controllers/resumes.controller.js";

const router = Router();
const temporaryStorage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (_req, file, callback) => callback(null, `rankhire-resume-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});
const resumeUpload = multer({
  storage: temporaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.mimetype)),
});

router.post("/upload", requireAuth, requireRole("student"), resumeUpload.single("resume"), upload);
router.get("/:user_id", requireAuth, requireRole("student"), getByUserId);

export default router;
