import { createServerClient } from "@/lib/supabase/server"
import { B2CLeadProfile } from "./B2CLeadProfile"

export const dynamic = 'force-dynamic'

export default async function B2CLeadProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: lead, error } = await supabase
    .from('vista_b2c_leads')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: events } = await supabase
    .from('vista_b2c_events')
    .select('*')
    .eq('b2c_lead_id', params.id)
    .order('event_timestamp', { ascending: false })

  const { data: conversion } = await supabase
    .from('vista_b2c_conversions')
    .select('*')
    .eq('b2c_lead_id', params.id)
    .single()

  if (error || !lead) {
    return <div className="p-8 text-center text-muted-foreground">Lead not found</div>
  }

  return (
    <B2CLeadProfile
      lead={lead}
      events={events || []}
      conversion={conversion || null}
    />
  )
}
