import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, X, Circle } from "lucide-react";
import { isApiConfigured } from "../services/api.js";
import { logout } from "../services/auth.js";

// These lists describe the menu for each of the three roles.
// Keeping them in one place means the sidebar and the mobile
// drawer always show exactly the same links.
const NAV = {
  tpo: [
    { to: "/tpo/dashboard", label: "Dashboard" },
    { to: "/tpo/select-students", label: "Select students" },
    { to: "/tpo/announcements", label: "Announcements" },
    { to: "/tpo/students", label: "Student directory" },
    { to: "/tpo/companies", label: "Companies" },
    { to: "/tpo/settings", label: "Settings" },
  ],
  student: [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/profile", label: "Profile" },
    { to: "/student/resume", label: "Resume" },
    { to: "/student/marksheets", label: "Marksheets" },
    { to: "/student/calculate-sgpa", label: "Calculate SGPA" },
    { to: "/student/jobs", label: "Opportunities" },
    { to: "/student/applications", label: "Applications" },
    { to: "/student/announcements", label: "Announcements" },
  ],
  company: [
    { to: "/company/dashboard", label: "Dashboard" },
    { to: "/company/post-job", label: "Post a role" },
    { to: "/company/jobs", label: "My postings" },
  ],
};

const ROLE_LABEL = { tpo: "Placement Office", student: "Student", company: "Company" };

// This is the little dot in the top bar that tells the user
// whether the app currently has a backend address to talk to.
function ConnectionDot() {
  const connected = isApiConfigured();
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
      <Circle
        className={`h-2 w-2 ${connected ? "fill-success text-success" : "fill-merit text-merit"}`}
        aria-hidden="true"
      />
      {connected ? "API connected" : "API pending"}
    </span>
  );
}

// This is the frame that wraps every signed in page.
// On wide screens it shows a fixed sidebar, and on phones it
// shows a top bar with a drawer that slides open. The page
// content itself is passed in as children.
export function Shell({ role, breadcrumb, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const items = NAV[role] || [];

  // This ends the session by asking the backend to sign the
  // user out. Even if the backend is unreachable, the person
  // is returned to the sign in page so they are not stuck.
  async function handleSignOut() {
    try {
      await logout();
    } catch {
      // Nothing to clean up locally, the session lives in a cookie.
    }
    navigate({ to: "/login" });
  }

  // This draws the list of links. It is used twice, once in the
  // desktop sidebar and once inside the mobile drawer.
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{ className: "bg-accent text-foreground font-medium" }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-rule bg-card px-4 py-6 lg:flex">
        <Link to="/" className="px-3">
          <span className="font-display text-xl">Rank Hire</span>
          <span className="eyebrow mt-1 block">Merit • Placement</span>
        </Link>
        <div className="mt-8">{nav}</div>
        <div className="mt-auto px-3">
          <p className="eyebrow">Workspace</p>
          <p className="mt-1 text-sm">{ROLE_LABEL[role]}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-rule bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
          <button
            type="button"
            className="rh-btn rh-btn-ghost px-2 py-2 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABEL[role]}
            {breadcrumb ? <span className="text-foreground"> / {breadcrumb}</span> : null}
          </p>
          <div className="ml-auto flex items-center gap-3">
            <ConnectionDot />
            <button type="button" className="rh-btn rh-btn-ghost px-2 py-2" aria-label="Notifications">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground sm:flex">
              {ROLE_LABEL[role].slice(0, 1)}
            </span>
            <button type="button" className="rh-btn rh-btn-ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>

      {/* This is the slide out menu for phones. It only exists
          while it is open, and closes when a link is chosen. */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-primary/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-card px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between px-3">
              <span className="font-display text-lg">Rank Hire</span>
              <button
                type="button"
                className="rh-btn rh-btn-ghost px-2 py-2"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6">{nav}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
