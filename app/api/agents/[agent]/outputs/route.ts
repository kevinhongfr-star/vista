import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { AgentName, AgentOutput } from "@/lib/types"

interface RouteParams {
  params: { agent: string }
}

/**
 * GET /api/agents/[agent]/outputs
 * Fetch recent outputs from a specific agent
 * Query params: ?limit=10&since=ISO-date
 */
export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createServerClient()
  const agentUpper = params.agent.toUpperCase() as AgentName

  // Validate agent name
  const validAgents: AgentName[] = ["LENS", "MARIA", "PROBE", "CARL"]
  if (!validAgents.includes(agentUpper)) {
    return NextResponse.json(
      { success: false, error: `Invalid agent: ${params.agent}` },
      { status: 400 }
    )
  }

  // Parse query params
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
  const since = searchParams.get("since")

  try {
    let query = supabase
      .from("agent_outputs")
      .select("*")
      .eq("agent", agentUpper)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (since) {
      query = query.gte("created_at", since)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent: agentUpper,
      outputs: data as AgentOutput[],
      count: data?.length || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}