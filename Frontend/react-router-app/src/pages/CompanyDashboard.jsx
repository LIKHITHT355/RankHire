import { Shell } from "../components/Shell.jsx";
import { PageHeader, StatCard, Panel } from "../components/Primitives.jsx";
import { NotConnected, Skeleton, ErrorCard } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getJobs } from "../services/jobs.js";


function CompanyDashboard() {
  // This loads only the jobs posted by the signed in company.
  // The counts below are added up from those real postings.
  const state = useApiData(() => getJobs({ mine: true }), []);
  const jobs = state.data || [];
  const active = jobs.filter((j) => j.status === "open").length;
  const applications = jobs.reduce((sum, j) => sum + (Number(j.applicantCount) || 0), 0);
  const shortlisted = jobs.reduce((sum, j) => sum + (Number(j.shortlistedCount) || 0), 0);

  return (
    <Shell role="company" breadcrumb="Dashboard">
      <PageHeader
        eyebrow="Hiring"
        title="Recruiter overview"
        description="A summary of your postings on the college placement record."
      />

      {!state.configured ? <NotConnected /> : null}
      {state.configured && state.loading ? <Skeleton rows={2} /> : null}
      {state.configured && state.error ? <ErrorCard message={state.error} onRetry={state.reload} /> : null}

      {/* These tiles count your roles and the interest they attracted. */}
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active roles" value={state.data ? active : null} />
        <StatCard label="Applications received" value={state.data ? applications : null} />
        <StatCard label="Shortlisted" value={state.data ? shortlisted : null} />
      </div>

      <div className="mt-6">
        <Panel title="Working with the placement cell">
          <p className="text-sm text-muted-foreground">
            Applicants shown to you are verified against the college academic record, so CGPA and backlog
            figures come from the institution rather than from the candidate.
          </p>
        </Panel>
      </div>
    </Shell>
  );
}

export default CompanyDashboard;
