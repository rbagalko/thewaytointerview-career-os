import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useJDAnalysisQuery } from "@/lib/api/queries";

export function JDAnalyzerPage() {
  const { data } = useJDAnalysisQuery();

  if (!data) {
    return null;
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="AI JD analyzer"
          title="Turn a job description into a preparation path"
          copy="This screen is scaffolded to accept pasted JDs, uploaded files, or selected job cards from discovery."
        />
        <div className="field">
          <label htmlFor="jd-text">Paste a job description</label>
          <textarea
            id="jd-text"
            defaultValue="Paste a JD here to connect live analysis later."
          />
        </div>
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader title="Role summary" copy={data.summary} />
          <div className="chip-row">
            {data.keySkills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionHeader title="Critical gaps" copy="High-signal skills to close before serious applications." />
          <div className="list-stack">
            {data.criticalGaps.map((gap) => (
              <div className="split-list-item" key={gap.skill}>
                <div>
                  <strong>{gap.skill}</strong>
                  <span>{gap.note}</span>
                </div>
                <span>{gap.importance}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader title="Predicted interview rounds" copy="Persisted AI analyses can later be stored in `jd_analyses` and `skill_gaps`." />
        <div className="card-grid">
          {data.interviewRounds.map((round) => (
            <article className="feature-card" key={round.name}>
              <h3 className="section-title">{round.name}</h3>
              <div className="chip-row">
                {round.focus.map((topic) => (
                  <span className="chip chip-muted" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

