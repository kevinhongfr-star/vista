import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const query = supabase.from("vista_payment_schedules").select("*")

    const opportunityId = searchParams.get("opportunity_id")
    if (opportunityId) {
      query.eq("opportunity_id", opportunityId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ schedules: [], error: error.message }, { status: 500 })
    }

    return NextResponse.json({ schedules: data || [] })
  } catch (error) {
    return NextResponse.json({ schedules: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { opportunity_id, total_value_cny, payment_model, schedule } = body

    const generatedSchedule = generateSchedule(payment_model, total_value_cny, schedule)

    const paidAmount = generatedSchedule
      .filter((m) => m.status === "paid")
      .reduce((sum, m) => sum + m.amount, 0)

    const { data, error } = await supabase
      .from("vista_payment_schedules")
      .insert({
        opportunity_id,
        total_value_cny,
        payment_model,
        schedule: generatedSchedule,
        paid_amount: paidAmount,
        outstanding_amount: total_value_cny - paidAmount,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, schedule: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

function generateSchedule(
  payment_model: string,
  total_value_cny: number,
  customSchedule?: { date: string; amount: number; description: string }[]
) {
  if (customSchedule && customSchedule.length > 0) {
    return customSchedule.map((m) => ({
      ...m,
      status: "pending" as const,
    }))
  }

  const today = new Date()
  const schedules: { date: string; amount: number; description: string; status: "pending" | "invoiced" | "paid" }[] = []

  switch (payment_model) {
    case "milestone":
      const third = total_value_cny / 3
      schedules.push(
        { date: formatDate(today), amount: third, description: "1/3 Retainer", status: "pending" },
        { date: formatDate(addDays(today, 30)), amount: third, description: "1/3 Shortlist", status: "pending" },
        { date: formatDate(addDays(today, 60)), amount: third, description: "1/3 Start", status: "pending" }
      )
      break

    case "advisory":
      const half = total_value_cny / 2
      schedules.push(
        { date: formatDate(today), amount: half, description: "50% Kick-off", status: "pending" },
        { date: formatDate(addDays(today, 45)), amount: half, description: "50% Delivery", status: "pending" }
      )
      break

    case "monthly":
      for (let i = 0; i < 12; i++) {
        schedules.push({
          date: formatDate(addMonths(today, i)),
          amount: total_value_cny / 12,
          description: `Month ${i + 1}`,
          status: "pending",
        })
      }
      break

    case "quarterly":
      for (let i = 0; i < 4; i++) {
        schedules.push({
          date: formatDate(addMonths(today, i * 3)),
          amount: total_value_cny / 4,
          description: `Q${i + 1}`,
          status: "pending",
        })
      }
      break

    case "annual":
      schedules.push({
        date: formatDate(today),
        amount: total_value_cny,
        description: "Annual Payment",
        status: "pending",
      })
      break

    case "on_completion":
    default:
      schedules.push({
        date: formatDate(addDays(today, 30)),
        amount: total_value_cny,
        description: "On Completion",
        status: "pending",
      })
      break
  }

  return schedules
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}