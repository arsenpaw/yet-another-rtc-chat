import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

/**
 * Atrium button — the primary action primitive.
 * Accent / ghost / soft / danger, sized to the design's CTA scale.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        ghost:
          "bg-secondary border border-input text-foreground hover:bg-white/10",
        soft:
          "bg-accent-soft border border-accent-soft-border text-accent-text hover:bg-accent-soft-strong",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
        link: "text-accent-text hover:text-accent-text-strong",
      },
      size: {
        sm: "h-8 rounded-[9px] px-3.5 text-xs",
        md: "h-10 rounded-[10px] px-[18px] text-sm",
        lg: "h-12 rounded-[11px] px-[26px] text-[15px]",
        icon: "size-9 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
