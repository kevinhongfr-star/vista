import { config } from "dotenv"
config({ path: ".env.local" })

async function test() {
  const prompt = `Score these 2 contacts. Return a JSON array.

Contacts:
[{"id":"abc","name":"Test 1","company":"Acme"},{"id":"def","name":"Test 2","company":"Beta"}]

Output JSON array:
[{"id":"abc","scores":{"v":20,"i":15,"s":25,"t":10,"a":18},"composite":88,"rationale":"test","recommended_action":"do something"}]`

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  })
  
  const data = await res.json()
  console.log("Raw content:")
  console.log(data.choices[0].message.content)
  console.log("\nType of parsed:", typeof JSON.parse(data.choices[0].message.content))
  const parsed = JSON.parse(data.choices[0].message.content)
  console.log("Is array:", Array.isArray(parsed))
  if (!Array.isArray(parsed)) {
    console.log("Keys:", Object.keys(parsed))
  }
}
test()
