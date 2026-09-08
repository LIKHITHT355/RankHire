import { AlertTriangle, Inbox, PlugZap, RotateCw } from "lucide-react";
import { API_NOT_CONFIGURED_MESSAGE } from "../services/api.js";

// This shows grey placeholder bars while data is being fetched.
// It keeps the page from jumping around and tells the user
// that something is on the way.
export function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

// This notice appears when no backend address has been set.
// It explains exactly what is missing instead of leaving the
// page blank or showing pretend information.
export function NotConnected() {
  return (
    <div className="panel flex items-start gap-3 p-5">
      <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-merit" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Backend not connected</p>
        <p className="mt-1 text-sm text-muted-foreground">{API_NOT_CONFIGURED_MESSAGE}</p>
      </div>
    </div>
  );
}

// This card appears when a request failed.
// It shows the reason and offers a button to try the request
// again, so a temporary problem does not block the user.
export function ErrorCard({ message, onRetry }) {
  return (
    <div className="panel p-5" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-destructive">Could not load this</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <button type="button" className="rh-btn rh-btn-ghost mt-4" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden="true" /> Retry
        </button>
      ) : null}
    </div>
  );
}

// This is shown when the request worked but there is nothing
// on record yet. It confirms the page is fine and simply empty.
export function EmptyState({ message = "No records on file yet." }) {
  return (
    <div className="panel flex items-center gap-3 p-5 text-sm text-muted-foreground">
      <Inbox className="h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

// This wrapper decides which of the states to show for a screen:
// not connected, loading, error with retry, empty, or the real
// content. Every data screen uses it so behaviour stays the same.
export function DataState({ state, emptyMessage, isEmpty, children, skeletonRows }) {
  const { configured, loading, error, reload, data } = state;
  if (!configured) return <NotConnected />;
  if (loading) return <Skeleton rows={skeletonRows} />;
  if (error) return <ErrorCard message={error} onRetry={reload} />;
  const empty = isEmpty ? isEmpty(data) : !data || (Array.isArray(data) && data.length === 0);
  if (empty) return <EmptyState message={emptyMessage} />;
  return children(data);
}
