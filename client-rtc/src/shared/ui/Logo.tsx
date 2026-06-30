import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export const BRAND = "Yet Another RTC Chat";

export interface LogoProps {
  /** Gradient mark size in px. */
  size?: number;
  /** Show the wordmark next to the mark. */
  wordmark?: boolean;
  /** Wraps in a Link to `/` when set. */
  to?: string;
  className?: string;
}

/** Brand mark — gradient rounded square + optional wordmark. */
export function Logo({ size = 26, wordmark = true, to, className }: LogoProps) {
  const radius = Math.round(size * 0.31);
  const inner = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="brand-gradient flex-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ width: size, height: size, borderRadius: radius }}
      />
      {wordmark && (
        <span
          className="font-extrabold tracking-[-0.4px] text-foreground"
          style={{ fontSize: Math.round(size * 0.69) }}
        >
          {BRAND}
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="transition-opacity hover:opacity-80">
        {inner}
      </Link>
    );
  }
  return inner;
}
