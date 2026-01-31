import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "rounded-md border-transparent bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold",
        secondary: "rounded-md border-transparent bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-bold",
        destructive: "rounded-md border-transparent bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-bold",
        outline: "rounded-md text-foreground border px-2 py-0.5 text-xs font-bold",
        // Chip variants - pill shaped with consistent sizing
        input: "rounded-full border border-border bg-background text-foreground/70 px-3 py-1",
        choice: "rounded-full border border-border bg-background text-foreground font-semibold px-3 py-1",
        filter: "rounded-full border border-border bg-background text-foreground/70 px-3 py-1",
        action: "rounded-full border border-border bg-background text-foreground/70 px-3 py-1",
        // Status variants
        warm: "rounded-full bg-amber-50 text-amber-700 px-3 py-1",
        neutral: "rounded-md bg-muted text-foreground/80 px-2 py-0.5 text-xs font-bold",
        accent: "rounded-full bg-blue-50 text-blue-600 px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
}

function Badge({ className, variant, onRemove, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
      {variant === "input" && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-foreground transition-colors"
          aria-label="Remove"
        >
          <X className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
