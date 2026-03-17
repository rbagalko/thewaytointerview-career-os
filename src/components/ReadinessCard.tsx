import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { type ReadinessSnapshot } from "@/lib/types";

interface ReadinessCardProps {
  readiness: ReadinessSnapshot;
}

export function ReadinessCard({ readiness }: ReadinessCardProps) {
  return (
    <Panel className="readiness-card">
      <SectionHeader
        eyebrow="Career pulse"
        title="Interview readiness"
        copy={`${readiness.delta7d > 0 ? `Up ${readiness.delta7d}%` : "No change"} in the last 7 days.`}
      />
      <div className="two-column-grid">
        <div className="readiness-meter" style={{ ["--score" as string]: readiness.overallScore }}>
          <div className="readiness-meter-content">
            <p className="readiness-score">{readiness.overallScore}%</p>
            <p className="readiness-label">Ready now</p>
          </div>
        </div>
        <div className="score-breakdown">
          {readiness.breakdown.map((item) => (
            <div className="score-row" key={item.label}>
              <div className="score-row-top">
                <span>{item.label}</span>
                <strong>{item.score}%</strong>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

