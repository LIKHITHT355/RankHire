import mongoose from "mongoose";

// This stores the public information for a company account.
// The user link means only one company profile exists per account.
// It is intentionally small so companies can fill it in gradually.
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, companyName: String, industry: String, website: String, about: String });
export default mongoose.model("CompanyProfile", schema);
