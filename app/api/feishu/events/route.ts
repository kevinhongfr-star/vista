import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAgentFromChatId, parseAgentResponse } from "@/lib/agents/utils"

/**
 * Feishu Event Subscription endpoint
 * Receives im.message.receive_v1 events from Feishu agent chats
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Handle URL verification challenge from Feishu
    if (body.type === "url_verification") {
      return NextResponse.json({ challenge: body.challenge })
    }

    // 2. Parse the message event
    const event = body.event
    if (!event || !event.message) {
      return NextResponse.json({ ok: true, skipped: "no_message" })
    }

    const chatId = event.message.chat_id
    const messageType = event.message.message_type

    // Only handle text messages
    if (messageType !== "text") {
      return NextResponse.json({ ok: true, skipped: "non_text" })
    }

    // Parse message content (Feishu sends JSON string in content field)
    let rawText = ""
    try {
      const contentObj = JSON.parse(event.message.content)
      rawText = contentObj.text || event.message.content
    } catch {
      rawText = event.message.content
    }

    // 3. Identify which agent this message is from
    const agent = getAgentFromChatId(chatId)
    if (!agent) {
      // Unknown chat - not from our agents
      return NextResponse.json({ ok: true, skipped: "unknown_chat" })
    }

    // 4. Parse the agent response for structured data
    const parsedData = parseAgentResponse(agent, rawText)

    // 5. Store in Supabase agent_outputs table
    const supabase = createServerClient()
    const { error } = await supabase.from("agent_outputs").insert({
      agent,
      chat_id: chatId,
      raw_message: rawText,
      parsed_data: parsedData,
      triggered_by: "agent",
      status: "received",
    })

    if (error) {
      console.error("Failed to store agent output:", error)
      // Still return success to avoid Feishu retries
    }

    return NextResponse.json({ ok: true, agent, stored: !error })
  } catch (error) {
    console.error("Feishu event handler error:", error)
    // Return success anyway to avoid Feishu retry loops
    return NextResponse.json({ ok: true, error: String(error) })
  }
}