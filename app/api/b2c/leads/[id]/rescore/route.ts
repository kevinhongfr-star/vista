import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { computeB2BScore, determinePipelineStage } from "@/lib/b2c/scoring"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: lead, error: leadError } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("id", id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    const { score, breakdown, label } = computeB2BScore(lead)
    const newStage = determinePipelineStage(score, label, lead.pipeline_stage)

    const historyEntry = {
      date: new Date().toISOString(),
      score,
      label,
      breakdown,
    }

    const existingHistory = (lead.b2b_score_history as any[]) || []
    const newHistory = [...existingHistory, historyEntry].slice(-50)

    const { data: updated, error: updateError } = await supabase
      .from("vista_b2c_leads")
      .update({
        b2b_potential_score: score,
        b2b_score_label: label,
        b2b_score_breakdown: breakdown,
        b2b_score_history: newHistory,
        pipeline_stage: newStage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      lead: updated,
      score,
      label,
      breakdown,
      pipeline_stage: newStage,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
