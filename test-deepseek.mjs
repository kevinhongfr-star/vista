import { config } from "dotenv"
config({ path: ".env.local" })

async function testDeepSeekDirect() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"

  console.log("Testing DeepSeek API directly...")
  console.log("Base URL:", baseUrl)
  console.log("API key set:", !!apiKey)
  console.log("API key prefix:", apiKey ? apiKey.slice(0, 6) + "..." : "none")

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "Say 'DeepSeek API is working!' in exactly 5 words.",
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    })

    console.log("Status:", response.status)
    const data = await response.json()
    
    if (response.ok) {
      console.log("Response:", data.choices?.[0]?.message?.content)
      console.log("Model:", data.model)
      console.log("Usage:", JSON.stringify(data.usage))
    } else {
      console.log("Error response:", JSON.stringify(data, null, 2))
    }
  } catch (e) {
    console.error("Fetch error:", e)
  }
}

testDeepSeekDirect()
