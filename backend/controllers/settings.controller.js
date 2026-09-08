import Settings from "../models/Settings.js";

// This reads the single placement settings document for the institution.
// An empty object is returned before a TPO has saved settings for the first time.
// This makes a new database work without any seed data.
export async function get(req, res, next) { try { res.json((await Settings.findOne()) || {}); } catch (error) { next(error); } }

// This updates the single settings document, creating it when missing.
// Only simple known settings are accepted from the client request.
// Validation keeps an invalid CGPA from being stored by mistake.
export async function update(req, res, next) { try { const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => ["placementCycleName", "minEligibleCgpa"].includes(key))); res.json(await Settings.findOneAndUpdate({}, update, { upsert: true, new: true, runValidators: true })); } catch (error) { next(error); } }
