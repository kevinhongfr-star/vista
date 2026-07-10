import { NextResponse } from "next/server"
import { sendMentionMessage } from "@/lib/feishu/client"
import { logAgentTrigger, fetchContactNames, fetchClusterInfo, getAgentChatId } from "@/lib/agents/utils"
import type { AgentTriggerRequest } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body: AgentTriggerRequest = await request.json().catch(() => ({}))
    const chatId = getAgentChatId("MARIA")

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "MARIA chat ID not configured" },
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
      message = `[VISTA][MARIA] Trigger: Draft outreach sequence for ${body.contactIds.length} contact(s):\n${contactNames.join("\n")}\nObjective: ${body.context || "Generate personalized email campaign"}`
    } else if (body.clusterId) {
      triggerType = "cluster"
      targetIds.push(body.clusterId)
      const clusterInfo = await fetchClusterInfo(body.clusterId)
      if (clusterInfo) {
        message = `[VISTA][MARIA] Trigger: Draft outreach campaign for cluster "${clusterInfo.name}" (${clusterInfo.count} contacts).\nObjective: ${body.context || "Generate multi-touch campaign"}`
      } else {
        message = `[VISTA][MARIA] Trigger: Draft outreach campaign for cluster ${body.clusterId}`
      }
    } else {
      triggerType = "all"
      message = `[VISTA][MARIA] Trigger: Generate campaign drafts for top 10 Hot contacts with no recent outreach.`
    }

    await sendMentionMessage(chatId, message)
    await logAgentTrigger("MARIA", triggerType, targetIds, message, "kevin")

    return NextResponse.json({
      success: true,
      agent: "MARIA",
      trigger_type: triggerType,
      message_sent: message,
    })
  } catch (error) {
    console.error("MARIA trigger error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}