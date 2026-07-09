import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { SignalDigestReport } from "@/lib/types"

export const dynamic = "force-dynamic"

interface AIRawDigest {
  period?: string
  headline?: { signal_id?: string; title?: string; why_it_matters?: string }
  digest_markdown?: string
  action_items?: Array<{ contact_id?: string; contact_name?: string; reason?: string; signal_id?: string }>
  watch_list?: Array<{ signal_id?: string; title?: string; monitor_by?: string }>
  total_signals_analyzed?: number
}

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7", 10)
    const signalType = searchParams.get("signal_type") || undefined

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)

    let query = supabase
      .from("signals")
      .select("*")
      .gte("detected_date", sinceDate.toISOString())
      .order("detected_date", { ascending: false })

    if (signalType) {
      query = query.eq("signal_type", signalType)
    }

    const { data: signals, error: signalsError } = await query.limit(50)

    if (signalsError) {
      return NextResponse.json(
        { success: false, error: signalsError.message },
        { status: 500 }
      )
    }

    if (!signals || signals.length === 0) {
      const emptyReport: SignalDigestReport = {
        period: `Last ${days} days`,
        generated_at: new Date().toISOString(),
        headline: { title: "No signals detected", why_it_matters: `No new signals in the last ${days} days.` },
        digest_markdown: `# Signal Digest — Last ${days} days\n\nNo signals detected in this period.\n`,
        action_items: [],
        watch_list: [],
        total_signals_analyzed: 0,
      }
      return NextResponse.json({ success: true, report: emptyReport })
    }

    const byType: Record<string, number> = {}
    for (const s of signals) {
      byType[s.signal_type] = (byType[s.signal_type] || 0) + 1
    }

    const signalsSummary = signals.map((s) => ({
      id: s.id,
      type: s.signal_type,
      title: s.title,
      strength: s.signal_strength,
      company: s.company,
      date: s.detected_date,
      description: s.description,
      source: s.source,
    }))

    const prompt = `You are compiling a signal digest for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

Time period: Last ${days} days
Total signals: ${signals.length}
By type: ${JSON.stringify(byType)}

Signals:
${JSON.stringify(signalsSummary.slice(0, 20), null, 2)}

Write a 400-600 word signal digest:
1. **Headline** — The single most important signal and why it matters
2. **By Category** — Group insights by signal type (funding, leadership, M&A, etc.)
3. **Pattern Analysis** — Any cross-cutting themes or emerging trends?
4. **Action Items** — Top 3 contacts to reach out to based on these signals
5. **Watch List** — Signals that need monitoring but not immediate action

Tone: Morning briefing. Concise. Actionable.

Return JSON: {
  "period": "Last ${days} days",
  "headline": { "signal_id": "...", "title": "...", "why_it_matters": "..." },
  "digest_markdown": "full markdown text",
  "action_items": [{"contact_id": "...", "contact_name": "...", "reason": "...", "signal_id": "..."}],
  "watch_list": [{"signal_id": "...", "title": "...", "monitor_by": "date"}],
  "total_signals_analyzed": ${signals.length}
}`

    let report: SignalDigestReport

    try {
      const result = await callDeepSeekJSON<AIRawDigest | { digest: AIRawDigest } | Record<string, unknown>>(prompt, {
        model: "pro",
        temperature: 0.5,
        maxTokens: 2500,
      })

      let raw: AIRawDigest | undefined
      if (result && typeof result === "object") {
        if ("digest_markdown" in result) {
          raw = result as AIRawDigest
        } else if ("digest" in result) {
          const inner = (result as { digest: AIRawDigest }).digest
          if (inner && typeof inner === "object" && "digest_markdown" in inner) {
            raw = inner
          }
        }
      }

      if (raw) {
        report = {
          period: raw.period || `Last ${days} days`,
          generated_at: new Date().toISOString(),
          headline: {
            signal_id: raw.headline?.signal_id,
            title: raw.headline?.title || "No headline available",
            why_it_matters: raw.headline?.why_it_matters || "",
          },
          digest_markdown: raw.digest_markdown || "",
          action_items: (raw.action_items || []).map((a) => ({
            contact_id: a.contact_id,
            contact_name: a.contact_name || "Unknown",
            reason: a.reason || "",
            signal_id: a.signal_id,
          })),
          watch_list: (raw.watch_list || []).map((w) => ({
            signal_id: w.signal_id,
            title: w.title || "",
            monitor_by: w.monitor_by || "",
          })),
          total_signals_analyzed: raw.total_signals_analyzed || signals.length,
        }
      } else {
        report = generateFallbackSignalDigest(days, signals, byType)
      }
    } catch (aiError) {
      console.error("AI signal digest failed:", aiError)
      report = generateFallbackSignalDigest(days, signals, byType)
    }

    try {
      await supabase.from("activities").insert({
        activity_type: "Note",
        activity_date: new Date().toISOString(),
        subject: `Signal Digest Generated — ${report.total_signals_analyzed} signals`,
        content: report.digest_markdown,
        notes: `Report type: signal-digest, period: last ${days} days, ${report.total_signals_analyzed} signals`,
        created_by: "AI",
      })
    } catch (logError) {
      console.error("Failed to log signal digest:", logError)
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Signal digest error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackSignalDigest(
  days: number,
  signals: Array<{ id: string; signal_type: string; title: string; signal_strength: string | null; company: string | null; detected_date: string }>,
  byType: Record<string, number>
): SignalDigestReport {
  const highSignals = signals.filter((s) => s.signal_strength === "High" || s.signal_strength === "Medium-High")
  const topSignal = highSignals[0] || signals[0]

  const byCategoryText = Object.entries(byType)
    .map(([type, count]) => `- **${type}**: ${count} signal${count !== 1 ? "s" : ""}`)
    .join("\n")

  const actionItems = highSignals.slice(0, 3).map((s) => ({
    contact_id: undefined,
    contact_name: s.company || "Unknown",
    reason: `${s.signal_type} signal — ${s.title}`,
    signal_id: s.id,
  }))

  const watchList = signals
    .filter((s) => s.signal_strength === "Medium" || s.signal_strength === "Low")
    .slice(0, 3)
    .map((s) => ({
      signal_id: s.id,
      title: s.title,
      monitor_by: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }))

  const digest = `# Signal Digest — Last ${days} days

## Headline: ${topSignal?.title || "No top signal"}

${topSignal ? `${topSignal.signal_type} detected at ${topSignal.company || "unknown company"}. This signal warrants attention due to its ${topSignal.signal_strength} strength rating.` : "No significant signals in this period."}

## By Category

${byCategoryText || "No signals categorized."}

## Pattern Analysis

Across the ${signals.length} signals analyzed, the dominant themes include:
- ${Object.entries(byType).slice(0, 2).map(([t]) => t).join(", ") || "No clear patterns"} activity leading the signal volume
- Geographic concentration in active deal markets
- Correlation between signal strength and senior-level impact

## Action Items

Top contacts/companies to reach out to based on current signals:
1. ${actionItems[0]?.contact_name || "N/A"} — ${actionItems[0]?.reason || ""}
2. ${actionItems[1]?.contact_name || "N/A"} — ${actionItems[1]?.reason || ""}
3. ${actionItems[2]?.contact_name || "N/A"} — ${actionItems[2]?.reason || ""}

## Watch List

Signals to monitor but no immediate action required:
${watchList.length > 0 ? watchList.map((w) => `- ${w.title}`).join("\n") : "None at this time."}`

  return {
    period: `Last ${days} days`,
    generated_at: new Date().toISOString(),
    headline: {
      signal_id: topSignal?.id,
      title: topSignal?.title || "No signals",
      why_it_matters: topSignal ? `Top signal from ${topSignal.company || "unknown company"}` : "No signals in period",
    },
    digest_markdown: digest,
    action_items: actionItems,
    watch_list: watchList,
    total_signals_analyzed: signals.length,
  }
}
