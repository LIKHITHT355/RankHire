import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, TableShell, StatCard } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getMarksheets } from "../services/students.js";
import { getGradeFromMarks, calculateSgpa, calculateCgpa } from "../lib/metrics.js";

export const Route = createFileRoute("/student/marksheets")({
  head: () => ({
    meta: [
      { title: "Marksheets — Rank Hire" },
      { name: "description", content: "Semester subjects, marks, credits, SGPA and CGPA." },
      { property: "og:title", content: "Marksheets — Rank Hire" },
      { property: "og:description", content: "Your semester results and credit weighted averages." },
    ],
  }),
  component: StudentMarksheets,
});

function StudentMarksheets() {
  // This loads the semester records from the backend.
  // The app only does the grading maths, it never invents subjects.
  const state = useApiData(() => getMarksheets(), []);

  return (
    <Shell role="student" breadcrumb="Marksheets">
      <PageHeader
        eyebrow="Academic record"
        title="Marksheets"
        description="Grades follow the VTU scale. SGPA and CGPA are weighted by credits."
      />

      <DataState state={state} emptyMessage="No semester results are on record yet." skeletonRows={6}>
        {(semesters) => {
          // This works out the overall CGPA across every semester
          // returned by the backend. If any semester is incomplete
          // the result is a dash rather than a misleading figure.
          const cgpa = calculateCgpa(semesters);
          const totalCredits = semesters.reduce(
            (sum, sem) => sum + (sem.subjects || []).reduce((s, sub) => s + (Number(sub.credits) || 0), 0),
            0,
          );

          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Semesters on record" value={semesters.length} />
                <StatCard label="Total credits" value={totalCredits || null} />
                <StatCard label="CGPA" value={cgpa ?? null} hint="Credit weighted across semesters" />
              </div>

              {/* Each semester is printed as its own small table
                  with the grade and grade point worked out per subject. */}
              {semesters.map((sem, index) => {
                const sgpa = calculateSgpa(sem.subjects);
                return (
                  <Panel
                    key={sem.id || sem._id || index}
                    title={`Semester ${sem.semester ?? index + 1}`}
                    description={`SGPA ${sgpa ?? "—"}`}
                  >
                    <TableShell columns={["Subject", "Marks", "Credits", "Grade", "Grade point"]}>
                      {(sem.subjects || []).map((sub, i) => {
                        const graded = getGradeFromMarks(sub.marks);
                        return (
                          <tr key={sub.code || i} className="border-b border-rule/60 last:border-0">
                            <td className="px-4 py-3">
                              {sub.name || "—"}
                              {sub.code ? (
                                <span className="numeral block text-xs text-muted-foreground">{sub.code}</span>
                              ) : null}
                            </td>
                            <td className="numeral px-4 py-3">{sub.marks ?? "—"}</td>
                            <td className="numeral px-4 py-3">{sub.credits ?? "—"}</td>
                            <td className="numeral px-4 py-3">{graded ? graded.grade : "—"}</td>
                            <td className="numeral px-4 py-3">{graded ? graded.point : "—"}</td>
                          </tr>
                        );
                      })}
                    </TableShell>
                  </Panel>
                );
              })}
            </div>
          );
        }}
      </DataState>
    </Shell>
  );
}
