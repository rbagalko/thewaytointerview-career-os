import { ArrowRight, Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ButtonLink } from "@/components/ButtonLink";
import { JobCard } from "@/components/JobCard";
import { MetricCard } from "@/components/MetricCard";
import { Panel } from "@/components/Panel";
import { ReadinessCard } from "@/components/ReadinessCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useDashboardQuery } from "@/lib/api/queries";

export function DashboardPage() {
  const location = useLocation();
  const { data, error, isPending } = useDashboardQuery();
  const flashState = location.state as
    | {
        onboardingComplete?: boolean;
        source?: "mock" | "supabase";
        nextBestAction?: {
          route?: string;
          cta?: string;
        };
      }
    | null;

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading dashboard…</strong>
            <p className="muted-copy">Pulling readiness, prep, and job context.</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Dashboard unavailable</strong>
            <p className="muted-copy">{error.message}</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="page">
      {flashState?.onboardingComplete ? (
        <Panel className="hero-panel">
          <SectionHeader
            eyebrow="Career baseline saved"
            title={
              flashState.source === "supabase"
                ? "Your live readiness system is now active"
                : "Your demo readiness system is ready"
            }
            copy={
              flashState.source === "supabase"
                ? "We saved your target role, locations, and skills, then generated a fresh readiness snapshot. Use job discovery next to shortlist the best 90-day-fit roles."
                : "Live workspace services are not configured in this session, so the app generated a local baseline and routed you into the dashboard experience."
            }
            action={
              <ButtonLink
                to={flashState.nextBestAction?.route ?? "/app/jobs"}
                variant="accent"
              >
                {flashState.nextBestAction?.cta ?? "Open job discovery"}
                <ArrowRight size={16} />
              </ButtonLink>
            }
          />
        </Panel>
      ) : null}

      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Career dashboard"
          title={`${data.goal.targetRole} readiness`}
          copy={`Targeting ${data.goal.targetCompany} with a ${data.goal.salaryGoal} salary goal.`}
          action={
            <ButtonLink to={data.readiness.nextBestAction.route} variant="accent">
              {data.readiness.nextBestAction.cta}
              <ArrowRight size={16} />
            </ButtonLink>
          }
        />
        <div className="badge-row">
          <span className="badge">
            <Star size={14} />
            {data.goal.experienceLevel}
          </span>
          {data.goal.preferredLocations.map((location) => (
            <span className="badge" key={location}>
              {location}
            </span>
          ))}
        </div>
      </Panel>

      <div className="metrics-grid">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="two-column-grid">
        <ReadinessCard readiness={data.readiness} />
        <Panel>
          <SectionHeader
            eyebrow="Today"
            title="Preparation plan"
            copy="The one thing this page should optimize is forward motion."
          />
          {data.todayTasks.length ? (
            <div className="list-stack">
              {data.todayTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-check">
                    <input type="checkbox" checked={task.status === "done"} readOnly />
                    <div>
                      <strong>{task.title}</strong>
                      <p className="muted-copy">{task.description}</p>
                    </div>
                  </div>
                  <div className="task-meta">
                    <span>{task.duration}</span>
                    <span>{task.type}</span>
                    <span>{task.skillTag}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No prep tasks yet</strong>
              <p className="muted-copy">Complete onboarding or generate a roadmap to populate today&apos;s training plan.</p>
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          eyebrow="90-day fit"
          title="Jobs you can realistically target next"
          copy="Each card pairs job discovery with a preparation path instead of just listing openings."
        />
        {data.topJobs.length ? (
          <div className="card-grid">
            {data.topJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No job matches yet</strong>
            <p className="muted-copy">Once you complete onboarding and relevant jobs are available, this panel will show scored opportunities.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
