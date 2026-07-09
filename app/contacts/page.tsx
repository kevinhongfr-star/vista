import { createServerClient } from "@/lib/supabase/server"
import { ContactsTable } from "@/components/contacts/ContactsTable"

export const dynamic = 'force-dynamic'

const DEFAULT_PAGE_SIZE = 20

interface ContactsPageProps {
  searchParams: {
    page?: string
    tier?: string
    level?: string
    search?: string
    stage?: string
    function?: string
    pageSize?: string
  }
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const supabase = createServerClient()
  const page = parseInt(searchParams.page || '0', 10)
  const pageSize = parseInt(searchParams.pageSize || String(DEFAULT_PAGE_SIZE), 10)
  const tier = searchParams.tier
  const level = searchParams.level
  const search = searchParams.search
  const stage = searchParams.stage
  const func = searchParams.function

  let query = supabase
    .from('vista_contacts')
    .select('*', { count: 'exact' })
    .order('priority_score', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (tier && tier !== 'all') {
    query = query.eq('engagement_tier', tier.charAt(0).toUpperCase() + tier.slice(1))
  }

  if (level && level !== 'all') {
    query = query.eq('encirclement_level', level.charAt(0).toUpperCase() + level.slice(1))
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (stage && stage !== 'all') {
    query = query.eq('pipeline_stage', stage)
  }

  if (func && func !== 'all') {
    query = query.eq('function', func)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
  }

  const pageCount = Math.ceil((count || 0) / pageSize)
  const totalCount = count || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-muted-foreground">{count || 0} total contacts</p>
        </div>
        <button
          onClick={() => {
            fetch('/api/contacts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'New Contact',
                company: 'New Company',
              }),
            }).then(res => res.json()).then(() => {
              window.location.reload()
            })
          }}
          className="px-4 py-2 bg-accent-fuchsia text-white rounded-lg hover:bg-accent-fuchsia/90 font-medium"
        >
          + Create Contact
        </button>
      </div>

      <ContactsTable
        data={data || []}
        pageCount={pageCount}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        searchParams={{
          tier: searchParams.tier,
          level: searchParams.level,
          search: searchParams.search,
          stage: searchParams.stage,
          function: searchParams.function,
          pageSize: searchParams.pageSize,
        }}
      />
    </div>
  )
}