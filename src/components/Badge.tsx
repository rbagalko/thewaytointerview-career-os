import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "muted" | "accent" | "gold";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "chip",
        tone === "muted" && "chip-muted",
        tone === "accent" && "chip-accent",
        tone === "gold" && "chip-gold",
        className
      )}
      {...props}
    />
  );
}

