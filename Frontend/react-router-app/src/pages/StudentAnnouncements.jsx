import { Shell } from "../components/Shell.jsx";
import { PageHeader } from "../components/Primitives.jsx";
import { DataState } from "../components/DataState.jsx";
import { useApiData } from "../hooks/useApiData.js";
import { getAnnouncements } from "../services/announcements.js";


function StudentAnnouncements() {
  // This loads the notice board. Students can only read it,
  // so there are no buttons to change anything here.
  const state = useApiData(() => getAnnouncements(), []);

  return (
    <Shell role="student" breadcrumb="Announcements">
      <PageHeader
        eyebrow="Notice board"
        title="Announcements"
        description="Published by the training and placement cell."
      />

      <DataState state={state} emptyMessage="There are no announcements yet." skeletonRows={3}>
        {(items) => (
          <ul className="space-y-4">
            {items.map((a) => (
              <li key={a.id || a._id} className="panel p-5">
                <h2 className="text-lg">{a.title}</h2>
                {a.createdAt ? (
                  <p className="numeral mt-1 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-muted-foreground">{a.message}</p>
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </Shell>
  );
}

export default StudentAnnouncements;
