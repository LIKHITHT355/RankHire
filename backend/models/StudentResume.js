import mongoose from "mongoose";

// This is kept separate from StudentProfile so extraction data never changes
// the existing profile or its legacy resume-file fields.
const schema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  status: { type: String, required: true, default: "completed" },
  extracted_at: { type: Date, required: true, default: Date.now },
  raw_text: { type: String, default: "" },
}, { collection: "student_resumes" });

export default mongoose.model("StudentResume", schema);
