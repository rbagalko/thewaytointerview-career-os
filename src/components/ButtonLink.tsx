import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/cn";

interface ButtonLinkProps extends LinkProps {
  variant?: "primary" | "secondary" | "accent" | "ghost";
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return <Link className={cn("button", `button-${variant}`, className)} {...props} />;
}

