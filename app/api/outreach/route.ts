import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const contact_id = searchParams.get("contact_id")
    const template_id = searchParams.get("template_id")
    const status = searchParams.get("status")

    let query = supabase
      .from("outreach_assignments")
      .select(`
        *,
        vista_contacts(name, company),
        vista_outreach_templates(name)
      `)
      .order("created_at", { ascending: false })

    if (contact_id) {
      query = query.eq("contact_id", contact_id)
    }
    if (template_id) {
      query = query.eq("template_id", template_id)
    }
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error, count } = await query
      .limit(100)

    if (error) {
      return NextResponse.json({ assignments: [], error: error.message }, { status: 500 })
    }

    const assignments = (data || []).map((item: any) => ({
      ...item,
      contact_name: item.vista_contacts?.name,
      contact_company: item.vista_contacts?.company,
      template_name: item.vista_outreach_templates?.name,
    }))

    return NextResponse.json({
      success: true,
      assignments,
      totalCount: count || assignments.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { contact_ids, contact_id, template_id, sequence_id } = body

    const ids = contact_ids || (contact_id ? [contact_id] : [])

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "contact_ids or contact_id is required" },
        { status: 400 }
      )
    }

    if (!template_id && !sequence_id) {
      return NextResponse.json(
        { success: false, error: "template_id or sequence_id is required" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const assignments = ids.map((cid: string) => ({
      contact_id: cid,
      template_id: template_id || null,
      sequence_id: sequence_id || null,
      status: "Active",
      current_step: 0,
      start_date: now,
      touches_sent: 0,
      touches_total: 1,
      created_at: now,
      updated_at: now,
    }))

    const { data, error } = await supabase
      .from("outreach_assignments")
      .insert(assignments)
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assignments: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id, status, current_step } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (current_step !== undefined) updates.current_step = current_step
    if (status === "Active" && current_step !== undefined) {
      updates.last_touch_date = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("outreach_assignments")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, assignment: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
