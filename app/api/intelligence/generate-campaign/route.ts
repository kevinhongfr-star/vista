import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { GenerateCampaignRequest, GeneratedCampaign, CampaignTouch, CampaignChannel } from "@/lib/types"

interface AICampaignResponse {
  campaign_name: string
  objective: string
  duration_days: number
  touches: Array<{
    day_offset: number
    channel: string
    action: string
    subject?: string
    body?: string
    success_criteria: string
  }>
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: GenerateCampaignRequest = await request.json()

    if (body.scope === "cluster" && !body.cluster_id) {
      return NextResponse.json(
        { success: false, error: "cluster_id is required when scope is 'cluster'" },
        { status: 400 }
      )
    }
    if (body.scope === "contacts" && (!body.contact_ids || body.contact_ids.length === 0)) {
      return NextResponse.json(
        { success: false, error: "contact_ids is required when scope is 'contacts'" },
        { status: 400 }
      )
    }
    if (!body.objective) {
      return NextResponse.json(
        { success: false, error: "objective is required" },
        { status: 400 }
      )
    }

    const touches = Math.min(body.touches || 3, 5)
    const channelMix = body.channel_mix || ["email", "linkedin", "phone"]

    let audienceSummary = ""
    let targetContacts = 0

    if (body.scope === "cluster" && body.cluster_id) {
      const { data: cluster, error: clusterError } = await supabase
        .from("density_clusters")
        .select("cluster_name, industry, geography, contact_count, contact_ids, signal_types, recommended_programs, revenue_potential")
        .eq("cluster_id", body.cluster_id)
        .single()

      if (clusterError) {
        return NextResponse.json(
          { success: false, error: clusterError.message },
          { status: 500 }
        )
      }

      if (!cluster) {
        return NextResponse.json(
          { success: false, error: "Cluster not found" },
          { status: 404 }
        )
      }

      targetContacts = cluster.contact_count || (cluster.contact_ids?.length || 0)
      audienceSummary = `Cluster: ${cluster.cluster_name}
- Industry: ${cluster.industry || "Unknown"}
- Geography: ${cluster.geography || "Unknown"}
- Contact count: ${targetContacts}
- Signal types: ${cluster.signal_types || "None"}
- Recommended programs: ${cluster.recommended_programs || "None"}
- Revenue potential: ${cluster.revenue_potential || "Unknown"}`
    } else {
      const { data: contacts, error: contactsError } = await supabase
        .from("vista_contacts")
        .select("id, name, company, role, seniority, function, industry, pipeline_stage, engagement_tier, vista_composite")
        .in("id", body.contact_ids!)

      if (contactsError) {
        return NextResponse.json(
          { success: false, error: contactsError.message },
          { status: 500 }
        )
      }

      targetContacts = contacts?.length || 0
      audienceSummary = `Target contacts (${targetContacts}):
${(contacts || []).map((c) => `- ${c.name}, ${c.role} at ${c.company} (${c.industry || "Unknown industry"}, ${c.pipeline_stage || "Prospect"}, VISTA: ${c.vista_composite || "N/A"})`).join("\n")}`
    }

    const prompt = `You are designing a BD campaign for LYC Partners executive search.

Campaign objective: ${body.objective}
Target audience: 
${audienceSummary}

Number of touches: ${touches}
Channel mix: ${channelMix.join(", ")}

Generate a ${touches}-touch campaign sequence. For each touch:
1. Day offset (when to execute, relative to campaign start)
2. Channel (email/linkedin/phone/event — must be from the channel mix)
3. Action description (what to do)
4. If email: subject line + body draft (150-200 words)
5. Success criteria (what counts as a positive response)

Return JSON: {
  "campaign_name": "...",
  "objective": "...",
  "duration_days": number,
  "touches": [
    {
      "day_offset": 0,
      "channel": "email",
      "action": "Initial outreach",
      "subject": "...",
      "body": "...",
      "success_criteria": "Reply or calendar booking"
    },
    ...
  ]
}`

    let campaign: GeneratedCampaign

    try {
      const result = await callDeepSeekJSON<AICampaignResponse | Record<string, unknown>>(prompt, {
        model: "pro",
        temperature: 0.7,
        maxTokens: 4096,
      })

      let campaignData: AICampaignResponse | undefined
      if (result && typeof result === "object") {
        if ("touches" in result && Array.isArray((result as AICampaignResponse).touches)) {
          campaignData = result as AICampaignResponse
        } else if ("campaign" in result) {
          const inner = (result as { campaign: AICampaignResponse }).campaign
          if (inner && typeof inner === "object" && "touches" in inner && Array.isArray(inner.touches)) {
            campaignData = inner
          }
        }
      }

      if (campaignData) {
        const validTouches: CampaignTouch[] = campaignData.touches.map((t) => ({
          day_offset: t.day_offset || 0,
          channel: (channelMix.includes(t.channel as CampaignChannel) ? t.channel : "email") as CampaignChannel,
          action: t.action || "Outreach",
          subject: t.subject,
          body: t.body,
          success_criteria: t.success_criteria || "Reply or engagement",
        }))

        campaign = {
          campaign_name: campaignData.campaign_name || "AI Generated Campaign",
          objective: campaignData.objective || body.objective,
          duration_days: campaignData.duration_days || Math.max(...validTouches.map((t) => t.day_offset), 14),
          touches: validTouches,
          target_contacts: targetContacts,
        }
      } else {
        campaign = generateFallbackCampaign(body.objective, touches, channelMix, targetContacts)
      }
    } catch (aiError) {
      console.error("AI campaign generation failed:", aiError)
      campaign = generateFallbackCampaign(body.objective, touches, channelMix, targetContacts)
    }

    // Log activity
    try {
      const { data: campaignRecord } = await supabase
        .from("campaign_activities")
        .insert({
          activity_type: "AI Generated",
          campaign_type: "AI Generated",
          activity_status: "Drafted",
          target_cluster_id: body.scope === "cluster" ? body.cluster_id : null,
          message_subject: campaign.campaign_name,
          message_body: JSON.stringify(campaign.touches, null, 2),
          body: `Objective: ${campaign.objective}\nDuration: ${campaign.duration_days} days\nTouches: ${campaign.touches.length}\nTarget contacts: ${targetContacts}`,
          contacts_invited_count: targetContacts,
        })
        .select("id")
        .single()

      if (campaignRecord) {
        // Log each touch as an activity note
        for (const touch of campaign.touches) {
          await supabase.from("activities").insert({
            campaign_id: campaignRecord.id,
            activity_type: "Note",
            activity_date: new Date().toISOString(),
            subject: `Campaign Touch Day ${touch.day_offset}: ${touch.action}`,
            content: touch.body || touch.action,
            notes: `Channel: ${touch.channel}, Success: ${touch.success_criteria}`,
            created_by: "AI",
          })
        }
      }
    } catch (logError) {
      console.error("Failed to log AI campaign generation:", logError)
    }

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error) {
    console.error("Generate campaign error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackCampaign(
  objective: string,
  touches: number,
  channelMix: CampaignChannel[],
  targetContacts: number
): GeneratedCampaign {
  const touchTemplates: CampaignTouch[] = [
    {
      day_offset: 0,
      channel: "email",
      action: "Initial outreach email",
      subject: "Connecting — LYC Partners & {company_name}",
      body: "Hi {contact_name},\n\nI wanted to reach out personally. At LYC Partners, we specialize in executive search for high-growth companies. I'd love to learn about your current priorities and explore how we might help.\n\nWould you be open to a brief call?\n\nBest,\nKevin Hong",
      success_criteria: "Reply or calendar booking",
    },
    {
      day_offset: 3,
      channel: "linkedin",
      action: "LinkedIn connection request with personalized note",
      success_criteria: "Connection accepted or message reply",
    },
    {
      day_offset: 7,
      channel: "email",
      action: "Follow-up email with value-add content",
      subject: "Following up — insights for {company_name}",
      body: "Hi {contact_name},\n\nI wanted to follow up on my previous note. I've been thinking about {company_name}'s growth trajectory and wanted to share a few insights from our work with similar companies.\n\nWould a 20-minute call this week work?\n\nBest,\nKevin Hong",
      success_criteria: "Reply or meeting booked",
    },
    {
      day_offset: 14,
      channel: "phone",
      action: "Phone call to touch base",
      success_criteria: "Conversation or voicemail returned",
    },
    {
      day_offset: 21,
      channel: "email",
      action: "Final follow-up with different angle",
      subject: "Last note — {company_name} opportunity",
      body: "Hi {contact_name},\n\nI don't want to be a pest, so this will be my last note for now. If the timing isn't right, I completely understand.\n\nIf things change, I'd love to reconnect. In the meantime, feel free to reach out if there's anything I can help with.\n\nBest,\nKevin Hong",
      success_criteria: "Reply or explicit not interested",
    },
  ]

  const selectedTouches = touchTemplates
    .slice(0, touches)
    .map((t) => ({
      ...t,
      channel: channelMix.includes(t.channel) ? t.channel : channelMix[0],
    }))

  return {
    campaign_name: "AI-Generated Multi-Touch Campaign",
    objective,
    duration_days: Math.max(...selectedTouches.map((t) => t.day_offset), 14),
    touches: selectedTouches,
    target_contacts: targetContacts,
  }
}
