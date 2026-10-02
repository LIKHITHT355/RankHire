import { useEffect, useState } from "react";
import { Forward, LoaderCircle, Mail, RefreshCw } from "lucide-react";
import { Notice, Panel } from "./Primitives.jsx";
import { getMailEmail, getMailInbox, forwardMailEmail } from "../services/mail.js";
import { isApiConfigured } from "../services/api.js";

function formatSender(from) {
  return from?.name || from?.address || "Unknown sender";
}

export function MailInbox({ onForwarded }) {
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadInbox() {
    setLoading(true);
    setError("");
    try {
      const items = await getMailInbox();
      setEmails(items.map((item) => ({ ...item, isForwarded: item.forwarded })));
      if (selected && !items.some((item) => item.uid === selected.uid)) {
        setSelected(null);
        setPreview(null);
      }
    } catch (err) {
      setError(err.message || "Could not load mail inbox.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadInbox(); }, []);

  // Keep confirmation feedback out of the document flow, so it does not move
  // either the inbox list or fixed-size preview panel.
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function selectEmail(email) {
    setSelected(email);
    setPreview(null);
    setNotice("");
    setError("");
    setPreviewLoading(true);
    try {
      setPreview(await getMailEmail(email.uid));
    } catch (err) {
      setError(err.message || "Could not load this email.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function forwardEmail() {
    if (!selected) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      await forwardMailEmail(selected.uid);
      setEmails((items) => items.map((item) => item.uid === selected.uid ? { ...item, isForwarded: true } : item));
      setSelected((item) => ({ ...item, isForwarded: true }));
      setNotice("Email forwarded as an announcement.");
      onForwarded?.();
    } catch (err) {
      if (err.status === 409) {
        setEmails((items) => items.map((item) => item.uid === selected.uid ? { ...item, isForwarded: true } : item));
        setSelected((item) => ({ ...item, isForwarded: true }));
      }
      setError(err.message || "Could not forward email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Panel title="Mail inbox">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Read recent placement-cell emails and publish their plain-text content as notices.</p>
        <button type="button" className="rh-btn shrink-0" onClick={loadInbox} disabled={loading || !isApiConfigured()}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
        </button>
      </div>
      <Notice tone="error">{error}</Notice>
      {notice ? <div className="fixed right-4 top-4 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm text-white shadow-lg" role="status">{notice}</div> : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[28rem] overflow-y-auto rounded-md border border-border">
          {loading ? <p className="p-4 text-sm text-muted-foreground">Loading inbox…</p> : null}
          {!loading && !error && emails.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No emails found in this inbox.</p> : null}
          {!loading && emails.map((email) => (
            <button key={email.uid} type="button" onClick={() => selectEmail(email)} className={`block w-full border-b border-border p-4 text-left last:border-b-0 ${selected?.uid === email.uid ? "bg-muted" : "hover:bg-muted/50"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{email.subject || "(No subject)"}</span>
                {email.isForwarded ? <span className="rounded bg-muted px-2 py-0.5 text-xs">Forwarded</span> : null}
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{formatSender(email.from)}</p>
              {email.date ? <p className="numeral mt-1 text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</p> : null}
            </button>
          ))}
        </div>
        <div className="flex h-[28rem] min-h-0 flex-col overflow-hidden rounded-md border border-border p-4">
          {!selected && !previewLoading ? <div className="m-auto text-center text-sm text-muted-foreground"><Mail className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />Select an email from the inbox to preview and forward.</div> : null}
          {previewLoading ? <p className="m-auto text-sm text-muted-foreground">Loading email…</p> : null}
          {preview ? <>
            <h3 className="text-lg">{preview.subject || "(No subject)"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{formatSender(preview.from)}</p>
            {preview.date ? <p className="numeral mt-1 text-xs text-muted-foreground">{new Date(preview.date).toLocaleString()}</p> : null}
            <p className="mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words text-sm text-muted-foreground">{preview.text}</p>
            <div className="mt-5 flex justify-end max-lg:w-full">
              {selected?.isForwarded ? (
                <button type="button" className="rh-btn max-lg:w-full" disabled title="This email has already been forwarded as an announcement.">
                  <Forward className="h-4 w-4" aria-hidden="true" />Forward as announcement
                </button>
              ) : (
                <button type="button" className="rh-btn rh-btn-primary max-lg:w-full" onClick={forwardEmail} disabled={sending}>
                  {sending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Forward className="h-4 w-4" aria-hidden="true" />}{sending ? "Forwarding…" : "Forward as announcement"}
                </button>
              )}
            </div>
          </> : null}
        </div>
      </div>
    </Panel>
  );
}
