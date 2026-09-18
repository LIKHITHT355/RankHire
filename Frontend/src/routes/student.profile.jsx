import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getMyProfile, updateProfile, getExtractedResume } from "../services/students.js";
import { ResumeUpload } from "../components/ResumeUpload.jsx";
import { ApiError } from "../services/api.js";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Rank Hire" },
      { name: "description", content: "Keep your placement profile and skills up to date." },
      { property: "og:title", content: "My profile — Rank Hire" },
      { property: "og:description", content: "Your placement profile on the college record." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const state = useApiData(() => getMyProfile(), []);
  const userId = state.data?.user?._id || state.data?.user?.id;
  const resumeState = useApiData(
    async () => {
      try {
        return await getExtractedResume(userId);
      } catch (err) {
        // A missing resume is the normal state before the first upload.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    [userId],
    { enabled: Boolean(userId) },
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    department: "",
    batch: "",
    skills: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This fills the form with the details already on record,
  // so the student edits their real profile rather than a blank one.
  useEffect(() => {
    if (state.data) {
      setForm((current) => ({
        name: state.data.name ?? "",
        phone: state.data.phone ?? "",
        email: current.email,
        location: current.location,
        department: state.data.department ?? "",
        batch: state.data.batch ?? "",
        skills: Array.isArray(state.data.skills) ? state.data.skills.join(", ") : (state.data.skills ?? ""),
      }));
    }
  }, [state.data]);

  // Resume information is loaded from the database after the normal profile.
  // It fills the same editable form instead of creating a second details area.
  useEffect(() => {
    if (!resumeState.data) return;
    const info = resumeState.data.personal_info || {};
    const extractedSkills = resumeState.data.skills?.map((skill) => skill.skill_name).join(", ");
    setForm((current) => ({
      ...current,
      name: info.full_name || current.name,
      phone: info.phone || current.phone,
      email: info.email || current.email,
      location: info.location || current.location,
      skills: extractedSkills || current.skills,
    }));
  }, [resumeState.data]);

  // This sends the edited profile to the backend.
  // Skills typed as one line are split into a list first,
  // which is what a typical backend expects to store.
  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const result = await updateProfile({
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      state.setData(result.data);
      setMessage(result.message);
    } catch (err) {
      setError(err.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell role="student" breadcrumb="Profile">
      <PageHeader
        eyebrow="Your record"
        title="Profile"
        description="These details are shown to the placement office and to recruiters you apply to."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={5} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}

      {state.configured && !state.loading && !state.error ? (
        <>
        <Panel title="Details">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <Field label="Full name" htmlFor="name">
              <input
                id="name"
                className="rh-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Contact number" htmlFor="phone">
              <input
                id="phone"
                className="rh-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                className="rh-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Location" htmlFor="location">
              <input
                id="location"
                className="rh-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </Field>
            <Field label="Department" htmlFor="department">
              <input
                id="department"
                className="rh-input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </Field>
            <Field label="Batch" htmlFor="batch">
              <input
                id="batch"
                className="rh-input"
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Skills" htmlFor="skills" hint="Separate each skill with a comma.">
                <input
                  id="skills"
                  className="rh-input"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rh-btn rh-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </button>
              <Notice tone="success">{message}</Notice>
              <Notice tone="error">{error}</Notice>
            </div>
          </form>
        </Panel>
        <div className="mt-6">
          <ResumeUpload userId={userId} onUploaded={resumeState.reload} />
        </div>
        </>
      ) : null}
    </Shell>
  );
}
