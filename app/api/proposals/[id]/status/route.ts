import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["sent", "declined"],
  sent: ["accepted", "declined"],
  accepted: ["in_progress", "declined"],
  "in_progress": ["completed", "declined"],
  completed: [],
  declined: [],
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { status: newStatus } = body

    const { data: proposal, error: fetchError } = await supabase
      .from("vista_proposals")
      .select("status")
      .eq("id", params.id)
      .single()

    if (fetchError || !proposal) {
      return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 })
    }

    const currentStatus = proposal.status
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status transition: ${currentStatus} → ${newStatus}`,
        allowed_transitions: allowedTransitions,
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("vista_proposals")
      .update({ status: newStatus })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, proposal: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
