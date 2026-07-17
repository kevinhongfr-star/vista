import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: assets, error: assetsError } = await supabase
      .from("vista_content_attribution")
      .select("id, content_title, content_type, revenue_attributed_cny")

    if (assetsError) {
      return NextResponse.json({ roi: [], error: assetsError.message }, { status: 500 })
    }

    const { data: interactions, error: intError } = await supabase
      .from("vista_content_contact_interactions")
      .select("content_id, interaction_type")

    if (intError) {
      return NextResponse.json({ roi: [], error: intError.message }, { status: 500 })
    }

    const interactionCounts: Record<string, { view: number; download: number; click: number }> = {}

    for (const int of interactions || []) {
      const key = int.content_id
      if (!interactionCounts[key]) {
        interactionCounts[key] = { view: 0, download: 0, click: 0 }
      }
      const type = (int.interaction_type || "").toLowerCase()
      if (type === "viewed") interactionCounts[key].view++
      else if (type === "attended" || type === "responded" || type === "shared" || type === "registered") {
        interactionCounts[key].click++
      }
    }

    const roi = (assets || []).map((asset: any) => {
      const counts = interactionCounts[asset.id] || { view: 0, download: 0, click: 0 }
      const total = counts.view + counts.download + counts.click

      return {
        content_id: asset.id,
        content_title: asset.content_title,
        content_type: asset.content_type,
        total_interactions: total,
        views: counts.view,
        downloads: counts.download,
        clicks: counts.click,
        estimated_roi_cny: asset.revenue_attributed_cny || 0,
        roi_per_interaction: total > 0
          ? Math.round((asset.revenue_attributed_cny || 0) / total)
          : 0,
      }
    })

    return NextResponse.json({ roi, period })
  } catch (error) {
    return NextResponse.json({ roi: [], error: String(error) }, { status: 500 })
  }
}
