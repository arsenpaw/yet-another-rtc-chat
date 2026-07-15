import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CommunityTileProps {
  initials: string;
  tone: string;
  active?: boolean;
}

function CommunityTile({ initials, tone, active }: CommunityTileProps) {
  return (
    <div
      className={cn(
        "flex size-[42px] items-center justify-center rounded-[14px] text-sm font-bold text-foreground",
        tone,
        active && "ring-accent"
      )}
    >
      {initials}
    </div>
  );
}

export interface IconRailProps {
  onAdd?: () => void;
  className?: string;
}

/**
 * Left icon rail shared by the Rooms and Room screens: brand mark, the
 * active community, and an add tile. Communities are presentational.
 */
export function IconRail({ onAdd, className }: IconRailProps) {
  return (
    <div
      className={cn(
        "flex w-[76px] flex-col items-center gap-3.5 border-r border-border-subtle bg-rail py-[18px]",
        className
      )}
    >
      <Link
        to="/rooms"
        className="brand-gradient size-[42px] rounded-[13px] transition-transform hover:scale-105"
        aria-label="Home"
      />
      <span className="h-px w-8 bg-white/10" />
      <CommunityTile initials="RC" tone="bg-avatar-1" active />
      <CommunityTile initials="IH" tone="bg-avatar-2" />
      <CommunityTile initials="SY" tone="bg-avatar-3" />
      <button
        type="button"
        onClick={onAdd}
        aria-label="New room"
        className="flex size-[42px] items-center justify-center rounded-[14px] border border-dashed border-white/20 text-faint transition-colors hover:border-primary hover:text-primary"
      >
        <Plus size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
}
