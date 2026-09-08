import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/Shell.jsx";
import { PageHeader, TableShell, Badge } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getApplications } from "../services/jobs.js";

export const Route = createFileRoute("/student/applications")({
  head: () => ({
    meta: [
      { title: "My applications — Rank Hire" },
      { name: "description", content: "Track the status of every placement application you have sent." },
      { property: "og:title", content: "My applications — Rank Hire" },
      { property: "og:description", content: "Where each of your applications stands." },
    ],
  }),
  component: StudentApplications,
});

function StudentApplications() {
  // This loads the applications the signed in student has sent.
  const state = useApiData(() => getApplications(), []);

  return (
    <Shell role="student" breadcrumb="Applications">
      <PageHeader
        eyebrow="Progress"
        title="My applications"
        description="Statuses are set by the recruiting company and update as they review."
      />

      <DataState state={state} emptyMessage="You have not applied to anything yet." skeletonRows={5}>
        {(applications) => (
          <TableShell columns={["Role", "Company", "Applied on", "Status"]}>
            {applications.map((a) => (
              <tr key={a.id || a._id} className="border-b border-rule/60 last:border-0">
                <td className="px-4 py-3">{a.jobTitle || a.title || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.company || "—"}</td>
                <td className="numeral px-4 py-3">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={a.status === "shortlisted" ? "merit" : a.status === "rejected" ? "danger" : "neutral"}>
                    {a.status || "submitted"}
                  </Badge>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </DataState>
    </Shell>
  );
}
