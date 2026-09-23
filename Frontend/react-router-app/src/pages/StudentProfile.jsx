import { useEffect, useState } from "react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getMyProfile, updateProfile } from "../services/students.js";


function StudentProfile() {
  const state = useApiData(() => getMyProfile(), []);
  const [form, setForm] = useState({
    name: "",
    phone: "",
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
      setForm({
        name: state.data.name ?? "",
        phone: state.data.phone ?? "",
        department: state.data.department ?? "",
        batch: state.data.batch ?? "",
        skills: Array.isArray(state.data.skills) ? state.data.skills.join(", ") : (state.data.skills ?? ""),
      });
    }
  }, [state.data]);

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
      ) : null}
    </Shell>
  );
}

export default StudentProfile;
