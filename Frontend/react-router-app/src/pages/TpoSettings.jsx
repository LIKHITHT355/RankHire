import { useEffect, useState } from "react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { isApiConfigured } from "../services/api.js";
import { getSettings, updateSettings } from "../services/settings.js";


function TpoSettings() {
  const state = useApiData(() => getSettings(), []);
  const [form, setForm] = useState({ cycle: "", minCgpa: "", maxBacklogs: "", applicationsPerStudent: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This copies the settings that arrived from the backend into
  // the form so the boxes show the values currently in force.
  // Nothing is remembered in the browser between visits.
  useEffect(() => {
    if (state.data) {
      setForm({
        cycle: state.data.cycle ?? "",
        minCgpa: state.data.minCgpa ?? "",
        maxBacklogs: state.data.maxBacklogs ?? "",
        applicationsPerStudent: state.data.applicationsPerStudent ?? "",
      });
    }
  }, [state.data]);

  // This saves the edited settings back to the backend and only
  // reports success once the server confirms the change.
  async function handleSave(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      await updateSettings(form);
      setMessage("Settings saved.");
      state.reload();
    } catch (err) {
      setError(err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell role="tpo" breadcrumb="Settings">
      <PageHeader
        eyebrow="Configuration"
        title="Placement settings"
        description="These rules are stored on the backend and apply to the whole cycle."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={4} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}

      {state.configured && !state.loading && !state.error ? (
        <Panel title="Cycle rules">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <Field label="Placement cycle" htmlFor="cycle">
              <input
                id="cycle"
                className="rh-input"
                value={form.cycle}
                onChange={(e) => setForm({ ...form, cycle: e.target.value })}
              />
            </Field>
            <Field label="Minimum CGPA" htmlFor="minCgpa">
              <input
                id="minCgpa"
                type="number"
                step="0.01"
                className="rh-input"
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
              />
            </Field>
            <Field label="Maximum backlogs allowed" htmlFor="maxBacklogs">
              <input
                id="maxBacklogs"
                type="number"
                className="rh-input"
                value={form.maxBacklogs}
                onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })}
              />
            </Field>
            <Field label="Applications per student" htmlFor="applicationsPerStudent">
              <input
                id="applicationsPerStudent"
                type="number"
                className="rh-input"
                value={form.applicationsPerStudent}
                onChange={(e) => setForm({ ...form, applicationsPerStudent: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <button type="submit" className="rh-btn rh-btn-primary" disabled={saving || !isApiConfigured()}>
                {saving ? "Saving…" : "Save settings"}
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

export default TpoSettings;
