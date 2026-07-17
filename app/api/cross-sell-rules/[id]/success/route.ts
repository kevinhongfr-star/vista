import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { converted } = body

    const { data: rule, error: fetchError } = await supabase
      .from("vista_cross_sell_rules")
      .select("success_rate")
      .eq("id", params.id)
      .single()

    if (fetchError || !rule) {
      return NextResponse.json({ success: false, error: "Rule not found" }, { status: 404 })
    }

    const currentRate = rule.success_rate || 0
    const newRate = currentRate * 0.9 + (converted ? 100 : 0) * 0.1

    const { data, error } = await supabase
      .from("vista_cross_sell_rules")
      .update({
        success_rate: Math.round(newRate * 10) / 10,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, rule: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
