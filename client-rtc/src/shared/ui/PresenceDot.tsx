import { cn } from "@/shared/lib/utils";

export interface PresenceDotProps {
  status?: "online" | "idle" | "offline";
  size?: number;
  pulse?: boolean;
  className?: string;
}

/** Small status dot — green online, dim idle/offline. */
export function PresenceDot({
  status = "online",
  size = 8,
  pulse = false,
  className,
}: PresenceDotProps) {
  return (
    <span
      className={cn(
        "relative inline-flex flex-none rounded-full",
        status === "online" ? "bg-online" : "bg-white/20",
        className
      )}
      style={{ width: size, height: size }}
    >
      {pulse && status === "online" && (
        <span className="absolute inset-0 animate-ping rounded-full bg-online opacity-75" />
      )}
    </span>
  );
}
