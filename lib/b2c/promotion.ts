import { createServerClient } from "@/lib/supabase/server"

export interface PromotionResult {
  contact_id: string
  created_new: boolean
  matched_via: string
}

export async function promoteB2CToB2B(
  leadId: string
): Promise<PromotionResult> {
  const supabase = createServerClient()

  const { data: lead, error: leadError } = await supabase
    .from("vista_b2c_leads")
    .select("*")
    .eq("id", leadId)
    .single()

  if (leadError || !lead) {
    throw new Error("Lead not found")
  }

  const email = lead.email as string | null
  const linkedinUrl = lead.linkedin_url as string | null

  let contactId: string | null = null
  let matchedVia = "manual"
  let createdNew = false

  if (email) {
    const { data: emailMatch } = await supabase
      .from("vista_contacts")
      .select("id")
      .eq("email", email)
      .single()
    if (emailMatch) {
      contactId = emailMatch.id
      matchedVia = "email"
    }
  }

  if (!contactId && linkedinUrl) {
    const { data: linkedinMatch } = await supabase
      .from("vista_contacts")
      .select("id")
      .eq("profile_url", linkedinUrl)
      .single()
    if (linkedinMatch) {
      contactId = linkedinMatch.id
      matchedVia = "linkedin"
    }
  }

  if (!contactId) {
    const { data: newContact, error: contactError } = await supabase
      .from("vista_contacts")
      .insert({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        role: lead.title,
        profile_url: lead.linkedin_url,
        industry: lead.industry,
        location: lead.location,
        pipeline_stage: "Prospect",
        data_source: "b2c_conversion",
        notes: `B2C conversion from DEX AI portal. B2C tier: ${lead.current_tier || "free"}. Total B2C spend: ¥${lead.total_spend_cny || 0}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (contactError) {
      throw new Error(`Failed to create contact: ${contactError.message}`)
    }

    contactId = newContact.id
    createdNew = true
    matchedVia = "manual"
  }

  const now = new Date().toISOString()

  const { error: conversionError } = await supabase
    .from("vista_b2c_conversions")
    .insert({
      b2c_lead_id: leadId,
      b2c_user_id: lead.b2c_user_id,
      vista_contact_id: contactId,
      b2b_score_at_conversion: lead.b2b_potential_score || 0,
      pipeline_stage_before: lead.pipeline_stage,
      conversion_reason: "manual_promotion",
      b2c_total_spend_cny: lead.total_spend_cny || 0,
      b2c_credits_purchased: lead.total_credits_purchased || 0,
      b2c_assessments_completed: lead.assessments_completed || [],
      b2c_days_as_user: lead.b2c_signup_date
        ? Math.floor(
            (Date.now() - new Date(lead.b2c_signup_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      converted_at: now,
    })

  if (conversionError) {
    throw new Error(`Failed to log conversion: ${conversionError.message}`)
  }

  const { error: updateError } = await supabase
    .from("vista_b2c_leads")
    .update({
      pipeline_stage: "promoted",
      linked_contact_id: contactId,
      linked_contact_matched_via: matchedVia,
      updated_at: now,
    })
    .eq("id", leadId)

  if (updateError) {
    throw new Error(`Failed to update lead: ${updateError.message}`)
  }

  if (!contactId) {
    throw new Error("Failed to create or link contact")
  }

  return {
    contact_id: contactId,
    created_new: createdNew,
    matched_via: matchedVia,
  }
}
