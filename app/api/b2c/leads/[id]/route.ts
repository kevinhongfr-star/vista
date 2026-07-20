import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: lead, error } = await supabase
      .from("vista_b2c_leads")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    const { data: events, error: eventsError } = await supabase
      .from("vista_b2c_events")
      .select("*")
      .eq("b2c_lead_id", id)
      .order("event_timestamp", { ascending: false })

    const { data: conversion, error: conversionError } = await supabase
      .from("vista_b2c_conversions")
      .select("*")
      .eq("b2c_lead_id", id)
      .single()

    return NextResponse.json({
      success: true,
      lead,
      events: events || [],
      conversion: conversion || null,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
