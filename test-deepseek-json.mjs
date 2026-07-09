import { config } from "dotenv"
config({ path: ".env.local" })

async function testJSONMode() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"

  console.log("Testing DeepSeek JSON mode...")

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
            content: `You are a BD intelligence analyst. Generate a 3-sentence executive summary for a contact.
Contact: John Smith, CTO at Acme Corp
Industry: Fintech
VISTA Scores: V=25 I=20 S=28 T=15 A=22 (Composite: 110)
Pipeline Stage: Engaged
Last Activity: 2024-01-15
Signals (last 30 days): funding, leadership_change
Cluster: Fintech Tech Leaders (450 contacts)

Output ONLY valid JSON with this exact structure:
{
  "summary": "3-sentence executive summary here",
  "confidence": 0.85
}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    console.log("Status:", response.status)
    const data = await response.json()
    
    if (response.ok) {
      const content = data.choices?.[0]?.message?.content
      console.log("Raw response:", content)
      try {
        const parsed = JSON.parse(content)
        console.log("Parsed JSON:", JSON.stringify(parsed, null, 2))
        console.log("Summary:", parsed.summary)
        console.log("Confidence:", parsed.confidence)
      } catch (e) {
        console.log("JSON parse failed:", e.message)
      }
    } else {
      console.log("Error:", JSON.stringify(data, null, 2))
    }
  } catch (e) {
    console.error("Fetch error:", e)
  }
}

testJSONMode()
