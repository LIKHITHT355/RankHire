// This file holds the small building blocks used all over the app:
// page titles, stat cards, panels, form fields and table shells.
// Keeping them here means every screen looks consistent.

// This shows the heading area at the top of a workspace page.
// It has a small label, the page title, and an optional line
// of explanation, plus room for buttons on the right.
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

// This is one small statistics tile, for example "students on record".
// When the number is not known it shows a dash rather than a guess.
export function StatCard({ label, value, hint }) {
  return (
    <div className="panel p-5">
      <p className="eyebrow">{label}</p>
      <p className="numeral mt-3 text-3xl text-foreground">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// This is a plain content panel with an optional title,
// used to group related information on a page.
export function Panel({ title, description, actions, children }) {
  return (
    <section className="panel p-5 sm:p-6">
      {title ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

// This pairs a label with a form control and links them together,
// which also helps people using a screen reader.
export function Field({ label, htmlFor, hint, children }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

// This wraps a table so it can scroll sideways on small screens
// instead of breaking the layout of the page.
export function TableShell({ columns, children }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            {columns.map((c) => (
              <th key={c} className="eyebrow px-4 py-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// This is a small coloured word used for statuses such as
// "open", "shortlisted" or "closed".
export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground",
    merit: "bg-merit/25 text-merit-foreground",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// This shows a short message after an action, such as saving.
// It disappears when the next action happens, so it never
// pretends something succeeded that did not.
export function Notice({ tone = "info", children }) {
  if (!children) return null;
  const tones = {
    info: "text-muted-foreground",
    success: "text-success",
    error: "text-destructive",
  };
  return (
    <p className={`mt-3 text-sm ${tones[tone]}`} role="status">
      {children}
    </p>
  );
}
