import mongoose from "mongoose";

// This represents one semester's marks for one student profile.
// Subject details stay embedded because they belong only to this sheet.
// SGPA is stored as a simple number for easy display.
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true }, semester: { type: Number, required: true },
  subjects: [{ name: String, marks: Number, credits: Number, grade: String, gradePoint: Number }], sgpa: Number,
}, { timestamps: true });
export default mongoose.model("Marksheet", schema);
