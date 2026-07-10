import { NextResponse } from "next/server"
import { sendMentionMessage } from "@/lib/feishu/client"
import { logAgentTrigger, fetchContactNames, getAgentChatId } from "@/lib/agents/utils"
import type { AgentTriggerRequest } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body: AgentTriggerRequest = await request.json().catch(() => ({}))
    const chatId = getAgentChatId("PROBE")

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "PROBE chat ID not configured" },
        { status: 500 }
      )
    }

    let message: string
    let triggerType: string
    const targetIds: string[] = []

    if (body.contactIds && body.contactIds.length > 0) {
      triggerType = "specific"
      targetIds.push(...body.contactIds)
      const contactNames = await fetchContactNames(body.contactIds)
      message = `[VISTA][PROBE] Trigger: Analyze pipeline status for ${body.contactIds.length} specific contact(s):\n${contactNames.join("\n")}`
    } else if (body.type === "at-risk") {
      triggerType = "at-risk"
      message = `[VISTA][PROBE] Trigger: Identify contacts at risk of churning (no activity in 30+ days, negative score delta, or stalled pipeline).`
    } else {
      triggerType = body.type || "refresh"
      message = `[VISTA][PROBE] Trigger: Full pipeline refresh. Update encirclement levels, engagement scores, and pipeline stage health metrics for all active contacts.`
    }

    await sendMentionMessage(chatId, message)
    await logAgentTrigger("PROBE", triggerType, targetIds, message, "kevin")

    return NextResponse.json({
      success: true,
      agent: "PROBE",
      trigger_type: triggerType,
      message_sent: message,
    })
  } catch (error) {
    console.error("PROBE trigger error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}