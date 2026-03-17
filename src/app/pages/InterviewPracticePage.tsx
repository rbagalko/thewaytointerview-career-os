import { Badge } from "@/components/Badge";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useFeatureFlagsQuery } from "@/lib/api/queries";
import {
  MOCK_INTERVIEW_FLOW,
  MOCK_INTERVIEW_METRICS,
  MOCK_INTERVIEW_SIGNATURE_LINE
} from "@/lib/ai/mockInterviewEngine";

export function InterviewPracticePage() {
  const { data } = useFeatureFlagsQuery();
  const interviewFlags = (data ?? []).filter(
    (flag) =>
      flag.key === "mock-interview-audio" ||
      flag.key === "mock-interview-video" ||
      flag.key === "live-recruiter-interviews"
  );

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Interview practice"
          title="Train answers like a storyteller, not a template"
          copy={MOCK_INTERVIEW_SIGNATURE_LINE}
        />
        <div className="badge-row">
          <Badge tone="gold">Soon you can experience this.</Badge>
          <Badge tone="muted">USIE engine blueprint is ready</Badge>
        </div>
      </Panel>

      <div className="card-grid">
        {interviewFlags.map((flag) => (
          <ComingSoonCard key={flag.key} title={flag.label} description={flag.description} />
        ))}
      </div>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="How the engine thinks"
            copy="Frameworks stay invisible. Story stays visible. Every answer should feel natural, sharp, and deeply understandable."
          />
          <div className="list-stack">
            {MOCK_INTERVIEW_FLOW.map((step) => (
              <div className="split-list-item" key={step}>
                <strong>{step}</strong>
                <span>Engine rule</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            title="How responses will be scored"
            copy="The interview engine will grade communication, depth, and simplicity, not just correctness."
          />
          <div className="list-stack">
            {MOCK_INTERVIEW_METRICS.map((metric) => (
              <div className="split-list-item" key={metric.key}>
                <div>
                  <strong>{metric.label}</strong>
                  <span>{metric.description}</span>
                </div>
                <span>{Math.round(metric.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
