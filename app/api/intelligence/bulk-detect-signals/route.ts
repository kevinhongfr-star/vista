import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"

interface BulkDetectSignalsRequest {
  scope: "all" | "recent" | "cluster" | "ids"
  days_back?: number
  cluster_id?: string
  contact_ids?: string[]
}

interface DetectedSignal {
  contact_id: string
  signal_type: string
  title: string
  content: string
  impact: "low" | "medium" | "high"
  recommended_action: string
  urgency: string
}

const BATCH_SIZE = 10
const MAX_CONCURRENT_BATCHES = 5
const MAX_CONTACTS = 500
const DEFAULT_DAYS_BACK = 7

export async function POST(request: Request) {
  const startTime = Date.now()
  let signalsDetected = 0
  let contactsScanned = 0
  let errors = 0

  try {
    const body: BulkDetectSignalsRequest = await request.json()
    const supabase = createServerClient()
    const daysBack = body.days_back || DEFAULT_DAYS_BACK

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - daysBack)

    let query = supabase
      .from("vista_contacts")
      .select(`
        id, name, company, role, seniority, function, industry,
        last_touch_date, last_engagement_date, engagement_tier,
        pipeline_stage, density_cluster_id
      `)
      .neq("status", "Archived")
      .limit(MAX_CONTACTS)

    switch (body.scope) {
      case "all":
      case "recent":
        if (body.scope === "recent") {
          query = query.or(
            `last_touch_date.gte.${sinceDate.toISOString()},last_engagement_date.gte.${sinceDate.toISOString()}`
          )
        }
        break
      case "cluster":
        if (!body.cluster_id) {
          return NextResponse.json(
            { success: false, error: "cluster_id required for scope 'cluster'" },
            { status: 400 }
          )
        }
        query = query.eq("density_cluster_id", body.cluster_id)
        break
      case "ids":
        if (!body.contact_ids || body.contact_ids.length === 0) {
          return NextResponse.json(
            { success: false, error: "contact_ids required for scope 'ids'" },
            { status: 400 }
          )
        }
        query = query.in("id", body.contact_ids)
        break
      default:
        return NextResponse.json(
          { success: false, error: "Invalid scope" },
          { status: 400 }
        )
    }

    const { data: contacts, error: fetchError } = await query
      .order("priority_score", { ascending: false })

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        success: true,
        signals_detected: 0,
        contacts_scanned: 0,
        total: 0,
        errors: 0,
        duration_ms: Date.now() - startTime,
      })
    }

    const totalContacts = contacts.length

    const contactIds = contacts.map((c) => c.id)
    const { data: existingSignals } = await supabase
      .from("signals")
      .select("id, signal_type, contact_ids, company, detected_date")
      .gte("detected_date", sinceDate.toISOString())

    const existingSignalKeys = new Set<string>()
    for (const s of existingSignals || []) {
      if (s.contact_ids) {
        for (const cid of s.contact_ids) {
          existingSignalKeys.add(`${cid}-${s.signal_type}`)
        }
      }
    }

    const { data: recentActivities } = await supabase
      .from("activities")
      .select("id, contact_id, activity_type, activity_date, subject, outcome")
      .gte("activity_date", sinceDate.toISOString())
      .in("contact_id", contactIds)
      .order("activity_date", { ascending: false })
      .limit(200)

    const getActivitiesForContact = (contactId: string) => {
      return (recentActivities || [])
        .filter((a) => a.contact_id === contactId)
        .slice(0, 5)
        .map((a) => ({
          type: a.activity_type,
          date: a.activity_date,
          subject: a.subject,
          outcome: a.outcome,
        }))
    }

    const batches: Array<typeof contacts> = []
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      batches.push(contacts.slice(i, i + BATCH_SIZE))
    }

    const processBatch = async (batch: typeof contacts) => {
      const batchContactData = batch.map((contact) => ({
        id: contact.id,
        name: contact.name,
        company: contact.company,
        role: contact.role,
        seniority: contact.seniority,
        function: contact.function,
        industry: contact.industry,
        engagement_tier: contact.engagement_tier,
        pipeline_stage: contact.pipeline_stage,
        last_touch_date: contact.last_touch_date,
        last_engagement_date: contact.last_engagement_date,
        recent_activities: getActivitiesForContact(contact.id),
      }))

      const prompt = `You are a signal detection engine. For each contact, analyze their recent activity and context to identify new signals.

IMPORTANT: Only detect signals you are confident about based on actual data provided. Do NOT fabricate or invent signals. If no signal is detected for a contact, omit them from the output.

Signal types:
- funding: Company raised capital
- job_change: Person changed role/company
- expansion: Company entering new market/hiring
- engagement_shift: Change in response patterns
- market_event: Industry shift affecting the contact
- partnership: New partnership or integration announced

Contacts and recent activity:
${JSON.stringify(batchContactData, null, 2)}

Output ONLY a valid JSON array (only include contacts where a signal IS detected):
[
  {
    "contact_id": "uuid",
    "signal_type": "funding",
    "title": "Company raised $50M Series B",
    "content": "Their company announced Series B funding led by Sequoia",
    "impact": "high",
    "recommended_action": "Reach out with congratulations + schedule call",
    "urgency": "This week"
  }
]

If no signals are detected, output an empty array: []`

      try {
        const rawResults = await callDeepSeekJSON<DetectedSignal[] | { signals: DetectedSignal[] } | Record<string, unknown>>(prompt, {
          model: "flash",
          temperature: 0.2,
          maxTokens: 2048,
        })

        let results: DetectedSignal[] = []
        if (Array.isArray(rawResults)) {
          results = rawResults
        } else if (rawResults && typeof rawResults === 'object') {
          const obj = rawResults as Record<string, unknown>
          if (Array.isArray(obj.signals)) results = obj.signals as DetectedSignal[]
          else if (Array.isArray(obj.results)) results = obj.results as DetectedSignal[]
          else if (Array.isArray(obj.detected)) results = obj.detected as DetectedSignal[]
        }

        for (const signal of results) {
          if (!signal || !signal.contact_id || !signal.signal_type) {
            continue
          }
          const signalKey = `${signal.contact_id}-${signal.signal_type}`
          if (existingSignalKeys.has(signalKey)) {
            continue
          }

          try {
            const signalStrength =
              signal.impact === "high"
                ? "High"
                : signal.impact === "medium"
                ? "Medium-High"
                : "Medium"

            const contact = batch.find((c) => c.id === signal.contact_id)

            await supabase.from("signals").insert({
              signal_type: signal.signal_type,
              title: signal.title,
              content: signal.content,
              company: contact?.company || null,
              signal_strength: signalStrength,
              status: "New",
              detected_date: new Date().toISOString(),
              contact_ids: [signal.contact_id],
              impact_assessment: signal.impact,
              recommended_action: signal.recommended_action,
              source: "ai-detected",
            })

            signalsDetected++
            existingSignalKeys.add(signalKey)
          } catch {
            errors++
          }
        }
      } catch (batchError) {
        console.error("Batch signal detection error:", batchError)
        errors += batch.length
      } finally {
        contactsScanned += batch.length
      }
    }

    for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
      const batchChunk = batches.slice(i, i + MAX_CONCURRENT_BATCHES)
      await Promise.all(batchChunk.map(processBatch))
    }

    return NextResponse.json({
      success: true,
      signals_detected: signalsDetected,
      contacts_scanned: contactsScanned,
      total: totalContacts,
      errors,
      duration_ms: Date.now() - startTime,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        signals_detected: signalsDetected,
        contacts_scanned: contactsScanned,
        errors,
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
