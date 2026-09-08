import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, TableShell, Notice } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getStudents } from "../services/students.js";
import { downloadCsv } from "../lib/csv.js";

export const Route = createFileRoute("/tpo/students")({
  head: () => ({
    meta: [
      { title: "Student directory — Rank Hire" },
      { name: "description", content: "The full student directory held by the placement office." },
      { property: "og:title", content: "Student directory — Rank Hire" },
      { property: "og:description", content: "Every student on the placement record." },
    ],
  }),
  component: TpoStudents,
});

const COLUMNS = [
  { key: "roll", label: "Roll" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "batch", label: "Batch" },
  { key: "cgpa", label: "CGPA" },
  { key: "backlogs", label: "Backlogs" },
];

function TpoStudents() {
  const state = useApiData(() => getStudents(), []);
  const [note, setNote] = useState("");

  // This downloads the directory exactly as it came from the
  // backend. If no students loaded, nothing is exported.
  function exportCsv() {
    const ok = downloadCsv("rank-hire-students.csv", COLUMNS, state.data || []);
    setNote(ok ? "Export downloaded." : "There is nothing to export yet.");
  }

  return (
    <Shell role="tpo" breadcrumb="Student directory">
      <PageHeader
        eyebrow="Directory"
        title="Students on record"
        description="Everyone registered with the training and placement cell."
        actions={
          <button
            type="button"
            className="rh-btn rh-btn-ghost"
            onClick={exportCsv}
            disabled={!state.data?.length}
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </button>
        }
      />
      <Notice>{note}</Notice>

      <DataState state={state} emptyMessage="No students are registered yet." skeletonRows={6}>
        {(students) => (
          <TableShell columns={["Roll", "Name", "Email", "Department", "Batch", "CGPA", "Backlogs"]}>
            {students.map((s) => (
              <tr key={s.id || s._id || s.email} className="border-b border-rule/60 last:border-0">
                <td className="numeral px-4 py-3">{s.roll || "—"}</td>
                <td className="px-4 py-3">{s.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.email || "—"}</td>
                <td className="px-4 py-3">{s.department || "—"}</td>
                <td className="numeral px-4 py-3">{s.batch || "—"}</td>
                <td className="numeral px-4 py-3">{s.cgpa ?? "—"}</td>
                <td className="numeral px-4 py-3">{s.backlogs ?? "—"}</td>
              </tr>
            ))}
          </TableShell>
        )}
      </DataState>
    </Shell>
  );
}
