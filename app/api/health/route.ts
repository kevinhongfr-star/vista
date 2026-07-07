import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing env vars',
      env: {
        SUPABASE_URL: supabaseUrl ? `set (${supabaseUrl.substring(0, 20)}...)` : 'MISSING',
        SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? `set (${supabaseKey.substring(0, 15)}...)` : 'MISSING',
      }
    }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })

    // Test basic connectivity
    const { data, error, count } = await supabase
      .from('vista_contacts')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error,
        env: {
          SUPABASE_URL: supabaseUrl.substring(0, 30) + '...',
          KEY_PREFIX: supabaseKey.substring(0, 15) + '...',
        }
      }, { status: 500 })
    }

    // Test pipeline view
    const { data: pipelineData, error: pipelineError } = await supabase
      .from('v_pipeline_summary')
      .select('*')

    return NextResponse.json({
      status: 'ok',
      contacts_count: count,
      pipeline: pipelineData,
      pipeline_error: pipelineError?.message || null,
      env: {
        SUPABASE_URL: supabaseUrl.substring(0, 30) + '...',
        KEY_PREFIX: supabaseKey.substring(0, 15) + '...',
      }
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      message: e.message,
      stack: e.stack,
    }, { status: 500 })
  }
}
