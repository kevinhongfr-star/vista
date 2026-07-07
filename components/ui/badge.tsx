import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Engagement tier variants
        cold: "border-transparent bg-tier-cold text-white",
        warm: "border-transparent bg-tier-warm text-white",
        engaged: "border-transparent bg-tier-engaged text-white",
        hot: "border-transparent bg-tier-hot text-white",
        committed: "border-transparent bg-tier-committed text-white",
        // Encirclement variants
        scout: "border-transparent bg-encirclement-scout text-white",
        patrol: "border-transparent bg-encirclement-patrol text-white",
        encirclement: "border-transparent bg-encirclement-encirclement text-white",
        siege: "border-transparent bg-encirclement-siege text-white",
        occupation: "border-transparent bg-encirclement-occupation text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }