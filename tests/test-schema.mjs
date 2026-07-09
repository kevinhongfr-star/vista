import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

async function checkSchema() {
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false } }
  )

  // Check vista_contacts columns
  const { data: contactRow, error: contactError } = await supabase
    .from("vista_contacts")
    .select("*")
    .limit(1)

  if (contactError) {
    console.log("Contacts error:", contactError.message)
  } else if (contactRow && contactRow.length > 0) {
    console.log("vista_contacts columns:")
    console.log(Object.keys(contactRow[0]).join(", "))
    console.log("\nSample row:")
    console.log(JSON.stringify(contactRow[0], null, 2).slice(0, 1000))
  }

  console.log("\n" + "=".repeat(60) + "\n")

  // Check signals columns
  const { data: signalRow, error: signalError } = await supabase
    .from("signals")
    .select("*")
    .limit(1)

  if (signalError) {
    console.log("Signals error:", signalError.message)
  } else if (signalRow && signalRow.length > 0) {
    console.log("signals columns:")
    console.log(Object.keys(signalRow[0]).join(", "))
    console.log("\nSample row:")
    console.log(JSON.stringify(signalRow[0], null, 2).slice(0, 1000))
  }

  console.log("\n" + "=".repeat(60) + "\n")

  // Check density_clusters columns
  const { data: clusterRow, error: clusterError } = await supabase
    .from("density_clusters")
    .select("*")
    .limit(1)

  if (clusterError) {
    console.log("Clusters error:", clusterError.message)
  } else if (clusterRow && clusterRow.length > 0) {
    console.log("density_clusters columns:")
    console.log(Object.keys(clusterRow[0]).join(", "))
  }
}

checkSchema()
