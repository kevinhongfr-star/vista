import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: clusters, error } = await supabase
      .from("density_clusters")
      .select("cluster_id, industry, geography, contact_count, density_score, status")
      .order("density_score", { ascending: false })

    if (error) {
      return NextResponse.json({ clusters: [], error: error.message })
    }

    return NextResponse.json({ clusters: clusters || [] })
  } catch (error) {
    return NextResponse.json({ clusters: [], error: "Failed to fetch clusters" })
  }
}
