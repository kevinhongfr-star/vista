import { createServerClient } from "@/lib/supabase/server"
import { ProgramsPage } from "./ProgramsPage"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

export default async function ProgramsPageWrapper() {
  const supabase = createServerClient()

  // Fetch programs
  const { data: programs, count } = await supabase
    .from('programs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Fetch program assignments
  const { data: assignments } = await supabase
    .from('program_assignments')
    .select('*')
    .order('assigned_date', { ascending: false })
    .limit(50)

  return (
    <ProgramsPage 
      programs={programs || []} 
      assignments={assignments || []}
      totalCount={count || 0}
    />
  )
}