import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/ButtonLink";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

type AuthMode = "signin" | "signup";

export function AuthPage() {
  const location = useLocation();
  const { isConfigured, isLoading, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/app/dashboard";
  }, [location.state]);

  if (isConfigured && !isLoading && user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setMessage("Account created. If email confirmation is enabled, verify your inbox before signing in.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell" style={{ gridTemplateColumns: "1fr" }}>
      <section className="main-surface hero-panel">
        <div className="page">
          <Panel className="hero-panel">
            <div className="hero-grid">
              <div className="page">
                <SectionHeader
                  eyebrow="Secure access"
                  title="Sign in to your career operating system"
                  copy="Supabase auth is now wired into the app shell. Use your test user or create a new account below."
                />
                <div className="badge-row">
                  <button
                    className={`nav-link${mode === "signin" ? " active" : ""}`}
                    type="button"
                    onClick={() => setMode("signin")}
                  >
                    Sign in
                  </button>
                  <button
                    className={`nav-link${mode === "signup" ? " active" : ""}`}
                    type="button"
                    onClick={() => setMode("signup")}
                  >
                    Create account
                  </button>
                </div>
                <form className="form-stack" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="auth-email">Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      type="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {error ? (
                    <div className="empty-state">
                      <strong>Auth failed</strong>
                      <p className="muted-copy">{error}</p>
                    </div>
                  ) : null}
                  {message ? (
                    <div className="empty-state">
                      <strong>Check the next step</strong>
                      <p className="muted-copy">{message}</p>
                    </div>
                  ) : null}
                  <div className="action-row">
                    <Button type="submit" variant="primary" disabled={isSubmitting || isLoading}>
                      {isSubmitting
                        ? "Working…"
                        : mode === "signin"
                          ? "Sign in"
                          : "Create account"}
                    </Button>
                    <ButtonLink to="/" variant="ghost">
                      Back to overview
                      <ArrowRight size={16} />
                    </ButtonLink>
                  </div>
                </form>
              </div>
              <Panel>
                <SectionHeader
                  title="What happens after login"
                  copy="Authenticated users can now persist onboarding, generate readiness snapshots, and query live job matches from Supabase."
                />
                <div className="list-stack">
                  <div className="split-list-item">
                    <strong>Onboarding persists</strong>
                    <span>`career_goals` + `candidate_profiles`</span>
                  </div>
                  <div className="split-list-item">
                    <strong>Readiness updates</strong>
                    <span>`readiness_snapshots`</span>
                  </div>
                  <div className="split-list-item">
                    <strong>Jobs are scored live</strong>
                    <span>`get_job_discovery()` RPC</span>
                  </div>
                </div>
              </Panel>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

