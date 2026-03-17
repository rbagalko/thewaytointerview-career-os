import { ArrowRight, Gauge, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ButtonLink } from "@/components/ButtonLink";
import { Panel } from "@/components/Panel";

export function LandingPage() {
  return (
    <main className="app-shell" style={{ gridTemplateColumns: "1fr" }}>
      <section className="main-surface hero-panel">
        <div className="page">
          <Panel className="hero-panel">
            <div className="hero-grid">
              <div className="page">
                <Badge tone="gold">March 19 launch scaffold</Badge>
                <h1 className="page-title">
                  TheWayToInterview becomes your AI career operating system.
                </h1>
                <p className="section-copy">
                  Guide candidates from skill gap to learning, proof of work, resume, job targeting,
                  daily prep, and applications with one clear answer to what they should do next.
                </p>
                <div className="action-row">
                  <ButtonLink to="/app/dashboard" variant="primary">
                    Open app shell
                    <ArrowRight size={16} />
                  </ButtonLink>
                  <ButtonLink to="/app/onboarding" variant="secondary">
                    Run onboarding
                  </ButtonLink>
                </div>
              </div>
              <Panel>
                <div className="list-stack">
                  <div className="split-list-item">
                    <div>
                      <strong>Readiness engine</strong>
                      <span>Track skill coverage, proof of work, resume fit, and prep consistency.</span>
                    </div>
                    <Gauge />
                  </div>
                  <div className="split-list-item">
                    <div>
                      <strong>Jobs with action paths</strong>
                      <span>Show realistic roles with readiness scores and the next steps to get there.</span>
                    </div>
                    <Target />
                  </div>
                  <div className="split-list-item">
                    <div>
                      <strong>Daily career training</strong>
                      <span>Turn skill gaps into concrete tasks, proof-of-work labs, and CRM follow-ups.</span>
                    </div>
                    <Sparkles />
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
