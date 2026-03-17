import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useDashboardQuery } from "@/lib/api/queries";

export function PrepPage() {
  const { data } = useDashboardQuery();

  if (!data) {
    return null;
  }

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Daily career training"
          title="Prep engine"
          copy="Turn readiness gaps into interview questions, readings, proof-of-work labs, and application actions."
        />
      </Panel>

      <div className="tasks-grid">
        {data.todayTasks.map((task) => (
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
              <span style={{ width: task.status === "in_progress" ? "55%" : task.status === "done" ? "100%" : "12%" }} />
            </div>
          </article>
        ))}
      </div>

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
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

