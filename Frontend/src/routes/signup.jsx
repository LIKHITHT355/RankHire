import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Field, Notice } from "../components/Primitives.jsx";
import { NotConnected } from "../components/DataState.jsx";
import { isApiConfigured } from "../services/api.js";
import { signup } from "../services/auth.js";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Request access — Rank Hire" },
      {
        name: "description",
        content: "Request an account on Rank Hire, the college placement management system.",
      },
      { property: "og:title", content: "Request access — Rank Hire" },
      { property: "og:description", content: "Request an account on the Rank Hire placement record." },
    ],
  }),
  component: SignupPage,
});

const TYPES = [
  { value: "student", label: "Student" },
  { value: "tpo", label: "TPO Officer" },
  { value: "company", label: "Company" },
];

function SignupPage() {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  // This sends the access request to the backend.
  // The success message is only shown after the server has
  // actually accepted the request, never before.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult("");
    setLoading(true);
    try {
      const response = await signup({ role, name, email, password });
      setResult(
        (response && response.message) || "Request received. The placement office will review it.",
      );
    } catch (err) {
      setError(err.message || "Request failed.");
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
        <p className="eyebrow">Request access</p>
        <h1 className="mt-2 text-3xl">Join the record</h1>

        {!isApiConfigured() ? (
          <div className="mt-6">
            <NotConnected />
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* This lets the person pick the kind of account they need.
              The placement office approves each request afterwards. */}
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted-foreground">Account type</legend>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRole(t.value)}
                  aria-pressed={role === t.value}
                  className={`rh-btn ${role === t.value ? "rh-btn-primary" : "rh-btn-ghost"} px-2 text-xs sm:text-sm`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label="Full name or organisation" htmlFor="name">
            <input
              id="name"
              required
              className="rh-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              className="rh-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password" hint="At least eight characters.">
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="rh-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <button type="submit" className="rh-btn rh-btn-primary w-full" disabled={loading}>
            {loading ? "Sending request…" : "Request access"}
          </button>
          <Notice tone="error">{error}</Notice>
          <Notice tone="success">{result}</Notice>
        </form>

        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
