// This file holds the academic maths for the app.
// It turns marks into grades, and grades into SGPA and CGPA.
// Everything here is pure calculation, no backend involved.
// If the numbers given are wrong or missing, it returns null.

// This list describes the VTU style grading rules.
// Each row says: if marks are at least "min", the grade
// and grade point on that row apply. The list is ordered
// from the highest band down to the lowest one.
const GRADE_BANDS = [
  { min: 90, grade: "O", point: 10 },
  { min: 80, grade: "A+", point: 9 },
  { min: 70, grade: "A", point: 8 },
  { min: 60, grade: "B+", point: 7 },
  { min: 55, grade: "B", point: 6 },
  { min: 50, grade: "C", point: 5 },
  { min: 40, grade: "P", point: 4 },
  { min: 0, grade: "F", point: 0 },
];

// This function checks that a value is a usable number.
// Text, empty boxes and impossible values are rejected.
// We use it before doing any maths so a bad value never
// quietly turns into a wrong result.
function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// This function converts a marks value into a grade.
// It walks down the grading bands and returns the first
// one the marks fit into. If the marks are missing or
// outside 0 to 100, it returns null instead of guessing.
export function getGradeFromMarks(marks) {
  const n = toNumber(marks);
  if (n === null || n < 0 || n > 100) return null;
  const band = GRADE_BANDS.find((b) => n >= b.min);
  return band ? { grade: band.grade, point: band.point } : null;
}

// This function works out the SGPA for one semester.
// It multiplies each subject's credits by its grade point,
// adds those up, and divides by the total credits.
// Any missing subject, credit or mark makes it return null.
export function calculateSgpa(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) return null;
  let weighted = 0;
  let credits = 0;
  for (const subject of subjects) {
    const credit = toNumber(subject?.credits);
    const graded = getGradeFromMarks(subject?.marks);
    if (credit === null || credit <= 0 || graded === null) return null;
    weighted += credit * graded.point;
    credits += credit;
  }
  if (credits === 0) return null;
  return Math.round((weighted / credits) * 100) / 100;
}

// This function works out the overall CGPA.
// It takes every semester, weights its SGPA by the credits
// earned in that semester, and averages them together.
// If one semester cannot be calculated, the answer is null.
export function calculateCgpa(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) return null;
  let weighted = 0;
  let credits = 0;
  for (const semester of semesters) {
    const sgpa = calculateSgpa(semester?.subjects);
    if (sgpa === null) return null;
    const semesterCredits = (semester.subjects || []).reduce(
      (sum, s) => sum + (toNumber(s?.credits) || 0),
      0,
    );
    if (semesterCredits <= 0) return null;
    weighted += sgpa * semesterCredits;
    credits += semesterCredits;
  }
  if (credits === 0) return null;
  return Math.round((weighted / credits) * 100) / 100;
}

// This function sorts students from the highest CGPA down.
// It also adds a rank number to each student so tables can
// show position. Students without a usable CGPA are kept at
// the end and given no rank rather than a made up one.
export function rankByCgpa(students) {
  if (!Array.isArray(students)) return [];
  const withCgpa = [];
  const withoutCgpa = [];
  for (const student of students) {
    const cgpa = toNumber(student?.cgpa);
    if (cgpa === null) withoutCgpa.push({ ...student, rank: null });
    else withCgpa.push({ ...student, cgpa });
  }
  withCgpa.sort((a, b) => b.cgpa - a.cgpa);
  return [...withCgpa.map((s, i) => ({ ...s, rank: i + 1 })), ...withoutCgpa];
}
