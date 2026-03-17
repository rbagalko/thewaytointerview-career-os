import { type ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, copy, action }: SectionHeaderProps) {
  return (
    <div className="panel-title-row">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {copy ? <p className="section-copy">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}

