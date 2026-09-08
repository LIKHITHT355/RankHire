import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, StatCard, Panel } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getStudents } from "../services/students.js";
import { getJobs } from "../services/jobs.js";
import { getAnnouncements } from "../services/announcements.js";

export const Route = createFileRoute("/tpo/dashboard")({
  head: () => ({
    meta: [
      { title: "Placement overview — Rank Hire" },
      { name: "description", content: "Placement office overview of students, opportunities and notices." },
      { property: "og:title", content: "Placement overview — Rank Hire" },
      { property: "og:description", content: "Placement office overview for the current cycle." },
    ],
  }),
  component: TpoDashboard,
});

function TpoDashboard() {
  // This loads the three sets of records the overview counts:
  // students, open opportunities and published announcements.
  // Until the backend answers, the tiles show a dash instead of a number.
  const state = useApiData(async () => {
    const [students, jobs, announcements] = await Promise.all([
      getStudents(),
      getJobs({ status: "open" }),
      getAnnouncements(),
    ]);
    return { students, jobs, announcements };
  }, []);

  const students = state.data?.students || [];
  const eligible = students.filter((s) => s.eligible).length;

  return (
    <Shell role="tpo" breadcrumb="Dashboard">
      <PageHeader
        eyebrow="Current cycle"
        title="Placement overview"
        description="A summary of the record as it stands today. Figures appear once the backend is connected."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}
      {state.loading ? <Skeleton rows={2} /> : null}

      {/* These four tiles are the headline numbers of the cycle.
          Each one shows a dash whenever the real value is unknown. */}
      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students on record" value={state.data ? students.length : null} />
        <StatCard label="Eligible this cycle" value={state.data ? eligible : null} />
        <StatCard label="Open opportunities" value={state.data ? state.data.jobs.length : null} />
        <StatCard label="Announcements" value={state.data ? state.data.announcements.length : null} />
      </div>

      <div className="mt-6">
        <Panel title="How this page works" description="Nothing on this screen is estimated.">
          <p className="text-sm text-muted-foreground">
            Every count is read directly from your Express and MongoDB backend. If a request fails, the page
            says so and offers a retry rather than filling the gap with a made up figure.
          </p>
        </Panel>
      </div>
    </Shell>
  );
}
