import mongoose from "mongoose";

// This contains institution-wide placement settings in one document.
// Upsert in the controller creates it on the first settings save.
// New simple settings can be added here without changing route logic.
const schema = new mongoose.Schema({ placementCycleName: String, minEligibleCgpa: { type: Number, min: 0, max: 10, default: 0 } }, { timestamps: true });
export default mongoose.model("Settings", schema);
