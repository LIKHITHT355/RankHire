// Result-card subjects and marks arranged by the supplied VTU scheme order.
const course = ([code, name, credits]) => ({ code, name, credits, cie: "", see: "", total: "" });
const sem = (totalCredits, subjects) => ({ totalCredits, subjects: subjects.map(course) });
export const vtuSchemeData = {
  1: sem(20, [
    ["BMATS101", "Mathematics for CSE Stream-I", 4],
    ["BPHYS102", "Physics for CSE Stream", 4],
    ["BPOPS103", "Principles of Programming Using C", 3],
    ["BESCK104C", "Introduction to Electronics Engineering", 3],
    ["BETCK105H", "Introduction to Internet of Things (IoT)", 3],
    ["BIDTK158", "Innovation and Design Thinking", 1],
    ["BENGK106", "Communicative English", 1],
    ["BSKK107", "Samskrutika Kannada", 1],
  ]),
  2: sem(20, [
    ["BMATS201", "Mathematics-II for CSE Stream", 4],
    ["BCHES202", "Applied Chemistry for CSE Stream", 4],
    ["BCEDK203", "Computer-Aided Engineering Drawing", 3],
    ["BESCK204B", "Introduction to Electrical Engineering", 3],
    ["BSFHK258", "Scientific Foundations of Health", 3],
    ["BPLCK205B", "Introduction to Python Programming", 1],
    ["BPWSK206", "Professional Writing Skills in English", 1],
    ["BICOK207", "Indian Constitution", 1],
  ]),
  3: sem(22, [
    ["BCS301", "Mathematics for Computer Science", 4],
    ["BCS302", "Digital Design & Computer Organization", 4],
    ["BCS303", "Operating Systems", 4],
    ["BCS304", "Data Structures and Applications", 3],
    ["BCSL305", "Data Structures Lab", 1],
    ["BCS306A", "Object Oriented Programming with Java", 3],
    ["BSCK307", "Social Connect and Responsibility", 1],
    ["BCS358A", "Data Analytics with Excel", 1],
    ["BNSK359", "National Service Scheme", 1],
  ]),
  4: sem(22, [
    ["BCS405A", "Discrete Mathematical Structures", 3],
    ["BCS401", "Analysis & Design of Algorithms", 4],
    ["BCS402", "Microcontrollers", 3],
    ["BCS403", "Database Management Systems", 3],
    ["BCSL404", "Analysis & Design of Algorithms Lab", 1],
    ["BUHK408", "Universal Human Values Course", 3],
    ["BBOC407", "Biology for Computer Engineers", 2],
    ["BCSL456D", "Technical Writing Using LaTeX Lab", 1],
    ["BNSK459", "National Service Scheme", 2],
  ]),
  5: sem(22, [
    ["BCS501", "Software Engineering and Project Management", 3],
    ["BCS502", "Computer Networks", 4],
    ["BCS503", "Theory of Computation", 4],
    ["BCS515A", "Computer Graphics", 3],
    ["BCS508", "Environmental Studies and E-Waste Management", 3],
    ["BCSL504", "Web Technology Lab", 1],
    ["BRMK557", "Research Methodology and IPR", 3],
    ["BCS586", "Mini Project", 1],
    ["BNSK559", "National Service Scheme", 0],
  ]),
  6: sem(18, [
    ["BCS601", "Cloud Computing", 4],
    ["BCS602", "Machine Learning", 4],
    ["BCS613D", "Advanced Java", 3],
    ["BCV654A", "Water Conservation and Rainwater Harvesting", 3],
    ["BCS685", "Project Phase I", 2],
    ["BCSL606", "Machine Learning Lab", 1],
    ["BCSL657D", "DevOps", 1],
    ["BNSK658", "National Service Scheme", 0],
    ["BIKS609", "Indian Knowledge System", 0],
  ]),
};
export const VTU_SCHEME_2022 = Object.fromEntries(
  Object.entries(vtuSchemeData).map(([semester, data]) => [semester, data.subjects]),
);
export const makeSemesterSubjects = (semester) =>
  (VTU_SCHEME_2022[semester] || []).map((subject) => ({ ...subject }));
