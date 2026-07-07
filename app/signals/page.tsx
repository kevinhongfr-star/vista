import { createServerClient } from "@/lib/supabase/server"
import { SignalsPage } from "./SignalsPage"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function SignalsPageWrapper() {
  const supabase = createServerClient()

  // Fetch recent signals
  const { data: signals, count } = await supabase
    .from('signals')
    .select('*', { count: 'exact' })
    .order('detected_date', { ascending: false })
    .limit(50)

  return (
    <SignalsPage signals={signals || []} totalCount={count || 0} />
  )
}