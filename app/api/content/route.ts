import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_content_attribution").select("*")

    const contentType = searchParams.get("content_type")
    if (contentType) {
      query.eq("content_type", contentType)
    }

    const { data, error } = await query.order("content_date", { ascending: false })

    if (error) {
      return NextResponse.json({ content: [], error: error.message }, { status: 500 })
    }

    const content = (data || []).map((item: any) => ({
      id: item.id,
      content_type: item.content_type,
      title: item.content_title,
      slug: item.content_url,
      description: "",
      author: "",
      published_at: item.content_date,
      status: "published",
      url: item.content_url,
      metrics: item.engagement_metrics || {},
      revenue_attributed_cny: item.revenue_attributed_cny || 0,
      created_at: item.created_at,
    }))

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ content: [], error: String(error) }, { status: 500 })
  }
}
