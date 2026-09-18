import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import StudentResume from "../models/StudentResume.js";
import ResumePersonalInfo from "../models/ResumePersonalInfo.js";
import ResumeSkill from "../models/ResumeSkill.js";

const pythonCommand = process.env.PYTHON_COMMAND || (process.platform === "win32" ? "py" : "python3");
const parserPath = path.resolve("scripts/extract_resume.py");

function runParser(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonCommand, [parserPath, filePath], { cwd: path.resolve() });
    let output = "";
    let errorOutput = "";
    child.stdout.on("data", (data) => { output += data; });
    child.stderr.on("data", (data) => { errorOutput += data; });
    child.on("error", () => reject(new Error("Python is not available. Install Python and the resume parser requirements.")));
    child.on("close", (code) => {
      try {
        const result = JSON.parse(output);
        if (code === 0 && !result.error) return resolve(result);
        reject(new Error(result.error || errorOutput || "Resume extraction failed."));
      } catch {
        reject(new Error(errorOutput || "Resume extraction returned an invalid result."));
      }
    });
  });
}

function responseData(resume, personalInfo, skills) {
  return {
    status: resume.status,
    extracted_at: resume.extracted_at,
    personal_info: personalInfo ? {
      full_name: personalInfo.full_name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      location: personalInfo.location,
    } : null,
    skills: skills.map((skill) => ({
      skill_name: skill.skill_name,
      skill_category: skill.skill_category,
      confidence: skill.confidence,
    })),
  };
}

export async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: { message: "A PDF or DOCX resume file is required", status: 400 } });
    if (!req.body.user_id) return res.status(400).json({ error: { message: "user_id is required", status: 400 } });
    if (String(req.body.user_id) !== String(req.session.user.id)) return res.status(403).json({ error: { message: "You can only upload your own resume", status: 403 } });

    let extracted;
    try {
      extracted = await runParser(req.file.path);
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }

    const resume = await StudentResume.findOneAndUpdate(
      { user_id: req.session.user.id },
      { user_id: req.session.user.id, status: "completed", extracted_at: new Date(), raw_text: extracted.raw_text },
      { upsert: true, new: true, runValidators: true },
    );
    const personalInfo = await ResumePersonalInfo.findOneAndUpdate(
      { resume_id: resume._id },
      { resume_id: resume._id, ...extracted.personal_info },
      { upsert: true, new: true, runValidators: true },
    );
    await ResumeSkill.deleteMany({ resume_id: resume._id });
    const skills = extracted.skills.length ? await ResumeSkill.insertMany(extracted.skills.map((skill) => ({ resume_id: resume._id, ...skill }))) : [];
    res.status(201).json(responseData(resume, personalInfo, skills));
  } catch (error) { next(error); }
}

export async function getByUserId(req, res, next) {
  try {
    if (String(req.params.user_id) !== String(req.session.user.id)) return res.status(403).json({ error: { message: "You can only read your own resume", status: 403 } });
    const resume = await StudentResume.findOne({ user_id: req.params.user_id });
    if (!resume) return res.status(404).json({ error: { message: "No extracted resume found", status: 404 } });
    const [personalInfo, skills] = await Promise.all([
      ResumePersonalInfo.findOne({ resume_id: resume._id }),
      ResumeSkill.find({ resume_id: resume._id }).sort({ skill_category: 1, skill_name: 1 }),
    ]);
    res.json(responseData(resume, personalInfo, skills));
  } catch (error) { next(error); }
}
