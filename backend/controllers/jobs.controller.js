import Job from "../models/Job.js";
import Application from "../models/Application.js";
import StudentProfile from "../models/StudentProfile.js";

const notFound = (res, name) => res.status(404).json({ error: { message: `${name} not found`, status: 404 } });

// This lists jobs according to the account currently using the API.
// Students only see open jobs, companies see their own, and TPO sees all.
// Optional status and search filters can narrow the returned list further.
export async function list(req, res, next) {
  try {
    const query = req.session.user.role === "student" ? { status: "open" } : req.session.user.role === "company" ? { postedBy: req.session.user.id } : {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) query.$or = ["title", "location", "skills"].map((key) => ({ [key]: new RegExp(req.query.search, "i") }));
    res.json(await Job.find(query).populate("postedBy", "name email").sort({ createdAt: -1 }));
  } catch (error) { next(error); }
}

// This loads one job that the signed-in role is allowed to inspect.
// A company cannot read another company's private job through this route.
// Students cannot open closed jobs unless they already have access elsewhere.
export async function getOne(req, res, next) {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) return notFound(res, "Job");
    if (req.session.user.role === "company" && String(job.postedBy._id) !== req.session.user.id) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } });
    res.json(job);
  } catch (error) { next(error); }
}

// This publishes a job under the company account stored in the session.
// Title and description are required because they identify the opportunity.
// Mongoose validates remaining values such as dates and numeric CGPA.
export async function create(req, res, next) {
  try {
    const { title, description, location, employmentType, skills, eligibility, minCgpa, deadline, status } = req.body;
    if (!title || !description) return res.status(400).json({ error: { message: "Title and description are required", status: 400 } });
    if (skills !== undefined && !Array.isArray(skills)) return res.status(400).json({ error: { message: "Skills must be an array", status: 400 } });
    res.status(201).json(await Job.create({ title, description, location, employmentType, skills, eligibility, minCgpa, deadline, status, postedBy: req.session.user.id }));
  } catch (error) { next(error); }
}

// This submits an application for the student represented by the session.
// It blocks closed jobs, duplicates, and students below a stated CGPA rule.
// The default status is applied and the new application is returned.
export async function apply(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return notFound(res, "Job");
    if (job.status !== "open" || (job.deadline && job.deadline < new Date())) return res.status(400).json({ error: { message: "This job is no longer accepting applications", status: 400 } });
    const student = await StudentProfile.findOne({ user: req.session.user.id });
    if (!student) return res.status(400).json({ error: { message: "Complete your student profile before applying", status: 400 } });
    if (job.minCgpa != null && (student.cgpa == null || student.cgpa < job.minCgpa)) return res.status(400).json({ error: { message: "Your CGPA does not meet this job's requirement", status: 400 } });
    if (await Application.exists({ job: job._id, student: student._id })) return res.status(400).json({ error: { message: "You have already applied to this job", status: 400 } });
    res.status(201).json(await Application.create({ job: job._id, student: student._id }));
  } catch (error) { next(error); }
}

// This returns the current student's applications with the job details.
// Results are newest first so recent applications are immediately visible.
// The session identity prevents reading any other student's application list.
export async function myApplications(req, res, next) {
  try { const student = await StudentProfile.findOne({ user: req.session.user.id }); res.json(student ? await Application.find({ student: student._id }).populate("job").sort({ appliedAt: -1 }) : []); } catch (error) { next(error); }
}

// This gives the job owner or the placement office a list of applicants.
// Student profiles are populated with names and email but no password field.
// Ownership is verified before a company sees candidate information.
export async function applicants(req, res, next) {
  try {
    const job = await Job.findById(req.params.id); if (!job) return notFound(res, "Job");
    if (req.session.user.role === "company" && String(job.postedBy) !== req.session.user.id) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } });
    res.json(await Application.find({ job: job._id }).populate({ path: "student", populate: { path: "user", select: "name email" } }).sort({ appliedAt: -1 }));
  } catch (error) { next(error); }
}
