"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToasts } from "@/components/ui/toast"
import { ReportViewer } from "@/components/intelligence/report-viewer"
import type { ReportType } from "@/lib/types"

interface GenerateReportButtonProps {
  reportType: ReportType
  resourceId?: string
  label?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  onComplete?: (report: any) => void
}

export function GenerateReportButton({
  reportType,
  resourceId,
  label,
  variant = "default",
  size = "default",
  onComplete,
}: GenerateReportButtonProps) {
  const { addToast } = useToasts()
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [reportTitle, setReportTitle] = useState("")
  const [reportContent, setReportContent] = useState("")
  const [reportGeneratedAt, setReportGeneratedAt] = useState("")

  const getEndpoint = () => {
    switch (reportType) {
      case "cluster":
        if (!resourceId) return null
        return `/api/intelligence/reports/cluster/${resourceId}`
      case "signal-digest":
        return "/api/intelligence/reports/signal-digest"
      case "pipeline-review":
        return "/api/intelligence/reports/pipeline-review"
      case "executive-brief":
        return "/api/intelligence/dashboard/executive-brief"
      default:
        return null
    }
  }

  const getTitle = (reportData: any): string => {
    switch (reportType) {
      case "cluster":
        return `${reportData.cluster_name} — Intelligence Brief`
      case "signal-digest":
        return `Signal Digest — ${reportData.period}`
      case "pipeline-review":
        return `Pipeline Review — ${reportData.period}`
      case "executive-brief":
        return "Executive Brief"
      default:
        return "Intelligence Report"
    }
  }

  const getContent = (reportData: any): string => {
    switch (reportType) {
      case "cluster":
        return reportData.narrative || ""
      case "signal-digest":
        return reportData.digest_markdown || ""
      case "pipeline-review":
        return reportData.review_markdown || ""
      case "executive-brief":
        return typeof reportData === "string" ? reportData : reportData.brief || ""
      default:
        return ""
    }
  }

  const getGeneratedAt = (reportData: any): string => {
    return reportData.generated_at || new Date().toISOString()
  }

  const handleGenerate = async () => {
    const endpoint = getEndpoint()
    if (!endpoint) {
      addToast("error", "Invalid report configuration")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch(endpoint)
      const data = await res.json()

      if (data.success) {
        const reportData = data.report || data.brief || data
        setReport(reportData)
        setReportTitle(getTitle(reportData))
        setReportContent(getContent(reportData))
        setReportGeneratedAt(getGeneratedAt(reportData))
        setViewerOpen(true)
        addToast("success", "Report generated successfully")
        if (onComplete) {
          onComplete(reportData)
        }
      } else {
        addToast("error", `Report generation failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      addToast("error", `Report generation failed: ${String(error)}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEmailReport = (subject: string, body: string) => {
    addToast("info", "Email composer opening with report...")
    setViewerOpen(false)
  }

  const defaultLabel = () => {
    switch (reportType) {
      case "cluster": return "Generate Brief"
      case "signal-digest": return "Generate Digest"
      case "pipeline-review": return "Generate Review"
      case "executive-brief": return "Generate Brief"
      default: return "Generate Report"
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={isGenerating}
        className={variant === "default" ? "bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white" : ""}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            {label || defaultLabel()}
          </>
        )}
      </Button>

      <ReportViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={reportTitle}
        reportType={reportType}
        content={reportContent}
        generatedAt={reportGeneratedAt}
        onEmailReport={handleEmailReport}
      />
    </>
  )
}
