import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { milestone_index, status } = body

    const { data: schedule, error: fetchError } = await supabase
      .from("vista_payment_schedules")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !schedule) {
      return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 })
    }

    const scheduleArray = Array.isArray(schedule.schedule) ? schedule.schedule : []
    if (milestone_index >= scheduleArray.length) {
      return NextResponse.json({ success: false, error: "Milestone index out of range" }, { status: 400 })
    }

    const updatedSchedule = [...scheduleArray]
    updatedSchedule[milestone_index] = {
      ...updatedSchedule[milestone_index],
      status,
    }

    const paidAmount = updatedSchedule
      .filter((m: { status: string }) => m.status === "paid")
      .reduce((sum: number, m: { amount: number }) => sum + m.amount, 0)

    const { data, error } = await supabase
      .from("vista_payment_schedules")
      .update({
        schedule: updatedSchedule,
        paid_amount: paidAmount,
        outstanding_amount: schedule.total_value_cny - paidAmount,
      })
      .eq("id", params.id)
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