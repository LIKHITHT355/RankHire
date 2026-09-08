import mongoose from "mongoose";

// This records one student's application to one job.
// The compound index prevents accidental duplicate applications.
// Status is limited to the placement stages used by the frontend.
const schema = new mongoose.Schema({ job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true }, student: { type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile", required: true }, status: { type: String, enum: ["applied", "shortlisted", "rejected", "selected"], default: "applied" }, appliedAt: { type: Date, default: Date.now } });
schema.index({ job: 1, student: 1 }, { unique: true });
export default mongoose.model("Application", schema);
