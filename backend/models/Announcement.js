import mongoose from "mongoose";

// This stores a message published by a placement officer.
// The text accepts both message and frontend's body naming.
// Timestamps let the API show newest announcements first.
const schema = new mongoose.Schema({ title: { type: String, required: true }, message: { type: String, required: true }, postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } }, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.model("Announcement", schema);
