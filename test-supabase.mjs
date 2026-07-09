import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

async function testSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("Testing Supabase connection...")
  console.log("URL:", supabaseUrl)
  console.log("Key set:", !!supabaseKey)

  try {
    const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
      auth: { persistSession: false },
    })

    // Test 1: Count contacts
    const { count, error: countError } = await supabase
      .from("vista_contacts")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.log("Count error:", countError.message)
    } else {
      console.log("Total contacts:", count)
    }

    // Test 2: Get top 3 contacts
    const { data: contacts, error: contactsError } = await supabase
      .from("vista_contacts")
      .select("id, name, company, role, vista_composite, pipeline_stage")
      .order("vista_composite", { ascending: false })
      .limit(3)

    if (contactsError) {
      console.log("Contacts error:", contactsError.message)
    } else {
      console.log("\nTop 3 contacts:")
      contacts.forEach((c) => {
        console.log(`  - ${c.name} (${c.company}) — Score: ${c.vista_composite}, Stage: ${c.pipeline_stage}`)
      })
    }

    // Test 3: Check clusters
    const { data: clusters, error: clustersError } = await supabase
      .from("density_clusters")
      .select("cluster_id, industry, contact_count")
      .order("contact_count", { ascending: false })
      .limit(3)

    if (clustersError) {
      console.log("\nClusters error:", clustersError.message)
    } else {
      console.log("\nTop 3 clusters:")
      clusters.forEach((c) => {
        console.log(`  - ${c.industry} (${c.contact_count} contacts)`)
      })
    }

    // Test 4: Check signals
    const { data: signals, error: signalsError } = await supabase
      .from("signals")
      .select("id, signal_type, company, description, detected_date")
      .order("detected_date", { ascending: false })
      .limit(3)

    if (signalsError) {
      console.log("\nSignals error:", signalsError.message)
    } else {
      console.log("\nTop 3 signals:")
      signals.forEach((s) => {
        console.log(`  - [${s.signal_type}] ${s.company}: ${s.description?.slice(0, 60)}...`)
      })
    }

    console.log("\n✅ Supabase connection verified!")
  } catch (e) {
    console.error("Supabase error:", e)
  }
}

testSupabase()
