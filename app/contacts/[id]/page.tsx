import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ContactDetail } from "./ContactDetail"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

interface ContactPageProps {
  params: {
    id: string
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const supabase = createServerClient()

  // Fetch contact
  const { data: contact, error: contactError } = await supabase
    .from('vista_contacts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (contactError || !contact) {
    notFound()
  }

  // Fetch signals for this contact
  const { data: signals } = await supabase
    .from('signals')
    .select('*')
    .eq('contact_id', params.id)
    .order('detected_date', { ascending: false })
    .limit(10)

  // Fetch campaign activities
  const { data: activities } = await supabase
    .from('campaign_activities')
    .select('*')
    .eq('campaign_contact_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch strategic notes
  const { data: notes } = await supabase
    .from('strategic_notes')
    .select('*')
    .eq('contact_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <ContactDetail
      contact={contact}
      signals={signals || []}
      activities={activities || []}
      notes={notes || []}
    />
  )
}