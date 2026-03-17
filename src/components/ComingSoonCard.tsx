import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

interface ComingSoonCardProps {
  title: string;
  description: string;
}

export function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <article className="coming-soon">
      <Badge tone="gold">Future module</Badge>
      <h3 className="section-title">{title}</h3>
      <p className="muted-copy">{description}</p>
      <Button variant="secondary" disabled>
        Soon you can experience this.
      </Button>
    </article>
  );
}

