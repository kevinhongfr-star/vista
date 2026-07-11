-- ============================================================================
-- VISTA V2 MIGRATION — COMBINED (FIX + FULL)
-- Single paste in Supabase SQL Editor
-- Fix: adds 'Live' to status check constraint
-- Then: full V2 migration (17 tables, 24 service seed rows, all functions)
-- ============================================================================

-- STEP 0: Fix status constraint BEFORE table creation
-- (If table already exists from partial run, alter it; if not, this is harmless)
DO $$
BEGIN
  -- Drop old constraint if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vista_service_catalog') THEN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT IF EXISTS vista_service_catalog_status_check;
    ALTER TABLE vista_service_catalog ADD CHECK (status IN ('Active', 'Live', 'Coming Soon', 'In Development', 'Retired', 'Internal'));
  END IF;
END $$;

-- ============================================================================
-- V2 MIGRATION SQL FOLLOWS
-- ============================================================================

-- ============================================================================
-- VISTA Schema Migration V2 — Service Catalog & V4 Backend Wiring
-- Date: 2026-07-11
-- Target: Supabase rnnlteyqmtxkzllbohuu
-- 
-- Purpose: Create the full service catalog from Notion content + 
--          all missing backend tables for V4 action-pushing platform
--
-- Sections:
--   1. Service Catalog (from Notion product definitions)
--   2. Contact-Service Relationships
--   3. Service-Linked Templates
--   4. Gamification Engine
--   5. Action Taxonomy Extension
--   6. Inbound Signal Tracking
--   7. Kanban State Storage
--   8. Task Tracker & Deadlines
--   9. Alert Rules Engine
--  10. Shareable Outputs
--  11. Layout Configuration
--  12. Qualitative Intelligence Storage
--  13. Platform Sync Tracking
-- ============================================================================

-- ============================================================================
-- SECTION 1: SERVICE CATALOG (from Notion — canonical product definitions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  category text NOT NULL CHECK (category IN (
    'Diagnostic', 'Development Program', 'Advisory', 'Membership', 'Content', 'Event'
  )),
  service_type text NOT NULL,
  subtype text,
  
  -- Details
  name text NOT NULL,
  full_name text,
  tagline text,
  description text,
  long_description text,
  value_proposition text,
  target_audience text[],
  industries text[],
  geographies text[],
  
  -- Format & Delivery
  format text,               -- e.g., '35 scored items | 25 minutes online'
  delivery_format text[],
  duration_text text,
  duration_hours integer,
  capacity integer,
  
  -- Pricing
  pricing_model text CHECK (pricing_model IN ('Fixed', 'Retainer', 'Subscription', 'Enterprise', 'Custom', 'Free', 'TBD')),
  price_from decimal(10,2),
  price_to decimal(10,2),
  currency text DEFAULT 'USD',
  pricing_notes text,
  
  -- Scoring (for diagnostics)
  score_bands jsonb,         -- e.g., {"80-100": "Revenue Machine", "60-79": "Emerging System"}
  dimensions jsonb,          -- e.g., [{"name": "Forecasting", "weight": 0.20}]
  archetypes_count integer,
  
  -- AI Wiring (signal triggers)
  signal_triggers jsonb,
  ideal_contact_profile jsonb,
  
  -- Cross-sell
  cross_sell_with text[],
  upsell_to text[],
  prerequisites text[],
  
  -- Build status
  build_phase text CHECK (build_phase IN ('Phase 1A', 'Phase 1B', 'Phase 1C', 'Post Tier 1', 'Live', 'TBD')),
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Live', 'Coming Soon', 'In Development', 'Retired', 'Internal')),
  
  -- Notion link
  notion_page_id text,
  notion_url text,
  
  -- Competitive position
  competitive_position text,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- SEED: Diagnostic Assessments (from Notion product definitions)
-- ============================================================================

-- 1. LEAP — Behavioral Wiring & Career Readiness
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, score_bands, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, prerequisites, build_phase, status, notion_page_id, competitive_position)
VALUES (
  'Diagnostic', 'Behavioral Assessment', 'LEAP', 
  'Leadership Entry Assessment Program',
  'WHO you are',
  'Measures behavioral wiring (DISC archetypes) and career readiness. The foundational diagnostic in the SHIFT stack. Entry product for the LYC Partners ecosystem.',
  'Online assessment', ARRAY['Virtual'], '15-25 minutes', 1,
  ARRAY['Senior Managers', 'HiPo Leaders', 'Succession Candidates'],
  ARRAY['APAC', 'Global'],
  '{"4 bands": "See full documentation"}'::jsonb,
  '[{"name": "Behavioral Self-Awareness", "description": "DISC archetypes"}, {"name": "Career Readiness", "description": "Readiness for next-level roles"}, {"name": "APAC Behavioral Modifier", "description": "Cultural adaptation capacity"}]'::jsonb,
  16,
  '[{"signal_type": "career_transition", "relevance": "high"}, {"signal_type": "promotion", "relevance": "high"}, {"signal_type": "new_role", "relevance": "medium"}]'::jsonb,
  '{"seniority": ["Manager", "Senior Manager", "Director"], "functions": ["Leadership", "Management"]}'::jsonb,
  ARRAY['SHIFT-LEAP', 'COACH', 'QUEST'],
  ARRAY[]::text[],
  'Phase 1A', 'Live',
  '398fafae-51be-8119', -- Notion page (referenced)
  'vs. DiSC: LEAP includes career readiness + APAC modifier; DiSC is behavioral only'
);

-- 2. QUEST — Executive Capability
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, score_bands, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, prerequisites, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Capability Assessment', 'QUEST',
  'Qualified Executive Skills & Transition',
  'WHAT can you do at the executive level?',
  'Measures five executive capabilities that determine whether a leader is genuinely operating at senior executive level. Includes APAC Cross-Border Capability Module and AI Readiness sub-score.',
  'Online assessment', ARRAY['Virtual'], '25 minutes', 1,
  ARRAY['Mid/Senior Executives', 'Cross-Border Leaders', 'PE Portfolio Leaders'],
  ARRAY['APAC', 'Global'],
  '{"80-100": "Executive Architect", "60-79": "Capability Builder", "40-59": "Emerging Executive", "20-39": "Capability Gap", "0-19": "Critical Risk"}'::jsonb,
  '[{"name": "Strategic Thinking", "weight": 0.25}, {"name": "Execution Drive", "weight": 0.20}, {"name": "Commercial Acumen", "weight": 0.20}, {"name": "APAC Cross-Border", "weight": 0.15}, {"name": "AI Readiness", "weight": 0.20}]'::jsonb,
  16,
  '[{"signal_type": "leadership_change", "relevance": "high"}, {"signal_type": "expansion", "relevance": "high"}, {"signal_type": "digital_transformation", "relevance": "medium"}]'::jsonb,
  '{"seniority": ["VP", "SVP", "C-Suite", "Managing Director"], "functions": ["Strategy", "Operations", "Commercial"]}'::jsonb,
  ARRAY['SHIFT-QUEST', 'COACH', 'Advisory Retainer'],
  ARRAY[]::text[],
  'Phase 1A', 'Live',
  '',
  'vs. Hogan/Korn Ferry: QUEST is APAC-specific + includes AI readiness; Western tools lack APAC calibration'
);

-- 3. COACH — Leadership Style
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Leadership Style Assessment', 'COACH',
  'Contextual Optimised Archetype & Coaching Heuristic',
  'HOW do you actually lead?',
  'Measures leadership style across 4 quadrants with pressure modifier showing style shifts under high-stakes conditions. Includes APAC Style IQ module and optional 360° rater.',
  'Online assessment', ARRAY['Virtual'], '20 minutes', 1,
  ARRAY['Senior Leaders', 'People Managers', 'Cross-Cultural Leaders'],
  ARRAY['APAC', 'Global'],
  '[{"name": "4 Quadrants", "description": "Leadership style dimensions"}, {"name": "Pressure Modifier", "description": "Style shift under stress"}, {"name": "APAC Style IQ", "description": "Cross-cultural perception gap"}]'::jsonb,
  16,
  '[{"signal_type": "leadership_change", "relevance": "high"}, {"signal_type": "team_conflict", "relevance": "medium"}, {"signal_type": "promotion", "relevance": "medium"}]'::jsonb,
  '{"seniority": ["Manager", "Director", "VP", "C-Suite"], "functions": ["Leadership", "People Management"]}'::jsonb,
  ARRAY['COACH+ 360', 'SHIFT-LEAP', 'Advisory Retainer'],
  'Phase 1A', 'Live',
  'vs. Leadership Circle: COACH includes pressure modifier + APAC Style IQ; 360° rater option'
);

-- 4. DRIVE — Motivation & Role Alignment
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Motivation Assessment', 'DRIVE',
  'Direction, Readiness, Insight, Values & Engagement',
  'WHY do you work the way you do?',
  'Measures what actually motivates a leader and whether their current role is aligned. When alignment is low, high performers disengage. DRIVE makes that visible before it becomes a problem.',
  'Online assessment', ARRAY['Virtual'], '20 minutes', 1,
  ARRAY['Transitioning Executives', 'Disengaged High Performers', 'Career Changers'],
  ARRAY['APAC', 'Global'],
  '[{"name": "Direction", "weight": 0.20}, {"name": "Readiness", "weight": 0.20}, {"name": "Insight", "weight": 0.20}, {"name": "Values", "weight": 0.20}, {"name": "Engagement", "weight": 0.20}]'::jsonb,
  16,
  '[{"signal_type": "career_transition", "relevance": "high"}, {"signal_type": "leadership_change", "relevance": "high"}, {"signal_type": "disengagement", "relevance": "high"}]'::jsonb,
  '{"seniority": ["Senior Manager", "Director", "VP"], "functions": ["All"]}'::jsonb,
  ARRAY['SHIFT-DRIVE', 'PRISM', 'Coaching'],
  'Phase 1A', 'Live',
  'vs. generic engagement surveys: DRIVE is individual diagnostic, not organizational survey'
);

-- 5. IMPACT — Performance Measurement
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Performance Assessment', 'IMPACT',
  'Integrated Mandate Performance & Accountability Compass',
  'WHAT have you actually produced?',
  'Measures what a leader has produced — business results, talent impact, stakeholder influence, and change delivery. Provides credibility evidence that a CV alone cannot.',
  'Online assessment + IMPACT-R Rater (3 stakeholders)', ARRAY['Virtual'], '25 minutes', 1,
  ARRAY['Board Candidates', 'Succession Candidates', 'PE Portfolio Leaders', 'C-Suite'],
  ARRAY['APAC', 'Global'],
  '[{"name": "Business Results"}, {"name": "Talent Impact"}, {"name": "Stakeholder Influence"}, {"name": "Change Delivery"}]'::jsonb,
  16,
  '[{"signal_type": "board_appointment", "relevance": "high"}, {"signal_type": "promotion", "relevance": "high"}, {"signal_type": "mandate_completion", "relevance": "medium"}]'::jsonb,
  '{"seniority": ["Director", "VP", "C-Suite", "Board Member"], "functions": ["All"]}'::jsonb,
  ARRAY['Advisory Retainer', 'PRISM'],
  'Phase 1A', 'Live',
  'Unique: measures output/impact not behavior; rater validation for board-ready evidence'
);

-- 6. SHIFT Composite — Full Diagnostic Profile
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, dimensions, signal_triggers, ideal_contact_profile, cross_sell_with, prerequisites, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Composite Profile', 'SHIFT Composite',
  'SHIFT Composite Profile',
  'The complete leadership intelligence picture',
  'Combines 5 Tier 1 diagnostics (LEAP + QUEST + COACH + DRIVE + IMPACT) into a single composite profile. Formula: LEAP(0.15) + QUEST(0.25) + COACH(0.20) + DRIVE(0.15) + IMPACT(0.25).',
  '5 online assessments combined', ARRAY['Virtual'], '2-3 hours total', 3,
  ARRAY['C-Suite', 'Board Directors', 'Senior Executives', 'PE Partners'],
  ARRAY['APAC', 'Global'],
  '[{"name": "LEAP", "weight": 0.15}, {"name": "QUEST", "weight": 0.25}, {"name": "COACH", "weight": 0.20}, {"name": "DRIVE", "weight": 0.15}, {"name": "IMPACT", "weight": 0.25}]'::jsonb,
  '[{"signal_type": "any", "relevance": "high"}]'::jsonb,
  '{"seniority": ["Director", "VP", "C-Suite", "Board Member"], "functions": ["All"]}'::jsonb,
  ARRAY['Advisory Retainer', 'Signal Council'],
  ARRAY['Prerequisite for Advisory Retainer and Signal Council Tier 2'],
  'Phase 1A', 'Live',
  'No APAC-native composite diagnostic exists; unique market position'
);

-- 7. BRIDGE — China/APAC Leadership Readiness
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, pricing_model, price_from, pricing_notes, target_audience, geographies, score_bands, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'China Readiness Assessment', 'BRIDGE',
  'Board Readiness, Intelligence, Decision-rights, Governance & Execution for China',
  'Mandate readiness for cross-border leadership in China/APAC',
  'Measures mandate readiness for cross-border leadership in China/APAC — governance, geopolitical fluency, market intelligence, and execution capability. Includes proprietary 18-Month Failure Pattern detection.',
  '35 scored items + 2 stage indicators', ARRAY['Virtual'], '25 minutes', 1,
  'Enterprise', 77000, '$77K margin on 3.5-hour delivery model',
  ARRAY['China/APAC Leaders', 'Cross-Border Executives', 'Board Directors'],
  ARRAY['China', 'APAC'],
  '{"80-100": "Ecosystem Architect", "60-79": "Adaptive Operator", "40-59": "Vulnerable Mandate", "20-39": "Structural Gap", "0-19": "Critical Risk"}'::jsonb,
  '[{"name": "Board Readiness", "weight": 0.20}, {"name": "Relationship Intelligence", "weight": 0.15}, {"name": "Market Intelligence", "weight": 0.15}, {"name": "Decision-Rights", "weight": 0.20}, {"name": "Governance", "weight": 0.15}, {"name": "Execution", "weight": 0.15}]'::jsonb,
  16,
  '[{"signal_type": "china_expansion", "relevance": "high"}, {"signal_type": "leadership_change", "relevance": "high"}, {"signal_type": "cross_border", "relevance": "high"}, {"signal_type": "board_appointment", "relevance": "high"}]'::jsonb,
  '{"seniority": ["Director", "VP", "C-Suite", "Board Member"], "functions": ["China Operations", "APAC Leadership", "Cross-Border"]}'::jsonb,
  ARRAY['MOSAIC', 'Advisory Retainer', 'PRISM'],
  'Phase 1A', 'Live',
  'vs. Diligent/Korn Ferry/Spencer Stuart: BRIDGE has 18-Month Failure Pattern + Three Fires (proprietary); China-specific; individual diagnostic'
);

-- 8. MOSAIC — Cross-Cultural Team Cohesion
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, dimensions, archetypes_count, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Team Assessment', 'MOSAIC',
  'Management, Operating-norms, Style-calibration, Alignment & Intercultural-cohesion',
  'How does the team operate across cultures?',
  'Measures team-level cross-cultural effectiveness — not individual CQ, but how the team actually operates across cultures. Includes MOSAIC-T team rater add-on (3+ colleagues rate subject).',
  '35 scored items | 20 minutes + MOSAIC-T (12Q per rater)', ARRAY['Virtual'], '20 minutes', 1,
  ARRAY['Cross-Cultural Teams', 'APAC Team Leaders', 'Global Team Managers'],
  ARRAY['APAC', 'Global'],
  '[{"name": "Management", "weight": 0.25}, {"name": "Operating Norms", "weight": 0.20}, {"name": "Style Calibration", "weight": 0.20}, {"name": "Alignment", "weight": 0.20}, {"name": "Intercultural Cohesion", "weight": 0.15}]'::jsonb,
  16,
  '[{"signal_type": "team_friction", "relevance": "high"}, {"signal_type": "cross_border", "relevance": "high"}, {"signal_type": "merger_integration", "relevance": "high"}]'::jsonb,
  '{"seniority": ["Manager", "Director", "VP"], "functions": ["All"], "context": "Cross-cultural teams"}'::jsonb,
  ARRAY['SHIFT-QUEST', 'BRIDGE', 'Advisory Retainer'],
  'Phase 1B', 'Live',
  'vs. Hofstede/Leadership Circle BRITE: MOSAIC is APAC-specific + Culture Map integration + team rater unique'
);

-- 9. FORGE — Sales Excellence
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, score_bands, dimensions, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'Sales Assessment', 'FORGE',
  'Forecasting, Operations, Revenue-architecture, Growth-execution & Enablement',
  'Can you scale your revenue organization?',
  'Measures sales leadership capability — the developable skills of running a revenue organization. Includes Revenue Impact Calculator translating scores to dollar impact.',
  '35 questions + scenario questions + Revenue Impact Calculator', ARRAY['Virtual'], '25 minutes', 1,
  ARRAY['VP Sales', 'CRO', 'CEO (revenue scalability)', 'PE Operating Partners'],
  ARRAY['APAC', 'Global'],
  '{"80-100": "Revenue Machine", "60-79": "Emerging System", "40-59": "Heroic Selling", "20-39": "Pipeline Chaos", "0-19": "Revenue Risk"}'::jsonb,
  '[{"name": "Forecasting", "weight": 0.20}, {"name": "Operations", "weight": 0.20}, {"name": "Revenue Architecture", "weight": 0.25}, {"name": "Growth 1", "weight": 0.12}, {"name": "Growth 2", "weight": 0.08}, {"name": "Enablement", "weight": 0.15}]'::jsonb,
  '[{"signal_type": "revenue_pressure", "relevance": "high"}, {"signal_type": "sales_leadership_change", "relevance": "high"}, {"signal_type": "scaling", "relevance": "high"}]'::jsonb,
  '{"seniority": ["VP", "CRO", "C-Suite"], "functions": ["Sales", "Revenue", "Commercial"]}'::jsonb,
  ARRAY['QUEST', 'Coaching', 'Advisory Retainer'],
  'Phase 1C', 'Live',
  'vs. Clari/Gong: FORGE measures leader capability not pipeline math; includes APAC calibration'
);

-- 10. SPARK — AI Readiness (Coming Soon)
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, format, delivery_format, duration_text, duration_hours, target_audience, geographies, signal_triggers, ideal_contact_profile, cross_sell_with, build_phase, status, competitive_position)
VALUES (
  'Diagnostic', 'AI Readiness Assessment', 'SPARK',
  'AI Leadership Readiness',
  'How ready are you to lead in an AI-transformed organization?',
  'Measures AI readiness across AI Literacy, AI Governance Judgment, AI-Era Strategic Capability, Behavioral Adaptability, and AI Team & Culture Leadership.',
  'Online assessment', ARRAY['Virtual'], '15-25 minutes', 1,
  ARRAY['Senior Leaders', 'C-Suite', 'Board Directors'],
  ARRAY['APAC', 'Global'],
  '[{"signal_type": "ai_adoption", "relevance": "high"}, {"signal_type": "digital_transformation", "relevance": "high"}, {"signal_type": "technology_disruption", "relevance": "high"}]'::jsonb,
  '{"seniority": ["Director", "VP", "C-Suite"], "functions": ["All"]}'::jsonb,
  ARRAY['SHIFT-LEAP', 'BRIDGE', 'Advisory Retainer'],
  'Post Tier 1', 'Coming Soon',
  'Only standalone AI leadership readiness diagnostic in APAC'
);

-- 11. PRISM — Positioning
INSERT INTO vista_service_catalog (category, service_type, name, full_name, tagline, description, target_audience, geographies, signal_triggers, cross_sell_with, build_phase, status)
VALUES (
  'Diagnostic', 'Positioning Assessment', 'PRISM',
  'Positioning diagnostic',
  'How are you positioned in your market?',
  'Market positioning and personal brand diagnostic for leaders.',
  ARRAY['Transitioning Executives', 'Board Candidates', 'Visible Leaders'],
  ARRAY['APAC', 'Global'],
  '[{"signal_type": "career_transition", "relevance": "high"}, {"signal_type": "visibility", "relevance": "medium"}]'::jsonb,
  ARRAY['DRIVE', 'BRIDGE', 'Advisory Retainer'],
  'Phase 1B', 'Live'
);

-- ============================================================================
-- SEED: Development Programs (Cohort-Based)
-- ============================================================================

-- 12. SHIFT-LEAP
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, duration_hours, target_audience, geographies, pricing_model, pricing_notes, prerequisites, cross_sell_with, build_phase, status)
VALUES (
  'Development Program', 'Cohort Program', 'SHIFT-LEAP',
  'High-Potential Leadership Development',
  'Cohort-based development starting with LEAP diagnostic. Focuses on behavioral self-awareness, career readiness activation, APAC behavioral modifier development, and role-fit optimization.',
  ARRAY['Virtual', 'Hybrid'], '8-12 weeks', 40,
  ARRAY['Senior Managers', 'HiPo Leaders', 'Succession Pipeline'],
  ARRAY['APAC'],
  'Enterprise', 'Company-funded; enterprise cohort pricing',
  ARRAY['LEAP diagnostic'],
  ARRAY['SHIFT-QUEST', 'Coaching'],
  'Phase 1A', 'Live'
);

-- 13. SHIFT-QUEST
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, duration_hours, target_audience, geographies, pricing_model, pricing_notes, prerequisites, cross_sell_with, build_phase, status)
VALUES (
  'Development Program', 'Cohort Program', 'SHIFT-QUEST',
  'Executive Capability Development',
  'Cohort-based development starting with QUEST diagnostic. Strategic thinking, execution drive, commercial acumen, APAC cross-border capability, AI readiness activation.',
  ARRAY['Virtual', 'Hybrid'], '6-10 weeks', 30,
  ARRAY['Mid/Senior Executives', 'Cross-Border Candidates', 'PE Portfolio Leaders'],
  ARRAY['APAC'],
  'Enterprise', 'Company-funded',
  ARRAY['QUEST diagnostic'],
  ARRAY['SHIFT-DRIVE', 'Advisory Retainer'],
  'Phase 1A', 'Live'
);

-- 14. SHIFT-DRIVE
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, duration_hours, target_audience, geographies, pricing_model, pricing_notes, prerequisites, cross_sell_with, build_phase, status)
VALUES (
  'Development Program', 'Cohort Program', 'SHIFT-DRIVE',
  'Career Transition Alignment',
  'Cohort-based development starting with DRIVE + PRISM diagnostics. Career motivation realignment, role-fit diagnosis, direction clarity, career capital activation.',
  ARRAY['Virtual', 'Hybrid'], '4-8 weeks', 20,
  ARRAY['Transitioning Executives', 'Post-Exit Founders', 'Board Candidates'],
  ARRAY['APAC'],
  'Custom', 'Mix of self-funded B2C and company L&D funded',
  ARRAY['DRIVE diagnostic', 'PRISM diagnostic'],
  ARRAY['PRISM Advisory', 'Coaching'],
  'Phase 1A', 'Live'
);

-- ============================================================================
-- SEED: Advisory & Membership
-- ============================================================================

-- 15. Advisory Retainer
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, target_audience, geographies, pricing_model, pricing_notes, prerequisites, cross_sell_with, build_phase, status)
VALUES (
  'Advisory', 'Retainer', 'Advisory Retainer',
  'Ongoing Advisory with Kevin Hong',
  'The most senior LYC Partners offering. Monthly 90-min advisory sessions, on-call access, annual SHIFT Composite reassessment, Signal Council membership, full WAVE access. Strictly limited in number.',
  ARRAY['Virtual', 'In-Person'], 'Ongoing monthly',
  ARRAY['C-Suite', 'Board Directors', 'Senior APAC Leaders'],
  ARRAY['APAC'],
  'Retainer', 'Investment available on request',
  ARRAY['SHIFT Composite engagement required'],
  ARRAY['Signal Council'],
  'Phase 1A', 'Live'
);

-- 16. Signal Council Tier 1 — Member
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, target_audience, geographies, pricing_model, price_from, currency, pricing_notes, cross_sell_with, build_phase, status)
VALUES (
  'Membership', 'Executive Membership', 'Signal Council — Member',
  'Signal Council Tier 1',
  'Quarterly diagnostic refresh (LEAP, BRIDGE, PRISM, MOSAIC, FORGE, or SPARK), monthly intelligence briefing, peer community access, priority event access.',
  ARRAY['Virtual'], 'Annual subscription',
  ARRAY['Senior Executives', 'Cross-Border Leaders'],
  ARRAY['APAC', 'Global'],
  'Subscription', 500, 'USD', '$500/month annual subscription',
  ARRAY['Signal Council Tier 2', 'Advisory Retainer'],
  'Phase 1A', 'Live'
);

-- 17. Signal Council Tier 2 — Insider
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, delivery_format, duration_text, target_audience, geographies, pricing_model, price_from, currency, pricing_notes, prerequisites, cross_sell_with, build_phase, status)
VALUES (
  'Membership', 'Executive Membership', 'Signal Council — Insider',
  'Signal Council Tier 2',
  'Everything in Tier 1 plus: bi-monthly 1:1 advisory session (paid), early access to new diagnostics, custom intelligence reports, board-ready output formatting.',
  ARRAY['Virtual'], 'Annual subscription',
  ARRAY['Senior Executives', 'Board Directors', 'PE Partners'],
  ARRAY['APAC', 'Global'],
  'Subscription', 1000, 'USD', '$1,000/month annual subscription',
  ARRAY['Signal Council Tier 1'],
  ARRAY['Advisory Retainer'],
  'Phase 1A', 'Live'
);

-- 18. Signal Council Nxt Gen
INSERT INTO vista_service_catalog (category, service_type, name, full_name, description, target_audience, geographies, pricing_model, pricing_notes, build_phase, status)
VALUES (
  'Membership', 'Rising Leader Membership', 'Signal Council Nxt Gen',
  'Rising Global-Track Leaders',
  'Diagnostic access at accessible price points (LEAP, DRIVE, PRISM), structured peer cohort, mentorship connections to senior Signal Council members, career planning framework.',
  ARRAY['Rising Leaders', 'High-Potential Managers'],
  ARRAY['APAC', 'Global'],
  'Subscription', 'Accessible price points — see Kevin',
  'Phase 1B', 'Coming Soon'
);

-- ============================================================================
-- SEED: Content & Events
-- ============================================================================

INSERT INTO vista_service_catalog (category, service_type, name, description, delivery_format, target_audience, geographies, status, build_phase)
VALUES 
  ('Content', 'Podcast', 'Leaders in Motion', 'Podcast series for senior APAC leaders. Career Track episodes + Main Show.', ARRAY['Virtual'], ARRAY['Senior Leaders', 'APAC Executives'], ARRAY['APAC', 'Global'], 'Live', 'Phase 1A'),
  ('Content', 'Podcast', 'France Chine', 'France-China business and leadership podcast.', ARRAY['Virtual'], ARRAY['France-China Leaders', 'Cross-Border Executives'], ARRAY['France', 'China'], 'Live', 'Phase 1A'),
  ('Content', 'Newsletter', 'LYC Partners Newsletter', 'Monthly intelligence briefing on APAC leadership, market signals, and executive insights.', ARRAY['Virtual'], ARRAY['All Contacts'], ARRAY['APAC', 'Global'], 'Live', 'Phase 1A'),
  ('Event', 'Webinar', 'LYC Webinar Series', 'Regular webinars on APAC leadership, AI, cross-border challenges.', ARRAY['Virtual'], ARRAY['All Contacts'], ARRAY['APAC', 'Global'], 'Live', 'Phase 1A'),
  ('Event', 'Workshop', 'LYC Workshops', 'Facilitated workshops using diagnostic insights for team and individual development.', ARRAY['In-Person', 'Virtual', 'Hybrid'], ARRAY['Teams', 'Leadership Groups'], ARRAY['APAC'], 'Live', 'Phase 1A'),
  ('Event', 'Roundtable', 'Signal Council Roundtables', 'Exclusive peer roundtables for Signal Council members.', ARRAY['In-Person'], ARRAY['Signal Council Members'], ARRAY['APAC'], 'Live', 'Phase 1A');

-- ============================================================================
-- SECTION 2: CONTACT-SERVICE RELATIONSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_contact_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id) ON DELETE CASCADE,
  service_id uuid REFERENCES vista_service_catalog(id),
  status text DEFAULT 'Identified' CHECK (status IN (
    'Identified', 'Recommended', 'Proposal Sent', 'In Discussion', 'Engaged', 'Completed', 'Declined'
  )),
  recommended_by text,
  recommendation_reason text,
  recommended_at timestamptz,
  engaged_at timestamptz,
  completed_at timestamptz,
  revenue_attributed decimal(10,2),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(contact_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_cs_contact ON vista_contact_services(contact_id);
CREATE INDEX IF NOT EXISTS idx_cs_service ON vista_contact_services(service_id);
CREATE INDEX IF NOT EXISTS idx_cs_status ON vista_contact_services(status);

-- ============================================================================
-- SECTION 3: SERVICE-LINKED TEMPLATES (expanded from email_templates)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES vista_service_catalog(id) ON DELETE CASCADE,
  template_type text NOT NULL CHECK (template_type IN (
    'Email', 'Proposal', 'Presentation', 'Invitation', 'Follow-Up',
    'Webinar Script', 'Podcast Brief', 'Newsletter Blurb', 'LinkedIn Post',
    'Meeting Agenda', 'Scope of Work', 'Case Study'
  )),
  name text NOT NULL,
  subject text,
  body text NOT NULL,
  variables text[] DEFAULT '{}',
  use_case text,
  signal_match text[],
  times_used integer DEFAULT 0,
  response_rate decimal(5,2),
  conversion_rate decimal(5,2),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_st_service ON vista_service_templates(service_id);
CREATE INDEX IF NOT EXISTS idx_st_type ON vista_service_templates(template_type);

-- ============================================================================
-- SECTION 4: GAMIFICATION ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  goal_type text NOT NULL CHECK (goal_type IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
  contacts_to_reach integer DEFAULT 10,
  emails_to_send integer DEFAULT 5,
  meetings_to_book integer DEFAULT 2,
  signals_to_act_on integer DEFAULT 3,
  campaigns_to_advance integer DEFAULT 1,
  period_start date,
  period_end date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vista_daily_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  contacts_reached integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  meetings_booked integer DEFAULT 0,
  signals_acted_on integer DEFAULT 0,
  follow_ups_completed integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  goals_met boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS vista_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  achievement_type text NOT NULL,
  unlocked_at timestamptz DEFAULT NOW(),
  recognized boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vista_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  nudge_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority integer DEFAULT 0,
  related_contact_id uuid,
  related_signal_id uuid,
  shown_at timestamptz DEFAULT NOW(),
  dismissed_at timestamptz,
  acted_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: ACTION TAXONOMY — Extend activities table
-- ============================================================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS next_step text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS next_step_due_date date;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS template_used_id uuid REFERENCES email_templates(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES vista_service_catalog(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS signal_id uuid REFERENCES signals(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS parent_activity_id uuid REFERENCES activities(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS response_received boolean DEFAULT false;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS company_name text;

CREATE INDEX IF NOT EXISTS idx_activities_purpose ON activities(purpose) WHERE purpose IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_outcome ON activities(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_next_due ON activities(next_step_due_date) WHERE next_step_due_date IS NOT NULL;

-- ============================================================================
-- SECTION 6: INBOUND SIGNAL TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_inbound_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_source text NOT NULL,
  contact_id uuid REFERENCES vista_contacts(id),
  company_name text,
  email text,
  program_id uuid REFERENCES programs(program_id),
  service_id uuid REFERENCES vista_service_catalog(id),
  occurred_at timestamptz NOT NULL DEFAULT NOW(),
  signal_value text CHECK (signal_value IN ('Low', 'Medium', 'High', 'Critical')),
  status text DEFAULT 'New' CHECK (status IN ('New', 'Acknowledged', 'Acted On', 'Nurture', 'Ignored')),
  notes text,
  raw_data jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbound_contact ON vista_inbound_signals(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbound_source ON vista_inbound_signals(signal_source);
CREATE INDEX IF NOT EXISTS idx_inbound_status ON vista_inbound_signals(status);

ALTER TABLE vista_inbound_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read inbound" ON vista_inbound_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full inbound" ON vista_inbound_signals FOR ALL TO service_role USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE vista_inbound_signals;

-- ============================================================================
-- SECTION 7: TASK TRACKER & DEADLINES
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  title text NOT NULL,
  description text,
  task_type text,
  priority integer DEFAULT 1 CHECK (priority IN (0, 1, 2, 3, 4)),
  due_date date,
  due_time time,
  contact_id uuid REFERENCES vista_contacts(id),
  company_name text,
  campaign_id uuid REFERENCES campaign_activities(id),
  signal_id uuid REFERENCES signals(id),
  activity_id uuid REFERENCES activities(id),
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue')),
  completed_at timestamptz,
  auto_generated boolean DEFAULT false,
  generated_by text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON vista_tasks(status) WHERE status IN ('Open', 'In Progress', 'Waiting', 'Overdue');
CREATE INDEX IF NOT EXISTS idx_tasks_due ON vista_tasks(due_date) WHERE status IN ('Open', 'In Progress', 'Waiting');

ALTER TABLE vista_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tasks" ON vista_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full tasks" ON vista_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 8: QUALITATIVE INTELLIGENCE STORAGE (from V4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_signal_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES signals(id),
  brief_text text,
  market_context text,
  affected_entities jsonb,
  recommended_actions jsonb,
  messaging_angles jsonb,
  product_matches jsonb,
  generated_at timestamptz DEFAULT NOW(),
  edited_at timestamptz,
  edited_by text
);

CREATE TABLE IF NOT EXISTS vista_contact_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id),
  who_they_are text,
  company_situation text,
  what_we_can_offer text,
  how_to_approach text,
  what_to_avoid text,
  relationship_summary text,
  service_recommendations jsonb,
  generated_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vista_lens_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id),
  recommendation_type text,
  who_to_contact text,
  why text,
  how text,
  what_to_say text,
  email_draft text,
  service_recommendation uuid REFERENCES vista_service_catalog(id),
  confidence float,
  generated_at timestamptz DEFAULT NOW(),
  acted_on boolean DEFAULT false,
  acted_at timestamptz
);

-- ============================================================================
-- SECTION 9: ALERT RULES ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  rule_type text NOT NULL,
  threshold_value integer,
  threshold_unit text DEFAULT 'days',
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vista_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES vista_alert_rules(id),
  alert_type text NOT NULL,
  severity text DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  contact_id uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved', 'acted_on')),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON vista_alerts(status) WHERE status = 'active';

-- ============================================================================
-- SECTION 10: SHAREABLE OUTPUTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  content_html text,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public boolean DEFAULT false,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  source_entity_type text,
  source_entity_id uuid,
  generated_by text DEFAULT 'Kevin',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_token ON vista_shared_reports(share_token);

-- ============================================================================
-- SECTION 11: LAYOUT CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_layout_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  page_name text NOT NULL,
  layout_name text NOT NULL,
  widgets jsonb NOT NULL,
  view_mode text DEFAULT 'grid',
  sort_config jsonb DEFAULT '{}',
  filter_config jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, page_name, layout_name)
);

-- ============================================================================
-- SECTION 12: PLATFORM SYNC TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_platform_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform text NOT NULL,
  target_platform text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  vista_entity_type text,
  vista_entity_id uuid,
  sync_status text DEFAULT 'pending',
  last_synced_at timestamptz,
  sync_error text,
  payload jsonb,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- ============================================================================
-- SEED: Default gamification goals
-- ============================================================================

INSERT INTO vista_goals (goal_type, contacts_to_reach, emails_to_send, meetings_to_book, signals_to_act_on, period_start, is_active)
VALUES 
  ('Daily', 10, 5, 1, 3, CURRENT_DATE, true),
  ('Weekly', 50, 25, 5, 15, CURRENT_DATE, true),
  ('Monthly', 200, 100, 20, 60, CURRENT_DATE, true);

-- ============================================================================
-- SEED: Default alert rules
-- ============================================================================

INSERT INTO vista_alert_rules (rule_type, threshold_value, threshold_unit, is_active)
VALUES
  ('stage_duration', 14, 'days', true),
  ('no_response', 7, 'days', true),
  ('follow_up_overdue', 1, 'days', true),
  ('signal_fresh', 1, 'days', true),
  ('contact_decay', 30, 'days', true),
  ('campaign_stalled', 14, 'days', true);

-- ============================================================================
-- RLS for new tables
-- ============================================================================

ALTER TABLE vista_service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_contact_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_daily_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_signal_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_contact_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_lens_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_layout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE vista_platform_sync ENABLE ROW LEVEL SECURITY;

-- Authenticated read all
DO $$ 
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'vista_service_catalog', 'vista_contact_services', 'vista_service_templates',
    'vista_goals', 'vista_daily_log', 'vista_achievements', 'vista_nudges',
    'vista_signal_intelligence', 'vista_contact_briefs', 'vista_lens_recommendations',
    'vista_alert_rules', 'vista_alerts', 'vista_shared_reports',
    'vista_layout_config', 'vista_platform_sync'
  ] LOOP
    EXECUTE format('CREATE POLICY "Auth read %I" ON %I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Service role %I" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ============================================================================
-- DONE — Post-migration checklist:
-- [ ] Run this migration on Supabase
-- [ ] Verify all tables created
-- [ ] Verify service catalog seeded (should have 24+ services)
-- [ ] Verify default goals and alert rules seeded
-- [ ] Test: query service catalog for AI recommendation wiring
-- ============================================================================
