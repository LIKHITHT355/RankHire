import StudentProfile from "../models/StudentProfile.js";
import Marksheet from "../models/Marksheet.js";

const profileCompletion = (p) => {
  const fields = [p.department, p.graduationBatch, p.phone, p.skills?.length, p.cgpa !== undefined && p.cgpa !== null, p.resumeUrl];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};
const shape = (p) => ({ ...p.toObject(), profileCompletion: profileCompletion(p) });

// This returns student profiles to placement officers with useful filters.
// Search checks names and emails after joining the linked user account.
// Profiles include a calculated completion number for directory displays.
export async function list(req, res, next) {
  try {
    const query = {};
    for (const key of ["department", "graduationBatch"]) if (req.query[key]) query[key] = req.query[key];
    if (req.query.batch) query.graduationBatch = req.query.batch;
    if (req.query.minCgpa) query.cgpa = { $gte: Number(req.query.minCgpa) };
    const profiles = await StudentProfile.find(query).populate("user", "name email role").sort({ cgpa: -1 });
    const text = req.query.search?.toLowerCase();
    res.json(profiles.filter((p) => !text || p.user.name.toLowerCase().includes(text) || p.user.email.toLowerCase().includes(text)).map(shape));
  } catch (error) { next(error); }
}

// This reads a single profile by its student profile id or user id.
// A student may only open their own record while TPO can open any.
// Not-found records get a standard 404 error response.
export async function getOne(req, res, next) {
  try {
    const p = await StudentProfile.findOne({ $or: [{ _id: req.params.id }, { user: req.params.id }] }).populate("user", "name email role");
    if (!p) return res.status(404).json({ error: { message: "Student not found", status: 404 } });
    if (req.session.user.role === "student" && String(p.user._id) !== req.session.user.id) return res.status(403).json({ error: { message: "You do not have permission for this action", status: 403 } });
    res.json(shape(p));
  } catch (error) { next(error); }
}

// This reads the signed-in student's own profile from their session id.
// It is shared by profile and resume screens so both see current data.
// A profile is created if an older student account does not have one yet.
export async function mine(req, res, next) {
  try {
    const p = await StudentProfile.findOneAndUpdate({ user: req.session.user.id }, { $setOnInsert: { user: req.session.user.id } }, { upsert: true, new: true }).populate("user", "name email role");
    res.json(shape(p));
  } catch (error) { next(error); }
}

// This updates only normal editable fields on the student's own profile.
// Unknown fields are ignored instead of being stored by accident.
// Basic number validation is delegated to Mongoose before saving.
export async function updateMine(req, res, next) {
  try {
    const allowed = ["department", "graduationBatch", "phone", "skills", "cgpa", "backlogs"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (update.skills && (!Array.isArray(update.skills) || update.skills.some((s) => typeof s !== "string"))) return res.status(400).json({ error: { message: "Skills must be an array of text", status: 400 } });
    const p = await StudentProfile.findOneAndUpdate({ user: req.session.user.id }, update, { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }).populate("user", "name email role");
    res.json(shape(p));
  } catch (error) { next(error); }
}

// This saves the uploaded resume name and a URL the frontend can display.
// Multer writes the file itself while this code records its metadata.
// Only the signed-in student's profile is changed by this request.
export async function uploadResume(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: { message: "A resume file is required", status: 400 } });
    const resumeUrl = `/uploads/${req.file.filename}`;
    await StudentProfile.findOneAndUpdate({ user: req.session.user.id }, { resumeUrl, resumeFileName: req.file.originalname }, { upsert: true, new: true });
    res.status(201).json({ resumeUrl, resumeFileName: req.file.originalname });
  } catch (error) { next(error); }
}

// This loads only the signed-in student's semester marksheets.
// Semester order is ascending so the result follows academic order.
// No other student's academic data is exposed by this endpoint.
export async function marksheets(req, res, next) {
  try {
    const p = await StudentProfile.findOne({ user: req.session.user.id });
    res.json(p ? await Marksheet.find({ student: p._id }).sort({ semester: 1 }) : []);
  } catch (error) { next(error); }
}
