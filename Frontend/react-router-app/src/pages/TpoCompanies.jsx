import { Shell } from "../components/Shell.jsx";
import { PageHeader, TableShell, Badge } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getCompanies } from "../services/settings.js";


function TpoCompanies() {
  // This loads the list of recruiting companies from the backend.
  const state = useApiData(() => getCompanies(), []);

  return (
    <Shell role="tpo" breadcrumb="Companies">
      <PageHeader
        eyebrow="Recruiters"
        title="Companies"
        description="Organisations registered for this placement cycle and the roles they have open."
      />

      <DataState state={state} emptyMessage="No companies are registered yet." skeletonRows={5}>
        {(companies) => (
          <TableShell columns={["Company", "Industry", "Open roles", "Status"]}>
            {companies.map((c) => (
              <tr key={c.id || c._id || c.name} className="border-b border-rule/60 last:border-0">
                <td className="px-4 py-3">{c.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.industry || "—"}</td>
                <td className="numeral px-4 py-3">{c.openRoles ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.status === "active" ? "merit" : "neutral"}>{c.status || "—"}</Badge>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </DataState>
    </Shell>
  );
}

export default TpoCompanies;
