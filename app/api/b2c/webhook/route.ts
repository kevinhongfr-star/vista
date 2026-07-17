import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { computeB2BScore, determinePipelineStage } from "@/lib/b2c/scoring"
import crypto from "crypto"

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

export async function POST(request: Request) {
  try {
    const payloadText = await request.text()
    const signature = request.headers.get("x-webhook-signature")

    if (!verifyWebhookSignature(payloadText, signature, process.env.B2C_WEBHOOK_SECRET || "")) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      )
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(payloadText)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      )
    }

    const eventId = body.event_id as string
    const b2cUserId = body.b2c_user_id as string
    const eventType = body.event_type as string

    if (!eventId || !b2cUserId || !eventType) {
      return NextResponse.json(
        { success: false, error: "event_id, b2c_user_id, and event_type are required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: existingEvent } = await supabase
      .from("vista_b2c_events")
      .select("id")
      .eq("event_id", eventId)
      .single()

    if (existingEvent) {
      return NextResponse.json({ status: "ok", message: "already processed" })
    }

    const { data: existingLead } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("b2c_user_id", b2cUserId)
      .single()

    const now = new Date().toISOString()
    let leadId: string
    let scoreBefore = 0

    if (existingLead) {
      leadId = existingLead.id
      scoreBefore = existingLead.b2b_potential_score || 0

      const updates: Record<string, unknown> = {
        updated_at: now,
        last_event_at: now,
      }

      switch (eventType) {
        case "user.signup":
          if (body.email) updates.email = body.email
          if (body.name) updates.name = body.name
          if (body.linkedin_url) updates.linkedin_url = body.linkedin_url
          if (body.title) updates.title = body.title
          if (body.company) updates.company = body.company
          break
        case "purchase.credit_pack":
          updates.total_credits_purchased =
            (existingLead.total_credits_purchased || 0) +
            ((body.payload as any)?.credits || 0)
          updates.total_spend_cny =
            (existingLead.total_spend_cny || 0) +
            ((body.payload as any)?.amount_cny || 0)
          break
        case "purchase.subscription":
          if ((body.payload as any)?.tier) {
            updates.current_tier = (body.payload as any).tier
          }
          updates.total_credits_purchased =
            (existingLead.total_credits_purchased || 0) +
            ((body.payload as any)?.credits || 0)
          break
        case "assessment.completed":
          {
            const existing = (existingLead.assessments_completed as string[]) || []
            const newAssessment = (body.payload as any)?.assessment_name as string
            if (newAssessment && !existing.includes(newAssessment)) {
              updates.assessments_completed = [...existing, newAssessment]
            }
          }
          break
        case "tier.upgrade":
          if ((body.payload as any)?.new_tier) {
            updates.current_tier = (body.payload as any).new_tier
          }
          break
        case "coaching.booked":
          updates.coaching_booked = true
          break
        case "linkedin.verified":
          updates.linkedin_verified = true
          if ((body.payload as any)?.linkedin_url) {
            updates.linkedin_url = (body.payload as any).linkedin_url
          }
          break
      }

      const mergedLead = { ...existingLead, ...updates }
      const { score, breakdown, label } = computeB2BScore(mergedLead as any)
      const newStage = determinePipelineStage(score, label, existingLead.pipeline_stage)

      const existingHistory = (existingLead.b2b_score_history as any[]) || []
      const newHistory = [
        ...existingHistory,
        { date: now, score, label, breakdown },
      ].slice(-50)

      updates.b2b_potential_score = score
      updates.b2b_score_label = label
      updates.b2b_score_breakdown = breakdown
      updates.b2b_score_history = newHistory
      updates.pipeline_stage = newStage

      const { error: updateError } = await supabase
        .from("vista_b2c_leads")
        .update(updates)
        .eq("id", leadId)

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }
    } else {
      const newLead: Record<string, unknown> = {
        b2c_user_id: b2cUserId,
        email: (body.payload as any)?.email || null,
        name: (body.payload as any)?.name || null,
        linkedin_url: (body.payload as any)?.linkedin_url || null,
        title: (body.payload as any)?.title || null,
        company: (body.payload as any)?.company || null,
        company_size: (body.payload as any)?.company_size || null,
        industry: (body.payload as any)?.industry || null,
        location: (body.payload as any)?.location || null,
        current_tier: (body.payload as any)?.current_tier || "free",
        total_credits_purchased: 0,
        total_credits_consumed: 0,
        total_spend_cny: 0,
        assessments_completed: [],
        coaching_booked: false,
        linkedin_verified: false,
        b2c_signup_date: now,
        last_event_at: now,
        created_at: now,
        updated_at: now,
      }

      if (eventType === "user.signup") {
        newLead.email = (body.payload as any)?.email || null
        newLead.name = (body.payload as any)?.name || null
        newLead.linkedin_url = (body.payload as any)?.linkedin_url || null
        newLead.title = (body.payload as any)?.title || null
        newLead.company = (body.payload as any)?.company || null
      }

      const { score, breakdown, label } = computeB2BScore(newLead as any)
      const newStage = determinePipelineStage(score, label)

      newLead.b2b_potential_score = score
      newLead.b2b_score_label = label
      newLead.b2b_score_breakdown = breakdown
      newLead.b2b_score_history = [{ date: now, score, label, breakdown }]
      newLead.pipeline_stage = newStage

      const { data: inserted, error: insertError } = await supabase
        .from("vista_b2c_leads")
        .insert(newLead)
        .select()
        .single()

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        )
      }

      leadId = inserted.id
    }

    const { score: scoreAfter } = computeB2BScore(
      (await supabase.from("vista_b2c_leads").select("*").eq("id", leadId).single()).data as any
    )

    const { error: eventError } = await supabase.from("vista_b2c_events").insert({
      event_id: eventId,
      event_type: eventType,
      b2c_lead_id: leadId,
      b2c_user_id: b2cUserId,
      payload: body.payload || body,
      score_before: scoreBefore,
      score_after: scoreAfter,
      score_delta: scoreAfter - scoreBefore,
      event_timestamp: (body.timestamp as string) || now,
      ingested_at: now,
    })

    if (eventError) {
      return NextResponse.json(
        { success: false, error: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: "processed",
      event_id: eventId,
      b2c_lead_id: leadId,
      b2b_score: scoreAfter,
      score_delta: scoreAfter - scoreBefore,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
