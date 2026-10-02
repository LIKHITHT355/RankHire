import CompanyProfile from "../models/CompanyProfile.js";
import Job from "../models/Job.js";

// This supplies a basic company directory to any logged-in role.
// Company account names and email are included as safe contact details.
// No account password or private session data is ever selected.
export async function list(req, res, next) {
  try {
    const profiles = await CompanyProfile.find().populate("user", "name email").sort({ companyName: 1 });
    const companies = await Promise.all(profiles.map(async (profile) => {
      const data = profile.toObject();
      const openRoles = await Job.countDocuments({ postedBy: data.user?._id, status: "open" });
      return {
        ...data,
        name: data.companyName || data.user?.name,
        openRoles,
        status: openRoles ? "active" : "inactive",
      };
    }));
    res.json(companies);
  } catch (error) { next(error); }
}
