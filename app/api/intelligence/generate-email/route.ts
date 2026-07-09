import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { callDeepSeekJSON } from "@/lib/deepseek"
import type { GenerateEmailRequest, GeneratedEmail } from "@/lib/types"

interface AIEmailResponse {
  subject: string
  body: string
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: GenerateEmailRequest = await request.json()

    if (!body.contact_ids || body.contact_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "contact_ids is required" },
        { status: 400 }
      )
    }

    const tone = body.tone || "warm"
    const templateType = body.template_type || "Custom"
    const context = body.context || ""

    // Fetch contact data
    const { data: contacts, error: contactsError } = await supabase
      .from("vista_contacts")
      .select("id, name, company, role, seniority, function, industry, pipeline_stage, last_touch_date, engagement_tier")
      .in("id", body.contact_ids)

    if (contactsError) {
      return NextResponse.json(
        { success: false, error: contactsError.message },
        { status: 500 }
      )
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No contacts found" },
        { status: 404 }
      )
    }

    // Fetch recent signals for each contact
    const contactIds = contacts.map((c) => c.id)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: signals } = await supabase
      .from("signals")
      .select("signal_type, title, signal_strength, detected_date, contact_ids")
      .or(`contact_ids.cs.{${contactIds.join(",")}}`)
      .gte("detected_date", thirtyDaysAgo.toISOString())
      .order("detected_date", { ascending: false })
      .limit(20)

    const emails: GeneratedEmail[] = []

    for (const contact of contacts) {
      // Find signals for this contact
      const contactSignals = (signals || []).filter((s) => {
        if (s.contact_ids && Array.isArray(s.contact_ids)) {
          return s.contact_ids.includes(contact.id)
        }
        return false
      })

      const signalSummary = contactSignals.length > 0
        ? contactSignals.map((s) => `${s.signal_type}: ${s.title} (${s.signal_strength})`).join("; ")
        : "No recent signals detected"

      const lastTouch = contact.last_touch_date
      const lastTouchStr = lastTouch
        ? new Date(lastTouch).toLocaleDateString()
        : "No prior contact"

      const prompt = `You are writing a business development email for Kevin Hong, Managing Partner at LYC Partners (executive search firm).

Contact profile:
- Name: ${contact.name || "Unknown"}
- Company: ${contact.company || "Unknown"}
- Role: ${contact.role || "Unknown"}
- Seniority: ${contact.seniority || "Unknown"}
- Function: ${contact.function || "Unknown"}
- Industry: ${contact.industry || "Unknown"}
- Pipeline stage: ${contact.pipeline_stage || "Prospect"}
- Last touch: ${lastTouchStr}
- Engagement tier: ${contact.engagement_tier || "Unknown"}
- Recent signals: ${signalSummary}

Template type: ${templateType}
Tone: ${tone}
Additional context: ${context || "None"}

Generate:
1. A compelling subject line (max 60 chars)
2. Email body (150-250 words) that:
   - References something specific about the contact (company news, role change, signal)
   - Positions LYC Partners value without being salesy
   - Has a clear but low-pressure CTA
   - Uses {contact_name} and {company_name} as template variables for personalization

Return JSON: { "subject": "...", "body": "..." }`

      try {
        const result = await callDeepSeekJSON<AIEmailResponse | { email: AIEmailResponse } | Record<string, unknown>>(prompt, {
          model: "pro",
          temperature: 0.7,
          maxTokens: 1024,
        })

        let emailData: AIEmailResponse | undefined
        if (result && typeof result === "object") {
          if ("subject" in result && "body" in result) {
            emailData = result as AIEmailResponse
          } else if ("email" in result) {
            const inner = (result as { email: AIEmailResponse }).email
            if (inner && typeof inner === "object" && "subject" in inner && "body" in inner) {
              emailData = inner
            }
          }
        }

        if (emailData) {
          emails.push({
            contact_id: contact.id,
            subject: emailData.subject,
            body: emailData.body,
            personalization: {
              contact_name: contact.name || "there",
              company_name: contact.company || "your company",
            },
          })
        } else {
          // Fallback template
          emails.push(generateFallbackEmail(contact, templateType))
        }
      } catch (aiError) {
        console.error(`AI email generation failed for contact ${contact.id}:`, aiError)
        emails.push(generateFallbackEmail(contact, templateType))
      }
    }

    // Log activity
    try {
      await supabase.from("activities").insert(
        emails.map((e) => ({
          contact_id: e.contact_id,
          activity_type: "Email Sent",
          activity_date: new Date().toISOString(),
          subject: `AI Draft Generated: ${e.subject}`,
          content: e.body,
          notes: `Template: ${templateType}, Tone: ${tone}`,
          created_by: "AI",
        }))
      )
    } catch (logError) {
      console.error("Failed to log AI email generation:", logError)
    }

    return NextResponse.json({
      success: true,
      emails,
    })
  } catch (error) {
    console.error("Generate email error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

function generateFallbackEmail(
  contact: { id: string; name?: string; company?: string },
  templateType: string
): GeneratedEmail {
  const name = contact.name || "there"
  const company = contact.company || "your company"

  const fallbacks: Record<string, { subject: string; body: string }> = {
    "Executive Brief": {
      subject: `Exclusive Executive Brief for {contact_name} at {company_name}`,
      body: `Hi {contact_name},\n\nI wanted to share an executive brief that I think would be highly relevant to {company_name}'s current strategic priorities.\n\nAt LYC Partners, we've been tracking key trends in your industry and have identified several opportunities that align with your role. I'd love to schedule a brief 20-minute call to walk you through the insights.\n\nWould next week work for a quick conversation?\n\nBest regards,\nKevin Hong\nManaging Partner, LYC Partners`,
    },
    "Follow-up": {
      subject: `Following up — {company_name} partnership`,
      body: `Hi {contact_name},\n\nI wanted to follow up on my previous note regarding {company_name}. I know things get busy, so I wanted to keep this brief.\n\nWe've helped several companies in your space with executive search and talent strategy. I'd welcome the chance to discuss how we might support {company_name}'s goals.\n\nHappy to find a time that works — would a quick call this week or next be convenient?\n\nBest regards,\nKevin Hong\nManaging Partner, LYC Partners`,
    },
    "Re-engagement": {
      subject: `Reconnecting — {company_name} updates`,
      body: `Hi {contact_name},\n\nIt's been a while since we last connected. I've been following {company_name}'s recent developments and wanted to reach back out.\n\nThere have been some interesting shifts in the executive landscape that I think would be valuable for you to know about. I'd love to catch up and share what we're seeing.\n\nWould you be open to a brief call in the coming weeks?\n\nBest regards,\nKevin Hong\nManaging Partner, LYC Partners`,
    },
  }

  const fallback = fallbacks[templateType] || {
    subject: `Touching base — {contact_name} at {company_name}`,
    body: `Hi {contact_name},\n\nI hope this note finds you well. I wanted to reach out and connect regarding {company_name}'s strategic initiatives.\n\nAt LYC Partners, we specialize in executive search and talent strategy. I'd welcome the opportunity to learn more about your current priorities and explore how we might be helpful.\n\nWould you be available for a brief introductory call?\n\nBest regards,\nKevin Hong\nManaging Partner, LYC Partners`,
  }

  return {
    contact_id: contact.id,
    subject: fallback.subject
      .replace(/{contact_name}/gi, name)
      .replace(/{company_name}/gi, company),
    body: fallback.body
      .replace(/{contact_name}/gi, name)
      .replace(/{company_name}/gi, company),
    personalization: { contact_name: name, company_name: company },
  }
}
