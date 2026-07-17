import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { computeB2BScore, determinePipelineStage } from "@/lib/b2c/scoring"

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== process.env.B2C_INGEST_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.b2c_user_id || !body.event_type) {
      return NextResponse.json(
        { success: false, error: "b2c_user_id and event_type are required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: existingLead } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("b2c_user_id", body.b2c_user_id)
      .single()

    const now = new Date().toISOString()

    let leadId: string
    let leadRecord: Record<string, unknown>

    if (existingLead) {
      const updates: Record<string, unknown> = {
        updated_at: now,
        last_event_at: now,
      }

      if (body.email !== undefined) updates.email = body.email
      if (body.name !== undefined) updates.name = body.name
      if (body.linkedin_url !== undefined) updates.linkedin_url = body.linkedin_url
      if (body.title !== undefined) updates.title = body.title
      if (body.company !== undefined) updates.company = body.company
      if (body.company_size !== undefined) updates.company_size = body.company_size
      if (body.industry !== undefined) updates.industry = body.industry
      if (body.location !== undefined) updates.location = body.location
      if (body.current_tier !== undefined) updates.current_tier = body.current_tier
      if (body.total_credits_purchased !== undefined)
        updates.total_credits_purchased = body.total_credits_purchased
      if (body.total_credits_consumed !== undefined)
        updates.total_credits_consumed = body.total_credits_consumed
      if (body.total_spend_cny !== undefined) updates.total_spend_cny = body.total_spend_cny
      if (body.assessments_completed !== undefined)
        updates.assessments_completed = body.assessments_completed
      if (body.coaching_booked !== undefined) updates.coaching_booked = body.coaching_booked
      if (body.linkedin_verified !== undefined) updates.linkedin_verified = body.linkedin_verified

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

      const { data: updated, error: updateError } = await supabase
        .from("vista_b2c_leads")
        .update(updates)
        .eq("id", existingLead.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        )
      }

      leadId = existingLead.id
      leadRecord = updated
    } else {
      const newLead: Record<string, unknown> = {
        b2c_user_id: body.b2c_user_id,
        email: body.email || null,
        name: body.name || null,
        linkedin_url: body.linkedin_url || null,
        title: body.title || null,
        company: body.company || null,
        company_size: body.company_size || null,
        industry: body.industry || null,
        location: body.location || null,
        current_tier: body.current_tier || "free",
        total_credits_purchased: body.total_credits_purchased || 0,
        total_credits_consumed: body.total_credits_consumed || 0,
        total_spend_cny: body.total_spend_cny || 0,
        assessments_completed: body.assessments_completed || [],
        coaching_booked: body.coaching_booked || false,
        linkedin_verified: body.linkedin_verified || false,
        b2c_signup_date: body.signup_date || now,
        last_event_at: now,
        created_at: now,
        updated_at: now,
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
      leadRecord = inserted
    }

    const { error: eventError } = await supabase.from("vista_b2c_events").insert({
      event_id: body.event_id || `ingest_${body.b2c_user_id}_${Date.now()}`,
      event_type: body.event_type,
      b2c_lead_id: leadId,
      b2c_user_id: body.b2c_user_id,
      payload: body,
      event_timestamp: now,
      ingested_at: now,
    })

    if (eventError) {
      return NextResponse.json(
        { success: false, error: eventError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: "ok",
      b2c_lead_id: leadId,
      b2b_score: (leadRecord as any).b2b_potential_score,
      b2b_score_label: (leadRecord as any).b2b_score_label,
      flagged: (leadRecord as any).b2b_score_label === "high_priority",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
