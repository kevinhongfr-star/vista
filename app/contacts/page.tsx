import { createServerClient } from "@/lib/supabase/server"
import { ContactsTable } from "@/components/contacts/ContactsTable"

// Force dynamic rendering since this page fetches data from Supabase
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface ContactsPageProps {
  searchParams: {
    page?: string
    tier?: string
    level?: string
    search?: string
  }
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const supabase = createServerClient()
  const page = parseInt(searchParams.page || '0', 10)
  const tier = searchParams.tier
  const level = searchParams.level
  const search = searchParams.search

  // Build query
  let query = supabase
    .from('vista_contacts')
    .select('*', { count: 'exact' })
    .order('priority_score', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  // Apply filters
  if (tier && tier !== 'all') {
    query = query.eq('engagement_tier', tier.charAt(0).toUpperCase() + tier.slice(1))
  }

  if (level && level !== 'all') {
    query = query.eq('encirclement_level', level.charAt(0).toUpperCase() + level.slice(1))
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,role.ilike.%${search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
  }

  const pageCount = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="text-sm text-muted-foreground">
          {count || 0} total contacts
        </div>
      </div>

      <ContactsTable
        data={data || []}
        pageCount={pageCount}
        currentPage={page}
        searchParams={{
          tier: searchParams.tier,
          level: searchParams.level,
          search: searchParams.search,
        }}
      />
    </div>
  )
}