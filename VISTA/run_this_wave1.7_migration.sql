-- ============================================================================
-- VISTA Wave 1.7 Migration — B2C → B2B Conversion Intelligence (CORRECTED)
-- ============================================================================
-- Version: 2.0 (CORRECTED SCOPE)
-- Date: 2026-07-12
-- Purpose: Enable VISTA to track B2C users from DEX AI portal as potential
--          B2B leads. NOT a B2C portal — VISTA is internal CRM only.
--
-- Changes:
--   SECTION 1: Drop V2 CHECK constraints (allow B2C product categories)
--   SECTION 2: Create 3 new tables (b2c_leads, b2c_events, b2c_conversions)
--   SECTION 3: Seed B2C products in service_catalog (for revenue tracking)
--   SECTION 4: Seed B2C→B2B cross-sell paths
--   SECTION 5: Triggers
--   SECTION 6: Indexes
--
-- Safe to re-run (IF NOT EXISTS, ON CONFLICT DO NOTHING)
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP V2 CHECK CONSTRAINTS (for B2C product categories)
-- ============================================================================
-- V2 migration created CHECK constraints on service_catalog that limit
-- category and pricing_model values. B2C products need additional values.

DO $$ BEGIN
  -- Drop category CHECK if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'vista_service_catalog'
    AND constraint_name = 'vista_service_catalog_category_check'
  ) THEN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT vista_service_catalog_category_check;
    RAISE NOTICE 'Dropped vista_service_catalog_category_check';
  END IF;
END $$;

DO $$ BEGIN
  -- Drop pricing_model CHECK if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'vista_service_catalog'
    AND constraint_name = 'vista_service_catalog_pricing_model_check'
  ) THEN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT vista_service_catalog_pricing_model_check;
    RAISE NOTICE 'Dropped vista_service_catalog_pricing_model_check';
  END IF;
END $$;

-- ============================================================================
-- SECTION 2: CREATE NEW TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 2.1 vista_b2c_leads — B2C users with B2B potential scoring
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vista_b2c_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity (from DEX AI portal)
  b2c_user_id TEXT NOT NULL UNIQUE,  -- DEX AI portal user ID
  email TEXT,
  name TEXT,
  linkedin_url TEXT,
  
  -- Professional context (key for B2B scoring)
  title TEXT,
  company TEXT,
  company_size INT,
  industry TEXT,
  location TEXT,
  
  -- B2C activity state
  current_tier TEXT DEFAULT 'free',  -- free, starter, member, pro
  total_credits_purchased INT DEFAULT 0,
  total_credits_consumed INT DEFAULT 0,
  total_spend_cny NUMERIC(12,2) DEFAULT 0,
  assessments_completed TEXT[] DEFAULT '{}',  -- ['PRISM', 'TRIDENT', 'CANVAS']
  coaching_booked BOOLEAN DEFAULT FALSE,
  linkedin_verified BOOLEAN DEFAULT FALSE,
  
  -- B2B potential scoring
  b2b_potential_score INT DEFAULT 0,  -- 0-100
  b2b_score_label TEXT DEFAULT 'low',  -- low, monitor, watch, high_priority
  b2b_score_breakdown JSONB DEFAULT '{}',  -- {title: 25, company_size: 15, ...}
  b2b_score_history JSONB DEFAULT '[]',  -- [{date, score, event_trigger}]
  
  -- Pipeline management
  pipeline_stage TEXT DEFAULT 'b2c_user',  -- b2c_user, flagged, research, outreach_ready, in_conversation, promoted
  pipeline_stage_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Linking
  linked_contact_id UUID REFERENCES vista_contacts(id),  -- set when promoted
  linked_contact_matched_via TEXT,  -- 'email', 'linkedin', 'manual'
  
  -- Notes
  bd_notes TEXT,
  
  -- Timestamps
  b2c_signup_date TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.2 vista_b2c_events — Event stream from DEX AI portal
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vista_b2c_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identity
  event_id TEXT UNIQUE,  -- From DEX AI portal, for dedup
  event_type TEXT NOT NULL,  -- user.signup, purchase.credit_pack, assessment.completed, etc.
  
  -- Link to lead
  b2c_lead_id UUID REFERENCES vista_b2c_leads(id),
  b2c_user_id TEXT NOT NULL,
  
  -- Event data
  payload JSONB DEFAULT '{}',  -- Full event payload from DEX AI portal
  
  -- Scoring impact
  score_before INT,
  score_after INT,
  score_delta INT,
  
  -- Timestamps
  event_timestamp TIMESTAMPTZ,  -- When event happened in DEX AI portal
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2.3 vista_b2c_conversions — Conversion log: B2C lead → B2B contact
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vista_b2c_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  b2c_lead_id UUID NOT NULL REFERENCES vista_b2c_leads(id),
  b2c_user_id TEXT NOT NULL,
  vista_contact_id UUID REFERENCES vista_contacts(id),
  
  -- Conversion context
  b2b_score_at_conversion INT,
  pipeline_stage_before TEXT,
  conversion_reason TEXT,  -- 'manual_promotion', 'auto_rule', 'score_threshold'
  
  -- B2C revenue at time of conversion
  b2c_total_spend_cny NUMERIC(12,2) DEFAULT 0,
  b2c_credits_purchased INT DEFAULT 0,
  b2c_assessments_completed TEXT[] DEFAULT '{}',
  b2c_days_as_user INT,  -- How long they were a B2C user before converting
  
  -- Post-conversion B2B tracking
  first_b2b_deal_value_cny NUMERIC(12,2),
  first_b2b_service TEXT,
  first_b2b_date DATE,
  
  -- Timestamps
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: SEED B2C PRODUCTS IN SERVICE CATALOG
-- ============================================================================
-- VISTA needs to know B2C products exist for revenue tracking and attribution.
-- These are NOT managed by VISTA — they're products of the DEX AI portal.

INSERT INTO vista_service_catalog (name, category, description, pricing_model, tier_level, is_b2c, slug, target_audience)
VALUES
  -- Credit Packs
  ('DEX AI Credit Pack Starter', 'Content', '10 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-starter', 'Individual professionals'),
  ('DEX AI Credit Pack Professional', 'Content', '50 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-professional', 'Individual professionals'),
  ('DEX AI Credit Pack Executive', 'Content', '150 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-executive', 'Senior professionals'),
  
  -- Subscriptions
  ('DEX AI Member', 'Membership', '30 credits/month + full assessment access', 'Subscription', 1, true, 'dex-ai-member', 'Individual professionals'),
  ('DEX AI Pro', 'Membership', '100 credits/month + priority features + Council path', 'Subscription', 1, true, 'dex-ai-pro', 'Ambitious professionals'),
  
  -- Assessments (credit-gated)
  ('PRISM Assessment', 'Diagnostic', 'Personality profile — career style, decision patterns, team fit (3 credits)', 'Fixed', 1, true, 'prism-assessment', 'B2C users'),
  ('TRIDENT Assessment', 'Diagnostic', 'Skills gap analysis — current vs. target role competencies (5 credits)', 'Fixed', 1, true, 'trident-assessment', 'B2C users'),
  ('CANVAS Assessment', 'Diagnostic', 'Career path mapping — 5-year trajectory visualization (8 credits)', 'Fixed', 1, true, 'canvas-assessment', 'B2C users'),
  
  -- Coaching (B2C entry point)
  ('DEX AI Coaching Session', 'Development Program', '1:1 career coaching session with LYC advisor (15 credits)', 'Fixed', 1, true, 'dex-ai-coaching', 'B2C users'),
  
  -- Bundle
  ('B2C Career Accelerator', 'Development Program', '3-month Pro + PRISM + CANVAS + 1 coaching session', 'Fixed', 1, true, 'b2c-career-accelerator', 'Ambitious professionals')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 4: SEED B2C → B2B CROSS-SELL / CONVERSION PATHS
-- ============================================================================
-- These track which B2C activities signal B2B opportunity

INSERT INTO vista_service_bundles (bundle_code, name, description, component_service_names, bundle_price_cny, individual_price_cny, discount_pct, is_active)
VALUES
  ('b2c-to-b2b-signal', 'B2C High-Value Signal', 'Auto-detected when B2C user shows B2B potential — triggers BD workflow', 
   ARRAY['DEX AI Credit Pack Executive', 'CANVAS Assessment', 'DEX AI Coaching Session'],
   0, 0, 0, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Auto-update updated_at on b2c_leads
CREATE OR REPLACE FUNCTION fn_b2c_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_leads_updated_at ON vista_b2c_leads;
CREATE TRIGGER trg_b2c_leads_updated_at
  BEFORE UPDATE ON vista_b2c_leads
  FOR EACH ROW EXECUTE FUNCTION fn_b2c_leads_updated_at();

-- Auto-update pipeline_stage_updated_at when stage changes
CREATE OR REPLACE FUNCTION fn_b2c_pipeline_stage_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    NEW.pipeline_stage_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_pipeline_stage_ts ON vista_b2c_leads;
CREATE TRIGGER trg_b2c_pipeline_stage_ts
  BEFORE UPDATE ON vista_b2c_leads
  FOR EACH ROW EXECUTE FUNCTION fn_b2c_pipeline_stage_updated();

-- Auto-set b2b_score_label from b2b_potential_score
CREATE OR REPLACE FUNCTION fn_b2c_score_label()
RETURNS TRIGGER AS $$
BEGIN
  NEW.b2b_score_label = CASE
    WHEN NEW.b2b_potential_score >= 80 THEN 'high_priority'
    WHEN NEW.b2b_potential_score >= 60 THEN 'watch'
    WHEN NEW.b2b_potential_score >= 40 THEN 'monitor'
    ELSE 'low'
  END;
  
  -- Auto-set pipeline_stage based on score (only if not already further along)
  IF NEW.b2b_potential_score >= 80 AND NEW.pipeline_stage = 'b2c_user' THEN
    NEW.pipeline_stage = 'flagged';
  ELSIF NEW.b2b_potential_score >= 60 AND NEW.pipeline_stage = 'b2c_user' THEN
    NEW.pipeline_stage = 'monitoring';
  END IF;
  
  -- Append to score history
  NEW.b2b_score_history = COALESCE(NEW.b2b_score_history, '[]'::jsonb) || 
    jsonb_build_array(jsonb_build_object(
      'date', NOW()::text,
      'score', NEW.b2b_potential_score,
      'label', NEW.b2b_score_label,
      'breakdown', COALESCE(NEW.b2b_score_breakdown, '{}'::jsonb)
    ));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_score_label ON vista_b2c_leads;
CREATE TRIGGER trg_b2c_score_label
  BEFORE UPDATE OF b2b_potential_score ON vista_b2c_leads
  FOR EACH ROW EXECUTE FUNCTION fn_b2c_score_label();

-- ============================================================================
-- SECTION 6: INDEXES
-- ============================================================================

-- B2C leads
CREATE INDEX IF NOT EXISTS idx_b2c_leads_email ON vista_b2c_leads(email);
CREATE INDEX IF NOT EXISTS idx_b2c_leads_linkedin ON vista_b2c_leads(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_b2c_leads_score ON vista_b2c_leads(b2b_potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_b2c_leads_stage ON vista_b2c_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_b2c_leads_tier ON vista_b2c_leads(current_tier);
CREATE INDEX IF NOT EXISTS idx_b2c_leads_company ON vista_b2c_leads(company);

-- B2C events
CREATE INDEX IF NOT EXISTS idx_b2c_events_lead ON vista_b2c_events(b2c_lead_id);
CREATE INDEX IF NOT EXISTS idx_b2c_events_type ON vista_b2c_events(event_type);
CREATE INDEX IF NOT EXISTS idx_b2c_events_user ON vista_b2c_events(b2c_user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_events_timestamp ON vista_b2c_events(event_timestamp DESC);

-- B2C conversions
CREATE INDEX IF NOT EXISTS idx_b2c_conversions_lead ON vista_b2c_conversions(b2c_lead_id);
CREATE INDEX IF NOT EXISTS idx_b2c_conversions_contact ON vista_b2c_conversions(vista_contact_id);

-- ============================================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================================
-- SELECT 'b2c_leads' as tbl, count(*) FROM vista_b2c_leads
-- UNION ALL
-- SELECT 'b2c_events', count(*) FROM vista_b2c_events
-- UNION ALL
-- SELECT 'b2c_conversions', count(*) FROM vista_b2c_conversions
-- UNION ALL
-- SELECT 'b2c_services', count(*) FROM vista_service_catalog WHERE is_b2c = true;

-- Expected: b2c_leads=0, b2c_events=0, b2c_conversions=0, b2c_services=10
