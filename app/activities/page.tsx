import { createServerClient } from "@/lib/supabase/server"
import { ActivitiesPage } from "./ActivitiesPage"

export const dynamic = 'force-dynamic'

export default async function ActivitiesPageWrapper() {
  const supabase = createServerClient()

  const { data: activities, error } = await supabase
    .from('activities')
    .select('*, vista_contacts(name, company)')
    .order('activity_date', { ascending: false })
    .limit(50)

  return (
    <ActivitiesPage activities={activities || []} />
  )
}