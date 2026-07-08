import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const minScore = searchParams.get("min_score")
    const maxScore = searchParams.get("max_score")
    const pipelineStage = searchParams.get("pipeline_stage")
    const company = searchParams.get("company")
    const geography = searchParams.get("geography")
    const functionCategory = searchParams.get("function")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("vista_contacts")
      .select("*", { count: "exact" })
      .order("vista_composite", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (minScore) {
      query = query.gte("vista_composite", parseInt(minScore))
    }
    if (maxScore) {
      query = query.lte("vista_composite", parseInt(maxScore))
    }
    if (pipelineStage) {
      query = query.eq("pipeline_stage", pipelineStage)
    }
    if (company) {
      query = query.ilike("company", `%${company}%`)
    }
    if (geography) {
      query = query.or(`region.ilike.%${geography}%,country.ilike.%${geography}%,location.ilike.%${geography}%`)
    }
    if (functionCategory) {
      query = query.eq("function", functionCategory)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      contacts: data || [],
      total: count || 0,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_contacts")
      .insert({
        name: body.name,
        company: body.company,
        role: body.role,
        email: body.email,
        phone: body.phone,
        function: body.function,
        seniority: body.seniority,
        industry: body.industry,
        region: body.region,
        country: body.country,
        location: body.location,
        pipeline_stage: body.pipeline_stage || "Prospect",
        profile_url: body.profile_url,
        data_source: body.data_source || "manual",
        notes: body.notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, contact: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}