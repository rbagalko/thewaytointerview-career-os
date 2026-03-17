import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
}

export function Panel({ className, muted, ...props }: PanelProps) {
  return <div className={cn("panel", muted && "panel-muted", className)} {...props} />;
}

