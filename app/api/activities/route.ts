import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { Activity, CreateActivityRequest, ACTIVITY_TYPES, PIPELINE_STAGES } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const contactId = searchParams.get("contact_id")
    const activityType = searchParams.get("activity_type")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("activities")
      .select("*, vista_contacts(name, company)")
      .order("activity_date", { ascending: false })
      .range(offset, offset + limit - 1)

    if (contactId) {
      query = query.eq("contact_id", contactId)
    }
    if (activityType) {
      query = query.eq("activity_type", activityType)
    }
    if (startDate) {
      query = query.gte("activity_date", startDate)
    }
    if (endDate) {
      query = query.lte("activity_date", endDate)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      activities: data || [],
      total: count || data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: CreateActivityRequest = await request.json()

    // Validate required fields
    if (!body.contact_id || !body.activity_type) {
      return NextResponse.json(
        { success: false, error: "contact_id and activity_type are required" },
        { status: 400 }
      )
    }

    // Insert activity
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        contact_id: body.contact_id,
        campaign_id: body.campaign_id,
        program_id: body.program_id,
        activity_type: body.activity_type,
        activity_date: body.activity_date || new Date().toISOString(),
        subject: body.subject,
        content: body.content,
        outcome: body.outcome,
        duration_minutes: body.duration_minutes,
        notes: body.notes,
        created_by: "Kevin",
      })
      .select()
      .single()

    if (activityError) {
      return NextResponse.json({ success: false, error: activityError.message }, { status: 500 })
    }

    // Update contact based on activity type
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Get current pipeline stage
    const { data: contact } = await supabase
      .from("vista_contacts")
      .select("pipeline_stage")
      .eq("id", body.contact_id)
      .single()

    const currentStage = contact?.pipeline_stage || "Prospect"

    // Determine updates based on activity type
    switch (body.activity_type) {
      case "Email Sent":
        updates.last_email_sent_date = new Date().toISOString()
        updates.last_contact_date = new Date().toISOString()
        if (currentStage === "Prospect") {
          updates.pipeline_stage = "Contacted"
        }
        break
      case "Email Opened":
        updates.last_email_opened_date = new Date().toISOString()
        if (currentStage === "Contacted") {
          updates.pipeline_stage = "Engaged"
        }
        break
      case "Email Replied":
        updates.last_contact_date = new Date().toISOString()
        if (currentStage === "Contacted" || currentStage === "Engaged") {
          updates.pipeline_stage = "Engaged"
        }
        break
      case "Call":
        updates.last_contact_date = new Date().toISOString()
        break
      case "Meeting":
        updates.last_meeting_date = new Date().toISOString()
        updates.last_contact_date = new Date().toISOString()
        if (["Prospect", "Contacted", "Engaged"].includes(currentStage)) {
          updates.pipeline_stage = "Meeting Booked"
        }
        break
      default:
        updates.last_contact_date = new Date().toISOString()
    }

    // Update contact
    await supabase
      .from("vista_contacts")
      .update(updates)
      .eq("id", body.contact_id)

    // Log pipeline history if stage changed
    if (updates.pipeline_stage && updates.pipeline_stage !== currentStage) {
      await supabase.from("pipeline_history").insert({
        contact_id: body.contact_id,
        from_stage: currentStage,
        to_stage: updates.pipeline_stage as string,
        changed_by: "Kevin",
        reason: body.notes || `${body.activity_type} activity`,
      })
    }

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}