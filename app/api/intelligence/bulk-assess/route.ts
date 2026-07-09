import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"

interface BulkAssessRequest {
  scope: "all" | "filter" | "cluster" | "ids"
  filter?: { industry?: string; seniority?: string; pipeline_stage?: string }
  cluster_id?: string
  contact_ids?: string[]
  assessment_type?: "full" | "score_only" | "recommendations_only"
}

interface ScoredContact {
  id: string
  scores: { v: number; i: number; s: number; t: number; a: number }
  composite: number
  rationale: string
  recommended_action: string
}

const BATCH_SIZE = 10
const MAX_CONCURRENT_BATCHES = 5
const MAX_CONTACTS = 500

export async function POST(request: Request) {
  const startTime = Date.now()
  let assessed = 0
  let updated = 0
  let errors = 0

  try {
    const body: BulkAssessRequest = await request.json()
    const supabase = createServerClient()
    const assessmentType = body.assessment_type || "full"

    let query = supabase
      .from("vista_contacts")
      .select(`
        id, name, company, role, seniority, function, industry,
        vista_v, vista_i, vista_s, vista_t, vista_a, vista_composite,
        priority_score, pipeline_stage, engagement_tier, last_touch_date,
        last_engagement_date, density_cluster_id
      `)
      .neq("status", "Archived")
      .limit(MAX_CONTACTS)

    switch (body.scope) {
      case "all":
        break
      case "filter":
        if (body.filter?.industry) {
          query = query.ilike("industry", `%${body.filter.industry}%`)
        }
        if (body.filter?.seniority) {
          query = query.eq("seniority", body.filter.seniority)
        }
        if (body.filter?.pipeline_stage) {
          query = query.eq("pipeline_stage", body.filter.pipeline_stage)
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
        assessed: 0,
        updated: 0,
        total: 0,
        errors: 0,
        duration_ms: Date.now() - startTime,
      })
    }

    const totalContacts = contacts.length

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const contactIds = contacts.map((c) => c.id)
    const { data: recentSignals } = await supabase
      .from("signals")
      .select("id, signal_type, title, content, company, detected_date, contact_ids")
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(100)

    const getSignalsForContact = (contactId: string) => {
      return (recentSignals || [])
        .filter((s) => s.contact_ids?.includes(contactId))
        .slice(0, 3)
        .map((s) => ({
          type: s.signal_type,
          title: s.title,
          content: s.content?.slice(0, 200),
          date: s.detected_date,
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
        current_scores: {
          v: contact.vista_v || 0,
          i: contact.vista_i || 0,
          s: contact.vista_s || 0,
          t: contact.vista_t || 0,
          a: contact.vista_a || 0,
          composite: contact.vista_composite || 0,
        },
        pipeline_stage: contact.pipeline_stage,
        engagement_tier: contact.engagement_tier,
        recent_signals: getSignalsForContact(contact.id),
      }))

      const prompt = `You are a BD scoring engine. Score each contact on V/I/S/T/A dimensions (0-30 each).

Scoring criteria:
- V (Value): Company size, revenue, industry tier, strategic fit. Larger/more strategic = higher.
- I (Intensity): Signal frequency, engagement momentum, response rate. More active = higher.
- S (Strategic): Seniority level, decision-making power, network position. C-suite = higher.
- T (Timing): Recent triggers (funding, hiring, expansion), urgency signals. Recent trigger = higher.
- E (Ecosystem/A): Cluster membership, referral proximity, event overlap. More connected = higher.

Composite = sum of all 5 scores (max 150). Scale composite to 0-100 range by multiplying by 2/3.

Contacts to score:
${JSON.stringify(batchContactData, null, 2)}

Output ONLY a valid JSON array with this exact structure:
[
  {
    "id": "contact_uuid",
    "scores": { "v": 22, "i": 18, "s": 25, "t": 15, "a": 20 },
    "composite": 100,
    "rationale": "One sentence explaining the score",
    "recommended_action": "Specific next action"
  }
]

Score ALL contacts in the input. Return exactly ${batch.length} items.`

      try {
        const rawResults = await callDeepSeekJSON<ScoredContact[] | { scores: ScoredContact[] } | Record<string, unknown>>(prompt, {
          model: "flash",
          temperature: 0.3,
          maxTokens: 2048,
        })

        let results: ScoredContact[] = []
        if (Array.isArray(rawResults)) {
          results = rawResults
        } else if (rawResults && typeof rawResults === 'object') {
          const obj = rawResults as Record<string, unknown>
          if (Array.isArray(obj.scores)) results = obj.scores as ScoredContact[]
          else if (Array.isArray(obj.results)) results = obj.results as ScoredContact[]
          else if (Array.isArray(obj.contacts)) results = obj.contacts as ScoredContact[]
        }

        const resultsMap = new Map<string, ScoredContact>()
        for (const r of results) {
          if (r && r.id) {
            resultsMap.set(r.id, r)
          }
        }

        for (const contact of batch) {
          const result = resultsMap.get(contact.id)
          if (!result) {
            errors++
            continue
          }

          assessed++

          const scaledComposite = Math.min(
            100,
            Math.round((result.composite / 150) * 100)
          )

          if (assessmentType === "full" || assessmentType === "score_only") {
            const { error: updateError } = await supabase
              .from("vista_contacts")
              .update({
                vista_v: result.scores.v,
                vista_i: result.scores.i,
                vista_s: result.scores.s,
                vista_t: result.scores.t,
                vista_a: result.scores.a,
                vista_composite: scaledComposite,
                priority_score: scaledComposite,
                last_score_update: new Date().toISOString(),
              })
              .eq("id", contact.id)

            if (updateError) {
              errors++
              continue
            }
            updated++
          }

          if (assessmentType === "full" || assessmentType === "recommendations_only") {
            if (result.rationale) {
              try {
                await supabase.from("strategic_notes").insert({
                  contact_id: contact.id,
                  note_type: "AI Assessment",
                  title: `AI Score: ${scaledComposite}/100`,
                  content: `${result.rationale}\n\nRecommended action: ${result.recommended_action}`,
                  category: "Insight",
                  priority: Math.round(scaledComposite / 20),
                  created_by: "deepseek-ai",
                })
              } catch {
                // Non-critical, just continue
              }
            }
          }
        }
      } catch (batchError) {
        console.error("Batch processing error:", batchError)
        errors += batch.length
      }
    }

    for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
      const batchChunk = batches.slice(i, i + MAX_CONCURRENT_BATCHES)
      await Promise.all(batchChunk.map(processBatch))
    }

    return NextResponse.json({
      success: true,
      assessed,
      updated,
      errors,
      total: totalContacts,
      duration_ms: Date.now() - startTime,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        assessed,
        updated,
        errors,
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
