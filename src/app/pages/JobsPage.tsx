import { useState } from "react";
import { JobCard } from "@/components/JobCard";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useJobsQuery } from "@/lib/api/queries";

export function JobsPage() {
  const [query, setQuery] = useState("");
  const [readinessMin, setReadinessMin] = useState(50);
  const { data, error, isPending } = useJobsQuery(query, readinessMin);

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Smart job discovery"
          title="Jobs you can realistically land in the next 90 days"
          copy="Every result shows readiness, match strength, missing skills, and recommended actions."
        />
        <div className="filters">
          <div className="field">
            <label htmlFor="job-search">Search</label>
            <input
              id="job-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Azure AD, IAM, Okta, Bengaluru..."
            />
          </div>
          <div className="field">
            <label htmlFor="readiness-min">Minimum readiness</label>
            <select
              id="readiness-min"
              value={readinessMin}
              onChange={(event) => setReadinessMin(Number(event.target.value))}
            >
              <option value={40}>40%+</option>
              <option value={50}>50%+</option>
              <option value={60}>60%+</option>
              <option value={70}>70%+</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="work-mode">Work mode</label>
            <select id="work-mode" defaultValue="Any">
              <option>Any</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>Onsite</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="time-horizon">Time horizon</label>
            <select id="time-horizon" defaultValue="90">
              <option value="30">30-day fit</option>
              <option value="60">60-day fit</option>
              <option value="90">90-day fit</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          title={`${data?.length ?? 0} recommended roles`}
          copy="This page calls the Supabase `get_job_discovery` RPC when credentials and migrations are present, and falls back to mock data otherwise."
        />
        {isPending ? (
          <div className="empty-state">
            <strong>Loading job matches…</strong>
            <p className="muted-copy">Scoring live opportunities against your readiness baseline.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <strong>Job discovery unavailable</strong>
            <p className="muted-copy">{error.message}</p>
          </div>
        ) : data?.length ? (
          <div className="card-grid">
            {data.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No roles matched this filter</strong>
            <p className="muted-copy">Try lowering the readiness threshold or seed more jobs into Supabase.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
