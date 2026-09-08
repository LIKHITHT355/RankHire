import CompanyProfile from "../models/CompanyProfile.js";

// This supplies a basic company directory to any logged-in role.
// Company account names and email are included as safe contact details.
// No account password or private session data is ever selected.
export async function list(req, res, next) { try { res.json(await CompanyProfile.find().populate("user", "name email").sort({ companyName: 1 })); } catch (error) { next(error); } }
