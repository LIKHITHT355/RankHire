import mongoose from "mongoose";

// This keeps an optional note when a candidate is shortlisted.
// A job and student can appear together only once.
// The record is separate from an application so TPOs can add one too.
const schema = new mongoose.Schema({ job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true }, student: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true }, note: String }, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ job: 1, student: 1 }, { unique: true });
export default mongoose.model("Shortlist", schema);
