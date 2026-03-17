import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { JobCard } from "@/components/JobCard";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useJobsQuery } from "@/lib/api/queries";

function matchesWorkMode(jobWorkMode: string, selectedWorkMode: string) {
  if (selectedWorkMode === "any") {
    return true;
  }

  return jobWorkMode.trim().toLowerCase() === selectedWorkMode;
}

function getFitHorizon(readinessScore: number) {
  if (readinessScore >= 70) {
    return "30";
  }

  if (readinessScore >= 55) {
    return "60";
  }

  return "90";
}

function matchesTimeHorizon(readinessScore: number, selectedHorizon: string) {
  const fitHorizon = getFitHorizon(readinessScore);

  if (selectedHorizon === "30") {
    return fitHorizon === "30";
  }

  if (selectedHorizon === "60") {
    return fitHorizon === "30" || fitHorizon === "60";
  }

  return true;
}

export function JobsPage() {
  const [query, setQuery] = useState("");
  const [readinessMin, setReadinessMin] = useState(40);
  const [workMode, setWorkMode] = useState("any");
  const [timeHorizon, setTimeHorizon] = useState("90");
  const { data, error, isPending } = useJobsQuery(query, readinessMin);
  const filteredJobs = useMemo(
    () =>
      (data ?? []).filter(
        (job) =>
          matchesWorkMode(job.workMode, workMode) &&
          matchesTimeHorizon(job.readinessScore, timeHorizon)
      ),
    [data, timeHorizon, workMode]
  );

  function resetFilters() {
    setQuery("");
    setReadinessMin(0);
    setWorkMode("any");
    setTimeHorizon("90");
  }

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
              <option value={0}>0%+</option>
              <option value={40}>40%+</option>
              <option value={50}>50%+</option>
              <option value={60}>60%+</option>
              <option value={70}>70%+</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="work-mode">Work mode</label>
            <select
              id="work-mode"
              value={workMode}
              onChange={(event) => setWorkMode(event.target.value)}
            >
              <option value="any">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="time-horizon">Time horizon</label>
            <select
              id="time-horizon"
              value={timeHorizon}
              onChange={(event) => setTimeHorizon(event.target.value)}
            >
              <option value="30">30-day fit</option>
              <option value="60">60-day fit</option>
              <option value="90">90-day fit</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeader
          title={`${filteredJobs.length} recommended ${filteredJobs.length === 1 ? "role" : "roles"}`}
          copy="Live results are ranked by readiness, then narrowed by work mode and your target time horizon."
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
        ) : filteredJobs.length ? (
          <div className="card-grid">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No roles matched this filter</strong>
            <p className="muted-copy">
              Try widening your threshold, work mode, or fit window to surface more realistic options.
            </p>
            <div className="action-row">
              <Button variant="secondary" type="button" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
