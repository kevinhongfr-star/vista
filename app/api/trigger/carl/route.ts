import { NextResponse } from "next/server"
import { sendMessage } from "@/lib/feishu/client"
import { logAgentTrigger, fetchClusterInfo, getAgentChatId } from "@/lib/agents/utils"
import type { AgentTriggerRequest } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body: AgentTriggerRequest = await request.json().catch(() => ({}))
    const chatId = getAgentChatId("CARL")

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "CARL chat ID not configured" },
        { status: 500 }
      )
    }

    let message: string
    let triggerType: string
    const targetIds: string[] = []

    if (body.clusterId) {
      triggerType = body.type || "cluster-analysis"
      targetIds.push(body.clusterId)
      const clusterInfo = await fetchClusterInfo(body.clusterId)
      if (clusterInfo) {
        message = `[VISTA][CARL] Trigger: Strategic analysis of cluster "${clusterInfo.name}" (${clusterInfo.count} contacts).\n${body.context ? `Context: ${body.context}` : "Analyze concentration risk, diversification opportunities, and strategic positioning."}`
      } else {
        message = `[VISTA][CARL] Trigger: Strategic analysis of cluster ${body.clusterId}`
      }
    } else if (body.type === "market-scan") {
      triggerType = "market-scan"
      message = `[VISTA][CARL] Trigger: Market landscape scan. Identify emerging trends, competitive dynamics, and strategic opportunities.`
    } else {
      triggerType = body.type || "strategic-review"
      message = `[VISTA][CARL] Trigger: Full strategic review. Evaluate current portfolio health, cluster diversification, and strategic positioning.`
    }

    await sendMessage(chatId, message)
    await logAgentTrigger("CARL", triggerType, targetIds, message, "kevin")

    return NextResponse.json({
      success: true,
      agent: "CARL",
      trigger_type: triggerType,
      message_sent: message,
    })
  } catch (error) {
    console.error("CARL trigger error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}