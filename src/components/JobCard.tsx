import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { type JobOpportunity } from "@/lib/types";

interface JobCardProps {
  job: JobOpportunity;
}

export function JobCard({ job }: JobCardProps) {
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
        <Button variant="primary">Analyze</Button>
        <Button variant="secondary">Save job</Button>
        <Button variant="ghost">Track</Button>
      </div>
    </article>
  );
}

