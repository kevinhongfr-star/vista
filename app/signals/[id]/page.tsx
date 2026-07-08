import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { SignalDetail } from "./SignalDetail"
import type { VistaContact } from "@/lib/types"

export const dynamic = 'force-dynamic'

interface SignalPageProps {
  params: {
    id: string
  }
}

export default async function SignalPage({ params }: SignalPageProps) {
  const supabase = createServerClient()

  const { data: signal, error: signalError } = await supabase
    .from('signals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (signalError || !signal) {
    notFound()
  }

  let affectedContacts: VistaContact[] = []

  if (signal.contact_ids && signal.contact_ids.length > 0) {
    const { data: contacts } = await supabase
      .from('vista_contacts')
      .select('id, name, company, function, vista_composite, pipeline_stage')
      .in('id', signal.contact_ids)
    affectedContacts = (contacts || []) as VistaContact[]
  }

  if (signal.company) {
    const { data: companyContacts } = await supabase
      .from('vista_contacts')
      .select('id, name, company, function, vista_composite, pipeline_stage')
      .ilike('company', `%${signal.company}%`)
    
    const existingIds = new Set(affectedContacts.map(c => c.id))
    for (const c of (companyContacts || [])) {
      if (!existingIds.has(c.id)) {
        affectedContacts.push(c as VistaContact)
      }
    }
  }

  return (
    <SignalDetail signal={signal} affectedContacts={affectedContacts} />
  )
}