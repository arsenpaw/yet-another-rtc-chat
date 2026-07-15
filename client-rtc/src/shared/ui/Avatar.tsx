import { cn } from "@/shared/lib/utils";

const TONES = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
] as const;

/** Deterministic tonal fill from a seed string (name / initials). */
export function toneFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export interface AvatarProps {
  /** Initials shown when no image. */
  label: string;
  /** Optional image (real user picture). */
  src?: string | null;
  size?: number;
  /** Overrides the auto-derived tonal fill. */
  tone?: string;
  ring?: "online" | "accent" | null;
  /** Bottom-right presence dot. */
  presence?: boolean;
  className?: string;
}

/**
 * Initials avatar with tonal fill — the Atrium avatar primitive.
 * Falls back to an image when `src` is provided.
 */
export function Avatar({
  label,
  src,
  size = 32,
  tone,
  ring = null,
  presence = false,
  className,
}: AvatarProps) {
  const fill = tone ?? toneFor(label);
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center overflow-hidden rounded-full font-semibold text-foreground",
          !src && fill,
          ring === "online" && "ring-online",
          ring === "accent" && "ring-accent",
          className
        )}
        style={{ fontSize: Math.round(size * 0.36) }}
      >
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-cover" />
        ) : (
          initialsOf(label) || label.slice(0, 2).toUpperCase()
        )}
      </div>
      {presence && (
        <span className="absolute -bottom-px -right-px size-[9px] rounded-full border-2 border-rail bg-online" />
      )}
    </div>
  );
}

export interface AvatarStackItem {
  label: string;
  tone?: string;
  src?: string | null;
  ring?: "online" | "accent" | null;
}

export interface AvatarStackProps {
  items: AvatarStackItem[];
  size?: number;
  max?: number;
  /** Overflow tile / border color background (matches the surface behind). */
  ringBorderClass?: string;
  className?: string;
}

/** Overlapping avatar cluster with a "+N" overflow tile. */
export function AvatarStack({
  items,
  size = 28,
  max = 3,
  ringBorderClass = "border-card",
  className,
}: AvatarStackProps) {
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  const overlap = Math.round(size * 0.32);
  return (
    <div className={cn("flex", className)}>
      {shown.map((it, i) => (
        <div
          key={i}
          className={cn("rounded-full border-2", ringBorderClass)}
          style={{ marginLeft: i === 0 ? 0 : -overlap }}
        >
          <Avatar
            label={it.label}
            tone={it.tone}
            src={it.src}
            ring={it.ring ?? null}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 bg-card font-semibold text-secondary-text",
            ringBorderClass
          )}
          style={{
            width: size,
            height: size,
            marginLeft: -overlap,
            fontSize: Math.round(size * 0.34),
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
