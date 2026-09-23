import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getResume, uploadResume } from "../services/students.js";
import { getExtractedResume } from "../services/students.js";
import { getSession } from "../services/auth.js";
import { ApiError } from "../services/api.js";
import { Badge } from "../components/Primitives.jsx";
import { ResumeUpload } from "../components/ResumeUpload.jsx";

export const Route = createFileRoute("/student/resume")({
  head: () => ({
    meta: [
      { title: "My resume — Rank Hire" },
      { name: "description", content: "Add or replace the resume held on your placement record." },
      { property: "og:title", content: "My resume — Rank Hire" },
      { property: "og:description", content: "The resume recruiters will see." },
    ],
  }),
  component: StudentResumeExtraction,
});

async function loadExtractedResume() {
  const user = await getSession();
  try {
    return { user, resume: await getExtractedResume(user.id) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { user, resume: null };
    throw error;
  }
}

function StudentResumeExtraction() {
  const state = useApiData(() => loadExtractedResume(), []);
  const resume = state.data?.resume;
  const userId = state.data?.user?.id;

  return (
    <Shell role="student" breadcrumb="Resume">
      <PageHeader eyebrow="Documents" title="Resume" description="Your file is parsed locally, then removed. Only extracted information is kept." />
      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={3} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}
      {state.configured && !state.loading && !state.error ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {resume ? (
            <>
              <Panel title="Extracted personal information">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs text-muted-foreground">Name</dt><dd>{resume.personal_info?.full_name || "Not found"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Email</dt><dd>{resume.personal_info?.email || "Not found"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Phone</dt><dd>{resume.personal_info?.phone || "Not found"}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Location</dt><dd>{resume.personal_info?.location || "Not found"}</dd></div>
                </dl>
              </Panel>
              <Panel title="Extracted skills" description={resume.extracted_at ? `Extracted ${new Date(resume.extracted_at).toLocaleDateString()}` : undefined}>
                {resume.skills?.length ? <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => <Badge key={`${skill.skill_category}-${skill.skill_name}`} tone={skill.skill_category === "technical" ? "merit" : "neutral"}>
                    {skill.skill_name} · {skill.skill_category} · {Math.round(skill.confidence * 100)}%
                  </Badge>)}
                </div> : <p className="text-sm text-muted-foreground">No predefined skills were found in this resume.</p>}
              </Panel>
              <div className="lg:col-span-2"><ResumeUpload userId={userId} title="Replace extracted resume" onUploaded={(nextResume) => state.setData({ ...state.data, resume: nextResume })} /></div>
            </>
          ) : <div className="lg:col-span-2"><ResumeUpload userId={userId} onUploaded={(nextResume) => state.setData({ ...state.data, resume: nextResume })} /></div>}
        </div>
      ) : null}
    </Shell>
  );
}

function StudentResume() {
  const state = useApiData(() => getResume(), []);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This hands the chosen file over to the backend.
  // The success line appears only after the server confirms it,
  // and the status above is refreshed straight afterwards.
  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    setMessage("");
    setError("");
    setUploading(true);
    try {
      await uploadResume(file);
      setMessage("Resume handed over to the placement record.");
      setFile(null);
      event.target.reset();
      state.reload();
    } catch (err) {
      setError(err.message || "The upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Shell role="student" breadcrumb="Resume">
      <PageHeader
        eyebrow="Documents"
        title="Resume"
        description="One resume is kept on file and shared with every company you apply to."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={2} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}

      {state.configured && !state.loading && !state.error ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* This panel reports what is currently on file. */}
          <Panel title="Current status">
            {state.data?.filename ? (
              <div className="text-sm">
                <p>{state.data.filename}</p>
                {state.data.updatedAt ? (
                  <p className="numeral mt-1 text-xs text-muted-foreground">
                    Updated {new Date(state.data.updatedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resume is on record yet.</p>
            )}
          </Panel>

          {/* This form sends a new resume file to the backend. */}
          <Panel title="Add or replace">
            <form onSubmit={handleUpload} className="space-y-4">
              <Field label="Resume file" htmlFor="resume" hint="PDF is recommended.">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="rh-input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Field>
              <button type="submit" className="rh-btn rh-btn-primary" disabled={!file || uploading}>
                {uploading ? "Uploading…" : "Hand over resume"}
              </button>
              <Notice tone="success">{message}</Notice>
              <Notice tone="error">{error}</Notice>
            </form>
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}
