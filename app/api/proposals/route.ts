import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_proposals").select("*, contacts(contact_name, company)")

    const contactId = searchParams.get("contact_id")
    if (contactId) {
      query.eq("contact_id", contactId)
    }

    const status = searchParams.get("status")
    if (status) {
      query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ proposals: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ proposals: data || [] })
  } catch (error) {
    return NextResponse.json({ proposals: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { contact_id, service_ids, bundle_id, discount_pct, notes } = body

    const { data: services, error: svcError } = await supabase
      .from("vista_service_catalog")
      .select("id, price_min_cny, price_max_cny, is_discountable")
      .in("id", service_ids || [])

    if (svcError) {
      return NextResponse.json({ success: false, error: svcError.message }, { status: 500 })
    }

    let totalValue = 0
    let isDiscountable = true

    for (const svc of services || []) {
      totalValue += (svc.price_min_cny + svc.price_max_cny) / 2
      if (!svc.is_discountable) {
        isDiscountable = false
      }
    }

    const effectiveDiscount = isDiscountable ? Math.min(discount_pct || 0, 100) : 0
    const totalValueCny = Math.round(totalValue * (1 - effectiveDiscount / 100))

    const proposalNumber = generateProposalNumber()

    const { data, error } = await supabase
      .from("vista_proposals")
      .insert({
        contact_id,
        proposal_number: proposalNumber,
        service_ids: service_ids || [],
        bundle_id: bundle_id || null,
        total_value_cny: totalValueCny,
        discount_applied_pct: effectiveDiscount,
        status: "draft",
        notes: notes || "",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, proposal: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

function generateProposalNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "")
  const random = Math.floor(Math.random() * 900) + 100
  return `PROP-${dateStr}-${random}`
}