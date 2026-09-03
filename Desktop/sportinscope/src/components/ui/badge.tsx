import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "live" | "success" | "warning" | "outline" | "football" | "nba";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  live: "bg-live text-live-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  outline: "border border-border text-foreground",
  football: "bg-football/15 text-football",
  nba: "bg-nba/15 text-nba",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <Badge variant="live" className={cn("gap-1.5", className)}>
      <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" aria-hidden />
      Live
    </Badge>
  );
}
