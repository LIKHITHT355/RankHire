import { useState } from "react";
import { Field, Notice, Panel } from "./Primitives.jsx";
import { uploadResumeForExtraction } from "../services/students.js";

// This is separate from the existing legacy resume uploader. It sends a file
// only for immediate local extraction; the server deletes the temporary file.
export function ResumeUpload({ userId, onUploaded, title = "Upload resume" }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputId = `resume-${title.replace(/\s+/g, "-").toLowerCase()}`;

  async function handleUpload(event) {
    event.preventDefault();
    if (!file || !userId) return;
    setMessage("");
    setError("");
    setUploading(true);
    try {
      const result = await uploadResumeForExtraction(file, userId);
      setMessage("Resume extracted and saved.");
      setFile(null);
      event.target.reset();
      onUploaded?.(result);
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : (err.message?.message || "The resume could not be extracted."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Panel title={title} description="PDF and DOCX files are parsed locally and removed immediately after extraction.">
      <form onSubmit={handleUpload} className="space-y-4">
        <Field label="Resume file" htmlFor={inputId} hint="PDF or DOCX, up to 5 MB.">
          <input id={inputId} type="file" accept=".pdf,.docx" className="rh-input" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </Field>
        <button type="submit" className="rh-btn rh-btn-primary" disabled={!file || !userId || uploading}>
          {uploading ? "Extracting…" : "Upload and extract"}
        </button>
        <Notice tone="success">{message}</Notice>
        <Notice tone="error">{error}</Notice>
      </form>
    </Panel>
  );
}
