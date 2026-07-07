import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing Supabase environment variables',
    }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    const { data, error, count } = await supabase
      .from('vista_contacts')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
      }, { status: 500 })
    }

    const { data: pipelineData, error: pipelineError } = await supabase
      .from('v_pipeline_summary')
      .select('*')

    return NextResponse.json({
      status: 'ok',
      contacts_count: count,
      pipeline: pipelineData,
      pipeline_error: pipelineError?.message || null,
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      message: e.message,
    }, { status: 500 })
  }
}
