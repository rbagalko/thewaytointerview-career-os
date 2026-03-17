import { Badge } from "@/components/Badge";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useLinkedInSuggestionsQuery } from "@/lib/api/queries";

export function LinkedInPage() {
  const { data } = useLinkedInSuggestionsQuery();

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="LinkedIn beta"
          title="Recruiter visibility and keyword clarity"
          copy="This module stays launch-safe by focusing on headline, summary, and keyword coverage instead of trying to do everything at once."
        />
        <div className="badge-row">
          <Badge tone="gold">Beta module</Badge>
          <Badge tone="muted">Profile score target: 80+</Badge>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Recommended profile changes" copy="Use the same skill vocabulary across resume, LinkedIn, and application answers." />
        <div className="list-stack">
          {(data ?? []).map((item) => (
            <div className="split-list-item" key={item}>
              <strong>{item}</strong>
              <span>Priority</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

