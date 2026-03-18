import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Clock3,
  FileText,
  Link2,
  MapPin,
  Shield,
  Sparkles,
  Upload,
  Users,
  Zap
} from "lucide-react";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { useAnalyzeJDMutation, useJDAnalysisQuery } from "@/lib/api/queries";
import { type JDAnalysis, type JDPrepTask, type JDRound } from "@/lib/types";

type InputMode = "text" | "url" | "file";
type ResultTab = "skills" | "rounds" | "signals" | "48h" | "2week";

const inputModes: { id: InputMode; label: string; icon: typeof FileText }[] = [
  { id: "text", label: "Paste Text", icon: FileText },
  { id: "url", label: "From URL", icon: Link2 },
  { id: "file", label: "Upload File", icon: Upload }
];

const resultTabs: { id: ResultTab; label: string }[] = [
  { id: "skills", label: "Skills" },
  { id: "rounds", label: "Rounds" },
  { id: "signals", label: "Signals" },
  { id: "48h", label: "48h Prep" },
  { id: "2week", label: "2-Week" }
];

function ConfidenceStat({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="jd-confidence-stat">
      <span className="jd-confidence-label">{label}</span>
      <strong className="jd-confidence-value">{value}%</strong>
    </div>
  );
}

function RoundSummaryCard({ round }: { round: JDRound }) {
  return (
    <article className="jd-round-card">
      <div className="jd-round-card-header">
        <div className="jd-round-heading">
          <span className="jd-step-pill">{round.step}</span>
          <div>
            <h4 className="jd-card-title">{round.name}</h4>
            <div className="jd-card-meta">
              <span>{round.format}</span>
              <span>{round.duration}</span>
              <span>{round.difficulty}</span>
            </div>
          </div>
        </div>
        <div className="jd-round-score-block">
          <strong>{round.likelihood}%</strong>
          {round.gate ? <span className="jd-gate-flag">Gate</span> : null}
        </div>
      </div>
      <p className="section-copy">{round.description}</p>
      <div className="chip-row">
        {round.focus.map((focus) => (
          <span className="chip chip-muted" key={`${round.name}-${focus}`}>
            {focus}
          </span>
        ))}
      </div>
    </article>
  );
}

function PrepTaskCard({ task }: { task: JDPrepTask }) {
  return (
    <article className="jd-prep-card">
      <div className="jd-prep-card-header">
        <div className="jd-round-heading">
          <span className="jd-step-pill">{task.step}</span>
          <div>
            <h4 className="jd-card-title">{task.title}</h4>
            <div className="jd-card-meta">
              <span>
                <Clock3 size={15} />
                {task.duration}
              </span>
            </div>
          </div>
        </div>
      </div>
      {task.resources.length ? (
        <div className="chip-row">
          {task.resources.map((resource) => (
            <span className="chip chip-muted" key={`${task.title}-${resource}`}>
              {resource}
            </span>
          ))}
        </div>
      ) : null}
      {task.note ? <p className="section-copy">{task.note}</p> : null}
    </article>
  );
}

function stripHtmlToText(input: string) {
  if (typeof DOMParser === "undefined") {
    return input;
  }

  const parsed = new DOMParser().parseFromString(input, "text/html");
  return parsed.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function tabHeadline(tab: ResultTab, analysis: JDAnalysis) {
  switch (tab) {
    case "skills":
      return "What Matters Most — Top Themes";
    case "rounds":
      return `Interview Roadmap — ${analysis.interviewRounds.length} Rounds`;
    case "signals":
      return "Employer Signals Detected";
    case "48h":
      return `${analysis.company || analysis.role || "Role"} Crash Course`;
    case "2week":
      return "2-Week Role Sprint";
  }
}

export function JDAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { data, error, isPending } = useJDAnalysisQuery(selectedJobId);
  const analyzeMutation = useAnalyzeJDMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [activeTab, setActiveTab] = useState<ResultTab>("skills");
  const [jdText, setJDText] = useState("");
  const [jdUrl, setJDUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileText, setUploadedFileText] = useState("");
  const [intakeError, setIntakeError] = useState("");

  useEffect(() => {
    setJDText(data?.rawText ?? "");
  }, [data?.rawText, selectedJobId]);

  useEffect(() => {
    if (data?.hasAnalysis) {
      setActiveTab("skills");
    }
  }, [data?.analysisId, data?.hasAnalysis]);

  const canAnalyze =
    (selectedJobId && inputMode === "text") ||
    (inputMode === "url" && jdUrl.trim().length > 12) ||
    (inputMode === "file" && uploadedFileText.trim().length >= 80) ||
    (inputMode === "text" && jdText.trim().length >= 80);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const supportedTextFile = file.type.startsWith("text/") || /\.(txt|md|text)$/i.test(file.name);

    if (!supportedTextFile) {
      setIntakeError("Upload a plain-text JD file for now. PDF and DOCX import will come next.");
      return;
    }

    const text = await file.text();
    setUploadedFileName(file.name);
    setUploadedFileText(text);
    setInputMode("file");
    setIntakeError("");
  }

  async function resolveIntakeText() {
    if (inputMode === "url") {
      const targetUrl = jdUrl.trim();

      if (!targetUrl) {
        throw new Error("Paste a public JD URL first.");
      }

      try {
        const response = await fetch(targetUrl);

        if (!response.ok) {
          throw new Error("The URL could not be fetched.");
        }

        const fetchedText = stripHtmlToText(await response.text());

        if (fetchedText.trim().length < 80) {
          throw new Error("The fetched page did not contain enough job-description text.");
        }

        setJDText(fetchedText);
        return fetchedText;
      } catch {
        throw new Error("Most job boards block direct browser fetch. Paste the JD text instead or open it from Job Discovery.");
      }
    }

    if (inputMode === "file") {
      if (uploadedFileText.trim().length < 80) {
        throw new Error("Upload a plain-text JD file before analyzing.");
      }

      setJDText(uploadedFileText);
      return uploadedFileText;
    }

    if (jdText.trim().length < 80 && !selectedJobId) {
      throw new Error("Paste a fuller JD so the engine can extract useful signals.");
    }

    return jdText;
  }

  async function handleAnalyze() {
    try {
      setIntakeError("");
      const sourceText = await resolveIntakeText();

      await analyzeMutation.mutateAsync({
        rawText: sourceText,
        jobId: selectedJobId
      });
    } catch (caughtError) {
      setIntakeError(caughtError instanceof Error ? caughtError.message : "Unable to analyze this JD right now.");
    }
  }

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading JD workspace…</strong>
            <p className="muted-copy">Pulling your latest role intelligence, signals, and prep plan.</p>
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
            <strong>JD workspace unavailable</strong>
            <p className="muted-copy">{error?.message ?? "Unable to load JD analysis."}</p>
          </div>
        </Panel>
      </div>
    );
  }

  const hasAnalysis = Boolean(data.hasAnalysis);
  const metaChips = [
    data.seniority,
    data.geography,
    data.jobFamily,
    data.functionArea
  ].filter(Boolean) as string[];

  const prepTasks = activeTab === "2week" ? data.prep2Week : data.prep48h;

  return (
    <div className="page jd-page">
      <Panel className="jd-intake-panel">
        <div className="jd-intake-header">
          <div className="eyebrow">
            <Sparkles size={14} />
            JD intelligence engine
          </div>
          <h1 className="page-title jd-centered-title">JD Intelligence Engine</h1>
          <p className="section-copy jd-centered-copy">
            Paste, upload, or fetch from URL and we&apos;ll decode skills, predict rounds, and build your prep plan.
          </p>
        </div>

        <div className="jd-source-card">
          <div className="jd-source-tabs" role="tablist" aria-label="JD source modes">
            {inputModes.map((mode) => {
              const Icon = mode.icon;

              return (
                <button
                  type="button"
                  key={mode.id}
                  className={`jd-source-tab${inputMode === mode.id ? " active" : ""}`}
                  onClick={() => {
                    setInputMode(mode.id);
                    setIntakeError("");
                  }}
                >
                  <Icon size={16} />
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="jd-source-body">
            {inputMode === "text" ? (
              <div className="field jd-source-field">
                <label htmlFor="jd-text">Job description</label>
                <textarea
                  id="jd-text"
                  value={jdText}
                  onChange={(event) => setJDText(event.target.value)}
                  placeholder="Paste the full job description here. If you opened this page from Job Discovery, the saved JD will already be prefilled."
                />
              </div>
            ) : null}

            {inputMode === "url" ? (
              <div className="field jd-source-field">
                <label htmlFor="jd-url">Public job URL</label>
                <input
                  id="jd-url"
                  value={jdUrl}
                  onChange={(event) => setJDUrl(event.target.value)}
                  placeholder="https://company.com/careers/product-manager"
                />
                <p className="muted-copy">We’ll try to fetch the page in-browser first. If the site blocks it, paste the JD text instead.</p>
              </div>
            ) : null}

            {inputMode === "file" ? (
              <div className="jd-upload-card">
                <input
                  ref={fileInputRef}
                  className="jd-hidden-input"
                  type="file"
                  accept=".txt,.md,.text,text/plain"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="jd-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} />
                  <span>{uploadedFileName ? `Loaded: ${uploadedFileName}` : "Choose a plain-text JD file"}</span>
                  <small>TXT and Markdown are supported right now.</small>
                </button>
              </div>
            ) : null}
          </div>

          <div className="jd-source-footer">
            <div className="jd-source-status">
              {selectedJobId ? <span className="chip chip-muted">Opened from Job Discovery</span> : null}
              {uploadedFileName ? <span className="chip chip-muted">{uploadedFileName}</span> : null}
              <span className="jd-status-note">
                {inputMode === "url"
                  ? "Public URL mode works when the source page allows browser fetch."
                  : "Ready to analyze ✨"}
              </span>
            </div>

            <Button
              type="button"
              variant="primary"
              className="jd-primary-button"
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !canAnalyze}
            >
              {analyzeMutation.isPending ? "Analyzing JD…" : "Analyze Job Description"}
              <ArrowRight size={18} />
            </Button>
          </div>

          {intakeError ? (
            <div className="empty-state">
              <strong>Need a cleaner JD input</strong>
              <p className="muted-copy">{intakeError}</p>
            </div>
          ) : null}

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
                Your latest role breakdown, gap list, interview roadmap, and prep plan are now saved to your workspace.
              </p>
            </div>
          ) : null}
        </div>

        <Button type="button" variant="secondary" className="jd-compare-button" disabled>
          Compare Multiple JDs Side by Side
        </Button>
      </Panel>

      {hasAnalysis ? (
        <section className="jd-results-shell">
          <div className="jd-result-hero">
            <div className="jd-result-kicker">{data.company ? data.company : "Role decoded"}</div>
            <h2 className="jd-result-title">{data.role || "Target role"}</h2>
            <p className="section-copy jd-result-summary">{data.summary}</p>

            {metaChips.length ? (
              <div className="jd-meta-row">
                {metaChips.map((chip) => (
                  <span className="jd-meta-chip" key={chip}>
                    {chip.includes("Remote") || chip.includes("Hybrid") || chip.includes("Onsite") ? (
                      <MapPin size={14} />
                    ) : chip === data.seniority ? (
                      <Users size={14} />
                    ) : chip === data.jobFamily ? (
                      <BriefcaseBusiness size={14} />
                    ) : (
                      <Brain size={14} />
                    )}
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="jd-confidence-row">
              <ConfidenceStat label="Skill extraction" value={data.confidenceScores.skillExtraction} />
              <ConfidenceStat label="Round prediction" value={data.confidenceScores.roundPrediction} />
              <ConfidenceStat label="Seniority" value={data.confidenceScores.seniority} />
              <ConfidenceStat label="Company match" value={data.confidenceScores.companyMatch} />
            </div>
          </div>

          <div className="jd-tab-bar" role="tablist" aria-label="JD intelligence tabs">
            {resultTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`jd-result-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "skills" ? (
            <div className="jd-section-stack">
              <Panel className="jd-highlight-panel">
                <div className="panel-title-row">
                  <div>
                    <div className="eyebrow">
                      <Zap size={14} />
                      Skills tab
                    </div>
                    <h3 className="section-title">{tabHeadline(activeTab, data)}</h3>
                  </div>
                </div>
                <div className="list-stack">
                  {data.whatMattersMost.map((theme) => (
                    <article className="jd-theme-card" key={`${theme.step}-${theme.title}`}>
                      <div className="jd-round-heading">
                        <span className="jd-step-pill">{theme.step}</span>
                        <div>
                          <h4 className="jd-card-title">{theme.title}</h4>
                          <p className="section-copy">{theme.explanation}</p>
                        </div>
                      </div>
                      <strong className="jd-theme-score">{theme.confidence}%</strong>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="panel-title-row">
                  <div>
                    <div className="eyebrow">
                      <Shield size={14} />
                      Gap pressure
                    </div>
                    <h3 className="section-title">Critical gaps to close before you interview</h3>
                  </div>
                </div>
                <div className="list-stack">
                  {data.criticalGaps.map((gap) => (
                    <article className="jd-signal-card" key={gap.skill}>
                      <div className="jd-card-header-row">
                        <h4 className="jd-card-title">{gap.skill}</h4>
                        <span className="chip chip-accent">{gap.importance}</span>
                      </div>
                      <p className="section-copy">{gap.note}</p>
                      {gap.suggestedActions?.length ? (
                        <div className="chip-row">
                          {gap.suggestedActions.map((action) => (
                            <span className="chip chip-muted" key={`${gap.skill}-${action}`}>
                              {action}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {activeTab === "rounds" ? (
            <div className="jd-section-stack">
              <Panel className="jd-highlight-panel">
                <div className="panel-title-row">
                  <div>
                    <div className="eyebrow">
                      <Users size={14} />
                      Rounds tab
                    </div>
                    <h3 className="section-title">{tabHeadline(activeTab, data)}</h3>
                  </div>
                </div>
                <div className="jd-pipeline-list">
                  {data.interviewRounds.map((round) => (
                    <div className="jd-pipeline-row" key={round.name}>
                      <div className="jd-pipeline-label">
                        <span>{round.step}.</span>
                        <strong>{round.name}</strong>
                      </div>
                      <div className="jd-pipeline-track">
                        <span style={{ width: `${round.likelihood}%` }} />
                      </div>
                      <div className="jd-pipeline-score">
                        <strong>{round.likelihood}%</strong>
                        {round.gate ? <span className="jd-gate-flag">Gate</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <div className="list-stack">
                {data.interviewRounds.map((round) => (
                  <RoundSummaryCard round={round} key={round.name} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "signals" ? (
            <div className="jd-section-stack">
              <Panel className="jd-highlight-panel">
                <div className="panel-title-row">
                  <div>
                    <div className="eyebrow">
                      <Shield size={14} />
                      Signals tab
                    </div>
                    <h3 className="section-title">{tabHeadline(activeTab, data)}</h3>
                  </div>
                </div>
                <div className="list-stack">
                  {data.employerSignals.map((signal) => (
                    <article className="jd-signal-card" key={signal.label}>
                      <span className="jd-signal-tag">{signal.label}</span>
                      <p className="section-copy">{signal.explanation}</p>
                      <div className="jd-signal-action">
                        <Zap size={16} />
                        <span>{signal.prepAction}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>

              <Panel className="jd-tips-panel">
                <h3 className="section-title">General Interview Tips</h3>
                <div className="list-stack">
                  {data.generalTips.map((tip) => (
                    <div className="jd-tip-row" key={tip}>
                      <Sparkles size={16} />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {activeTab === "48h" || activeTab === "2week" ? (
            <div className="jd-section-stack">
              <Panel className="jd-highlight-panel">
                <div className="panel-title-row">
                  <div>
                    <div className="eyebrow">
                      <Clock3 size={14} />
                      Prep tab
                    </div>
                    <h3 className="section-title">{tabHeadline(activeTab, data)}</h3>
                    <p className="section-copy">
                      {activeTab === "48h"
                        ? "Focus on domain immersion and technical storyline alignment."
                        : "Use this sprint to turn the JD into a full interview-ready preparation path."}
                    </p>
                  </div>
                </div>
                <div className="list-stack">
                  {prepTasks.map((task) => (
                    <PrepTaskCard task={task} key={`${activeTab}-${task.step}-${task.title}`} />
                  ))}
                </div>
              </Panel>

              <Panel className="jd-tips-panel">
                <h3 className="section-title">General Interview Tips</h3>
                <div className="list-stack">
                  {data.generalTips.map((tip) => (
                    <div className="jd-tip-row" key={`${activeTab}-${tip}`}>
                      <Sparkles size={16} />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Link className="button jd-next-link" to="/app/resume">
                Next: Optimize Resume
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
