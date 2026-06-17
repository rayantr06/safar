import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        {
          "border-transparent bg-primary text-white": variant === "default",
          "border-transparent bg-secondary-container text-on-secondary-container":
            variant === "secondary",
          "text-on-surface": variant === "outline",
          "border-transparent bg-success-light text-success": variant === "success",
          "border-transparent bg-warning-light text-warning": variant === "warning",
          "border-transparent bg-error-container text-on-error-container":
            variant === "danger",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
