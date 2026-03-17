import { useEffect, useState } from "react";
import { Download, Upload } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import {
  useAnalyzeResumeMutation,
  useResumeWorkspaceQuery
} from "@/lib/api/queries";

function downloadOptimizedDraft(text: string, suggestions: { before: string; after: string }[]) {
  const optimizedDraft = [
    "Optimized Resume Notes",
    "",
    "Suggested rewrites:",
    ...suggestions.flatMap((suggestion, index) => [
      `${index + 1}. Before: ${suggestion.before}`,
      `   After: ${suggestion.after}`,
      ""
    ]),
    "Original resume text:",
    text
  ].join("\n");

  const blob = new Blob([optimizedDraft], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "thewaytointerview-optimized-resume.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResumePage() {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { data, error, isPending } = useResumeWorkspaceQuery();
  const analyzeMutation = useAnalyzeResumeMutation();
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    setResumeText(data?.rawText ?? "");
  }, [data?.rawText]);

  async function handleAnalyze() {
    await analyzeMutation.mutateAsync({
      rawText: resumeText,
      jobId: selectedJobId
    });
  }

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading resume workspace…</strong>
            <p className="muted-copy">Pulling your latest ATS score and rewrite suggestions.</p>
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
            <strong>Resume optimizer unavailable</strong>
            <p className="muted-copy">{error?.message ?? "Unable to load resume workspace."}</p>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Resume optimizer"
          title="ATS fit plus proof-of-work credibility"
          copy="Paste your resume, score it against your target direction, and keep an optimized draft ready for applications."
        />
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Paste your resume"
            copy="For launch, the fastest live path is text-based analysis. File upload can land next without blocking ATS scoring."
          />
          <div className="field">
            <label htmlFor="resume-text">Resume text</label>
            <textarea
              id="resume-text"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste your latest resume here..."
            />
          </div>
          <div className="action-row">
            <Button
              variant="primary"
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || resumeText.trim().length < 80}
            >
              {analyzeMutation.isPending ? "Analyzing…" : "Analyze resume"}
            </Button>
            <Button variant="secondary" type="button" disabled>
              <Upload size={16} />
              File upload next
            </Button>
          </div>
          {analyzeMutation.error ? (
            <div className="empty-state">
              <strong>Unable to analyze resume yet</strong>
              <p className="muted-copy">{analyzeMutation.error.message}</p>
            </div>
          ) : null}
          {analyzeMutation.isSuccess ? (
            <div className="empty-state">
              <strong>Resume analysis saved</strong>
              <p className="muted-copy">
                Your latest ATS score is now stored in Supabase and reflected in the dashboard.
              </p>
            </div>
          ) : null}
        </Panel>
        <Panel>
          <SectionHeader
            title="Current role fit"
            copy={`Latest score for ${data.targetRole || "your target role"}${data.targetCompany ? ` at ${data.targetCompany}` : ""}.`}
          />
          <div className="list-stack">
            <div className="split-list-item">
              <strong>ATS score</strong>
              <span>{data.atsScore != null ? `${Math.round(data.atsScore)} / 100` : "Not analyzed yet"}</span>
            </div>
            <div className="chip-row">
              {data.keywordGaps.length ? (
                data.keywordGaps.map((gap) => (
                  <Badge key={gap} tone="accent">
                    {gap}
                  </Badge>
                ))
              ) : (
                <Badge tone="gold">No keyword gaps yet</Badge>
              )}
            </div>
            <Button
              variant="accent"
              type="button"
              onClick={() => downloadOptimizedDraft(resumeText, data.suggestions)}
              disabled={!data.suggestions.length || !resumeText.trim()}
            >
              <Download size={16} />
              Export optimized draft
            </Button>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader
          title="Suggested rewrites"
          copy="These are now generated from the latest stored resume analysis instead of staying purely mock."
        />
        <div className="list-stack">
          {data.suggestions.length ? (
            data.suggestions.map((suggestion) => (
              <article className="suggestion-card" key={`${suggestion.before}-${suggestion.after}`}>
                <p className="metric-label">Before</p>
                <p className="muted-copy">{suggestion.before}</p>
                <p className="metric-label">After</p>
                <p>{suggestion.after}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <strong>No rewrite suggestions yet</strong>
              <p className="muted-copy">Analyze a pasted resume to generate keyword gaps and stronger bullet rewrites.</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
