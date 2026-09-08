import { createFileRoute, Link } from "@tanstack/react-router";

// This page catches any web address that does not match a real page.
// Instead of an empty screen the visitor sees a clear notice and a
// link back to the start of the site.
export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — Rank Hire" },
      { name: "description", content: "This Rank Hire page does not exist." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page not found — Rank Hire" },
      { property: "og:description", content: "This Rank Hire page does not exist." },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Record not found</p>
        <h1 className="numeral mt-2 text-6xl">404</h1>
        <h2 className="mt-4 text-xl">This page is not on file</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="rh-btn rh-btn-primary mt-6">
          Return to Rank Hire
        </Link>
      </div>
    </div>
  );
}
