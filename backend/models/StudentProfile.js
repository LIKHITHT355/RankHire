import mongoose from "mongoose";

// This holds placement-specific information for a student account.
// Each user can have one profile, linked by the user field.
// Empty fields are allowed because profiles are completed over time.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: String, department: String, batch: String, graduationBatch: String, phone: String, skills: [String],
  cgpa: { type: Number, min: 0, max: 10 }, backlogs: { type: Number, min: 0, default: 0 },
  resumeUrl: String, resumeFileName: String,
});
export default mongoose.model("StudentProfile", schema);
