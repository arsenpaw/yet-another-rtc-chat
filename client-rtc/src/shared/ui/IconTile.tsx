import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

/**
 * Square rounded tile holding an icon — header actions, voice/video controls,
 * composer affordances. `active` flips to the accent-soft state.
 */
const tileVariants = cva(
  "inline-flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        panel: "bg-secondary border border-border text-foreground hover:bg-white/10",
        control: "bg-control border border-input text-foreground hover:bg-white/10",
        ghost: "text-secondary-text hover:bg-white/5 hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "size-[30px] rounded-lg text-sm",
        md: "size-9 rounded-[9px] text-[15px]",
        lg: "size-10 rounded-[11px] text-base",
      },
      active: { true: "", false: "" },
    },
    compoundVariants: [
      {
        active: true,
        variant: ["panel", "control", "ghost"],
        class:
          "bg-accent-soft-strong border border-accent-soft-border text-accent-text-strong hover:bg-accent-soft-strong",
      },
    ],
    defaultVariants: { variant: "control", size: "lg", active: false },
  }
);

export interface IconTileProps
  extends Omit<React.ComponentProps<"button">, "size">,
    VariantProps<typeof tileVariants> {}

export function IconTile({
  className,
  variant,
  size,
  active,
  ...props
}: IconTileProps) {
  return (
    <button
      type="button"
      className={cn(tileVariants({ variant, size, active }), className)}
      {...props}
    />
  );
}
