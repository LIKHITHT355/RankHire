import { Shell } from "../components/Shell.jsx";
import { PageHeader, StatCard, Panel } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getMyProfile, getResume } from "../services/students.js";
import { getJobs, getApplications } from "../services/jobs.js";
import { getAnnouncements } from "../services/announcements.js";


function StudentDashboard() {
  // This loads everything the readiness summary needs in one go:
  // the profile, the resume status, open jobs, the applications
  // already sent, and the latest notices.
  const state = useApiData(async () => {
    const [profile, resume, jobs, applications, announcements] = await Promise.all([
      getMyProfile(),
      getResume(),
      getJobs({ status: "open" }),
      getApplications(),
      getAnnouncements(),
    ]);
    return { profile, resume, jobs, applications, announcements };
  }, []);

  const d = state.data;

  return (
    <Shell role="student" breadcrumb="Dashboard">
      <PageHeader
        eyebrow="Placement readiness"
        title={d?.profile?.name ? `Good to see you, ${d.profile.name}` : "My readiness"}
        description="Everything here is read from the college record. Missing figures show as a dash."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={2} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}

      {/* These tiles summarise how ready the student is to apply. */}
      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile completion"
          value={d?.profile?.completion !== undefined ? `${d.profile.completion}%` : null}
        />
        <StatCard label="Open opportunities" value={d ? d.jobs.length : null} />
        <StatCard label="Applications sent" value={d ? d.applications.length : null} />
        <StatCard label="New announcements" value={d ? d.announcements.length : null} />
      </div>

      {d ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* This panel repeats the academic figures held on record. */}
          <Panel title="Academic summary">
            <dl className="grid grid-cols-2 gap-4 text-sm">
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

          {/* This panel shows whether a resume is already on file. */}
          <Panel title="Resume">
            <p className="text-sm text-muted-foreground">
              {d.resume?.filename
                ? `On record: ${d.resume.filename}`
                : "No resume has been added to your record yet."}
            </p>
            {d.resume?.updatedAt ? (
              <p className="numeral mt-2 text-xs text-muted-foreground">
                Updated {new Date(d.resume.updatedAt).toLocaleDateString()}
              </p>
            ) : null}
          </Panel>
        </div>
      ) : null}
    </Shell>
  );
}

export default StudentDashboard;
