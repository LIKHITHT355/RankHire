import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, StatCard, Panel } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useCachedApiData } from "../hooks/useCachedApiData.js";
import { studentQueryKeys } from "../lib/queryKeys.js";
import { getMyProfile } from "../services/students.js";
import { getJobs, getApplications } from "../services/jobs.js";
import { getAnnouncements } from "../services/announcements.js";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "My readiness — Rank Hire" },
      {
        name: "description",
        content: "Your placement readiness: profile, resume, jobs and applications.",
      },
      { property: "og:title", content: "My readiness — Rank Hire" },
      { property: "og:description", content: "Your placement readiness at a glance." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  // This loads the records used in the readiness summary in one go.
  const state = useCachedApiData(
    studentQueryKeys.dashboard,
    async () => {
      const [profile, jobs, applications, announcements] = await Promise.all([
        getMyProfile(),
        getJobs({ status: "open" }),
        getApplications(),
        getAnnouncements(),
      ]);
      return { profile, jobs, applications, announcements };
    },
    [],
  );

  const d = state.data;

  return (
    <Shell role="student" breadcrumb="Dashboard">
      <PageHeader
        eyebrow="Placement readiness"
        title={d?.profile?.name ? `Good to see you, ${d.profile.name}` : "My readiness"}
        description="A clear view of your academic record and placement activity."
        actions={
          <Link to="/student/jobs" className="rh-btn rh-btn-primary dashboard-action">
            Explore opportunities
          </Link>
        }
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={2} /> : null}
      {state.configured && state.error ? (
        <ErrorCard message={state.error} onRetry={state.reload} />
      ) : null}

      {/* These tiles summarise how ready the student is to apply. */}
      <div className="dashboard-stats mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile completion"
          value={d?.profile?.completion !== undefined ? `${d.profile.completion}%` : null}
        />
        <StatCard label="Open opportunities" value={d ? d.jobs.length : null} />
        <StatCard label="Applications sent" value={d ? d.applications.length : null} />
        <StatCard label="New announcements" value={d ? d.announcements.length : null} />
      </div>

      {d ? (
        <div className="mt-6 grid gap-6">
          {/* This panel repeats the academic figures held on record. */}
          <Panel
            title="Academic summary"
            description="Your latest academic record on file."
            actions={
              <Link to="/student/profile" className="dashboard-text-link">
                View profile
              </Link>
            }
          >
            <dl className="dashboard-academic grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="eyebrow">Department</dt>
                <dd className="mt-1">{d.profile?.department || "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Batch</dt>
                <dd className="numeral mt-1">{d.profile?.batch || "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">CGPA</dt>
                <dd className="numeral mt-1 text-2xl">{d.profile?.cgpa ?? "—"}</dd>
              </div>
              <div>
                <dt className="eyebrow">Backlogs</dt>
                <dd className="numeral mt-1 text-2xl">{d.profile?.backlogs ?? "—"}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}
