import mongoose from "mongoose";

// This stores account information shared by every kind of user.
// Password hashes are kept separately from data returned to clients.
// The email index prevents two accounts from using one address.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student", "tpo", "company"], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model("User", userSchema);
