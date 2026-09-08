import StudentProfile from "../models/StudentProfile.js";

// This filters students with the requested academic criteria.
// MongoDB sorts by CGPA before rank numbers are calculated in order.
// Rank starts at one and is included beside each safe profile result.
export async function list(req, res, next) {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.batch) query.graduationBatch = req.query.batch;
    if (req.query.minCgpa) query.cgpa = { $gte: Number(req.query.minCgpa) };
    const students = await StudentProfile.find(query).populate("user", "name email").sort({ cgpa: -1, _id: 1 });
    res.json(students.map((student, index) => ({ ...student.toObject(), rank: index + 1 })));
  } catch (error) { next(error); }
}
