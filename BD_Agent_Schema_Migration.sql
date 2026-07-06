-- ============================================================================
-- BD Agent Schema Migration
-- Date: 2026-07-06
-- Author: James/AI (PM)
-- Target: Supabase rnnlteyqmtxkzllbohuu
-- 
-- Context:
--   - Main contact table: vista_contacts (17,359 records)
--   - campaign_contacts: retained but not used by BD Agents until further notice
--   - Existing scoring columns in vista_contacts will be overwritten with new rules
--   - bd_* tables retained but not used
--
-- Execution order: Run sequentially. Each section is idempotent (IF NOT EXISTS).
-- ============================================================================

-- ============================================================================
-- SECTION 1: ALTER TABLE vista_contacts — Add missing columns
-- ============================================================================

-- LENS metadata columns
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS score_delta TEXT;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_score_update TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_engagement_date DATE;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS decay_flag BOOLEAN DEFAULT FALSE;

-- VISTA 5-dimension scores (PROBE writes)
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_v INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_i INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_s INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_t INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_a INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS vista_composite INTEGER DEFAULT 0;

-- Density cluster reference
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS density_cluster_id UUID;

-- ============================================================================
-- SECTION 2: signals table — Add missing columns for BD Agent use
-- ============================================================================
-- Existing signals table has different column names than spec expects.
-- We add the missing BD-specific columns rather than rename existing ones.

ALTER TABLE signals ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_type TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS signal_strength TEXT CHECK (signal_strength IS NULL OR signal_strength IN ('Low','Medium','Medium-High','High'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS detected_date DATE;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS recency_weight DECIMAL DEFAULT 1.0;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS score_impact INTEGER DEFAULT 0;

-- Note: signals.signal_type is the BD-specific signal type (11 categories).
-- The existing signals.type column remains for platform-level signal types.
-- LENS should write to signals.signal_type for BD scoring.

-- Index for BD signal queries
CREATE INDEX IF NOT EXISTS idx_signals_signal_type ON signals(signal_type) WHERE signal_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signals_strength ON signals(signal_strength) WHERE signal_strength IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_signals_detected ON signals(detected_date DESC) WHERE detected_date IS NOT NULL;

-- ============================================================================
-- SECTION 3: campaign_activities — Add missing columns for MARIA
-- ============================================================================
-- campaign_activities exists (0 records) with basic columns.
-- Add MARIA-specific columns for campaign execution tracking.

ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS campaign_type TEXT CHECK (campaign_type IS NULL OR campaign_type IN ('Signal-triggered','Nurture','Ecosystem Invite','Kevin Intro','Re-engagement'));
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS service_route TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_template TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS conversation_angle TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS activity_status TEXT CHECK (activity_status IS NULL OR activity_status IN ('Drafted','Sent','Opened','Replied','Meeting Booked','No Response'));
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS response_date TIMESTAMPTZ;

-- Index for MARIA activity queries
CREATE INDEX IF NOT EXISTS idx_campaign_activities_status ON campaign_activities(activity_status) WHERE activity_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_activities_type ON campaign_activities(campaign_type) WHERE campaign_type IS NOT NULL;

-- ============================================================================
-- SECTION 4: New tables
-- ============================================================================

-- 4.1 density_clusters (PROBE writes)
CREATE TABLE IF NOT EXISTS density_clusters (
    cluster_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry TEXT NOT NULL,
    geography TEXT NOT NULL,
    density_score DECIMAL DEFAULT 0,
    status TEXT CHECK (status IN ('Watch','Emerging','Active')),
    contact_count INTEGER DEFAULT 0,
    signal_types TEXT[],
    recommended_programs UUID[],
    revenue_potential DECIMAL DEFAULT 0,  -- Fixed typo from spec (was revenue_potial)
    last_calculated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(industry, geography)
);

-- 4.2 programs (PROBE writes)
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

-- 4.3 program_assignments (PROBE writes)
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

-- 4.4 strategic_notes (CARL writes)
CREATE TABLE IF NOT EXISTS strategic_notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_type TEXT CHECK (note_type IN ('Decision','Override','ICP Adjustment','Focus Shift','Review')),
    description TEXT,
    author TEXT DEFAULT 'CARL',
    contact_id UUID REFERENCES vista_contacts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: Indexes for new tables
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_density_clusters_status ON density_clusters(status);
CREATE INDEX IF NOT EXISTS idx_density_clusters_industry ON density_clusters(industry);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_cluster ON programs(cluster_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_contact ON program_assignments(contact_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_program ON program_assignments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_status ON program_assignments(status);
CREATE INDEX IF NOT EXISTS idx_strategic_notes_contact ON strategic_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_strategic_notes_type ON strategic_notes(note_type);

-- ============================================================================
-- SECTION 6: Dashboard Views
-- ============================================================================

-- 6.1 Top 7 weekly ranking
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

-- 6.2 Pipeline summary by engagement tier
CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT 
    engagement_tier,
    COUNT(*) as contact_count,
    ROUND(AVG(priority_score)) as avg_score,
    COUNT(CASE WHEN decay_flag THEN 1 END) as stale_count
FROM vista_contacts
GROUP BY engagement_tier
ORDER BY MIN(priority_score);

-- 6.3 Encirclement status by account (company)
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

-- 6.4 Outreach activity summary (last 30 days)
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

-- ============================================================================
-- SECTION 7: RLS Policies for new tables
-- ============================================================================

ALTER TABLE density_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_notes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read access
CREATE POLICY "Authenticated read density_clusters" ON density_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read programs" ON programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read program_assignments" ON program_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read strategic_notes" ON strategic_notes FOR SELECT TO authenticated USING (true);

-- Service role full access
CREATE POLICY "Service role full density_clusters" ON density_clusters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full programs" ON programs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full program_assignments" ON program_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full strategic_notes" ON strategic_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 8: Data migration — Reset scoring to new spec rules
-- ============================================================================
-- WARNING: This resets all existing scores to 0. LENS will recalculate on next run.
-- The old scoring system used different scales (engagement 0-50 vs spec 0-25, etc.)
-- A clean reset ensures no confusion from mixed-scale data.

-- Reset LENS scores (will be recalculated by LENS agent)
UPDATE vista_contacts SET
    stain_score = 0,
    cluster_score = 0,
    signal_score = 0,
    engagement_score = 0,
    priority_score = 0,
    score_delta = NULL,
    last_score_update = NOW(),
    decay_flag = FALSE;

-- Reset engagement_tier to Cold (will be recalculated by LENS)
UPDATE vista_contacts SET engagement_tier = 'Cold';

-- Reset encirclement_level to Scout (will be recalculated by LENS)
UPDATE vista_contacts SET encirclement_level = 'Scout';

-- Set last_engagement_date from existing last_touch_date where available
UPDATE vista_contacts SET last_engagement_date = last_touch_date::DATE
WHERE last_touch_date IS NOT NULL AND last_touch_date != '';

-- Flag contacts with no engagement in 30+ days
UPDATE vista_contacts SET decay_flag = TRUE
WHERE last_engagement_date IS NULL 
   OR last_engagement_date < CURRENT_DATE - INTERVAL '30 days';

-- ============================================================================
-- DONE
-- ============================================================================
-- Post-migration checklist:
-- [ ] Verify all columns exist: SELECT column_name FROM information_schema.columns WHERE table_name = 'vista_contacts' ORDER BY ordinal_position;
-- [ ] Verify new tables: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('density_clusters','programs','program_assignments','strategic_notes');
-- [ ] Verify views: SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname IN ('v_top_7','v_pipeline_summary','v_encirclement','v_outreach_activity');
-- [ ] Run LENS scoring pass to populate scores with new rules
-- ============================================================================
