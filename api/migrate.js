const { Client } = require('pg');

const MIGRATION_SQL = "-- ============================================================================\n-- BD Agent Schema Migration\n-- Date: 2026-07-06\n-- Author: James/AI (PM)\n-- Target: Supabase rnnlteyqmtxkzllbohuu\n-- \n-- Context:\n--   - Main contact table: vista_contacts (17,359 records)\n--   - campaign_contacts: retained but not used by BD Agents until further notice\n--   - Existing scoring columns in vista_contacts will be overwritten with new rules\n--   - bd_* tables retained but not used\n--\n-- Execution order: Run sequentially. Each section is idempotent (IF NOT EXISTS).\n-- ============================================================================\n\n-- ============================================================================\n-- SECTION 1: ALTER TABLE vista_contacts \u2014 Add missing columns\n-- ============================================================================\n\n-- LENS metadata columns\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS score_delta TEXT;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_score_update TIMESTAMPTZ;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_engagement_date DATE;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS decay_flag BOOLEAN DEFAULT FALSE;\n\n-- VISTA 5-dimension scores (PROBE writes)\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_v INTEGER DEFAULT 0;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_i INTEGER DEFAULT 0;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_s INTEGER DEFAULT 0;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_t INTEGER DEFAULT 0;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_a INTEGER DEFAULT 0;\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_composite INTEGER DEFAULT 0;\n\n-- Density cluster reference\nALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS density_cluster_id UUID;\n\n-- ============================================================================\n-- SECTION 2: signals table \u2014 Add missing columns for BD Agent use\n-- ============================================================================\n-- Existing signals table has different column names than spec expects.\n-- We add the missing BD-specific columns rather than rename existing ones.\n\nALTER TABLE signals ADD COLUMN IF NOT EXISTS company TEXT;\nALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_type TEXT;\nALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_strength TEXT CHECK (signal_strength IS NULL OR signal_strength IN ('Low','Medium','Medium-High','High'));\nALTER TABLE signals ADD COLUMN IF NOT EXISTS detected_date DATE;\nALTER TABLE signals ADD COLUMN IF NOT EXISTS recency_weight DECIMAL DEFAULT 1.0;\nALTER TABLE signals ADD COLUMN IF NOT EXISTS score_impact INTEGER DEFAULT 0;\n\n-- Note: signals.signal_type is the BD-specific signal type (11 categories).\n-- The existing signals.type column remains for platform-level signal types.\n-- LENS should write to signals.signal_type for BD scoring.\n\n-- Index for BD signal queries\nCREATE INDEX IF NOT EXISTS idx_signals_signal_type ON signals(signal_type) WHERE signal_type IS NOT NULL;\nCREATE INDEX IF NOT EXISTS idx_signals_strength ON signals(signal_strength) WHERE signal_strength IS NOT NULL;\nCREATE INDEX IF NOT EXISTS idx_signals_detected ON signals(detected_date DESC) WHERE detected_date IS NOT NULL;\n\n-- ============================================================================\n-- SECTION 3: campaign_activities \u2014 Add missing columns for MARIA\n-- ============================================================================\n-- campaign_activities exists (0 records) with basic columns.\n-- Add MARIA-specific columns for campaign execution tracking.\n\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS campaign_type TEXT CHECK (campaign_type IS NULL OR campaign_type IN ('Signal-triggered','Nurture','Ecosystem Invite','Kevin Intro','Re-engagement'));\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS service_route TEXT;\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_template TEXT;\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS conversation_angle TEXT;\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS activity_status TEXT CHECK (activity_status IS NULL OR activity_status IN ('Drafted','Sent','Opened','Replied','Meeting Booked','No Response'));\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;\nALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ;\n\n-- Index for MARIA activity queries\nCREATE INDEX IF NOT EXISTS idx_campaign_activities_status ON campaign_activities(activity_status) WHERE activity_status IS NOT NULL;\nCREATE INDEX IF NOT EXISTS idx_campaign_activities_type ON campaign_activities(campaign_type) WHERE campaign_type IS NOT NULL;\n\n-- ============================================================================\n-- SECTION 4: New tables\n-- ============================================================================\n\n-- 4.1 density_clusters (PROBE writes)\nCREATE TABLE IF NOT EXISTS density_clusters (\n    cluster_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    industry TEXT NOT NULL,\n    geography TEXT NOT NULL,\n    density_score DECIMAL DEFAULT 0,\n    status TEXT CHECK (status IN ('Watch','Emerging','Active')),\n    contact_count INTEGER DEFAULT 0,\n    signal_types TEXT[],\n    recommended_programs UUID[],\n    revenue_potential DECIMAL DEFAULT 0,  -- Fixed typo from spec (was revenue_potial)\n    last_calculated TIMESTAMPTZ DEFAULT NOW(),\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    UNIQUE(industry, geography)\n);\n\n-- 4.2 programs (PROBE writes)\nCREATE TABLE IF NOT EXISTS programs (\n    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    type TEXT CHECK (type IN ('Webinar','Podcast','Newsletter','Roundtable','1:1 Coaching','Advisory','Market Insights')),\n    tier TEXT CHECK (tier IN ('Free','Paid')),\n    name TEXT NOT NULL,\n    description TEXT,\n    cluster_id UUID REFERENCES density_clusters(cluster_id),\n    capacity INTEGER,\n    enrolled_count INTEGER DEFAULT 0,\n    price DECIMAL DEFAULT 0,\n    status TEXT CHECK (status IN ('Planned','Inviting','Active','Completed')),\n    start_date DATE,\n    end_date DATE,\n    revenue_actual DECIMAL DEFAULT 0,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- 4.3 program_assignments (PROBE writes)\nCREATE TABLE IF NOT EXISTS program_assignments (\n    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    contact_id UUID REFERENCES vista_contacts(id),\n    program_id UUID REFERENCES programs(program_id),\n    status TEXT CHECK (status IN ('Invited','Registered','Attended','Converted','Churned')),\n    assigned_date DATE DEFAULT CURRENT_DATE,\n    conversion_date DATE,\n    revenue_attributed DECIMAL DEFAULT 0,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- 4.4 strategic_notes (CARL writes)\nCREATE TABLE IF NOT EXISTS strategic_notes (\n    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    note_type TEXT CHECK (note_type IN ('Decision','Override','ICP Adjustment','Focus Shift','Review')),\n    description TEXT,\n    author TEXT DEFAULT 'CARL',\n    contact_id UUID REFERENCES vista_contacts(id),\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- ============================================================================\n-- SECTION 5: Indexes for new tables\n-- ============================================================================\n\nCREATE INDEX IF NOT EXISTS idx_density_clusters_status ON density_clusters(status);\nCREATE INDEX IF NOT EXISTS idx_density_clusters_industry ON density_clusters(industry);\nCREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);\nCREATE INDEX IF NOT EXISTS idx_programs_cluster ON programs(cluster_id);\nCREATE INDEX IF NOT EXISTS idx_program_assignments_contact ON program_assignments(contact_id);\nCREATE INDEX IF NOT EXISTS idx_program_assignments_program ON program_assignments(program_id);\nCREATE INDEX IF NOT EXISTS idx_program_assignments_status ON program_assignments(status);\nCREATE INDEX IF NOT EXISTS idx_strategic_notes_contact ON strategic_notes(contact_id);\nCREATE INDEX IF NOT EXISTS idx_strategic_notes_type ON strategic_notes(note_type);\n\n-- ============================================================================\n-- SECTION 6: Dashboard Views\n-- ============================================================================\n\n-- 6.1 Top 7 weekly ranking\nCREATE OR REPLACE VIEW v_top_7 AS\nSELECT id, name, company, role, seniority,\n       stain_score, cluster_score, signal_score, engagement_score, priority_score,\n       engagement_tier, encirclement_level, score_delta,\n       vista_composite, last_engagement_date, decay_flag,\n       stain_group, region, country\nFROM vista_contacts\nWHERE priority_score >= 40\nORDER BY priority_score DESC, signal_score DESC\nLIMIT 7;\n\n-- 6.2 Pipeline summary by engagement tier\nCREATE OR REPLACE VIEW v_pipeline_summary AS\nSELECT \n    engagement_tier,\n    COUNT(*) as contact_count,\n    ROUND(AVG(priority_score)) as avg_score,\n    COUNT(CASE WHEN decay_flag THEN 1 END) as stale_count\nFROM vista_contacts\nGROUP BY engagement_tier\nORDER BY MIN(priority_score);\n\n-- 6.3 Encirclement status by account (company)\nCREATE OR REPLACE VIEW v_encirclement AS\nSELECT \n    company,\n    COUNT(*) as contact_count,\n    MAX(encirclement_level) as encirclement_level,\n    ROUND(AVG(engagement_score)) as avg_engagement,\n    ROUND(AVG(priority_score)) as avg_priority,\n    ARRAY_AGG(name) as contacts\nFROM vista_contacts\nWHERE company IS NOT NULL\nGROUP BY company\nORDER BY contact_count DESC;\n\n-- 6.4 Outreach activity summary (last 30 days)\nCREATE OR REPLACE VIEW v_outreach_activity AS\nSELECT \n    activity_type,\n    COALESCE(activity_status, outcome) as activity_status,\n    COUNT(*) as count,\n    DATE_TRUNC('week', COALESCE(sent_date, activity_date)) as week\nFROM campaign_activities\nWHERE COALESCE(sent_date, activity_date) >= CURRENT_DATE - INTERVAL '30 days'\nGROUP BY activity_type, COALESCE(activity_status, outcome), week\nORDER BY week DESC;\n\n-- ============================================================================\n-- SECTION 7: RLS Policies for new tables\n-- ============================================================================\n\nALTER TABLE density_clusters ENABLE ROW LEVEL SECURITY;\nALTER TABLE programs ENABLE ROW LEVEL SECURITY;\nALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;\nALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;\n\n-- Allow authenticated read access\nCREATE POLICY \"Authenticated read density_clusters\" ON density_clusters FOR SELECT TO authenticated USING (true);\nCREATE POLICY \"Authenticated read programs\" ON programs FOR SELECT TO authenticated USING (true);\nCREATE POLICY \"Authenticated read program_assignments\" ON program_assignments FOR SELECT TO authenticated USING (true);\nCREATE POLICY \"Authenticated read strategic_notes\" ON strategic_notes FOR SELECT TO authenticated USING (true);\n\n-- Service role full access\nCREATE POLICY \"Service role full density_clusters\" ON density_clusters FOR ALL TO service_role USING (true) WITH CHECK (true);\nCREATE POLICY \"Service role full programs\" ON programs FOR ALL TO service_role USING (true) WITH CHECK (true);\nCREATE POLICY \"Service role full program_assignments\" ON program_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);\nCREATE POLICY \"Service role full strategic_notes\" ON strategic_notes FOR ALL TO service_role USING (true) WITH CHECK (true);\n\n-- ============================================================================\n-- SECTION 8: Data migration \u2014 Reset scoring to new spec rules\n-- ============================================================================\n-- WARNING: This resets all existing scores to 0. LENS will recalculate on next run.\n-- The old scoring system used different scales (engagement 0-50 vs spec 0-25, etc.)\n-- A clean reset ensures no confusion from mixed-scale data.\n\n-- Reset LENS scores (will be recalculated by LENS agent)\nUPDATE vista_contacts SET\n    stain_score = 0,\n    cluster_score = 0,\n    signal_score = 0,\n    engagement_score = 0,\n    priority_score = 0,\n    score_delta = NULL,\n    last_score_update = NOW(),\n    decay_flag = FALSE;\n\n-- Reset engagement_tier to Cold (will be recalculated by LENS)\nUPDATE vista_contacts SET engagement_tier = 'Cold';\n\n-- Reset encirclement_level to Scout (will be recalculated by LENS)\nUPDATE vista_contacts SET encirclement_level = 'Scout';\n\n-- Set last_engagement_date from existing last_touch_date where available\nUPDATE vista_contacts SET last_engagement_date = last_touch_date::DATE\nWHERE last_touch_date IS NOT NULL AND last_touch_date != '';\n\n-- Flag contacts with no engagement in 30+ days\nUPDATE vista_contacts SET decay_flag = TRUE\nWHERE last_engagement_date IS NULL \n   OR last_engagement_date < CURRENT_DATE - INTERVAL '30 days';\n\n-- ============================================================================\n-- DONE\n-- ============================================================================\n-- Post-migration checklist:\n-- [ ] Verify all columns exist: SELECT column_name FROM information_schema.columns WHERE table_name = 'vista_contacts' ORDER BY ordinal_position;\n-- [ ] Verify new tables: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('density_clusters','programs','program_assignments','strategic_notes');\n-- [ ] Verify views: SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname IN ('v_top_7','v_pipeline_summary','v_encirclement','v_outreach_activity');\n-- [ ] Run LENS scoring pass to populate scores with new rules\n-- ============================================================================\n";
const DB_PASS = process.env.SUPABASE_DB_PASSWORD;

module.exports = async function handler(req, res) {
  const authKey = req.headers['x-migration-key'] || req.query.key;
  if (authKey !== 'vista-migrate-2026') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<html><body><h1>VISTA Migration Endpoint</h1><p>Auth required. Pass ?key=YOUR_KEY</p></body></html>');
  }

  if (!DB_PASS) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<html><body><h1>ERROR</h1><pre>SUPABASE_DB_PASSWORD not set in Vercel env</pre></body></html>');
  }

  const log = [];
  let client = null;

  const targets = [
    {
      label: 'direct',
      host: 'db.rnnlteyqmtxkzllbohuu.supabase.co',
      port: 5432,
      user: 'postgres',
      password: DB_PASS,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
    {
      label: 'pooler-apse1',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 6543,
      user: 'postgres.rnnlteyqmtxkzllbohuu',
      password: DB_PASS,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
    {
      label: 'pooler-use1',
      host: 'aws-0-us-east-1.pooler.supabase.com',
      port: 6543,
      user: 'postgres.rnnlteyqmtxkzllbohuu',
      password: DB_PASS,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    },
  ];

  for (const t of targets) {
    try {
      client = new Client(t);
      await client.connect();
      log.push('CONNECT OK via ' + t.label);
      break;
    } catch (e) {
      log.push('CONNECT FAIL ' + t.label + ': ' + e.message.substring(0, 200));
      client = null;
    }
  }

  if (!client) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<html><body><h1>CONNECTION FAILED</h1><pre>' + log.join('\n') + '</pre></body></html>');
  }

  try {
    await client.query(MIGRATION_SQL);
    log.push('MIGRATION EXECUTED OK');

    const cols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='vista_contacts' AND column_name IN ('score_delta','vista_v','vista_composite','density_cluster_id','decay_flag') ORDER BY column_name"
    );
    log.push('NEW COLUMNS: ' + cols.rows.map(r => r.column_name).join(', '));

    const tables = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('density_clusters','programs','program_assignments','strategic_notes') ORDER BY tablename"
    );
    log.push('NEW TABLES: ' + tables.rows.map(r => r.tablename).join(', '));

    const views = await client.query(
      "SELECT viewname FROM pg_views WHERE schemaname='public' AND viewname IN ('v_top_7','v_pipeline_summary','v_encirclement','v_outreach_activity') ORDER BY viewname"
    );
    log.push('VIEWS: ' + views.rows.map(r => r.viewname).join(', '));

    const count = await client.query("SELECT COUNT(*) as c FROM vista_contacts");
    log.push('VISTA_CONTACTS COUNT: ' + count.rows[0].c);

    const sample = await client.query("SELECT stain_score, engagement_tier, encirclement_level FROM vista_contacts LIMIT 3");
    log.push('SAMPLE: ' + JSON.stringify(sample.rows));

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<html><body><h1>MIGRATION COMPLETE</h1><pre>' + log.join('\n---\n') + '</pre></body></html>');
  } catch (e) {
    log.push('MIGRATION ERROR: ' + e.message.substring(0, 800));
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send('<html><body><h1>MIGRATION ERROR</h1><pre>' + log.join('\n---\n') + '</pre></body></html>');
  } finally {
    if (client) await client.end();
  }
};
