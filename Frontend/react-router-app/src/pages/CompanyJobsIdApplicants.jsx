import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, TableShell, Badge, Notice } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getApplicants } from "../services/jobs.js";
import { updateShortlist } from "../services/shortlists.js";
import { downloadCsv } from "../lib/csv.js";


const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
  { key: "cgpa", label: "CGPA" },
  { key: "status", label: "Status" },
];

function Applicants() {
  const { id } = useParams();
  const state = useApiData(() => getApplicants(id), [id]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  // This changes one candidate's status through the backend and
  // then reloads the table, so the screen always matches the record.
  async function setStatus(applicationId, status) {
    setNote("");
    setError("");
    setBusy(applicationId);
    try {
      await updateShortlist(id, applicationId, status);
      setNote(`Candidate marked as ${status}.`);
      state.reload();
    } catch (err) {
      setError(err.message || "Could not update the candidate.");
    } finally {
      setBusy(null);
    }
  }

  // This downloads the applicant list exactly as loaded.
  function exportCsv() {
    const ok = downloadCsv(`rank-hire-applicants-${id}.csv`, COLUMNS, state.data || []);
    setNote(ok ? "Export downloaded." : "There is nothing to export yet.");
  }

  return (
    <Shell role="company" breadcrumb="Applicants">
      <PageHeader
        eyebrow="Role review"
        title="Applicants"
        description="Academic figures below come from the college record, not from the candidate."
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
      <Notice tone="success">{note}</Notice>
      <Notice tone="error">{error}</Notice>

      <DataState state={state} emptyMessage="No one has applied to this role yet." skeletonRows={5}>
        {(applicants) => (
          <TableShell columns={["Name", "Department", "CGPA", "Status", "Actions"]}>
            {applicants.map((a) => {
              const applicationId = a.id || a._id;
              return (
                <tr key={applicationId} className="border-b border-rule/60 last:border-0">
                  <td className="px-4 py-3">
                    {a.name || "—"}
                    <span className="block text-xs text-muted-foreground">{a.email || ""}</span>
                  </td>
                  <td className="px-4 py-3">{a.department || "—"}</td>
                  <td className="numeral px-4 py-3">{a.cgpa ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={a.status === "shortlisted" ? "merit" : a.status === "rejected" ? "danger" : "neutral"}>
                      {a.status || "submitted"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rh-btn rh-btn-ghost px-3 py-1.5 text-xs"
                        disabled={busy === applicationId}
                        onClick={() => setStatus(applicationId, "shortlisted")}
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        className="rh-btn rh-btn-danger px-3 py-1.5 text-xs"
                        disabled={busy === applicationId}
                        onClick={() => setStatus(applicationId, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableShell>
        )}
      </DataState>
    </Shell>
  );
}

export default Applicants;
