import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Building2, ClipboardList, ArrowRight } from "lucide-react";

// This is the public landing page at the address "/".
// It introduces Rank Hire, explains what each of the three
// roles can do, and links to signing in or requesting access.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rank Hire — Merit, made visible" },
      {
        name: "description",
        content:
          "Rank Hire is a placement management system for engineering colleges. Merit ranking, opportunities, applications and announcements in one official record.",
      },
      { property: "og:title", content: "Rank Hire — Merit, made visible" },
      {
        property: "og:description",
        content:
          "Placement management for engineering colleges: merit ranking, opportunities and applications in one record.",
      },
    ],
  }),
  component: Landing,
});

// These three cards describe the roles. Keeping them in a list
// means the page stays short and the layout stays consistent.
const ROLES = [
  {
    icon: GraduationCap,
    title: "Students",
    body: "Keep your academic record, resume and applications in one place. See every opportunity you are eligible for, with the criteria stated plainly.",
    points: ["Semester marksheets with SGPA and CGPA", "Resume on record", "Application status"],
  },
  {
    icon: ClipboardList,
    title: "Placement Office",
    body: "Run merit queries across departments and batches, publish announcements, and hand verified shortlists to recruiters.",
    points: ["Rank by CGPA and eligibility", "Announcements", "Directory and CSV export"],
  },
  {
    icon: Building2,
    title: "Companies",
    body: "Post roles with clear eligibility, review verified applicants, and shortlist candidates against the college record.",
    points: ["Post roles", "Applicant tables", "Shortlisting"],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* This is the top navigation of the public site. */}
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-5">
          <Link to="/">
            <span className="font-display text-xl">Rank Hire</span>
            <span className="eyebrow mt-0.5 block">Merit • Placement</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2 sm:gap-4">
            <a href="#roles" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
              Roles
            </a>
            <a
              href="#principles"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Principles
            </a>
            <Link to="/login" className="rh-btn rh-btn-ghost">
              Sign in
            </Link>
            <Link to="/signup" className="rh-btn rh-btn-primary">
              Request access
            </Link>
          </nav>
        </div>
      </header>

      {/* This is the hero: the one line that states what the system is for. */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <p className="eyebrow">Training &amp; Placement Cell</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Merit, made visible.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Rank Hire is the placement record for an engineering college. Academic results, eligibility,
          opportunities and outcomes sit in one place, ordered by merit and open to the people they concern.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login" className="rh-btn rh-btn-primary">
            Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/signup" className="rh-btn rh-btn-ghost">
            Request access
          </Link>
        </div>
      </section>

      {/* This section explains the three roles side by side. */}
      <section id="roles" className="border-t border-rule bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">Three workspaces</p>
          <h2 className="mt-2 text-3xl">One record, read three ways</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ROLES.map((role) => (
              <article key={role.title} className="panel p-6">
                <role.icon className="h-6 w-6 text-merit" aria-hidden="true" />
                <h3 className="mt-4 text-xl">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.body}</p>
                <ul className="mt-4 space-y-2 border-t border-rule pt-4 text-sm text-muted-foreground">
                  {role.points.map((p) => (
                    <li key={p}>— {p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* This is the short statement of principles behind the system. */}
      <section id="principles" className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">Principles</p>
        <h2 className="mt-2 max-w-2xl text-3xl">
          A placement record should be accurate, legible and the same for everyone.
        </h2>
        <div className="mt-10 grid gap-8 border-t border-rule pt-8 sm:grid-cols-3">
          <div>
            <p className="numeral text-sm text-merit">01</p>
            <h3 className="mt-2 text-lg">Nothing invented</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every figure shown comes from the college record. Where a number is unknown, the page says so.
            </p>
          </div>
          <div>
            <p className="numeral text-sm text-merit">02</p>
            <h3 className="mt-2 text-lg">Criteria stated first</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Eligibility is printed next to every opportunity, before a student spends effort applying.
            </p>
          </div>
          <div>
            <p className="numeral text-sm text-merit">03</p>
            <h3 className="mt-2 text-lg">Order by merit</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ranking follows credit weighted results, calculated the same way for every candidate.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>Rank Hire — Placement Management System</p>
          <p>Training &amp; Placement Cell</p>
        </div>
      </footer>
    </div>
  );
}
