import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contact_id, program_id, status } = body

    if (!contact_id || !program_id) {
      return NextResponse.json(
        { error: 'Contact ID and Program ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const assignmentData: Record<string, unknown> = {
      contact_id,
      program_id,
      status: status || 'Invited',
      assigned_date: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('program_assignments')
      .insert(assignmentData)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, assignment: data })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('program_assignments')
      .select('*')
      .order('assigned_date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, assignments: data })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
