import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { CreateCampaignRequest } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const campaignType = searchParams.get("campaign_type")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("campaign_activities")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("body", `%${search}%`)
    }
    if (campaignType) {
      query = query.eq("campaign_type", campaignType)
    }
    if (status) {
      query = query.eq("activity_status", status)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      campaigns: data || [],
      total: count || 0,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: CreateCampaignRequest = await request.json()

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaign_activities")
      .insert({
        activity_type: body.campaign_type,
        campaign_type: body.campaign_type,
        activity_status: "Drafted",
        target_cluster_id: body.target_cluster_id,
        email_template_id: body.email_template_id,
        message_subject: body.subject,
        message_body: body.body,
        body: body.body,
      })
      .select()
      .single()

    if (campaignError) {
      return NextResponse.json({ success: false, error: campaignError.message }, { status: 500 })
    }

    // If contact_ids provided, add them to campaign_contacts
    if (body.contact_ids && body.contact_ids.length > 0) {
      const campaignContacts = body.contact_ids.map(contactId => ({
        campaign_id: campaign.id,
        contact_id: contactId,
        status: "Invited",
        invitation_date: new Date().toISOString(),
      }))

      await supabase.from("campaign_contacts").insert(campaignContacts)

      // Update invited count
      await supabase
        .from("campaign_activities")
        .update({ contacts_invited_count: body.contact_ids.length })
        .eq("id", campaign.id)
    }

    // If target_cluster_id provided, add all contacts from cluster
    if (body.target_cluster_id) {
      const { data: clusterContacts } = await supabase
        .from("vista_contacts")
        .select("id")
        .eq("density_cluster_id", body.target_cluster_id)

      if (clusterContacts && clusterContacts.length > 0) {
        const campaignContacts = clusterContacts.map(c => ({
          campaign_id: campaign.id,
          contact_id: c.id,
          status: "Invited",
          invitation_date: new Date().toISOString(),
        }))

        await supabase.from("campaign_contacts").insert(campaignContacts)

        await supabase
          .from("campaign_activities")
          .update({ contacts_invited_count: clusterContacts.length })
          .eq("id", campaign.id)
      }
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}