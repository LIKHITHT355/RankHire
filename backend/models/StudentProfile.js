import mongoose from "mongoose";

// This holds placement-specific information for a student account.
// Each user can have one profile, linked by the user field.
// Empty fields are allowed because profiles are completed over time.
const subjectSchema = new mongoose.Schema({
  code: String,
  name: String,
  credits: { type: Number, min: 0 },
  marks: { type: Number, min: 0, max: 100 },
  grade: String,
  gradePoint: { type: Number, min: 0, max: 10 },
}, { _id: false });

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true, min: 1, max: 8 },
  sgpa: { type: Number, default: 0, min: 0, max: 10 },
  totalCredits: { type: Number, default: 0, min: 0 },
  subjects: { type: [subjectSchema], default: [] },
}, { _id: false });

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: String, department: String, batch: String, graduationBatch: String, phone: String, skills: [String],
  cgpa: { type: Number, min: 0, max: 10, default: 0 }, backlogs: { type: Number, min: 0, default: 0 },
  semesters: { type: [semesterSchema], default: [] },
  resumeUrl: String, resumeFileName: String,
});

// CGPA is credit weighted, so a short semester never carries the same
// influence as a full one. It is recalculated whenever semester data is saved.
schema.pre("save", function calculateCgpa(next) {
  const totals = this.semesters.reduce((result, semester) => ({
    points: result.points + (Number(semester.sgpa) || 0) * (Number(semester.totalCredits) || 0),
    credits: result.credits + (Number(semester.totalCredits) || 0),
  }), { points: 0, credits: 0 });
  this.cgpa = totals.credits ? Number((totals.points / totals.credits).toFixed(2)) : 0;
  next();
});
export default mongoose.model("StudentProfile", schema);
