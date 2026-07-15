import { cn } from "@/shared/lib/utils";

/** JetBrains-mono uppercase section label / eyebrow. */
export function MonoLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] uppercase tracking-[1px] text-faint",
        className
      )}
      {...props}
    />
  );
}
