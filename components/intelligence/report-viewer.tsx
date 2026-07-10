"use client"

import { useState } from "react"
import { X, Copy, FileText, Mail, Edit3, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToasts, Toaster } from "@/components/ui/toast"
import { simpleMarkdownToHtml, copyToClipboard } from "@/lib/markdown"
import type { ReportType } from "@/lib/types"

interface ReportViewerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  reportType: ReportType
  content: string
  generatedAt?: string
  onEmailReport?: (subject: string, body: string) => void
}

export function ReportViewer({
  isOpen,
  onClose,
  title,
  reportType,
  content,
  generatedAt,
  onEmailReport,
}: ReportViewerProps) {
  const { toasts, addToast, dismissToast } = useToasts()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const activeContent = isEditing ? editContent : content

  const handleCopy = async () => {
    try {
      await copyToClipboard(activeContent)
      setCopied(true)
      addToast("success", "Report copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast("error", "Failed to copy report")
    }
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        addToast("error", "Please allow pop-ups to export PDF")
        return
      }

      const htmlContent = simpleMarkdownToHtml(activeContent)
      const reportDate = generatedAt
        ? new Date(generatedAt).toLocaleString()
        : new Date().toLocaleString()

      printWindow.document.write(`
        <html>
          <head>
            <title>${title} — LYC Intelligence</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
              * { box-sizing: border-box; }
              body {
                font-family: 'Inter', sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                line-height: 1.6;
                color: #1C1C1E;
              }
              h1 { color: #1C1C1E; font-size: 28px; font-weight: 700; margin-top: 0; border-bottom: 2px solid #C108AB; padding-bottom: 12px; }
              h2 { color: #C108AB; font-size: 20px; font-weight: 700; margin-top: 28px; margin-bottom: 12px; }
              h3 { color: #1C1C1E; font-size: 16px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
              p { margin: 12px 0; }
              ul, ol { margin: 12px 0; padding-left: 24px; }
              li { margin: 6px 0; }
              strong { color: #1C1C1E; font-weight: 600; }
              code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
              .metadata {
                color: #666;
                font-size: 13px;
                margin-bottom: 24px;
                display: flex;
                gap: 16px;
                align-items: center;
              }
              .badge {
                display: inline-block;
                padding: 3px 10px;
                background: #C108AB15;
                color: #C108AB;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 600;
                text-transform: capitalize;
              }
              .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .logo {
                font-weight: 700;
                font-size: 14px;
                color: #666;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">LYC Partners — Intelligence</div>
              <span class="badge">${reportType.replace(/-/g, " ")}</span>
            </div>
            <h1>${title}</h1>
            <div class="metadata">
              <span>Generated: ${reportDate}</span>
            </div>
            <div class="content">
              ${htmlContent}
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        setIsExporting(false)
      }, 500)
    } catch (error) {
      setIsExporting(false)
      addToast("error", `PDF export failed: ${String(error)}`)
    }
  }

  const handleEmail = () => {
    if (onEmailReport) {
      onEmailReport(`[LYC Intelligence] ${title}`, activeContent)
    }
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    addToast("success", "Edits saved")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-none shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent-fuchsia/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-accent-fuchsia" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              {generatedAt && (
                <p className="text-xs text-muted-foreground">
                  Generated {new Date(generatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleSaveEdit()
                } else {
                  setEditContent(content)
                  setIsEditing(true)
                }
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Done" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
            {onEmailReport && (
              <Button
                size="sm"
                onClick={handleEmail}
                className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full min-h-[400px] p-4 border rounded-none font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-fuchsia/30"
            />
          ) : (
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(activeContent) }}
            />
          )}
        </div>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
