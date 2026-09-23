import mongoose from "mongoose";

const schema = new mongoose.Schema({
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentResume", required: true, unique: true },
  full_name: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
}, { collection: "resume_personal_info" });

export default mongoose.model("ResumePersonalInfo", schema);
