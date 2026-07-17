import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const templateId = params.id
    const body = await request.json()

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.template_name !== undefined) updates.name = body.template_name
    if (body.template_type !== undefined) updates.bucket = body.template_type
    if (body.subject_template !== undefined) updates.subject_line = body.subject_template
    if (body.body_template !== undefined) updates.body_template = body.body_template
    if (body.variables !== undefined) updates.variables = body.variables
    if (body.channel !== undefined) updates.channel = body.channel
    if (body.touch_number !== undefined) updates.touch_number = body.touch_number
    if (body.description !== undefined) updates.description = body.description
    if (body.is_active !== undefined) updates.is_active = body.is_active

    const { data, error } = await supabase
      .from("vista_outreach_templates")
      .update(updates)
      .eq("id", templateId)
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const templateId = params.id

    const { error } = await supabase
      .from("vista_outreach_templates")
      .update({ is_active: false })
      .eq("id", templateId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
