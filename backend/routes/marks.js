import { Router } from "express";
import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();
const uploadDirectory = path.join(os.tmpdir(), "rankhire-marksheets");
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({ destination: uploadDirectory, filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "scripts", "extract_marks.py");
const python = process.env.PYTHON_BIN || (process.platform === "win32" ? "py" : "python3");

function runExtractor(filePath, requestId) {
  return new Promise((resolve) => {
    execFile(python, [script, filePath, requestId], { timeout: 10_000, windowsHide: true }, (error, stdout, stderr) => {
      if (error) return resolve({ processError: error, stdout, stderr });
      try { resolve({ data: JSON.parse(stdout), stdout, stderr }); }
      catch (parseError) { resolve({ parseError, stdout, stderr }); }
    });
  });
}

router.post("/extract-marks", requireAuth, requireRole("student"), upload.single("marksheet"), async (req, res, next) => {
  // Temporary multipart diagnostic: remove after confirming a real upload.
  console.log("[marksheet upload]", { body: req.body, file: req.file ? { fieldname: req.file.fieldname, originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, path: req.file.path } : undefined });
  let temporaryMarksPath;
  try {
    if (!req.file) return res.status(400).json({ detail: "Attach a PDF in the marksheet field." });
    if (req.file.mimetype !== "application/pdf") return res.status(400).json({ detail: "Only application/pdf marksheets are supported." });
    let expectedCodes;
    try { expectedCodes = JSON.parse(req.body.courses || "").map((course) => typeof course === "string" ? course : course.code).filter(Boolean); }
    catch { return res.status(400).json({ detail: "Send courses as a JSON array of subject codes or course objects with code." }); }
    if (!expectedCodes.length) return res.status(400).json({ detail: "At least one subject code is required." });

    const requestId = randomUUID();
    temporaryMarksPath = path.join(os.tmpdir(), `marks_${requestId}.json`);
    const extraction = await runExtractor(req.file.path, requestId);
    console.log("[marks extractor] stdout:", extraction.stdout);
    console.error("[marks extractor] stderr:", extraction.stderr);
    let extractorError;
    try { extractorError = JSON.parse(extraction.stdout || "")?.error; } catch {}
    if (typeof extractorError === "string" && extractorError.trim()) {
      return res.status(422).json({ detail: extractorError.trim() });
    }
    if (extraction.processError) {
      return res.status(500).json({ detail: "PDF extraction process failed" });
    }
    if (extraction.parseError) {
      return res.status(500).json({ detail: "PDF extraction returned invalid JSON" });
    }
    if (extraction.data?.error) {
      return res.status(422).json({ detail: String(extraction.data.error) });
    }
    const marks = extraction.data;
    if (!marks || Array.isArray(marks) || typeof marks !== "object") {
      return res.status(500).json({ detail: "PDF extraction returned an invalid marks payload" });
    }
    const missingCodes = expectedCodes.filter((code) => !Object.hasOwn(marks, code));
    return res.json({ marks, missingCodes });
  } catch (error) {
    console.error("[marks extraction] unexpected route error:", error);
    return res.status(500).json({ detail: "Internal server error" });
  }
  finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    if (typeof temporaryMarksPath === "string") fs.unlink(temporaryMarksPath, () => {});
  }
});

export default router;
