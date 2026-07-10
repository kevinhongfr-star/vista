import * as React from "react"
import { cn } from "@/lib/utils"

interface VistaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  borderLeftColor?: "fuchsia" | "teal" | "ocean" | "slate" | "success" | "warning" | "error"
  hoverable?: boolean
  children: React.ReactNode
}

const borderColorMap: Record<string, string> = {
  fuchsia: "border-l-[3px] border-l-accent",
  teal: "border-l-[3px] border-l-teal",
  ocean: "border-l-[3px] border-l-ocean",
  slate: "border-l-[3px] border-l-slate",
  success: "border-l-[3px] border-l-success",
  warning: "border-l-[3px] border-l-warning",
  error: "border-l-[3px] border-l-error",
}

export function VistaCard({ 
  className, 
  borderLeftColor, 
  hoverable = true,
  children, 
  ...props 
}: VistaCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6",
        borderLeftColor && borderColorMap[borderLeftColor],
        hoverable && "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function VistaCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
  )
}

export function VistaCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-bold font-heading tracking-tight text-primary",
        className
      )}
      {...props}
    />
  )
}

export function VistaCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export function VistaCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}
