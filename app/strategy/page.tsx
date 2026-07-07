import { createServerClient } from "@/lib/supabase/server"
import { StrategyPage } from "./StrategyPage"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function StrategyPageWrapper() {
  const supabase = createServerClient()

  // Fetch strategic notes
  const { data: notes, count } = await supabase
    .from('strategic_notes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <StrategyPage notes={notes || []} totalCount={count || 0} />
  )
}