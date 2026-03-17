import { ArrowRight, Flag, Sparkles } from "lucide-react";
import { Badge } from "@/components/Badge";
import { ButtonLink } from "@/components/ButtonLink";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { useDashboardQuery, useFeatureFlagsQuery } from "@/lib/api/queries";

export function InsightsPanel() {
  const { data: dashboard } = useDashboardQuery();
  const { data: flags } = useFeatureFlagsQuery();

  return (
    <aside className="insights">
      <div className="insight-block">
        <h3>Readiness snapshot</h3>
        <div className="insight-stack">
          <div>
            <p className="metric-value">{dashboard?.readiness.overallScore ?? 0}%</p>
            <p className="muted-copy">Current readiness for your target role.</p>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${dashboard?.readiness.overallScore ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="insight-block">
        <h3>Top skill gaps</h3>
        <div className="insight-stack">
          {dashboard?.readiness.topGaps.map((gap) => (
            <div className="insight-item" key={gap}>
              <span>{gap}</span>
              <Badge tone="accent">Priority</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-block">
        <h3>Next best action</h3>
        <p className="muted-copy">{dashboard?.readiness.nextBestAction.title}</p>
        <ButtonLink to={dashboard?.readiness.nextBestAction.route ?? "/app/dashboard"} variant="ghost">
          Open action
          <ArrowRight size={16} />
        </ButtonLink>
      </div>

      <div className="insight-block">
        <h3>
          <Sparkles size={16} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
          Featured resources
        </h3>
        <div className="insight-stack">
          {dashboard?.resources.map((resource) => (
            <div className="insight-item" key={resource.id}>
              <div>
                <strong>{resource.title}</strong>
                <div className="muted">{resource.source}</div>
              </div>
              <Badge tone="gold">{resource.duration}</Badge>
            </div>
          ))}
        </div>
      </div>

      {(flags ?? []).slice(0, 2).map((flag) => (
        <ComingSoonCard key={flag.key} title={flag.label} description={flag.description} />
      ))}

      <div className="insight-block">
        <h3>
          <Flag size={16} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
          Launch note
        </h3>
        <p className="muted-copy">
          This scaffold runs with mock data until Supabase credentials and edge functions are wired.
        </p>
      </div>
    </aside>
  );
}
