import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const period = searchParams.get("period") || "30d"

    const { data: assets, error: assetsError } = await supabase
      .from("vista_content_assets")
      .select("id, content_title, content_type, estimated_roi_cny")

    if (assetsError) {
      return NextResponse.json({ roi: [], error: assetsError.message }, { status: 500 })
    }

    const { data: interactions, error: intError } = await supabase
      .from("vista_content_interactions")
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
      interactionCounts[key][int.interaction_type] = (interactionCounts[key][int.interaction_type] || 0) + 1
    }

    const roi = (assets || []).map((asset) => {
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
        estimated_roi_cny: asset.estimated_roi_cny || 0,
        roi_per_interaction: total > 0
          ? Math.round((asset.estimated_roi_cny || 0) / total)
          : 0,
      }
    })

    return NextResponse.json({ roi, period })
  } catch (error) {
    return NextResponse.json({ roi: [], error: String(error) }, { status: 500 })
  }
}