import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import {
  useAnalyzeLinkedInMutation,
  useLinkedInWorkspaceQuery
} from "@/lib/api/queries";

export function LinkedInPage() {
  const { data, error, isPending } = useLinkedInWorkspaceQuery();
  const optimizeMutation = useAnalyzeLinkedInMutation();
  const [profileName, setProfileName] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    setProfileName(data?.profileName ?? "");
    setHeadline(data?.headline ?? "");
    setSummary(data?.summary ?? "");
  }, [data?.profileName, data?.headline, data?.summary]);

  async function handleOptimize() {
    await optimizeMutation.mutateAsync({
      profileName,
      headline,
      summary
    });
  }

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading LinkedIn workspace…</strong>
            <p className="muted-copy">Pulling your latest profile score, suggested headline, and keyword gaps.</p>
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
            <strong>LinkedIn optimizer unavailable</strong>
            <p className="muted-copy">{error?.message ?? "Unable to load LinkedIn workspace."}</p>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="LinkedIn optimizer"
          title="Sharpen recruiter visibility and keyword clarity"
          copy={`Optimize your profile for ${data.targetRole || "your target role"}${data.targetCompany ? ` at ${data.targetCompany}` : ""} without leaving the app.`}
        />
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Current profile copy"
            copy="For launch, this module focuses on the two sections that most strongly affect recruiter search relevance and first impressions."
          />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="profile-name">Profile name</label>
              <input
                id="profile-name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-headline">Headline</label>
              <input
                id="profile-headline"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Azure AD Engineer | Identity Automation | PowerShell"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-summary">About / Summary</label>
            <textarea
              id="profile-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Describe your target direction, strongest identity skills, and proof-of-work in clear recruiter-friendly language."
            />
          </div>
          <div className="action-row">
            <Button
              type="button"
              variant="primary"
              onClick={handleOptimize}
              disabled={optimizeMutation.isPending || headline.trim().length < 12 || summary.trim().length < 80}
            >
              {optimizeMutation.isPending ? "Optimizing…" : "Optimize LinkedIn copy"}
            </Button>
          </div>
          {optimizeMutation.error ? (
            <div className="empty-state">
              <strong>Unable to optimize LinkedIn yet</strong>
              <p className="muted-copy">{optimizeMutation.error.message}</p>
            </div>
          ) : null}
          {optimizeMutation.isSuccess ? (
            <div className="empty-state">
              <strong>LinkedIn optimization saved</strong>
              <p className="muted-copy">
                Your latest profile score, suggested headline, and summary are now saved to your workspace.
              </p>
            </div>
          ) : null}
        </Panel>

        <Panel>
          <SectionHeader
            title="Profile score"
            copy="Use this as a fast quality signal before you start sending applications or recruiter outreach."
          />
          <div className="list-stack">
            <div className="split-list-item">
              <strong>Current score</strong>
              <span>{data.profileScore != null ? `${Math.round(data.profileScore)} / 100` : "Not scored yet"}</span>
            </div>
            <div className="chip-row">
              {data.keywordGaps.length ? (
                data.keywordGaps.map((gap) => (
                  <Badge key={gap} tone="accent">
                    {gap}
                  </Badge>
                ))
              ) : (
                <Badge tone="gold">No keyword gaps detected</Badge>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader
            title="Suggested headline"
            copy="Keep the role, core skill keywords, and one clear specialization in the first line."
          />
          <div className="suggestion-card">
            <p>{data.suggestedHeadline || "Optimize your profile to generate a stronger headline."}</p>
          </div>
        </Panel>

        <Panel>
          <SectionHeader
            title="Suggested summary"
            copy="Your summary should connect target role, high-signal skills, and proof-of-work in recruiter language."
          />
          <div className="suggestion-card">
            <p>{data.suggestedSummary || "Optimize your profile to generate a stronger About section."}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
