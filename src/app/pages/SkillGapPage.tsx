import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useDashboardQuery } from "@/lib/api/queries";

export function SkillGapPage() {
  const { data, error, isPending } = useDashboardQuery();

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading skill gap engine…</strong>
            <p className="muted-copy">Pulling your latest readiness breakdown and gap priorities.</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Skill gap view unavailable</strong>
            <p className="muted-copy">{error?.message ?? "Unable to load your top gaps."}</p>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Skill gap engine"
          title="See the exact gaps slowing down your next offer"
          copy="This view turns readiness data into a ranked list of what to fix first instead of leaving the user with generic advice."
          action={
            <ButtonLink to="/app/prep" variant="accent">
              Open prep roadmap
              <ArrowRight size={16} />
            </ButtonLink>
          }
        />
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Top priority gaps"
            copy="These are the areas that most directly affect role fit, confidence in interviews, and readiness score movement."
          />
          {data.readiness.topGaps.length ? (
            <div className="list-stack">
              {data.readiness.topGaps.map((gap, index) => (
                <div className="split-list-item" key={gap}>
                  <div>
                    <strong>{gap}</strong>
                    <span>
                      {index === 0
                        ? "Highest urgency for your next role target."
                        : index === 1
                          ? "Needs clearer proof and interview examples."
                          : "Worth closing to improve match quality and confidence."}
                    </span>
                  </div>
                  <span>{index === 0 ? "P1" : index === 1 ? "P2" : "P3"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No gaps detected yet</strong>
              <p className="muted-copy">Complete onboarding and JD analysis to rank your next biggest skill gaps.</p>
            </div>
          )}
        </Panel>

        <Panel>
          <SectionHeader
            title="Readiness breakdown"
            copy="This shows which systems are pulling your overall readiness score down the most."
          />
          <div className="list-stack">
            {data.readiness.breakdown.map((item) => (
              <div className="split-list-item" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>
                    {item.score >= 70
                      ? "Strong enough for current job targeting."
                      : item.score >= 40
                        ? "Needs deliberate improvement."
                        : "Major opportunity to strengthen."}
                  </span>
                </div>
                <span>{Math.round(item.score)}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          title="Recommended next actions"
          copy="Use these resources to turn the top gap list into forward motion this week."
        />
        {data.resources.length ? (
          <div className="card-grid">
            {data.resources.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <h3 className="section-title">{resource.title}</h3>
                <p className="muted-copy">{resource.source}</p>
                <div className="chip-row">
                  <span className="chip chip-gold">{resource.duration}</span>
                  <span className="chip chip-muted">{resource.difficulty}</span>
                  <span className="chip">{resource.skillTag}</span>
                </div>
                {resource.url ? (
                  <a className="inline-link" href={resource.url} target="_blank" rel="noreferrer">
                    Open resource
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No resources yet</strong>
            <p className="muted-copy">Analyze a role or generate a roadmap to unlock targeted learning recommendations.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
