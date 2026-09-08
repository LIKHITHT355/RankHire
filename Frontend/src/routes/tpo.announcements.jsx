import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, Panel, Field, Notice } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { isApiConfigured } from "../services/api.js";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../services/announcements.js";

export const Route = createFileRoute("/tpo/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Rank Hire" },
      { name: "description", content: "Publish and manage placement announcements for students." },
      { property: "og:title", content: "Announcements — Rank Hire" },
      { property: "og:description", content: "Publish placement notices to the student body." },
    ],
  }),
  component: TpoAnnouncements,
});

function TpoAnnouncements() {
  const state = useApiData(() => getAnnouncements(), []);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // This publishes a new notice through the backend and then
  // reloads the list, so what is on screen matches what is stored.
  async function handlePublish(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await createAnnouncement({ title, body });
      setTitle("");
      setBody("");
      setMessage("Announcement published.");
      state.reload();
    } catch (err) {
      setError(err.message || "Could not publish.");
    } finally {
      setSaving(false);
    }
  }

  // This deletes a notice, but only after the person confirms.
  // Deleting cannot be undone, so the confirmation matters.
  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setError("");
    setMessage("");
    try {
      await deleteAnnouncement(id);
      setMessage("Announcement deleted.");
      state.reload();
    } catch (err) {
      setError(err.message || "Could not delete.");
    }
  }

  return (
    <Shell role="tpo" breadcrumb="Announcements">
      <PageHeader
        eyebrow="Notices"
        title="Announcements"
        description="Notices published here are visible to every student workspace."
      />

      <Panel title="New announcement">
        <form className="space-y-4" onSubmit={handlePublish}>
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              required
              className="rh-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Body" htmlFor="body">
            <textarea
              id="body"
              required
              rows={4}
              className="rh-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <button type="submit" className="rh-btn rh-btn-primary" disabled={saving || !isApiConfigured()}>
            {saving ? "Publishing…" : "Publish"}
          </button>
          <Notice tone="success">{message}</Notice>
          <Notice tone="error">{error}</Notice>
        </form>
      </Panel>

      <div className="mt-6">
        {/* This is the list of notices already on record. */}
        <DataState state={state} emptyMessage="No announcements published yet." skeletonRows={3}>
          {(items) => (
            <ul className="space-y-4">
              {items.map((a) => (
                <li key={a.id || a._id} className="panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg">{a.title}</h3>
                      {a.createdAt ? (
                        <p className="numeral mt-1 text-xs text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      ) : null}
                      <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
                    </div>
                    <button
                      type="button"
                      className="rh-btn rh-btn-danger shrink-0"
                      onClick={() => handleDelete(a.id || a._id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DataState>
      </div>
    </Shell>
  );
}
