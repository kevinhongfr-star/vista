import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { EmailTemplate } from "@/lib/types"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const templateId = params.id
    const body = await request.json()

    const { data, error } = await supabase
      .from("email_templates")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, template: data })
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
      .from("email_templates")
      .delete()
      .eq("id", templateId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}