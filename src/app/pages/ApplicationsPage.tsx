import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useApplicationsQuery } from "@/lib/api/queries";
import { type ApplicationStage } from "@/lib/types";

const stages: ApplicationStage[] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected"
];

export function ApplicationsPage() {
  const { data, error, isPending } = useApplicationsQuery();

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Career CRM"
          title="Track every application in one place"
          copy="Saved jobs, active applications, interview stages, and next actions should all live in the same operating system."
        />
      </Panel>

      <Panel>
        <SectionHeader title="Application board" copy="Kanban-ready layout for the `applications` table." />
        {isPending ? (
          <div className="empty-state">
            <strong>Loading CRM board…</strong>
            <p className="muted-copy">Pulling saved jobs and active application stages.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <strong>CRM unavailable</strong>
            <p className="muted-copy">{error.message}</p>
          </div>
        ) : (
          <div className="crm-board">
            {stages.map((stage) => (
              <section className="crm-column" key={stage}>
                <h3 className="crm-column-title">{stage}</h3>
                {(data?.[stage] ?? []).length ? (
                  data?.[stage]?.map((application) => (
                    <article className="crm-card" key={application.id}>
                      <strong>{application.company}</strong>
                      <span>{application.role}</span>
                      <span className="muted">{application.nextAction}</span>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <strong>No items</strong>
                    <p className="muted-copy">New tracked jobs will land here directly.</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
