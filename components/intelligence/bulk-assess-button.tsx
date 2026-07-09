"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Zap, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToasts } from "@/components/ui/toast"

interface BulkAssessButtonProps {
  onComplete?: () => void
}

type ScopeOption = "all" | "cluster" | "ids"
type AssessmentType = "full" | "score_only" | "recommendations_only"

export function BulkAssessButton({ onComplete }: BulkAssessButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [scope, setScope] = useState<ScopeOption>("all")
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("full")
  const [result, setResult] = useState<{
    assessed: number
    updated: number
    errors: number
    total: number
    duration_ms: number
  } | null>(null)
  const { addToast } = useToasts()

  const handleStart = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const body: Record<string, unknown> = {
        scope,
        assessment_type: assessmentType,
      }

      const response = await fetch("/api/intelligence/bulk-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          assessed: data.assessed,
          updated: data.updated,
          errors: data.errors,
          total: data.total,
          duration_ms: data.duration_ms,
        })
        addToast(
          "success",
          `Bulk assessment complete: ${data.updated} contacts updated`
        )
        onComplete?.()
      } else {
        addToast("error", `Bulk assessment failed: ${data.error}`)
      }
    } catch (error) {
      addToast("error", `Bulk assessment failed: ${String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleClose = () => {
    if (isRunning) return
    setIsOpen(false)
    setResult(null)
  }

  const progress = result
    ? 100
    : isRunning
    ? 50
    : 0

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-accent-fuchsia to-purple-600 hover:from-accent-fuchsia/90 hover:to-purple-700 text-white"
      >
        <Zap className="h-4 w-4 mr-2" />
        Run Bulk Assessment
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-fuchsia" />
              Bulk AI Assessment
            </DialogTitle>
            <DialogDescription>
              Use AI to score and assess contacts in bulk. Results are written directly to the database.
            </DialogDescription>
          </DialogHeader>

          {!isRunning && !result && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select
                  value={scope}
                  onValueChange={(v) => setScope(v as ScopeOption)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="cluster">By Cluster</SelectItem>
                    <SelectItem value="ids">Selected IDs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select
                  value={assessmentType}
                  onValueChange={(v) => setAssessmentType(v as AssessmentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full (Scores + Recommendations)</SelectItem>
                    <SelectItem value="score_only">Score Only</SelectItem>
                    <SelectItem value="recommendations_only">Recommendations Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p>⚠️ This will call the DeepSeek AI API and may take a few minutes.</p>
                <p>Processing rate: ~10 contacts per batch, 5 concurrent batches.</p>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="space-y-4 py-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-accent-fuchsia animate-spin" />
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Assessing contacts with AI...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{result.assessed}</p>
                  <p className="text-xs text-muted-foreground">Assessed</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{result.updated}</p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-500">{result.errors}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">
                    {Math.round(result.duration_ms / 1000)}s
                  </p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>

              {result.errors > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    {result.errors} contacts had errors during assessment. They were skipped.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {result ? (
              <Button onClick={handleClose}>
                Done
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isRunning}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Assessment
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
