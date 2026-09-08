import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { NotConnected } from "../components/DataState.jsx";
import { isApiConfigured } from "../services/api.js";
import { createJob } from "../services/jobs.js";

export const Route = createFileRoute("/company/post-job")({
  head: () => ({
    meta: [
      { title: "Post a role — Rank Hire" },
      { name: "description", content: "Publish a role with clear eligibility to the college placement record." },
      { property: "og:title", content: "Post a role — Rank Hire" },
      { property: "og:description", content: "Publish a role to eligible students." },
    ],
  }),
  component: PostJob,
});

const EMPTY = {
  title: "",
  description: "",
  location: "",
  type: "Full time",
  skills: "",
  eligibility: "",
  minCgpa: "",
  deadline: "",
};

function PostJob() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This publishes the role through the backend.
  // The skills line is split into a list first. The form is only
  // cleared once the server has confirmed the posting was saved.
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      await createJob({
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setForm(EMPTY);
      setMessage("Role published to the placement record.");
    } catch (err) {
      setError(err.message || "Could not publish the role.");
    } finally {
      setSaving(false);
    }
  }

  // This keeps the form fields in step with what is typed.
  function set(key) {
    return (event) => setForm({ ...form, [key]: event.target.value });
  }

  return (
    <Shell role="company" breadcrumb="Post a role">
      <PageHeader
        eyebrow="New posting"
        title="Post a role"
        description="State the eligibility clearly; students see it before they apply."
      />

      {!isApiConfigured() ? (
        <div className="mb-6">
          <NotConnected />
        </div>
      ) : null}

      <Panel title="Role details">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Job title" htmlFor="title">
            <input id="title" required className="rh-input" value={form.title} onChange={set("title")} />
          </Field>
          <Field label="Location" htmlFor="location">
            <input id="location" className="rh-input" value={form.location} onChange={set("location")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description" htmlFor="description">
              <textarea
                id="description"
                rows={5}
                required
                className="rh-input"
                value={form.description}
                onChange={set("description")}
              />
            </Field>
          </div>
          <Field label="Employment type" htmlFor="type">
            <select id="type" className="rh-input" value={form.type} onChange={set("type")}>
              <option>Full time</option>
              <option>Internship</option>
              <option>Internship + Full time</option>
              <option>Contract</option>
            </select>
          </Field>
          <Field label="Minimum CGPA" htmlFor="minCgpa">
            <input
              id="minCgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="rh-input"
              value={form.minCgpa}
              onChange={set("minCgpa")}
            />
          </Field>
          <Field label="Skills" htmlFor="skills" hint="Separate each skill with a comma.">
            <input id="skills" className="rh-input" value={form.skills} onChange={set("skills")} />
          </Field>
          <Field label="Application deadline" htmlFor="deadline">
            <input
              id="deadline"
              type="date"
              className="rh-input"
              value={form.deadline}
              onChange={set("deadline")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Other eligibility" htmlFor="eligibility" hint="Departments, batches, backlog limits.">
              <input
                id="eligibility"
                className="rh-input"
                value={form.eligibility}
                onChange={set("eligibility")}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rh-btn rh-btn-primary" disabled={saving}>
              {saving ? "Publishing…" : "Publish role"}
            </button>
            <Notice tone="success">{message}</Notice>
            <Notice tone="error">{error}</Notice>
          </div>
        </form>
      </Panel>
    </Shell>
  );
}
