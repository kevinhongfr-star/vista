import { NextResponse } from "next/server"
import { sendMentionMessage } from "@/lib/feishu/client"
import { logAgentTrigger, fetchContactNames, fetchClusterInfo, getAgentChatId } from "@/lib/agents/utils"
import type { AgentTriggerRequest } from "@/lib/types"

export async function POST(request: Request) {
  
  try {
    const body: AgentTriggerRequest = await request.json().catch(() => ({}))
    const chatId = getAgentChatId("LENS")
    
    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "LENS chat ID not configured" },
        { status: 500 }
      )
    }
    
    let message: string
    let triggerType: string
    const targetIds: string[] = []
    
    // Build context-aware message based on request body
    if (body.contactIds && body.contactIds.length > 0) {
      // Specific contacts trigger
      triggerType = "specific"
      targetIds.push(...body.contactIds)
      const contactNames = await fetchContactNames(body.contactIds)
      message = `[VISTA][LENS] Trigger: Score ${body.contactIds.length} specific contact(s):\n${contactNames.join("\n")}`
    } else if (body.clusterId) {
      // Cluster trigger
      triggerType = "cluster"
      targetIds.push(body.clusterId)
      const clusterInfo = await fetchClusterInfo(body.clusterId)
      if (clusterInfo) {
        message = `[VISTA][LENS] Trigger: Score all contacts in cluster "${clusterInfo.name}" (${clusterInfo.count} contacts)`
      } else {
        message = `[VISTA][LENS] Trigger: Score all contacts in cluster ${body.clusterId}`
      }
    } else if (body.scope) {
      // Scope-based trigger
      triggerType = body.scope
      if (body.scope === "all") {
        message = `[VISTA][LENS] Trigger: Run LENS scoring on all contacts. Priority: contacts with decay_flag=true or score=0.`
      } else if (body.scope === "unscored") {
        message = `[VISTA][LENS] Trigger: Score all contacts with priority_score=0 or null.`
      } else if (body.scope === "decayed") {
        message = `[VISTA][LENS] Trigger: Re-score all contacts with decay_flag=true (stale scores).`
      } else {
        message = `[VISTA][LENS] Trigger: Run scoring with scope: ${body.scope}`
      }
    } else {
      // Default: full scoring
      triggerType = "all"
      message = `[VISTA][LENS] Trigger: Run LENS scoring on all contacts. Priority: contacts with decay_flag=true or score=0.`
    }
    
    // Send message to Feishu
    await sendMentionMessage(chatId, message)
    
    // Log trigger to activities
    await logAgentTrigger("LENS", triggerType, targetIds, message, "kevin")
    
    return NextResponse.json({
      success: true,
      agent: "LENS",
      trigger_type: triggerType,
      message_sent: message,
    })
  } catch (error) {
    console.error("LENS trigger error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}