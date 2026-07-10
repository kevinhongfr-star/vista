import { createServerClient } from "@/lib/supabase/server"
import type { AgentName } from "@/lib/types"

// Agent chat ID mapping from env vars
export const AGENT_CHAT_ENV: Record<AgentName, string> = {
  LENS: process.env.FEISHU_CHAT_LENS || "",
  MARIA: process.env.FEISHU_CHAT_MARIA || "",
  PROBE: process.env.FEISHU_CHAT_PROBE || "",
  CARL: process.env.FEISHU_CHAT_CARL || "",
}

/**
 * Get the chat ID for a specific agent
 */
export function getAgentChatId(agent: AgentName): string {
  return AGENT_CHAT_ENV[agent]
}

/**
 * Log agent trigger to activities table
 */
export async function logAgentTrigger(
  agent: AgentName,
  triggerType: string,
  targetIds: string[],
  messageSent: string,
  triggeredBy: string = "kevin"
): Promise<void> {
  const supabase = createServerClient()
  
  await supabase.from("activities").insert({
    contact_id: targetIds[0] || null,
    activity_type: "Note",
    activity_date: new Date().toISOString(),
    subject: `Agent Trigger: ${agent}`,
    content: messageSent,
    outcome: `Trigger type: ${triggerType}, Targets: ${targetIds.length}`,
    notes: JSON.stringify({
      type: "agent_trigger",
      details: {
        agent,
        trigger_type: triggerType,
        target_ids: targetIds,
        message_sent: messageSent,
        triggered_by: triggeredBy,
      },
    }),
    created_by: triggeredBy,
  })
}

/**
 * Fetch contact names for message formatting
 */
export async function fetchContactNames(contactIds: string[]): Promise<string[]> {
  if (!contactIds.length) return []
  
  const supabase = createServerClient()
  const { data } = await supabase
    .from("vista_contacts")
    .select("id, name, company")
    .in("id", contactIds.slice(0, 20))
  
  return (data || []).map((c) => `${c.name || "Unknown"} (${c.company || "N/A"})`)
}

/**
 * Fetch cluster info for message formatting
 */
export async function fetchClusterInfo(clusterId: string): Promise<{ name: string; count: number } | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("density_clusters")
    .select("cluster_id, industry, contact_count")
    .eq("cluster_id", clusterId)
    .single()
  
  if (!data) return null
  return { name: data.industry || "Unknown Cluster", count: data.contact_count || 0 }
}

/**
 * Determine agent name from chat ID (for Feishu event handling)
 */
export function getAgentFromChatId(chatId: string): AgentName | null {
  for (const [agent, id] of Object.entries(AGENT_CHAT_ENV)) {
    if (id === chatId) return agent as AgentName
  }
  return null
}

/**
 * Parse agent response for structured data
 */
export function parseAgentResponse(
  agent: AgentName,
  rawText: string
): Record<string, unknown> | null {
  // Try to extract JSON blocks from markdown code blocks
  const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // Fall through to raw extraction
    }
  }
  
  // Try direct JSON parse
  try {
    return JSON.parse(rawText)
  } catch {
    // Fall through to metadata extraction
  }
  
  // Fallback: extract metadata based on agent type
  const result: Record<string, unknown> = { raw: rawText, agent, timestamp: new Date().toISOString() }
  
  // Try to extract counts from common patterns
  const countMatch = rawText.match(/(\d+)\s+(contacts?|scored|updated|flagged)/i)
  if (countMatch) {
    result[countMatch[2].toLowerCase()] = parseInt(countMatch[1])
  }
  
  return result
}