import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/ButtonLink";
import { useSaveJobMutation, useTrackJobMutation } from "@/lib/api/queries";
import { type JobOpportunity } from "@/lib/types";

interface JobCardProps {
  job: JobOpportunity;
}

export function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();
  const saveJobMutation = useSaveJobMutation();
  const trackJobMutation = useTrackJobMutation();

  async function handleSave() {
    await saveJobMutation.mutateAsync(job);
  }

  async function handleTrack() {
    await trackJobMutation.mutateAsync(job);
    navigate("/app/tracker");
  }

  const feedback =
    saveJobMutation.error?.message ||
    trackJobMutation.error?.message ||
    (trackJobMutation.isSuccess
      ? "Tracked in your CRM board."
      : saveJobMutation.isSuccess
        ? "Saved to your shortlist."
        : null);

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-company">{job.company}</h3>
          <p className="job-role">{job.roleTitle}</p>
        </div>
        <div className="job-score">
          <strong>{job.readinessScore}%</strong>
          <span className="muted">Readiness</span>
        </div>
      </div>
      <div className="job-meta">
        <span>{job.salaryRange}</span>
        <span>{job.location}</span>
        <span>{job.workMode}</span>
        <span>{job.experienceLevel}</span>
      </div>
      <div>
        <p className="metric-label">Skill gaps</p>
        <div className="chip-row">
          {job.missingSkills.map((skill) => (
            <Badge key={skill} tone="accent">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="metric-label">Recommended actions</p>
        <div className="split-list">
          {job.recommendedActions.map((action) => (
            <div className="split-list-item" key={action}>
              <strong>{action}</strong>
              <span>Next</span>
            </div>
          ))}
        </div>
      </div>
      <div className="action-row">
        <ButtonLink to={`/app/jd?job=${job.id}`} variant="primary">
          Analyze
        </ButtonLink>
        <Button
          variant="secondary"
          type="button"
          onClick={handleSave}
          disabled={saveJobMutation.isPending || saveJobMutation.isSuccess}
        >
          {saveJobMutation.isPending
            ? "Saving…"
            : saveJobMutation.isSuccess
              ? "Saved"
              : "Save job"}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={handleTrack}
          disabled={trackJobMutation.isPending}
        >
          {trackJobMutation.isPending ? "Tracking…" : "Track"}
        </Button>
      </div>
      {feedback ? <p className="inline-feedback">{feedback}</p> : null}
    </article>
  );
}
