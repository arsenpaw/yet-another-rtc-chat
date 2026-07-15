import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ChipProps extends React.ComponentProps<"button"> {
  active?: boolean;
}

/** Filter pill — accent fill when active, panel + border when not. */
export function Chip({ active = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "h-8 shrink-0 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border text-secondary-text hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
