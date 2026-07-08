import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ContactDetail } from "./ContactDetail"

export const dynamic = 'force-dynamic'

interface ContactPageProps {
  params: {
    id: string
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const supabase = createServerClient()

  const { data: contact, error: contactError } = await supabase
    .from('vista_contacts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (contactError || !contact) {
    notFound()
  }

  return (
    <ContactDetail contact={contact} />
  )
}