import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, TableShell, Notice } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard, EmptyState } from "../components/DataState.jsx";
import { isApiConfigured } from "../services/api.js";
import { queryRanking } from "../services/ranking.js";
import { rankByCgpa } from "../lib/metrics.js";
import { downloadCsv } from "../lib/csv.js";

export const Route = createFileRoute("/tpo/select-students")({
  head: () => ({
    meta: [
      { title: "Select students — Rank Hire" },
      { name: "description", content: "Run a merit query across departments, batches and CGPA cut offs." },
      { property: "og:title", content: "Select students — Rank Hire" },
      { property: "og:description", content: "Merit ranking query for the placement office." },
    ],
  }),
  component: SelectStudents,
});

const COLUMNS = [
  { key: "rank", label: "Rank" },
  { key: "name", label: "Student" },
  { key: "roll", label: "Roll" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "cgpa", label: "CGPA" },
  { key: "backlogs", label: "Backlogs" },
];

function SelectStudents() {
  const [filters, setFilters] = useState({ department: "", batch: "", minCgpa: "" });
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  // This sends the chosen filters to the backend and puts the
  // matching students on screen in merit order. Nothing is shown
  // until the server has actually returned real records.
  async function runQuery(event) {
    if (event) event.preventDefault();
    setError("");
    setNote("");
    setLoading(true);
    try {
      const result = await queryRanking(filters);
      setRows(rankByCgpa(Array.isArray(result) ? result : result?.students || []));
    } catch (err) {
      setRows(null);
      setError(err.message || "The query failed.");
    } finally {
      setLoading(false);
    }
  }

  // This saves the results currently on screen as a CSV file.
  // If the table is empty there is nothing genuine to export,
  // so the button simply reports that instead.
  function exportCsv() {
    const ok = downloadCsv("rank-hire-selection.csv", COLUMNS, rows || []);
    setNote(ok ? "Export downloaded." : "There are no results to export yet.");
  }

  return (
    <Shell role="tpo" breadcrumb="Select students">
      <PageHeader
        eyebrow="Merit query"
        title="Select students"
        description="Filter the record by department, batch and minimum CGPA, then export the shortlist."
        actions={
          <button type="button" className="rh-btn rh-btn-ghost" onClick={exportCsv} disabled={!rows?.length}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <Panel title="Filters">
        {/* This form gathers the query conditions. Nothing is
            searched until the run button is pressed. */}
        <form className="grid gap-4 sm:grid-cols-4" onSubmit={runQuery}>
          <Field label="Department" htmlFor="department">
            <input
              id="department"
              className="rh-input"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              placeholder="e.g. Computer Science"
            />
          </Field>
          <Field label="Batch" htmlFor="batch">
            <input
              id="batch"
              className="rh-input"
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              placeholder="e.g. 2026"
            />
          </Field>
          <Field label="Minimum CGPA" htmlFor="minCgpa">
            <input
              id="minCgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="rh-input"
              value={filters.minCgpa}
              onChange={(e) => setFilters({ ...filters, minCgpa: e.target.value })}
            />
          </Field>
          <div className="flex items-end">
            <button type="submit" className="rh-btn rh-btn-primary w-full" disabled={loading || !isApiConfigured()}>
              {loading ? "Running…" : "Run query"}
            </button>
          </div>
        </form>
        <Notice>{note}</Notice>
      </Panel>

      <div className="mt-6">
        {!isApiConfigured() ? <NotConnected /> : null}
        {isApiConfigured() && loading ? <Skeleton rows={5} /> : null}
        {isApiConfigured() && !loading && error ? <ErrorCard message={error} onRetry={runQuery} /> : null}
        {isApiConfigured() && !loading && !error && rows && rows.length === 0 ? (
          <EmptyState message="No students match these filters." />
        ) : null}
        {isApiConfigured() && !loading && !error && rows && rows.length > 0 ? (
          <TableShell columns={["Rank", "Student", "Roll / Email", "Department", "CGPA", "Backlogs", "Eligible"]}>
            {rows.map((s) => (
              <tr key={s.id || s._id || s.email} className="border-b border-rule/60 last:border-0">
                <td className="numeral px-4 py-3">{s.rank ?? "—"}</td>
                <td className="px-4 py-3">{s.name || "—"}</td>
                <td className="px-4 py-3">
                  <span className="numeral">{s.roll || "—"}</span>
                  <span className="block text-xs text-muted-foreground">{s.email || "—"}</span>
                </td>
                <td className="px-4 py-3">{s.department || "—"}</td>
                <td className="numeral px-4 py-3">{s.cgpa ?? "—"}</td>
                <td className="numeral px-4 py-3">{s.backlogs ?? "—"}</td>
                <td className="px-4 py-3">{s.eligible === undefined ? "—" : s.eligible ? "Yes" : "No"}</td>
              </tr>
            ))}
          </TableShell>
        ) : null}
      </div>
    </Shell>
  );
}
