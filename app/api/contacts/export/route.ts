import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: contacts, error } = await supabase
      .from("vista_contacts")
      .select("*")
      .order("priority_score", { ascending: false })
      .limit(1000)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No contacts found" },
        { status: 404 }
      )
    }

    const headers = [
      "id",
      "name",
      "company",
      "role",
      "seniority",
      "function",
      "industry",
      "region",
      "country",
      "email",
      "phone",
      "headline",
      "profile_url",
      "stain_group",
      "stain_score",
      "cluster_score",
      "signal_score",
      "engagement_score",
      "priority_score",
      "engagement_tier",
      "encirclement_level",
      "advisory_tier",
      "bd_pathway",
      "bd_priority",
      "pipeline_stage",
      "funnel_stage",
      "status",
      "data_source",
      "touch_count",
      "last_touch_date",
      "last_engagement_date",
      "decay_flag",
      "vista_composite",
      "score_delta",
      "created_at",
      "updated_at",
    ]

    const csvRows = [
      headers.join(","),
      ...contacts.map((contact) =>
        headers
          .map((header) => {
            const value = (contact as Record<string, unknown>)[header]
            if (value === null || value === undefined) return ""
            const stringValue = String(value).replace(/"/g, '""')
            return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue
          })
          .join(",")
      ),
    ]

    const csvContent = csvRows.join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="vista_contacts_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
