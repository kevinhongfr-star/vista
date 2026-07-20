import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendMessage } from "@/lib/feishu/client"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("b2b_score_label", "high_priority")
      .eq("pipeline_stage", "flagged")
      .order("b2b_potential_score", { ascending: false })

    if (error) {
      return NextResponse.json({ alerts: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alerts: data || [] })
  } catch (error) {
    return NextResponse.json({ alerts: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lead_id, chat_id } = body

    if (!lead_id) {
      return NextResponse.json(
        { success: false, error: "lead_id is required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: lead, error } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("id", lead_id)
      .single()

    if (error || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    const chatId = chat_id || process.env.FEISHU_ALERT_CHAT_ID
    if (chatId) {
      const message = `
🔴 B2B Potential Detected

B2C User: ${lead.name || "Unknown"}
Title: ${lead.title || "N/A"} @ ${lead.company || "N/A"} (${lead.company_size || 0} employees)
B2B Score: ${lead.b2b_potential_score || 0}/100
Key Signals: ${Object.entries((lead.b2b_score_breakdown as Record<string, number>) || {})
  .filter(([, v]) => v > 0)
  .map(([k, v]) => `${k}(${v})`)
  .join(", ")}
Suggested Action: Research company needs → Prepare outbound → Offer Diagnostic

[View in VISTA] https://vista-azure-delta.vercel.app/b2c-pipeline/${lead.id}
      `.trim()

      await sendMessage(chatId, message)
    }

    return NextResponse.json({ success: true, notified: !!chatId })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
