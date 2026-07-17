import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_discount_rules")
      .select("*")

    if (error) {
      return NextResponse.json({ rules: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rules: data || [] })
  } catch (error) {
    return NextResponse.json({ rules: [], error: String(error) }, { status: 500 })
  }
}