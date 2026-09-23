import mongoose from "mongoose";

const schema = new mongoose.Schema({
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentResume", required: true },
  skill_name: { type: String, required: true },
  skill_category: { type: String, enum: ["technical", "soft"], required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
}, { collection: "resume_skills" });

schema.index({ resume_id: 1, skill_name: 1 }, { unique: true });

export default mongoose.model("ResumeSkill", schema);
