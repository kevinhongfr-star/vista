import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: conversions, error: convError } = await supabase
      .from("vista_b2c_conversions")
      .select("*")

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    const { data: allLeads, error: leadsError } = await supabase
      .from("vista_b2c_leads")
      .select("id, total_spend_cny, pipeline_stage")

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 })
    }

    const converterIds = new Set((conversions || []).map((c) => c.b2c_lead_id))

    const preConversionSpend = (conversions || []).reduce(
      (sum, c) => sum + (c.b2c_total_spend_cny || 0),
      0
    )

    const b2cRevenueFromConverters = (allLeads || [])
      .filter((l) => converterIds.has(l.id))
      .reduce((sum, l) => sum + (l.total_spend_cny || 0), 0)

    const b2cRevenueFromNonConverters = (allLeads || [])
      .filter((l) => !converterIds.has(l.id))
      .reduce((sum, l) => sum + (l.total_spend_cny || 0), 0)

    const b2bDealValue = (conversions || []).reduce(
      (sum, c) => sum + (c.first_b2b_deal_value_cny || 0),
      0
    )

    const totalB2CRevenue = b2cRevenueFromConverters + b2cRevenueFromNonConverters
    const roiRatio = totalB2CRevenue > 0 ? (b2bDealValue / totalB2CRevenue).toFixed(2) : "0"

    const avgPreConversionJourney =
      (conversions || []).length > 0
        ? {
            avg_credits_purchased: Math.round(
              (conversions || []).reduce((sum, c) => sum + (c.b2c_credits_purchased || 0), 0) /
                (conversions || []).length
            ),
            avg_assessments_completed: (
              (conversions || []).reduce(
                (sum, c) => sum + ((c.b2c_assessments_completed as string[]) || []).length,
                0
              ) / (conversions || []).length
            ).toFixed(1),
            avg_days_as_user: Math.round(
              (conversions || []).reduce((sum, c) => sum + (c.b2c_days_as_user || 0), 0) /
                (conversions || []).length
            ),
          }
        : null

    return NextResponse.json({
      pre_conversion_b2c_spend: preConversionSpend,
      b2c_revenue_from_converters: b2cRevenueFromConverters,
      b2c_revenue_from_non_converters: b2cRevenueFromNonConverters,
      b2b_revenue_from_converts: b2bDealValue,
      roi_ratio: parseFloat(roiRatio),
      avg_pre_conversion_journey: avgPreConversionJourney,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
