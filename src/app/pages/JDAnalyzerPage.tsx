import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useAnalyzeJDMutation, useJDAnalysisQuery } from "@/lib/api/queries";

export function JDAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { data, error, isPending } = useJDAnalysisQuery(selectedJobId);
  const analyzeMutation = useAnalyzeJDMutation();
  const [jdText, setJDText] = useState("");

  useEffect(() => {
    setJDText(data?.rawText ?? "");
  }, [data?.rawText, selectedJobId]);

  async function handleAnalyze() {
    await analyzeMutation.mutateAsync({
      rawText: jdText,
      jobId: selectedJobId
    });
  }

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading JD workspace…</strong>
            <p className="muted-copy">Pulling your latest analysis, gaps, and interview-round prediction.</p>
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
            <strong>JD analyzer unavailable</strong>
            <p className="muted-copy">{error?.message ?? "Unable to load JD analysis."}</p>
          </div>
        </Panel>
      </div>
    );
  }

  const canAnalyze = jdText.trim().length >= 80 || Boolean(selectedJobId);
  const hasAnalysis = Boolean(data.hasAnalysis);

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="AI JD analyzer"
          title={
            data.role
              ? `${data.role}${data.company ? ` at ${data.company}` : ""}`
              : "Turn a job description into a preparation path"
          }
          copy={
            selectedJobId
              ? "This workspace can analyze a selected role directly from Job Discovery or use pasted JD text for a custom target."
              : "Paste any JD to pull out key skills, likely interview rounds, and the gaps you should close before applying."
          }
        />
        <div className="badge-row">
          {selectedJobId ? <Badge tone="accent">Selected from Job Discovery</Badge> : null}
          {hasAnalysis ? <Badge tone="gold">Latest analysis loaded</Badge> : null}
        </div>
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Paste or review the JD"
            copy="Use pasted text for custom roles, or keep the selected job attached and run the analyzer against it."
          />
          <div className="field">
            <label htmlFor="jd-text">Job description</label>
            <textarea
              id="jd-text"
              value={jdText}
              onChange={(event) => setJDText(event.target.value)}
              placeholder="Paste the full job description here, or open this page from a job card to analyze a saved role."
            />
          </div>
          <div className="action-row">
            <Button
              type="button"
              variant="primary"
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !canAnalyze}
            >
              {analyzeMutation.isPending
                ? "Analyzing JD…"
                : selectedJobId
                  ? "Analyze selected job"
                  : "Analyze pasted JD"}
            </Button>
          </div>
          {analyzeMutation.error ? (
            <div className="empty-state">
              <strong>Unable to analyze this JD yet</strong>
              <p className="muted-copy">{analyzeMutation.error.message}</p>
            </div>
          ) : null}
          {analyzeMutation.isSuccess ? (
            <div className="empty-state">
              <strong>JD analysis saved</strong>
              <p className="muted-copy">
                Your latest role breakdown, gap list, and interview-round prediction are now saved to your workspace.
              </p>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <SectionHeader
            title="Role summary"
            copy={
              hasAnalysis
                ? data.summary
                : "Run the analyzer to generate a role summary, missing-skill breakdown, and interview plan."
            }
          />
          {data.keySkills.length ? (
            <div className="chip-row">
              {data.keySkills.map((skill) => (
                <span className="chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No JD analysis yet</strong>
              <p className="muted-copy">Analyze a JD to surface the strongest role signals and preparation focus areas.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Critical gaps"
            copy="These are the skills that are most likely to weaken interview performance if you can’t back them with examples."
          />
          {data.criticalGaps.length ? (
            <div className="list-stack">
              {data.criticalGaps.map((gap) => (
                <div className="split-list-item" key={gap.skill}>
                  <div>
                    <strong>{gap.skill}</strong>
                    <span>{gap.note}</span>
                  </div>
                  <Badge tone="accent">{gap.importance}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No gap list yet</strong>
              <p className="muted-copy">Once analyzed, this section will flag the highest-priority missing skills.</p>
            </div>
          )}
        </Panel>

        <Panel>
          <SectionHeader
            title="Predicted interview rounds"
            copy="Use this to shape your prep roadmap and prioritize the stories, labs, and troubleshooting examples you should rehearse."
          />
          {data.interviewRounds.length ? (
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
          ) : (
            <div className="empty-state">
              <strong>No interview prediction yet</strong>
              <p className="muted-copy">Analyze a JD to predict likely recruiter, technical, and scenario rounds.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
