import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Field, Notice } from "../components/Primitives.jsx";
import { NotConnected } from "../components/DataState.jsx";
import { isApiConfigured } from "../services/api.js";
import { login } from "../services/auth.js";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Rank Hire" },
      { name: "description", content: "Sign in to the Rank Hire placement management system." },
      { property: "og:title", content: "Sign in — Rank Hire" },
      { property: "og:description", content: "Sign in to the Rank Hire placement record." },
    ],
  }),
  component: LoginPage,
});

const ROLES = [
  { value: "student", label: "Student", home: "/student/dashboard" },
  { value: "tpo", label: "TPO Officer", home: "/tpo/dashboard" },
  { value: "company", label: "Company", home: "/company/dashboard" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // This runs when the sign in button is pressed.
  // It sends the details to the backend and waits for the answer.
  // Only a real success from the backend moves the person onward,
  // otherwise the reason for the failure is shown on the form.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ role, email, password });
      const target = ROLES.find((r) => r.value === role);
      navigate({ to: target.home });
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-rule px-6 py-5">
        <Link to="/">
          <span className="font-display text-xl">Rank Hire</span>
          <span className="eyebrow mt-0.5 block">Merit • Placement</span>
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
        <p className="eyebrow">Sign in</p>
        <h1 className="mt-2 text-3xl">Access your record</h1>

        {!isApiConfigured() ? (
          <div className="mt-6">
            <NotConnected />
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* This row lets the person say which kind of account they use.
              The choice is sent to the backend along with the password. */}
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted-foreground">I am signing in as</legend>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  aria-pressed={role === r.value}
                  className={`rh-btn ${role === r.value ? "rh-btn-primary" : "rh-btn-ghost"} px-2 text-xs sm:text-sm`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Institutional email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              className="rh-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              required
              className="rh-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <button type="submit" className="rh-btn rh-btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <Notice tone="error">{error}</Notice>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          No account yet?{" "}
          <Link to="/signup" className="text-foreground underline underline-offset-4">
            Request access
          </Link>
        </p>
      </main>
    </div>
  );
}
