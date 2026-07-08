import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { VistaContact } from "@/lib/types"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const signalId = params.id

    // Get signal details
    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .single()

    if (signalError) {
      return NextResponse.json({ success: false, error: "Signal not found" }, { status: 404 })
    }

    // Get affected contacts
    let affectedContacts: VistaContact[] = []

    if (signal.contact_ids && signal.contact_ids.length > 0) {
      const { data: contacts } = await supabase
        .from("vista_contacts")
        .select("id, name, company, function, vista_composite, pipeline_stage")
        .in("id", signal.contact_ids)
      affectedContacts = (contacts || []) as VistaContact[]
    }

    // Also search by company name
    if (signal.company) {
      const { data: companyContacts } = await supabase
        .from("vista_contacts")
        .select("id, name, company, function, vista_composite, pipeline_stage")
        .ilike("company", `%${signal.company}%`)
      
      const existingIds = new Set(affectedContacts.map(c => c.id))
      for (const c of (companyContacts || [])) {
        if (!existingIds.has(c.id)) {
          affectedContacts.push(c as VistaContact)
        }
      }
    }

    // Get historical signals for same company
    const { data: historicalSignals } = await supabase
      .from("signals")
      .select("id, signal_type, signal_strength, description, created_at")
      .ilike("company", signal.company || "")
      .neq("id", signalId)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      signal,
      affected_contacts: affectedContacts,
      historical_signals: historicalSignals || [],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const signalId = params.id
    const body = await request.json()

    const { data, error } = await supabase
      .from("signals")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", signalId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, signal: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const signalId = params.id

    const { error } = await supabase.from("signals").delete().eq("id", signalId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}