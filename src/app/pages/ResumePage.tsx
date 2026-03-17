import { Download, Upload } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { useResumeSuggestionsQuery } from "@/lib/api/queries";

export function ResumePage() {
  const { data } = useResumeSuggestionsQuery();

  return (
    <div className="page">
      <Panel className="hero-panel">
        <SectionHeader
          eyebrow="Resume optimizer"
          title="ATS fit plus proof-of-work credibility"
          copy="Upload once, optimize against roles or specific jobs, and keep the best version ready for applications."
        />
      </Panel>

      <div className="two-column-grid">
        <Panel>
          <SectionHeader title="Upload or paste your resume" copy="The parser and ATS scorer hook into Supabase storage and server-side analysis later." />
          <div className="empty-state">
            <Upload size={20} />
            <strong>Drop PDF or DOCX here</strong>
            <p className="muted-copy">
              The scaffold currently uses mock parsing results so the UI remains navigable before backend wiring.
            </p>
            <Button variant="secondary">Choose file</Button>
          </div>
        </Panel>
        <Panel>
          <SectionHeader title="Current role fit" copy="Three high-priority changes to move this resume closer to your target role." />
          <div className="list-stack">
            <div className="split-list-item">
              <strong>ATS score</strong>
              <span>71 / 100</span>
            </div>
            <div className="chip-row">
              <Badge tone="accent">Conditional Access</Badge>
              <Badge tone="accent">Graph API</Badge>
              <Badge tone="accent">Zero Trust</Badge>
            </div>
            <Button variant="accent">
              <Download size={16} />
              Export optimized draft
            </Button>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHeader title="Suggested rewrites" copy="These examples become editable server-side outputs once the resume optimization endpoint is wired." />
        <div className="list-stack">
          {data?.map((suggestion) => (
            <article className="suggestion-card" key={suggestion.before}>
              <p className="metric-label">Before</p>
              <p className="muted-copy">{suggestion.before}</p>
              <p className="metric-label">After</p>
              <p>{suggestion.after}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

