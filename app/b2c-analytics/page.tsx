import { createServerClient } from "@/lib/supabase/server"
import { B2CAnalyticsPage } from "./B2CAnalyticsPage"

export const dynamic = 'force-dynamic'

export default async function B2CAnalyticsPageWrapper() {
  const supabase = createServerClient()

  const { data: leads } = await supabase
    .from('vista_b2c_leads')
    .select('*')

  const { data: conversions } = await supabase
    .from('vista_b2c_conversions')
    .select('*')

  return (
    <B2CAnalyticsPage
      leads={leads || []}
      conversions={conversions || []}
    />
  )
}
