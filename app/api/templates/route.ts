import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("vista_outreach_templates")
      .select("*")
      .eq("is_active", true)
      .order("bucket")
      .order("touch_number")

    if (error) {
      return NextResponse.json({ templates: [], error: error.message }, { status: 500 })
    }

    const templates = (data || []).map((t: any) => ({
      id: t.id,
      template_name: t.name,
      template_type: t.bucket,
      subject_template: t.subject_line,
      body_template: t.body_template,
      variables: t.variables || {},
      channel: t.channel,
      touch_number: t.touch_number,
      description: t.description,
    }))

    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json({ templates: [], error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("vista_outreach_templates")
      .insert({
        name: body.template_name,
        bucket: body.template_type || "universal",
        subject_line: body.subject_template,
        body_template: body.body_template,
        variables: body.variables || {},
        channel: body.channel || "any",
        touch_number: body.touch_number || 1,
        description: body.description || "",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const template = {
      id: data.id,
      template_name: data.name,
      template_type: data.bucket,
      subject_template: data.subject_line,
      body_template: data.body_template,
      variables: data.variables,
    }

    return NextResponse.json({ success: true, template })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
