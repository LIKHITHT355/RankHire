import Shortlist from "../models/Shortlist.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

async function canUseJob(req, jobId) { const job = await Job.findById(jobId); return job && (req.session.user.role === "tpo" || String(job.postedBy) === req.session.user.id) ? job : null; }

// This lists shortlist entries and can be narrowed to one job with ?job=.
// Companies only receive records for jobs they own while TPO sees all.
// Student details are populated for reviewing candidates.
export async function list(req, res, next) {
  try { const query = req.query.job ? { job: req.query.job } : {}; if (req.session.user.role === "company") { const jobs = await Job.find({ postedBy: req.session.user.id }).select("_id"); query.job = { $in: jobs.map((j) => j._id) }; } res.json(await Shortlist.find(query).populate("job", "title").populate({ path: "student", populate: { path: "user", select: "name email" } })); } catch (error) { next(error); }
}

// This creates a manual shortlist record for an eligible company or TPO.
// It checks that the job exists and a student id has been supplied.
// Duplicate rows are rejected by MongoDB's unique index.
export async function create(req, res, next) {
  try { const { job, student, note } = req.body; if (!job || !student) return res.status(400).json({ error: { message: "Job and student are required", status: 400 } }); if (!(await canUseJob(req, job))) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } }); res.status(201).json(await Shortlist.create({ job, student, note })); } catch (error) { next(error); }
}

// This compatibility endpoint returns shortlisted applications for one job.
// It uses the frontend's expected /jobs/:id/shortlist address.
// Job ownership protection is the same as the main shortlist routes.
export async function jobList(req, res, next) { try { if (!(await canUseJob(req, req.params.id))) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } }); res.json(await Application.find({ job: req.params.id, status: "shortlisted" }).populate({ path: "student", populate: { path: "user", select: "name email" } })); } catch (error) { next(error); } }

// This compatibility endpoint changes an applicant's workflow status.
// Only valid placement statuses are allowed to keep data consistent.
// If set to shortlisted, it also creates the corresponding shortlist record.
export async function updateApplication(req, res, next) { try { if (!(await canUseJob(req, req.params.id))) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } }); const { status } = req.body; if (!["applied", "shortlisted", "rejected", "selected"].includes(status)) return res.status(400).json({ error: { message: "Invalid application status", status: 400 } }); const application = await Application.findOneAndUpdate({ _id: req.params.applicationId, job: req.params.id }, { status }, { new: true }); if (!application) return res.status(404).json({ error: { message: "Application not found", status: 404 } }); if (status === "shortlisted") await Shortlist.updateOne({ job: req.params.id, student: application.student }, { $setOnInsert: { job: req.params.id, student: application.student } }, { upsert: true }); res.json(application); } catch (error) { next(error); } }
