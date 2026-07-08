import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

interface SettingsData {
  id: string
  stain_weight: number
  cluster_weight: number
  signal_weight: number
  engagement_weight: number
  cold_threshold: number
  warm_threshold: number
  engaged_threshold: number
  hot_threshold: number
  committed_threshold: number
  decay_flag_days: number
  lens_mode: string
  maria_mode: string
  scoring_schedule: string
  threshold_alerts: string
  decay_alerts: string
  weekly_digest: string
  updated_at: string | null
}

const DEFAULT_SETTINGS = {
  stain_weight: 25,
  cluster_weight: 25,
  signal_weight: 25,
  engagement_weight: 25,
  cold_threshold: 20,
  warm_threshold: 40,
  engaged_threshold: 60,
  hot_threshold: 80,
  committed_threshold: 100,
  decay_flag_days: 30,
  lens_mode: "semi-auto",
  maria_mode: "draft",
  scoring_schedule: "Monday 07:00",
  threshold_alerts: "enabled",
  decay_alerts: "enabled",
  weekly_digest: "enabled",
}

async function ensureSettingsTable(supabase: ReturnType<typeof createServerClient>) {
  try {
    await supabase.rpc("run_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          stain_weight INTEGER DEFAULT 25,
          cluster_weight INTEGER DEFAULT 25,
          signal_weight INTEGER DEFAULT 25,
          engagement_weight INTEGER DEFAULT 25,
          cold_threshold INTEGER DEFAULT 20,
          warm_threshold INTEGER DEFAULT 40,
          engaged_threshold INTEGER DEFAULT 60,
          hot_threshold INTEGER DEFAULT 80,
          committed_threshold INTEGER DEFAULT 100,
          decay_flag_days INTEGER DEFAULT 30,
          lens_mode TEXT DEFAULT 'semi-auto',
          maria_mode TEXT DEFAULT 'draft',
          scoring_schedule TEXT DEFAULT 'Monday 07:00',
          threshold_alerts TEXT DEFAULT 'enabled',
          decay_alerts TEXT DEFAULT 'enabled',
          weekly_digest TEXT DEFAULT 'enabled',
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    })
  } catch (error) {
    // Table might already exist or rpc not available
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()

    await ensureSettingsTable(supabase)

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
      })
    }

    if (!data) {
      const { data: newSettings, error: insertError } = await supabase
        .from("settings")
        .insert(DEFAULT_SETTINGS)
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({
          success: true,
          settings: DEFAULT_SETTINGS,
        })
      }

      return NextResponse.json({
        success: true,
        settings: newSettings,
      })
    }

    return NextResponse.json({
      success: true,
      settings: data,
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
    })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    await ensureSettingsTable(supabase)

    const { data: existingSettings, error: fetchError } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    const updateData: Partial<SettingsData> = {}

    if (body.stain_weight !== undefined) updateData.stain_weight = body.stain_weight
    if (body.cluster_weight !== undefined) updateData.cluster_weight = body.cluster_weight
    if (body.signal_weight !== undefined) updateData.signal_weight = body.signal_weight
    if (body.engagement_weight !== undefined) updateData.engagement_weight = body.engagement_weight
    if (body.cold_threshold !== undefined) updateData.cold_threshold = body.cold_threshold
    if (body.warm_threshold !== undefined) updateData.warm_threshold = body.warm_threshold
    if (body.engaged_threshold !== undefined) updateData.engaged_threshold = body.engaged_threshold
    if (body.hot_threshold !== undefined) updateData.hot_threshold = body.hot_threshold
    if (body.committed_threshold !== undefined) updateData.committed_threshold = body.committed_threshold
    if (body.decay_flag_days !== undefined) updateData.decay_flag_days = body.decay_flag_days
    if (body.lens_mode !== undefined) updateData.lens_mode = body.lens_mode
    if (body.maria_mode !== undefined) updateData.maria_mode = body.maria_mode
    if (body.scoring_schedule !== undefined) updateData.scoring_schedule = body.scoring_schedule
    if (body.threshold_alerts !== undefined) updateData.threshold_alerts = body.threshold_alerts
    if (body.decay_alerts !== undefined) updateData.decay_alerts = body.decay_alerts
    if (body.weekly_digest !== undefined) updateData.weekly_digest = body.weekly_digest

    updateData.updated_at = new Date().toISOString()

    let resultData: SettingsData | null = null
    let resultError: Error | null = null

    if (existingSettings) {
      const { data, error } = await supabase
        .from("settings")
        .update(updateData)
        .eq("id", existingSettings.id)
        .select()
        .single()

      resultData = data
      resultError = error
    } else {
      const { data, error } = await supabase
        .from("settings")
        .insert({ ...DEFAULT_SETTINGS, ...updateData })
        .select()
        .single()

      resultData = data
      resultError = error
    }

    if (resultError) {
      return NextResponse.json(
        { success: false, error: resultError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: resultData,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
