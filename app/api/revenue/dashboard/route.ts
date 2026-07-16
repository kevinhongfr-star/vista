import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const ALL_TIERS = [
  { tier: 1, tier_name: "Free" },
  { tier: 2, tier_name: "Starter" },
  { tier: 3, tier_name: "Mid-Ticket" },
  { tier: 4, tier_name: "Premium" },
  { tier: 5, tier_name: "Search" },
  { tier: 6, tier_name: "Advisory" },
  { tier: 7, tier_name: "Platform" },
]

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "monthly"

    const { data: engagements, error: engError } = await supabase
      .from("vista_contact_service_engagements")
      .select("*, vista_service_catalog(tier, tier_name, name)")

    if (engError) {
      return NextResponse.json({ error: engError.message }, { status: 500 })
    }

    const completedEngagements = engagements?.filter(
      (e: { status: string }) => e.status === "completed"
    ) || []

    const revenueByTier: { tier: number; tier_name: string; total_cny: number; count: number }[] =
      ALL_TIERS.map((t) => ({ ...t, total_cny: 0, count: 0 }))

    const revenueByServiceMap: Record<string, { service_name: string; total_cny: number; count: number }> = {}

    let bundleCount = 0
    let totalDeals = 0
    let dealsWithDiscount = 0
    let totalDiscountPct = 0

    const avgDealByTierMap: Record<number, { total: number; count: number }> = {}

    for (const eng of completedEngagements) {
      const svc = eng.vista_service_catalog
      const tier = svc?.tier || 1
      const tierName = svc?.tier_name || "Free"
      const serviceName = svc?.name || "Unknown"
      const price = eng.price_paid_cny || 0
      const wasDiscounted = eng.was_discounted || false
      const discountPct = eng.discount_pct || 0

      const tierIndex = revenueByTier.findIndex((r) => r.tier === tier)
      if (tierIndex >= 0) {
        revenueByTier[tierIndex].total_cny += price
        revenueByTier[tierIndex].count += 1
      }

      if (!revenueByServiceMap[serviceName]) {
        revenueByServiceMap[serviceName] = { service_name: serviceName, total_cny: 0, count: 0 }
      }
      revenueByServiceMap[serviceName].total_cny += price
      revenueByServiceMap[serviceName].count += 1

      totalDeals += 1
      if (wasDiscounted) {
        dealsWithDiscount += 1
        totalDiscountPct += discountPct
      }

      if (!avgDealByTierMap[tier]) {
        avgDealByTierMap[tier] = { total: 0, count: 0 }
      }
      avgDealByTierMap[tier].total += price
      avgDealByTierMap[tier].count += 1
    }

    const revenueByService = Object.values(revenueByServiceMap).sort(
      (a, b) => b.total_cny - a.total_cny
    )

    const avgDealSizeByTier = Object.entries(avgDealByTierMap).map(([tier, data]) => ({
      tier: parseInt(tier, 10),
      avg_cny: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }))

    const { data: proposals, error: propError } = await supabase
      .from("vista_proposals")
      .select("status, total_value_cny, bundle_id")

    if (propError) {
      return NextResponse.json({ error: propError.message }, { status: 500 })
    }

    const pipelineByStatus: Record<string, number> = {}
    let totalPipeline = 0
    let totalProposals = 0
    let bundleProposals = 0

    for (const p of proposals || []) {
      const status = p.status || "draft"
      const value = p.total_value_cny || 0
      pipelineByStatus[status] = (pipelineByStatus[status] || 0) + value
      totalPipeline += value
      totalProposals += 1
      if (p.bundle_id) {
        bundleProposals += 1
      }
    }

    const bundleAdoptionRate = totalProposals > 0 ? bundleProposals / totalProposals : 0

    const { data: progressions, error: progError } = await supabase
      .from("vista_tier_progressions")
      .select("from_tier, to_tier")

    if (progError) {
      return NextResponse.json({ error: progError.message }, { status: 500 })
    }

    const fromTierCounts: Record<number, number> = {}
    const transitionCounts: Record<string, number> = {}

    for (const p of progressions || []) {
      fromTierCounts[p.from_tier] = (fromTierCounts[p.from_tier] || 0) + 1
      const key = `${p.from_tier}->${p.to_tier}`
      transitionCounts[key] = (transitionCounts[key] || 0) + 1
    }

    const tierConversion: { from_tier: number; to_tier: number; count: number; pct: number }[] = []
    for (const key of Object.keys(transitionCounts)) {
      const [fromStr, toStr] = key.split("->")
      const from = parseInt(fromStr, 10)
      const to = parseInt(toStr, 10)
      const count = transitionCounts[key]
      const total = fromTierCounts[from] || 0
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      tierConversion.push({ from_tier: from, to_tier: to, count, pct })
    }

    return NextResponse.json({
      revenue_by_tier: revenueByTier,
      revenue_by_service: revenueByService,
      bundle_adoption_rate: Math.round(bundleAdoptionRate * 100) / 100,
      avg_deal_size_by_tier: avgDealSizeByTier,
      discount_utilization: {
        total_deals: totalDeals,
        deals_with_discount: dealsWithDiscount,
        avg_discount_pct: dealsWithDiscount > 0 ? Math.round((totalDiscountPct / dealsWithDiscount) * 10) / 10 : 0,
      },
      pipeline_value: {
        total_proposals_cny: totalPipeline,
        by_status: pipelineByStatus,
      },
      tier_conversion: tierConversion,
      period,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}