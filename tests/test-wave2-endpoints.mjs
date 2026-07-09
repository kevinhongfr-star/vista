import { config } from "dotenv"
config({ path: ".env.local" })

const BASE_URL = "http://localhost:3000"

async function testBulkAssess() {
  console.log("\n=== Testing: POST /api/intelligence/bulk-assess ===")
  console.log("Scope: ids (3 contacts)")

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/vista_contacts?select=id&order=priority_score.desc&limit=3`, {
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
  })
  const contacts = await supabaseRes.json()
  const contactIds = contacts.map((c) => c.id)
  console.log(`Testing with ${contactIds.length} contacts`)

  const startTime = Date.now()
  const response = await fetch(`${BASE_URL}/api/intelligence/bulk-assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "ids",
      contact_ids: contactIds,
      assessment_type: "score_only",
    }),
  })

  const elapsed = Date.now() - startTime
  const data = await response.json()

  console.log(`Status: ${response.status}`)
  console.log(`Time: ${elapsed}ms`)

  if (response.ok && data.success) {
    console.log("✅ Success")
    console.log(`  Assessed: ${data.assessed}`)
    console.log(`  Updated: ${data.updated}`)
    console.log(`  Errors: ${data.errors}`)
    console.log(`  Total: ${data.total}`)
    console.log(`  Duration: ${data.duration_ms}ms`)
  } else {
    console.log("❌ Failed:", data.error || data.message)
  }

  return data
}

async function testBulkDetectSignals() {
  console.log("\n=== Testing: POST /api/intelligence/bulk-detect-signals ===")
  console.log("Scope: recent (7 days)")

  const startTime = Date.now()
  const response = await fetch(`${BASE_URL}/api/intelligence/bulk-detect-signals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scope: "recent",
      days_back: 7,
    }),
  })

  const elapsed = Date.now() - startTime
  const data = await response.json()

  console.log(`Status: ${response.status}`)
  console.log(`Time: ${elapsed}ms`)

  if (response.ok && data.success) {
    console.log("✅ Success")
    console.log(`  Signals detected: ${data.signals_detected}`)
    console.log(`  Contacts scanned: ${data.contacts_scanned}`)
    console.log(`  Total: ${data.total}`)
    console.log(`  Errors: ${data.errors}`)
    console.log(`  Duration: ${data.duration_ms}ms`)
  } else {
    console.log("❌ Failed:", data.error || data.message)
  }

  return data
}

async function runAllTests() {
  await testBulkAssess()
  await testBulkDetectSignals()
  console.log("\n✅ All Wave 2 endpoint tests completed!")
}

runAllTests()
