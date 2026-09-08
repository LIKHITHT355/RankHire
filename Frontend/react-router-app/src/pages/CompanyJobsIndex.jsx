import { Link } from "react-router-dom";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, TableShell, Badge } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getJobs } from "../services/jobs.js";


function CompanyJobs() {
  // This loads only the postings that belong to this company.
  const state = useApiData(() => getJobs({ mine: true }), []);

  return (
    <Shell role="company" breadcrumb="My postings">
      <PageHeader
        eyebrow="Postings"
        title="My roles"
        description="Open a role to review the students who applied to it."
      />

      <DataState state={state} emptyMessage="You have not posted any roles yet." skeletonRows={5}>
        {(jobs) => (
          <TableShell columns={["Role", "Location", "Deadline", "Status", "Applicants", ""]}>
            {jobs.map((job) => {
              const id = job.id || job._id;
              return (
                <tr key={id} className="border-b border-rule/60 last:border-0">
                  <td className="px-4 py-3">{job.title || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.location || "—"}</td>
                  <td className="numeral px-4 py-3">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={job.status === "open" ? "merit" : "neutral"}>{job.status || "—"}</Badge>
                  </td>
                  <td className="numeral px-4 py-3">{job.applicantCount ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/company/jobs/${String(id)}/applicants`}
                      className="text-sm underline underline-offset-4"
                    >
                      View applicants
                    </Link>
                  </td>
                </tr>
              );
            })}
          </TableShell>
        )}
      </DataState>
    </Shell>
  );
}

export default CompanyJobs;
