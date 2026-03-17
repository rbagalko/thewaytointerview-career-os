import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/ButtonLink";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useOnboardingMutation } from "@/lib/api/queries";
import { onboardingRoleOptions } from "@/lib/mock-data";

function computeReadiness(role: string, skills: string[]) {
  const normalizedSkills = skills
    .map((skill) => skill.trim())
    .filter(Boolean)
    .length;

  const roleBoost = role.toLowerCase().includes("identity") || role.toLowerCase().includes("azure")
    ? 8
    : 0;

  return Math.min(82, 38 + normalizedSkills * 5 + roleBoost);
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(onboardingRoleOptions[0]);
  const [company, setCompany] = useState("Microsoft");
  const [salaryGoal, setSalaryGoal] = useState("30 LPA");
  const [experienceLevel, setExperienceLevel] = useState("Mid-level");
  const [skillsInput, setSkillsInput] = useState("Azure AD, PowerShell, MFA");
  const [preferredLocationsInput, setPreferredLocationsInput] = useState("Bengaluru, Remote");
  const onboardingMutation = useOnboardingMutation();

  const skills = useMemo(
    () =>
      skillsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [skillsInput]
  );

  const preferredLocations = useMemo(
    () =>
      preferredLocationsInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [preferredLocationsInput]
  );

  const readiness = computeReadiness(role, skills);
  const persistedReadiness = onboardingMutation.data?.readiness;
  const previewReadiness = persistedReadiness?.overallScore ?? readiness;
  const previewTopGaps = persistedReadiness?.topGaps ?? [
    "Conditional Access",
    "Azure AD Connect",
    "PowerShell automation"
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onboardingMutation.mutateAsync({
      targetRole: role,
      targetCompany: company,
      salaryGoal,
      experienceLevel,
      currentSkills: skills,
      preferredLocations
    });

    navigate("/app/dashboard", {
      replace: true,
      state: {
        onboardingComplete: true,
        source: result.source,
        nextBestAction: result.readiness.nextBestAction
      }
    });
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Smooth onboarding"
          title="Build the user's career cockpit in under three minutes"
          copy="This form writes career goals and skills into Supabase, then creates a fresh readiness snapshot for the dashboard, jobs, and prep engine."
        />
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader title="Career target" copy="Keep the form lightweight. Everything here maps directly to `career_goals` and `candidate_profiles`." />
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="target-role">Target role</label>
                <select id="target-role" value={role} onChange={(event) => setRole(event.target.value)}>
                  {onboardingRoleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="target-company">Target company</label>
                <input
                  id="target-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="salary-goal">Salary goal</label>
                <input
                  id="salary-goal"
                  value={salaryGoal}
                  onChange={(event) => setSalaryGoal(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="experience-level">Experience level</label>
                <select
                  id="experience-level"
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                >
                  <option>Entry-level</option>
                  <option>Junior</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="preferred-locations">Preferred locations</label>
              <input
                id="preferred-locations"
                value={preferredLocationsInput}
                onChange={(event) => setPreferredLocationsInput(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="skills">Current skills</label>
              <textarea
                id="skills"
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
              />
            </div>
            {onboardingMutation.error ? (
              <div className="empty-state">
                <strong>Unable to save onboarding yet</strong>
                <p className="muted-copy">{onboardingMutation.error.message}</p>
              </div>
            ) : null}
            <p className="muted-copy">
              Submitting this saves your baseline, refreshes readiness, and takes you straight into the live dashboard.
            </p>
            <div className="action-row">
              <Button variant="primary" type="submit" disabled={onboardingMutation.isPending}>
                {onboardingMutation.isPending ? "Generating plan…" : "Generate career plan"}
              </Button>
              <Button variant="secondary" type="button">
                Upload resume
              </Button>
              {onboardingMutation.data ? (
                <ButtonLink to={onboardingMutation.data.readiness.nextBestAction.route} variant="ghost">
                  {onboardingMutation.data.readiness.nextBestAction.cta}
                  <ArrowRight size={16} />
                </ButtonLink>
              ) : null}
            </div>
          </form>
        </Panel>

        <Panel>
          <SectionHeader title="Outcome preview" copy="This panel updates from the live onboarding response so the user sees their baseline before they leave the page." />
          <div className="list-stack">
            <div className="split-list-item">
              <strong>Readiness</strong>
              <span>{previewReadiness}%</span>
            </div>
            <div className="split-list-item">
              <strong>Target</strong>
              <span>
                {role} at {company}
              </span>
            </div>
            <div className="split-list-item">
              <strong>Salary goal</strong>
              <span>{salaryGoal}</span>
            </div>
            <div className="chip-row">
              {skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
            <div className="chip-row">
              {preferredLocations.map((location) => (
                <Badge key={location} tone="muted">
                  {location}
                </Badge>
              ))}
            </div>
            <div className="empty-state">
              <strong>Top gaps</strong>
              <p className="muted-copy">{previewTopGaps.join(", ") || "Complete onboarding to see your gaps."}</p>
            </div>
            {persistedReadiness ? (
              <div className="empty-state">
                <strong>Next best action</strong>
                <p className="muted-copy">{persistedReadiness.nextBestAction.title}</p>
              </div>
            ) : (
              <div className="empty-state">
                <strong>Likely next step</strong>
                <p className="muted-copy">
                  Jobs and prep recommendations will become sharper after your first persisted readiness snapshot.
                </p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
