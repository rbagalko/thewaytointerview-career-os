import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import {
  useGeneratePrepRoadmapMutation,
  usePrepPlanQuery,
  usePrepTaskStatusMutation
} from "@/lib/api/queries";
import { type PrepTask } from "@/lib/types";

function nextTaskAction(task: PrepTask) {
  if (task.status === "done") {
    return {
      label: "Mark todo",
      status: "todo" as const
    };
  }

  return {
    label: "Mark done",
    status: "done" as const
  };
}

export function PrepPage() {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { data, error, isPending } = usePrepPlanQuery();
  const roadmapMutation = useGeneratePrepRoadmapMutation();
  const taskStatusMutation = usePrepTaskStatusMutation();

  async function handleGenerateRoadmap() {
    await roadmapMutation.mutateAsync(selectedJobId);
  }

  async function handleTaskAction(taskId: string, status: "todo" | "in_progress" | "done") {
    await taskStatusMutation.mutateAsync({ taskId, status });
  }

  if (isPending) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Loading prep engine…</strong>
            <p className="muted-copy">Pulling your roadmap, active tasks, and best-fit resources.</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Panel>
          <div className="empty-state">
            <strong>Prep engine unavailable</strong>
            <p className="muted-copy">{error.message}</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Daily career training"
          title={
            data.roadmap
              ? `${data.roadmap.role} roadmap`
              : "Generate your first prep roadmap"
          }
          copy={
            data.roadmap
              ? `Current plan for ${data.roadmap.company} spans ${data.roadmap.durationDays} days and turns your biggest gaps into daily actions.`
              : "Turn readiness gaps into interview questions, readings, proof-of-work labs, and application actions."
          }
        />
        <div className="action-row">
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerateRoadmap}
            disabled={roadmapMutation.isPending}
          >
            {roadmapMutation.isPending
              ? "Generating roadmap…"
              : data.roadmap
                ? "Regenerate roadmap"
                : "Generate 14-day roadmap"}
          </Button>
        </div>
        {roadmapMutation.isSuccess ? (
          <div className="empty-state">
            <strong>Roadmap ready</strong>
            <p className="muted-copy">
              {roadmapMutation.data.taskCount} tasks were generated from your latest readiness gaps.
            </p>
          </div>
        ) : null}
        {roadmapMutation.error ? (
          <div className="empty-state">
            <strong>Unable to generate roadmap yet</strong>
            <p className="muted-copy">{roadmapMutation.error.message}</p>
          </div>
        ) : null}
        {data.focusSkills.length ? (
          <div className="chip-row">
            {data.focusSkills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </Panel>

      {data.tasks.length ? (
        <div className="tasks-grid">
          {data.tasks.map((task) => {
            const action = nextTaskAction(task);
            const isTaskPending =
              taskStatusMutation.isPending && taskStatusMutation.variables?.taskId === task.id;

            return (
              <article className="task-card" key={task.id}>
                <div className="panel-title-row">
                  <div>
                    <h3 className="section-title">{task.title}</h3>
                    <p className="muted-copy">{task.description}</p>
                  </div>
                </div>
                <div className="task-meta">
                  <span>{task.duration}</span>
                  <span>{task.type}</span>
                  <span>{task.skillTag}</span>
                </div>
                <div className="progress-bar">
                  <span
                    style={{
                      width:
                        task.status === "in_progress"
                          ? "55%"
                          : task.status === "done"
                            ? "100%"
                            : "12%"
                    }}
                  />
                </div>
                <div className="action-row">
                  {task.status !== "done" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleTaskAction(task.id, "in_progress")}
                      disabled={isTaskPending}
                    >
                      {isTaskPending && taskStatusMutation.variables?.status === "in_progress"
                        ? "Updating…"
                        : task.status === "in_progress"
                          ? "In progress"
                          : "Start"}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleTaskAction(task.id, action.status)}
                    disabled={isTaskPending}
                  >
                    {isTaskPending && taskStatusMutation.variables?.status === action.status
                      ? "Updating…"
                      : action.label}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Panel>
          <div className="empty-state">
            <strong>No prep tasks yet</strong>
            <p className="muted-copy">
              Generate a 14-day roadmap and we’ll turn your readiness gaps into daily work.
            </p>
          </div>
        </Panel>
      )}

      <Panel>
        <SectionHeader
          title="Recommended learning resources"
          copy="Curated examples ranked by fit, duration, and difficulty."
        />
        <div className="card-grid">
          {data.resources.map((resource) => (
            <article className="resource-card" key={resource.id}>
              <h3 className="section-title">{resource.title}</h3>
              <p className="muted-copy">{resource.source}</p>
              <div className="chip-row">
                <span className="chip chip-gold">{resource.duration}</span>
                <span className="chip chip-muted">{resource.difficulty}</span>
                <span className="chip">{resource.skillTag}</span>
              </div>
              {resource.url ? (
                <a className="inline-link" href={resource.url} target="_blank" rel="noreferrer">
                  Open resource
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
