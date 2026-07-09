import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

const BASE_URL = "http://localhost:3000"

async function getSampleIds() {
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false } }
  )

  // Get a contact
  const { data: contacts } = await supabase
    .from("vista_contacts")
    .select("id, name, company")
    .order("vista_composite", { ascending: false })
    .limit(1)
  const contactId = contacts?.[0]?.id
  console.log(`Contact: ${contacts?.[0]?.name} (${contacts?.[0]?.company}) — ${contactId}`)

  // Get a cluster
  const { data: clusters } = await supabase
    .from("density_clusters")
    .select("cluster_id, industry, contact_count")
    .order("contact_count", { ascending: false })
    .limit(1)
  const clusterId = clusters?.[0]?.cluster_id
  console.log(`Cluster: ${clusters?.[0]?.industry} (${clusters?.[0]?.contact_count} contacts) — ${clusterId}`)

  // Get a signal
  const { data: signals } = await supabase
    .from("signals")
    .select("id, signal_type, company")
    .order("detected_date", { ascending: false })
    .limit(1)
  const signalId = signals?.[0]?.id
  console.log(`Signal: ${signals?.[0]?.signal_type} at ${signals?.[0]?.company} — ${signalId}`)

  return { contactId, clusterId, signalId }
}

async function testEndpoint(url, name) {
  console.log(`\n=== Testing: ${name} ===`)
  console.log(`URL: ${url}`)
  try {
    const startTime = Date.now()
    const response = await fetch(url)
    const elapsed = Date.now() - startTime
    const text = await response.text()
    
    console.log(`Status: ${response.status}`)
    console.log(`Time: ${elapsed}ms`)
    
    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.log("Response (first 500 chars):", text.slice(0, 500))
      return null
    }
    
    console.log(`Source: ${data.source || data.narrative_source || data.analysis_source || "unknown"}`)
    
    if (response.ok) {
      console.log("✅ Success")
      const preview = JSON.stringify(data, null, 2).slice(0, 1500)
      console.log("Response preview:", preview)
      if (JSON.stringify(data).length > 1500) {
        console.log("... (truncated)")
      }
    } else {
      console.log("❌ Failed:", data.error || data.message)
    }
    return data
  } catch (e) {
    console.log("❌ Network error:", e.message)
    return null
  }
}

async function runAllTests() {
  const { contactId, clusterId, signalId } = await getSampleIds()

  // Test 1: Contact Summary
  await testEndpoint(
    `${BASE_URL}/api/intelligence/contact/${contactId}/summary`,
    "Contact Summary"
  )

  // Test 2: Contact Recommendations
  await testEndpoint(
    `${BASE_URL}/api/intelligence/contact/${contactId}/recommendations`,
    "Contact Recommendations"
  )

  // Test 3: Cluster Insights (narrative)
  await testEndpoint(
    `${BASE_URL}/api/intelligence/cluster/${clusterId}/insights`,
    "Cluster Insights / Narrative"
  )

  // Test 4: Signal Impact
  await testEndpoint(
    `${BASE_URL}/api/intelligence/signal/${signalId}/impact`,
    "Signal Impact Analysis"
  )

  // Test 5: Executive Brief
  await testEndpoint(
    `${BASE_URL}/api/intelligence/dashboard/executive-brief`,
    "Executive Brief"
  )

  console.log("\n✅ All tests completed!")
}

runAllTests()
