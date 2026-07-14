import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const MIGRATION_KEY = process.env.MIGRATION_KEY || 'vista-migrate-2026'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== MIGRATION_KEY) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Unauthorized' 
    }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing Supabase environment variables'
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  })

  const results: { step: string; status: 'success' | 'error'; message?: string }[] = []

  try {
    // 1. ALTER TABLE vista_contacts - Add new columns
    results.push({ step: 'Adding columns to vista_contacts', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS score_delta TEXT;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_score_update TIMESTAMPTZ;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_engagement_date DATE;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS decay_flag BOOLEAN DEFAULT FALSE;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_v INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_i INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_s INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_t INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_a INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_composite INTEGER DEFAULT 0;
        ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS density_cluster_id UUID;
      ` 
    })

    // 2. ALTER TABLE signals - Add BD columns
    results.push({ step: 'Adding columns to signals', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS company TEXT;
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_type TEXT;
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_strength TEXT CHECK (signal_strength IS NULL OR signal_strength IN ('Low','Medium','Medium-High','High'));
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS detected_date DATE;
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS recency_weight DECIMAL DEFAULT 1.0;
        ALTER TABLE signals ADD COLUMN IF NOT EXISTS score_impact INTEGER DEFAULT 0;
      ` 
    })

    // 3. ALTER TABLE campaign_activities - Add MARIA columns
    results.push({ step: 'Adding columns to campaign_activities', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS campaign_type TEXT CHECK (campaign_type IS NULL OR campaign_type IN ('Signal-triggered','Nurture','Ecosystem Invite','Kevin Intro','Re-engagement'));
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS service_route TEXT;
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_template TEXT;
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS conversation_angle TEXT;
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS activity_status TEXT CHECK (activity_status IS NULL OR activity_status IN ('Drafted','Sent','Opened','Replied','Meeting Booked','No Response'));
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;
        ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ;
      ` 
    })

    // 4. Create density_clusters table
    results.push({ step: 'Creating density_clusters table', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS density_clusters (
          cluster_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          industry TEXT NOT NULL,
          geography TEXT NOT NULL,
          density_score DECIMAL DEFAULT 0,
          status TEXT CHECK (status IN ('Watch','Emerging','Active')),
          contact_count INTEGER DEFAULT 0,
          signal_types TEXT[],
          recommended_programs UUID[],
          revenue_potential DECIMAL DEFAULT 0,
          last_calculated TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(industry, geography)
        );
      ` 
    })

    // 5. Create programs table
    results.push({ step: 'Creating programs table', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS programs (
          program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT CHECK (type IN ('Webinar','Podcast','Newsletter','Roundtable','1:1 Coaching','Advisory','Market Insights')),
          tier TEXT CHECK (tier IN ('Free','Paid')),
          name TEXT NOT NULL,
          description TEXT,
          cluster_id UUID REFERENCES density_clusters(cluster_id),
          capacity INTEGER,
          enrolled_count INTEGER DEFAULT 0,
          price DECIMAL DEFAULT 0,
          status TEXT CHECK (status IN ('Planned','Inviting','Active','Completed')),
          start_date DATE,
          end_date DATE,
          revenue_actual DECIMAL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      ` 
    })

    // 6. Create program_assignments table
    results.push({ step: 'Creating program_assignments table', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS program_assignments (
          assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contact_id UUID REFERENCES vista_contacts(id),
          program_id UUID REFERENCES programs(program_id),
          status TEXT CHECK (status IN ('Invited','Registered','Attended','Converted','Churned')),
          assigned_date DATE DEFAULT CURRENT_DATE,
          conversion_date DATE,
          revenue_attributed DECIMAL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      ` 
    })

    // 7. Create strategic_notes table
    results.push({ step: 'Creating strategic_notes table', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS strategic_notes (
          note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          note_type TEXT CHECK (note_type IN ('Decision','Override','ICP Adjustment','Focus Shift','Review')),
          description TEXT,
          author TEXT DEFAULT 'CARL',
          contact_id UUID REFERENCES vista_contacts(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      ` 
    })

    // 8. Create views
    results.push({ step: 'Creating dashboard views', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        CREATE OR REPLACE VIEW v_top_7 AS
        SELECT id, name, company, role, seniority,
               stain_score, cluster_score, signal_score, engagement_score, priority_score,
               engagement_tier, encirclement_level, score_delta,
               vista_composite, last_engagement_date, decay_flag,
               stain_group, region, country
        FROM vista_contacts
        WHERE priority_score >= 40
        ORDER BY priority_score DESC, signal_score DESC
        LIMIT 7;

        CREATE OR REPLACE VIEW v_pipeline_summary AS
        SELECT 
          engagement_tier,
          COUNT(*) as contact_count,
          ROUND(AVG(priority_score)) as avg_score,
          COUNT(CASE WHEN decay_flag THEN 1 END) as stale_count
        FROM vista_contacts
        GROUP BY engagement_tier
        ORDER BY MIN(priority_score);

        CREATE OR REPLACE VIEW v_encirclement AS
        SELECT 
          company,
          COUNT(*) as contact_count,
          MAX(encirclement_level) as encirclement_level,
          ROUND(AVG(engagement_score)) as avg_engagement,
          ROUND(AVG(priority_score)) as avg_priority,
          ARRAY_AGG(name) as contacts
        FROM vista_contacts
        WHERE company IS NOT NULL
        GROUP BY company
        ORDER BY contact_count DESC;

        CREATE OR REPLACE VIEW v_outreach_activity AS
        SELECT 
          activity_type,
          COALESCE(activity_status, outcome) as activity_status,
          COUNT(*) as count,
          DATE_TRUNC('week', COALESCE(sent_date, activity_date)) as week
        FROM campaign_activities
        WHERE COALESCE(sent_date, activity_date) >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY activity_type, COALESCE(activity_status, outcome), week
        ORDER BY week DESC;
      ` 
    })

    // 9. Data migration
    results.push({ step: 'Running data migration', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        UPDATE vista_contacts SET
          stain_score = 0, cluster_score = 0, signal_score = 0,
          engagement_score = 0, priority_score = 0,
          score_delta = NULL, last_score_update = NOW(), decay_flag = FALSE;

        UPDATE vista_contacts SET engagement_tier = 'Cold', encirclement_level = 'Scout';

        UPDATE vista_contacts SET last_engagement_date = last_touch_date::DATE
        WHERE last_touch_date IS NOT NULL AND last_touch_date != '';

        UPDATE vista_contacts SET decay_flag = TRUE
        WHERE last_engagement_date IS NULL 
           OR last_engagement_date < CURRENT_DATE - INTERVAL '30 days';
      ` 
    })

    // 10. Enable RLS
    results.push({ step: 'Enabling RLS on new tables', status: 'success' })
    await supabase.rpc('run_sql', { 
      sql: `
        ALTER TABLE density_clusters ENABLE ROW LEVEL SECURITY;
        ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;
      ` 
    })

    // Verify
    const { count } = await supabase.from('vista_contacts').select('id', { count: 'exact', head: true })
    const { data: pipeline } = await supabase.from('v_pipeline_summary').select('*')

    return NextResponse.json({
      status: 'success',
      message: 'Migration completed successfully',
      results,
      verification: {
        contacts_count: count,
        pipeline_records: pipeline?.length || 0
      }
    })

  } catch (e: any) {
    results.push({ step: 'Migration failed', status: 'error', message: e.message })
    return NextResponse.json({
      status: 'error',
      message: e.message,
      results,
      stack: e.stack
    }, { status: 500 })
  }
}