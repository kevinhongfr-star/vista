import { Loader2 } from "lucide-react"

export function PageLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-fuchsia" />
        <p className="text-sm text-muted-foreground">{label}...</p>
      </div>
    </div>
  )
}
