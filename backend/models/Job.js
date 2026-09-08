import mongoose from "mongoose";

// This is a job posted by a company user.
// The postedBy link is used to protect company-only job views.
// Status defaults to open until a company closes the role later.
const schema = new mongoose.Schema({ title: { type: String, required: true }, description: { type: String, required: true }, location: String, employmentType: String, skills: [String], eligibility: String, minCgpa: Number, deadline: Date, postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, status: { type: String, enum: ["open", "closed"], default: "open" } }, { timestamps: { createdAt: true, updatedAt: true } });
export default mongoose.model("Job", schema);
