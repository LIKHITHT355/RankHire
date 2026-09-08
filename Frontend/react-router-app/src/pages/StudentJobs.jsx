import { useState } from "react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Badge, Notice } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getJobs, applyToJob } from "../services/jobs.js";


function StudentJobs() {
  const state = useApiData(() => getJobs({ status: "open" }), []);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This sends an application for one role to the backend.
  // While it is in flight only that role's button is disabled.
  // Success or failure comes from the server, never from the app.
  async function handleApply(jobId) {
    setMessage("");
    setError("");
    setBusyId(jobId);
    try {
      await applyToJob(jobId);
      setMessage("Application submitted.");
      state.reload();
    } catch (err) {
      setError(err.message || "Could not submit the application.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Shell role="student" breadcrumb="Opportunities">
      <PageHeader
        eyebrow="Open roles"
        title="Opportunities"
        description="Eligibility is printed with every role, so you know before you apply."
      />
      <Notice tone="success">{message}</Notice>
      <Notice tone="error">{error}</Notice>

      <DataState state={state} emptyMessage="No opportunities are open right now." skeletonRows={4}>
        {(jobs) => (
          <ul className="space-y-4">
            {jobs.map((job) => {
              const id = job.id || job._id;
              return (
                <li key={id} className="panel p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <h2 className="text-xl">{job.title || "—"}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.company || "—"} · {job.location || "—"} · {job.type || "—"}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge tone="merit">Min CGPA {job.minCgpa ?? "—"}</Badge>
                        {job.eligibility ? <Badge>{job.eligibility}</Badge> : null}
                        {(job.skills || []).map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="eyebrow">Closes</p>
                      <p className="numeral mt-1 text-sm">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}
                      </p>
                      <button
                        type="button"
                        className="rh-btn rh-btn-primary mt-4"
                        onClick={() => handleApply(id)}
                        disabled={busyId === id || job.applied}
                      >
                        {job.applied ? "Applied" : busyId === id ? "Submitting…" : "Apply"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DataState>
    </Shell>
  );
}

export default StudentJobs;
