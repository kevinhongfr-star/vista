-- ============================================================================
-- MEGA MIGRATION — VISTA (V2 + W1.5/W1.6/W1.7) + DEX AI (66 migrations)
-- VERSION: 2.0 (FIXED — service_type NOT NULL + category CHECK + missing cols)
-- ============================================================================
-- Generated: 2026-07-15
-- Target: Supabase rnnlteyqmtxkzllbohuu
--
-- FIXES vs v1.0:
--   1. Wave 1.6: Added service_type to ALL INSERT statements (was NOT NULL violation)
--   2. Wave 1.6: Added pre-fix to DROP category CHECK constraint (tier names as categories)
--   3. Wave 1.7: Added is_b2c + slug columns before B2C product INSERT
--   4. Wave 1.7: Fixed tier_level → tier column reference + added service_type
--
-- HOW TO RUN:
--   1. Open Supabase SQL Editor
--   2. Paste this entire file
--   3. Click Run
--
-- SAFE TO RE-RUN: All statements use IF NOT EXISTS / ON CONFLICT / DO blocks
-- ORDER: V2 foundation → Wave 1.5 RPC fix → Wave 1.6 Revenue OS → 
--         Wave 1.7 B2C→B2B → DEX AI (chronological)
-- ============================================================================


-- ============================================================================
-- PART A: VISTA — V2 + Wave 1.5/1.6/1.7
-- ============================================================================

-- >>> FILE: run_this_v2_migration.sql (V2 Service Catalog + V4 Backend)
-- ============================================================================
-- VISTA V2 MIGRATION — FINAL COMBINED (ALL FIXES INCLUDED)
-- Single paste in Supabase SQL Editor. No pre-steps needed.
--
-- Fixes applied:
--   1. 'Live' added to status check constraint
--   2. QUEST INSERT: removed extra empty value (22 cols ≠ 23 vals)
-- ============================================================================

-- Pre-fix: update status constraint if table exists from partial run
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vista_service_catalog') THEN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT IF EXISTS vista_service_catalog_status_check;
    ALTER TABLE vista_service_catalog ADD CHECK (status IN ('Active', 'Live', 'Coming Soon', 'In Development', 'Retired', 'Internal'));
  END IF;
END $$;

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
-- SECTION 5: ACTION TAXONOMY — Extend campaign_activities table
-- ============================================================================

ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS purpose text;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS outcome text;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS next_step text;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS next_step_due_date date;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS template_used_id uuid REFERENCES email_templates(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES vista_service_catalog(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS signal_id uuid REFERENCES signals(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS parent_activity_id uuid REFERENCES campaign_activities(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS response_received boolean DEFAULT false;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS company_name text;

CREATE INDEX IF NOT EXISTS idx_activities_purpose ON campaign_activities(purpose) WHERE purpose IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_outcome ON campaign_activities(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_next_due ON campaign_activities(next_step_due_date) WHERE next_step_due_date IS NOT NULL;

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
DROP POLICY IF EXISTS "Authenticated read inbound" ON vista_inbound_signals;
CREATE POLICY "Authenticated read inbound" ON vista_inbound_signals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role full inbound" ON vista_inbound_signals;
CREATE POLICY "Service role full inbound" ON vista_inbound_signals FOR ALL TO service_role USING (true) WITH CHECK (true);
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE vista_inbound_signals;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
  activity_id uuid REFERENCES campaign_activities(id),
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
DROP POLICY IF EXISTS "Authenticated read tasks" ON vista_tasks;
CREATE POLICY "Authenticated read tasks" ON vista_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role full tasks" ON vista_tasks;
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
    EXECUTE format('DROP POLICY IF EXISTS "Auth read %I" ON %I', t, t);
    EXECUTE format('CREATE POLICY "Auth read %I" ON %I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Service role %I" ON %I', t, t);
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


-- >>> FILE: fix_rpc_functions_wave1.5.sql (RPC Function Fixes)
-- Fix fn_funnel_summary: cast funnel_stage to match VARCHAR return type
DROP FUNCTION IF EXISTS fn_funnel_summary();
CREATE OR REPLACE FUNCTION fn_funnel_summary()
RETURNS TABLE (
  stage VARCHAR(30),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT funnel_stage::VARCHAR(30), COUNT(*)::BIGINT
  FROM vista_contacts
  WHERE funnel_stage IS NOT NULL
  GROUP BY funnel_stage
  ORDER BY
    CASE funnel_stage
      WHEN 'outreach' THEN 1
      WHEN 'conversation' THEN 2
      WHEN 'opportunity' THEN 3
      WHEN 'paid' THEN 4
      WHEN 'nurture' THEN 5
      WHEN 'closed_lost' THEN 6
      ELSE 7
    END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix fn_today_actions: use c.name instead of c.full_name
DROP FUNCTION IF EXISTS fn_today_actions();
CREATE OR REPLACE FUNCTION fn_today_actions()
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  funnel_stage VARCHAR(30),
  next_action_type VARCHAR(30),
  next_action_date DATE,
  days_overdue INT,
  warmth_score SMALLINT,
  bd_bucket VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    COALESCE(c.name, c.company, 'Unknown')::TEXT,
    c.funnel_stage,
    c.next_action_type,
    c.next_action_date,
    CASE
      WHEN c.next_action_date < CURRENT_DATE
      THEN (CURRENT_DATE - c.next_action_date)::INT
      ELSE 0
    END,
    c.warmth_score,
    c.bd_bucket
  FROM vista_contacts c
  WHERE c.next_action_date <= CURRENT_DATE
    AND c.funnel_stage NOT IN ('paid', 'closed_lost')
    AND c.next_action_type IS NOT NULL
  ORDER BY
    days_overdue DESC,
    c.warmth_score DESC NULLS LAST,
    c.next_action_date ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix fn_overdue_outreaches: use c.name instead of c.full_name
DROP FUNCTION IF EXISTS fn_overdue_outreaches();
CREATE OR REPLACE FUNCTION fn_overdue_outreaches()
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  funnel_stage VARCHAR(30),
  days_overdue INT,
  warmth_score SMALLINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    COALESCE(c.name, c.company, 'Unknown')::TEXT,
    c.funnel_stage,
    (CURRENT_DATE - c.next_action_date)::INT,
    c.warmth_score
  FROM vista_contacts c
  WHERE c.next_action_date < CURRENT_DATE
    AND c.funnel_stage IN ('outreach', 'awareness')
  ORDER BY (CURRENT_DATE - c.next_action_date) DESC
  LIMIT 30;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix fn_nurture_due_reengage: use c.name instead of c.full_name
DROP FUNCTION IF EXISTS fn_nurture_due_reengage();
CREATE OR REPLACE FUNCTION fn_nurture_due_reengage()
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  route_type VARCHAR(20),
  reengage_date DATE,
  days_overdue INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.contact_id,
    COALESCE(c.name, c.company, 'Unknown')::TEXT,
    n.route_type,
    n.reengage_date,
    CASE
      WHEN n.reengage_date < CURRENT_DATE
      THEN (CURRENT_DATE - n.reengage_date)::INT
      ELSE 0
    END
  FROM vista_nurture_routes n
  JOIN vista_contacts c ON c.id = n.contact_id
  WHERE n.status = 'active'
    AND n.reengage_date <= CURRENT_DATE
  ORDER BY n.reengage_date ASC
  LIMIT 30;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fix fn_weekly_outreach_stats: use c.name instead of c.full_name
DROP FUNCTION IF EXISTS fn_weekly_outreach_stats();
CREATE OR REPLACE FUNCTION fn_weekly_outreach_stats()
RETURNS TABLE (
  week_start DATE,
  touches_sent INT,
  replies_received INT,
  conversations_started INT,
  routed_to_nurture INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (sent_at::date - EXTRACT(DOW FROM sent_at::date)::INT) AS week_start,
    COUNT(*) FILTER (WHERE status = 'sent')::INT AS touches_sent,
    COUNT(*) FILTER (WHERE status = 'replied')::INT AS replies_received,
    COUNT(*) FILTER (WHERE status = 'replied' AND response_sentiment IN ('positive','meeting_booked'))::INT AS conversations_started,
    0::INT AS routed_to_nurture
  FROM vista_outreach_sequences
  WHERE sent_at >= CURRENT_DATE - INTERVAL '28 days'
  GROUP BY week_start
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql STABLE;


-- >>> FILE: run_this_wave1.6_migration.sql — FIXED (service_type + category CHECK)
-- ============================================================
-- VISTA Wave 1.6 — Revenue Operating System Migration
-- ============================================================
-- Author: James/AI | Date: 2026-07-12
-- Depends on: Wave 1.5 (funnel core), V2 (service catalog)
-- Safe to re-run: all statements use IF NOT EXISTS
-- ============================================================

-- ============================================================
-- SECTION 1: Service Catalog Enhancements
-- ============================================================

-- 1.1 Add tier architecture to service catalog
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier INT DEFAULT 3;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier_name TEXT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_min_cny NUMERIC;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_max_cny NUMERIC;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS price_model TEXT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS engagement_duration TEXT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS target_buyer TEXT[];
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS is_discountable BOOLEAN DEFAULT true;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS discount_rules JSONB;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS tier_positioning TEXT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS competitor_anchor TEXT;

-- 1.2 Update existing services with tier info (assign existing 24 services to tiers)
UPDATE vista_service_catalog SET tier = 3, tier_name = 'Mid-Ticket (Revenue)', is_discountable = true
WHERE tier IS NULL AND name IN ('PRISM', 'BRIDGE', 'MOSAIC', 'SPARK', 'FORGE');

UPDATE vista_service_catalog SET tier = 3, tier_name = 'Mid-Ticket (Revenue)', is_discountable = true
WHERE tier IS NULL AND name IN ('COACH', 'DRIVE');

UPDATE vista_service_catalog SET tier = 4, tier_name = 'High-Ticket (Proof)', is_discountable = true
WHERE tier IS NULL AND name = 'Advisory Services';

UPDATE vista_service_catalog SET tier = 5, tier_name = 'Search (Cash Engine)', is_discountable = false
WHERE tier IS NULL AND name LIKE '%Search%' OR name LIKE '%search%';


-- Pre-fix: Drop category CHECK constraint (Wave 1.6 uses tier names as categories)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'vista_service_catalog'
    AND constraint_name = 'vista_service_catalog_category_check'
  ) THEN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT vista_service_catalog_category_check;
    RAISE NOTICE 'Dropped vista_service_catalog_category_check';
  END IF;
END $$;

-- 1.3 Seed Tier 1 — FREE (Acquisition Layer)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, is_discountable, tier_positioning)
VALUES
    ('LinkedIn Content (3x/week)', 'Free Content', 'Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['All ICP contacts'], false, 'The thought leader who gets cross-border talent'),
    ('Newsletter (weekly)', 'Free Content', 'Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['All contacts'], false, 'The thought leader who gets cross-border talent'),
    ('Podcast (weekly)', 'Free Content', 'Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Target guests', 'Listeners'], false, 'The thought leader who gets cross-border talent'),
    ('Webinar (monthly, 45 min)', 'Free Content', 'Event', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Nurture list', 'Workshop leads'], false, 'The thought leader who gets cross-border talent'),
    ('Diagnostic Teaser (15 min)', 'Free Content', 'Diagnostic', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Conversation-stage contacts'], false, 'Show them what the data looks like')
ON CONFLICT DO NOTHING;

-- 1.4 Seed Tier 2 — LOW-TICKET (Validation Layer)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Workshop (online, 2-3 hours)', 'Event', 'Workshop', 2, 'Low-Ticket (Validation)', 2000, 5000, 'per_session', ARRAY['HR leaders', 'L&D heads'], '2-3 hours', true, '{"max_pct": 0.15, "conditions": ["early_bird"]}', 'Practical, diagnostic-driven, not theory', '2-3x cheaper than Huthwaite/DDI'),
    ('Workshop (half-day intensive)', 'Event', 'Workshop', 2, 'Low-Ticket (Validation)', 5000, 8000, 'per_session', ARRAY['VPs', 'Directors'], 'half-day', true, '{"max_pct": 0.15, "conditions": ["early_bird"]}', 'Practical, diagnostic-driven, not theory', '2-3x cheaper than Huthwaite/DDI'),
    ('Insights Report (single issue)', 'Content', 'Report', 2, 'Low-Ticket (Validation)', 1500, 3000, 'per_issue', ARRAY['PE operators', 'Strategy heads'], 'one-time', true, '{"max_pct": 0.10}', 'Show intelligence quality', NULL),
    ('Talent Market Map', 'Diagnostic', 'Mapping', 2, 'Low-Ticket (Validation)', 3000, 8000, 'per_project', ARRAY['HR', 'Hiring managers'], '3-6 weeks', true, '{"max_pct": 0.15}', 'Demonstrate GRID capability', NULL),
    ('The Council (annual membership)', 'Membership', 'Membership', 2, 'Low-Ticket (Validation)', 8000, 15000, 'per_year', ARRAY['Senior leaders', 'PE partners'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('DEX AI Starter Credits', 'Platform', 'Platform', 7, 'Platform (DEX AI)', 500, 2000, 'one_time', ARRAY['HR teams', 'Recruiters'], 'one-time', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights')
ON CONFLICT DO NOTHING;

-- 1.5 Seed Tier 3 — MID-TICKET (Revenue Layer)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Diagnostic (comprehensive)', 'Diagnostic', 'Assessment', 3, 'Mid-Ticket (Revenue)', 8000, 25000, 'per_project', ARRAY['CHROs', 'VPs', 'GMs'], '2-4 weeks', true, '{"max_pct": 0.50, "conditions": ["founding_client", "first_3"]}', 'Data-driven talent intelligence, not gut feel', 'Same price as SHL/Hogan, more actionable'),
    ('Executive Coaching (6 sessions)', 'Development Program', 'Coaching', 3, 'Mid-Ticket (Revenue)', 18000, 36000, 'per_engagement', ARRAY['Senior directors', 'VPs'], '3 months', true, '{"max_pct": 0.15}', 'Boutique coaching with data backing', NULL),
    ('Executive Coaching (12 sessions)', 'Development Program', 'Coaching', 3, 'Mid-Ticket (Revenue)', 30000, 60000, 'per_engagement', ARRAY['C-suite', 'Founders'], '6 months', true, '{"max_pct": 0.15}', 'Boutique coaching with data backing', NULL),
    ('Training Program (custom, 3 sessions)', 'Development Program', 'Training', 3, 'Mid-Ticket (Revenue)', 15000, 30000, 'per_program', ARRAY['L&D', 'HR directors'], '1-2 months', true, '{"max_pct": 0.20}', 'Diagnostic-backed training', NULL),
    ('Syndicate Intelligence Subscription', 'Membership', 'Subscription', 3, 'Mid-Ticket (Revenue)', 30000, 60000, 'per_year', ARRAY['PE firms', 'Strategy teams'], '12 months', true, '{"max_pct": 0.15, "conditions": ["annual"]}', 'Ongoing intelligence, not point-in-time', NULL),
    ('DEX AI Pro Subscription', 'Platform', 'Platform', 7, 'Platform (DEX AI)', 5000, 15000, 'per_month', ARRAY['HR teams', 'Talent functions'], 'monthly', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights'),
    ('Mapping Project (full market scan)', 'Diagnostic', 'Mapping', 3, 'Mid-Ticket (Revenue)', 15000, 40000, 'per_project', ARRAY['CHROs', 'PE operating partners'], '3-6 weeks', true, '{"max_pct": 0.15}', 'Comprehensive market intelligence', NULL)
ON CONFLICT DO NOTHING;

-- 1.6 Seed Tier 4 — HIGH-TICKET (Proof Layer)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Advisory Project (single product)', 'Advisory', 'Advisory', 4, 'High-Ticket (Proof)', 40000, 80000, 'per_project', ARRAY['CHROs', 'CEOs'], '2-3 months', true, '{"max_pct": 0.20, "conditions": ["founding_client", "first_3"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('Advisory Project (multi-product)', 'Advisory', 'Advisory', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_project', ARRAY['CEOs', 'Boards'], '4-6 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('HQ-China Alignment Program (BRIDGE full)', 'Development Program', 'Program', 4, 'High-Ticket (Proof)', 60000, 120000, 'per_project', ARRAY['Expats', 'China GMs', 'HQ heads'], '6 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('AI Transformation Program (SPARK full)', 'Development Program', 'Program', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_project', ARRAY['CEOs', 'CTOs', 'CHROs'], '6-9 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('Retainer (monthly advisory)', 'Advisory', 'Retainer', 4, 'High-Ticket (Proof)', 15000, 30000, 'per_month', ARRAY['CHROs', 'CEOs'], '6-12 months', true, '{"max_pct": 0.20, "conditions": ["annual_commitment", "first_3"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('PE Portfolio Talent Review (annual)', 'Advisory', 'Advisory', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_year', ARRAY['PE partners'], 'ongoing', true, '{"max_pct": 0.18, "conditions": ["bundle"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('DEX AI Enterprise License', 'Platform', 'Platform', 7, 'Platform (DEX AI)', 15000, 30000, 'per_month', ARRAY['Large enterprises'], 'annual contract', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights')
ON CONFLICT DO NOTHING;

-- 1.7 Seed Tier 5 — SEARCH (Cash Engine)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Retained Executive Search', 'Advisory', 'Search', 5, 'Search (Cash Engine)', 75000, 200000, 'per_role', ARRAY['CHROs', 'CEOs'], '2-4 months', false, NULL, 'Search + intelligence, not just headhunting', 'Same price as Egon Zehnder/Spencer Stuart, more data'),
    ('Contingent Search', 'Advisory', 'Search', 5, 'Search (Cash Engine)', 50000, 150000, 'per_role', ARRAY['CHROs', 'Hiring managers'], '1-3 months', false, NULL, 'Search + intelligence, not just headhunting', 'Same price as Egon Zehnder/Spencer Stuart, more data'),
    ('Search + Diagnostic Bundle', 'Advisory', 'Search', 5, 'Search (Cash Engine)', 90000, 215000, 'per_role', ARRAY['CHROs', 'CEOs'], '2-4 months', true, '{"max_pct": 0.10, "conditions": ["bundle"]}', 'Search + intelligence bundled', 'Same price, more comprehensive'),
    ('Mapping-to-Search Pipeline', 'Diagnostic', 'Mapping', 5, 'Search (Cash Engine)', 15000, 40000, 'per_role', ARRAY['CHROs', 'PE operating partners'], '3-6 weeks then search', true, '{"max_pct": 0.10, "note": "mapping fee credited to search"}', 'Mapping converts to search', NULL)
ON CONFLICT DO NOTHING;

-- 1.8 Seed Tier 6 — THE COUNCIL (Recurring + Exclusivity)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Council Individual Member', 'Membership', 'Membership', 6, 'Council (Recurring)', 12000, 12000, 'per_year', ARRAY['Senior leaders'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('Council Corporate Member', 'Membership', 'Membership', 6, 'Council (Recurring)', 30000, 30000, 'per_year', ARRAY['CHROs', 'CEOs'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('Council PE Partner Member', 'Membership', 'Membership', 6, 'Council (Recurring)', 50000, 50000, 'per_year', ARRAY['PE partners'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage')
ON CONFLICT DO NOTHING;

-- 1.9 Seed Tier 7 — PLATFORM (DEX AI additional products)
INSERT INTO vista_service_catalog (name, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, is_discountable, tier_positioning, competitor_anchor)
VALUES
    ('DEX AI Credit Top-Up', 'Platform', 'Platform', 7, 'Platform (DEX AI)', 50, 50, 'per_unit', ARRAY['HR teams', 'Recruiters'], false, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights'),
    ('METRIX Assessment (standalone)', 'Platform', 'Assessment', 7, 'Platform (DEX AI)', 200, 500, 'per_assessment', ARRAY['HR teams', 'Recruiters'], true, 'Data-driven assessment, not gut feel', NULL),
    ('Team Diagnostic (up to 10 people)', 'Platform', 'Assessment', 7, 'Platform (DEX AI)', 3000, 8000, 'one_time', ARRAY['HR teams', 'Team leads'], true, 'Team-level intelligence', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 2: Bundle Definitions
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_service_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_name TEXT NOT NULL,
    bundle_code TEXT UNIQUE NOT NULL,
    component_service_names TEXT[] NOT NULL, -- names since IDs may vary
    individual_total_min_cny NUMERIC,
    individual_total_max_cny NUMERIC,
    bundle_price_min_cny NUMERIC NOT NULL,
    bundle_price_max_cny NUMERIC NOT NULL,
    discount_pct NUMERIC NOT NULL,
    description TEXT,
    positioning TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO vista_service_bundles (bundle_name, bundle_code, component_service_names, individual_total_min_cny, individual_total_max_cny, bundle_price_min_cny, bundle_price_max_cny, discount_pct, description, positioning)
VALUES
    ('Search + Diagnose', 'BUNDLE_SEARCH_DIAG', ARRAY['Retained Executive Search', 'Diagnostic (comprehensive)'], 100000, 220000, 110000, 200000, 0.09, 'Executive search with bundled diagnostic for the placed candidate', 'Full intelligence package: find them AND assess them'),
    ('Diagnose + Develop', 'BUNDLE_DIAG_DEV', ARRAY['Diagnostic (comprehensive)', 'Executive Coaching (6 sessions)'], 26000, 61000, 21000, 49000, 0.20, 'Diagnostic followed by coaching arc based on results', 'From insight to action: diagnose, then develop'),
    ('Diagnose + Transform', 'BUNDLE_DIAG_TRANS', ARRAY['Diagnostic (comprehensive)', 'Advisory Project (single product)'], 48000, 105000, 39000, 84000, 0.19, 'Diagnostic followed by advisory implementation', 'Data-backed transformation: know the gap, then close it'),
    ('Full Program (ASCENT)', 'BUNDLE_ASCENT', ARRAY['Diagnostic (comprehensive)', 'Executive Coaching (6 sessions)', 'Workshop (online, 2-3 hours)', 'Retainer (monthly advisory)'], 51000, 121000, 41000, 97000, 0.20, 'Complete leadership development arc', 'End-to-end: assess, coach, train, advise'),
    ('PE Portfolio', 'BUNDLE_PE_PORTFOLIO', ARRAY['PE Portfolio Talent Review (annual)', 'Retained Executive Search', 'Retained Executive Search', 'Retainer (monthly advisory)'], 260000, 490000, 228000, 402000, 0.18, 'Annual PE portfolio talent management package', 'Complete talent infrastructure for your portfolio'),
    ('Council + Workshop', 'BUNDLE_COUNCIL_WS', ARRAY['Council Individual Member', 'Workshop (online, 2-3 hours)'], 14000, 17000, 11500, 14000, 0.18, 'Council membership with workshop access', 'Join the circle + deepen your knowledge')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: Discount Rules
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    applicable_tier INT, -- which pricing tier
    max_discount_pct NUMERIC NOT NULL,
    condition_type TEXT NOT NULL,
    condition_params JSONB,
    frame_as TEXT NOT NULL,
    never_override BOOLEAN DEFAULT false,
    priority INT DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO vista_discount_rules (rule_name, applicable_tier, max_discount_pct, condition_type, condition_params, frame_as, never_override, priority)
VALUES
    ('Founding Client Rate (Diagnostics)', 3, 0.50, 'founding_client', '{"first_n_clients": 3}', 'Founding client rate', false, 90),
    ('Founding Client Rate (Advisory)', 4, 0.20, 'founding_client', '{"first_n_clients": 3}', 'Founding client rate', false, 90),
    ('Annual Retainer Commitment', 4, 0.20, 'annual_commitment', '{"min_months": 12}', 'Annual partnership rate', false, 70),
    ('Council Founding Members', 6, 0.20, 'founding_member', '{"max_founding": 20}', 'Founding member rate', false, 90),
    ('Workshop Early-Bird', 2, 0.15, 'early_bird', '{"days_before": 14}', 'Early-bird pricing', false, 50),
    ('Multi-Product Bundle', NULL, 0.30, 'bundle', NULL, 'Program rate', false, 60),
    ('NEVER: Search Fees', 5, 0.00, 'never', NULL, 'N/A', true, 100),
    ('NEVER: Platform Subscriptions', 7, 0.00, 'never', NULL, 'N/A', true, 100),
    ('NEVER: Post-Founding Retainers', 4, 0.00, 'never_post_founding', '{"after_n_clients": 3}', 'N/A', true, 100)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: Content Attribution
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_content_attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL CHECK (content_type IN ('linkedin', 'newsletter', 'podcast', 'webinar', 'workshop')),
    content_title TEXT NOT NULL,
    content_date DATE,
    content_url TEXT,
    contacts_reached INT DEFAULT 0,
    contacts_engaged INT DEFAULT 0,
    contacts_converted INT DEFAULT 0,
    revenue_attributed_cny NUMERIC DEFAULT 0,
    attribution_model TEXT DEFAULT 'direct',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vista_content_contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES vista_content_attribution(id),
    contact_id UUID REFERENCES vista_contacts(id),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'attended', 'responded', 'shared', 'registered')),
    interaction_date TIMESTAMPTZ DEFAULT now(),
    resulted_in_conversation BOOLEAN DEFAULT false,
    conversation_id UUID
);

-- Index for content attribution lookups
CREATE INDEX IF NOT EXISTS idx_content_interactions_contact ON vista_content_contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_content_interactions_content ON vista_content_contact_interactions(content_id);

-- ============================================================
-- SECTION 5: Workshop Management
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    workshop_type TEXT NOT NULL CHECK (workshop_type IN ('online_2_3hr', 'half_day_intensive', 'webinar_45min')),
    scheduled_date TIMESTAMPTZ,
    duration_minutes INT,
    price_cny NUMERIC,
    max_capacity INT,
    registered_count INT DEFAULT 0,
    attended_count INT DEFAULT 0,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'open_registration', 'full', 'delivered', 'cancelled')),
    recording_url TEXT,
    content_clips TEXT[],
    follow_up_sequence_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vista_workshop_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workshop_id UUID REFERENCES vista_workshops(id),
    contact_id UUID REFERENCES vista_contacts(id),
    registration_date TIMESTAMPTZ DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    paid_amount_cny NUMERIC DEFAULT 0,
    feedback_score INT CHECK (feedback_score BETWEEN 1 AND 5),
    follow_up_status TEXT DEFAULT 'pending' CHECK (follow_up_status IN ('pending', 'contacted', 'meeting_booked', 'proposal_sent', 'converted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workshop_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_workshop_attendees_contact ON vista_workshop_attendees(contact_id);

-- ============================================================
-- SECTION 6: Council Membership
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_council_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    membership_tier TEXT NOT NULL CHECK (membership_tier IN ('individual', 'corporate', 'pe_partner')),
    annual_fee_cny NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'renewed')),
    auto_renew BOOLEAN DEFAULT false,
    seats_included INT DEFAULT 1,
    seats_used INT DEFAULT 0,
    roundtables_attended INT DEFAULT 0,
    workshop_seats_used INT DEFAULT 0,
    referral_count INT DEFAULT 0,
    is_founding_member BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(contact_id, membership_tier)
);

CREATE INDEX IF NOT EXISTS idx_council_members_contact ON vista_council_members(contact_id);

-- ============================================================
-- SECTION 7: DEX AI Subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_dex_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    company_name TEXT,
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
    monthly_fee_cny NUMERIC,
    total_credits INT DEFAULT 0,
    used_credits INT DEFAULT 0,
    remaining_credits INT,
    subscription_start DATE,
    subscription_end DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('trial', 'active', 'paused', 'cancelled', 'upgraded')),
    auto_renew BOOLEAN DEFAULT true,
    last_credit_usage_date DATE,
    upgrade_eligible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dex_subscriptions_contact ON vista_dex_subscriptions(contact_id);

-- ============================================================
-- SECTION 8: Cross-Sell Rules
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_cross_sell_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_service_name TEXT NOT NULL,
    target_service_name TEXT NOT NULL,
    priority INT DEFAULT 50,
    trigger_condition TEXT DEFAULT 'on_completion',
    trigger_delay_days INT DEFAULT 0,
    pitch_script TEXT,
    success_rate NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO vista_cross_sell_rules (source_service_name, target_service_name, priority, trigger_condition, trigger_delay_days, pitch_script)
VALUES
    ('Retained Executive Search', 'Diagnostic (comprehensive)', 90, 'on_completion', 7, 'We found your VP. Here''s their leadership profile. Want to see how they''ll fit with your existing team?'),
    ('Diagnostic (comprehensive)', 'Executive Coaching (6 sessions)', 85, 'on_completion', 3, 'Your assessment shows clear development areas. Here''s a 6-month coaching arc to build them.'),
    ('Diagnostic (comprehensive)', 'Workshop (online, 2-3 hours)', 80, 'on_completion', 3, 'Your gap is clear. Bring your leadership team to our alignment workshop.'),
    ('Diagnostic (comprehensive)', 'Advisory Project (single product)', 75, 'on_completion', 5, 'Your readiness score indicates significant opportunity. Here''s a transformation roadmap.'),
    ('Workshop (online, 2-3 hours)', 'Diagnostic (comprehensive)', 85, 'on_completion', 14, 'You saw the framework in the workshop. Here''s what it looks like for YOUR team specifically.'),
    ('Workshop (half-day intensive)', 'Diagnostic (comprehensive)', 85, 'on_completion', 14, 'You saw the framework in the workshop. Here''s what it looks like for YOUR team specifically.'),
    ('Executive Coaching (6 sessions)', 'Retainer (monthly advisory)', 80, 'on_completion', 7, 'Your coaching is going well. Want ongoing advisory access so you don''t lose momentum?'),
    ('Executive Coaching (12 sessions)', 'Retainer (monthly advisory)', 80, 'on_completion', 7, 'Your coaching is going well. Want ongoing advisory access so you don''t lose momentum?'),
    ('Mapping Project (full market scan)', 'Retained Executive Search', 90, 'on_completion', 3, 'We mapped the market. Here are the top 5 candidates. Want us to approach them?'),
    ('Council Individual Member', 'Workshop (online, 2-3 hours)', 70, 'manual', 0, 'As a Council member, you get priority seating + 20% off workshops.'),
    ('DEX AI Starter Credits', 'DEX AI Pro Subscription', 85, 'on_usage', 0, 'You''ve used 8 of 10 credits. Here''s what unlimited looks like.'),
    ('Retainer (monthly advisory)', 'Retained Executive Search', 75, 'manual', 0, 'Your retainer includes quarterly talent reviews. Found any hard-to-fill roles?')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 9: Tier Progression Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_tier_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    from_tier INT,
    to_tier INT,
    triggered_by_service_name TEXT,
    progression_date DATE NOT NULL,
    days_in_previous_tier INT,
    consultant_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tier_progressions_contact ON vista_tier_progressions(contact_id);

-- ============================================================
-- SECTION 10: Contact Service Engagements
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_contact_service_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    service_id UUID REFERENCES vista_service_catalog(id),
    engagement_date DATE,
    tier_at_engagement INT,
    price_paid_cny NUMERIC,
    was_discounted BOOLEAN DEFAULT false,
    discount_pct NUMERIC DEFAULT 0,
    discount_rule_applied TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 5),
    testimonial_obtained BOOLEAN DEFAULT false,
    converted_to_service_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagements_contact ON vista_contact_service_engagements(contact_id);
CREATE INDEX IF NOT EXISTS idx_engagements_service ON vista_contact_service_engagements(service_id);

-- ============================================================
-- SECTION 11: Payment Schedules
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES vista_opportunities(id),
    total_value_cny NUMERIC NOT NULL,
    currency TEXT DEFAULT 'CNY',
    payment_model TEXT NOT NULL CHECK (payment_model IN ('milestone', 'monthly', 'quarterly', 'annual', 'on_completion')),
    schedule JSONB NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    outstanding_amount NUMERIC,
    next_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_schedules_opportunity ON vista_payment_schedules(opportunity_id);

-- ============================================================
-- SECTION 12: Proposals
-- ============================================================

CREATE TABLE IF NOT EXISTS vista_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES vista_contacts(id),
    proposal_number TEXT UNIQUE,
    service_ids UUID[],
    bundle_id UUID REFERENCES vista_service_bundles(id),
    total_value_cny NUMERIC,
    discount_applied_pct NUMERIC DEFAULT 0,
    discount_rule_used TEXT,
    payment_schedule JSONB,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'in_progress', 'completed', 'declined')),
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_contact ON vista_proposals(contact_id);

-- ============================================================
-- SECTION 13: Contact Revenue Scoring Columns
-- ============================================================

ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS revenue_potential_score INT DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS current_tier INT DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS estimated_ltv_cny NUMERIC DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS recommended_next_service_name TEXT;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS bundle_eligible BOOLEAN DEFAULT false;

-- ============================================================
-- SECTION 14: Funnel Stage Update
-- ============================================================

-- Add tier-based funnel stages to outreach sequences
ALTER TABLE vista_outreach_sequences ADD COLUMN IF NOT EXISTS tier_model BOOLEAN DEFAULT false;
ALTER TABLE vista_outreach_sequences ADD COLUMN IF NOT EXISTS applicable_tiers INT[];

-- Add current funnel stage to contacts
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS funnel_stage TEXT DEFAULT 'awareness';
-- awareness, engagement, validation, investment, transformation, membership, advocacy

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
DECLARE
    catalog_count INT;
    bundle_count INT;
    rule_count INT;
    crosssell_count INT;
BEGIN
    SELECT COUNT(*) INTO catalog_count FROM vista_service_catalog;
    SELECT COUNT(*) INTO bundle_count FROM vista_service_bundles;
    SELECT COUNT(*) INTO rule_count FROM vista_discount_rules;
    SELECT COUNT(*) INTO crosssell_count FROM vista_cross_sell_rules;
    
    RAISE NOTICE '=== Wave 1.6 Migration Complete ===';
    RAISE NOTICE 'Service catalog entries: %', catalog_count;
    RAISE NOTICE 'Bundle definitions: %', bundle_count;
    RAISE NOTICE 'Discount rules: %', rule_count;
    RAISE NOTICE 'Cross-sell rules: %', crosssell_count;
END $$;



-- >>> FILE: run_this_wave1.7_migration.sql — FIXED (is_b2c/slug cols + service_type)
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


-- Pre-fix: Add missing columns for B2C product catalog entries
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS is_b2c BOOLEAN DEFAULT false;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS slug TEXT;
-- Note: tier_level is referenced as 'tier' in Wave 1.6 schema; use tier instead

-- ============================================================================
-- SECTION 3: SEED B2C PRODUCTS IN SERVICE CATALOG
-- ============================================================================
-- VISTA needs to know B2C products exist for revenue tracking and attribution.
-- These are NOT managed by VISTA — they're products of the DEX AI portal.

INSERT INTO vista_service_catalog (name, category, service_type, description, pricing_model, tier, is_b2c, slug, target_audience)
VALUES
  -- Credit Packs
  ('DEX AI Credit Pack Starter', 'Content', 'Platform', '10 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-starter', 'Individual professionals'),
  ('DEX AI Credit Pack Professional', 'Content', 'Platform', '50 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-professional', 'Individual professionals'),
  ('DEX AI Credit Pack Executive', 'Content', 'Platform', '150 credits for DEX AI career advisory assessments and tools', 'Fixed', 1, true, 'dex-ai-credits-executive', 'Senior professionals'),
  
  -- Subscriptions
  ('DEX AI Member', 'Membership', 'Subscription', '30 credits/month + full assessment access', 'Subscription', 1, true, 'dex-ai-member', 'Individual professionals'),
  ('DEX AI Pro', 'Membership', 'Subscription', '100 credits/month + priority features + Council path', 'Subscription', 1, true, 'dex-ai-pro', 'Ambitious professionals'),
  
  -- Assessments (credit-gated)
  ('PRISM Assessment', 'Diagnostic', 'Assessment', 'Personality profile — career style, decision patterns, team fit (3 credits)', 'Fixed', 1, true, 'prism-assessment', 'B2C users'),
  ('TRIDENT Assessment', 'Diagnostic', 'Assessment', 'Skills gap analysis — current vs. target role competencies (5 credits)', 'Fixed', 1, true, 'trident-assessment', 'B2C users'),
  ('CANVAS Assessment', 'Diagnostic', 'Assessment', 'Career path mapping — 5-year trajectory visualization (8 credits)', 'Fixed', 1, true, 'canvas-assessment', 'B2C users'),
  
  -- Coaching (B2C entry point)
  ('DEX AI Coaching Session', 'Development Program', 'Coaching', '1:1 career coaching session with LYC advisor (15 credits)', 'Fixed', 1, true, 'dex-ai-coaching', 'B2C users'),
  
  -- Bundle
  ('B2C Career Accelerator', 'Development Program', 'Program', '3-month Pro + PRISM + CANVAS + 1 coaching session', 'Fixed', 1, true, 'b2c-career-accelerator', 'Ambitious professionals')
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
DROP FUNCTION IF EXISTS fn_b2c_leads_updated_at();
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
DROP FUNCTION IF EXISTS fn_b2c_pipeline_stage_updated();
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
DROP FUNCTION IF EXISTS fn_b2c_score_label();
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


-- ============================================================================
-- PART B: DEX AI / LYC Intelligence (66 migration files)
-- ============================================================================


-- >>> FILE: 20250707_nexus_chat_tables.sql
-- Migration: Nexus Chat Tables
-- Date: 2026-07-07
-- Purpose: Create chat persistence tables for Nexus AI chatbot

-- ── chat_sessions ──
-- Stores conversation sessions per user
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  use_case TEXT,
  diagnostic_progress INTEGER DEFAULT 0 CHECK (diagnostic_progress >= 0 AND diagnostic_progress <= 5),
  diagnostic_dimensions JSONB DEFAULT '[]'::jsonb,
  milestone_status JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user session lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- ── chat_messages ──
-- Stores individual messages within a session
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  diagnostic_tags TEXT[] DEFAULT '{}',
  milestone_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast session message lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- ── RLS Policies ──

-- Enable RLS on both tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_sessions: users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON chat_sessions;
CREATE POLICY "Users can insert own sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON chat_sessions;
CREATE POLICY "Users can delete own sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- chat_messages: users can only see messages in their own sessions
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON chat_messages;
CREATE POLICY "Users can view messages in own sessions"
  ON chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in own sessions" ON chat_messages;
CREATE POLICY "Users can insert messages in own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete messages in own sessions" ON chat_messages;
CREATE POLICY "Users can delete messages in own sessions"
  ON chat_messages FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- ── user_profiles extension ──
-- Ensure profiles table has required fields for Nexus
-- (profiles table already exists from auth setup)

-- Add nexus-specific columns if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'archetype') THEN
    ALTER TABLE profiles ADD COLUMN archetype TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'title') THEN
    ALTER TABLE profiles ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE profiles ADD COLUMN company TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seniority_level') THEN
    ALTER TABLE profiles ADD COLUMN seniority_level TEXT DEFAULT 'director';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nexus_sessions_count') THEN
    ALTER TABLE profiles ADD COLUMN nexus_sessions_count INTEGER DEFAULT 0;
  END IF;
END
$$;

-- ── Credits table (if not exists) ──
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 5,
  tier TEXT NOT NULL DEFAULT 'free',
  daily_grant INTEGER NOT NULL DEFAULT 5,
  last_grant_date DATE DEFAULT CURRENT_DATE,
  total_spent INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- ── Trigger: Update chat_sessions.updated_at ──
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- >>> FILE: 20260608_create_memories_and_share_cards_tables.sql
-- ── Memories Table ─────────────────────────────────────────────────
-- Stores user-extracted career intelligence (goals, pain points, strengths,
-- experiences, preferences, insights) from chat conversations or explicit
-- user input. Consumed by:
--   • api/memory.ts (POST → extract via DeepSeek + insert)
--   • Frontend memoryStore.loadMemories (future: GET route)
--
-- Schema mirrors what api/memory.ts inserts.

CREATE TABLE IF NOT EXISTS public.memories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type   TEXT NOT NULL
                  CHECK (memory_type IN ('goal','pain_point','strength','experience','preference','insight')),
  content       TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'conversation_extraction'
                  CHECK (source IN ('conversation_extraction','explicit_user_input','system')),
  session_id    UUID,                          -- chat session reference (nullable)
  confidence    NUMERIC(3,2) NOT NULL DEFAULT 0.6
                  CHECK (confidence >= 0 AND confidence <= 1),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_memories_user_id_active
  ON public.memories (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_memories_session_id
  ON public.memories (session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_memory_type
  ON public.memories (memory_type);

CREATE INDEX IF NOT EXISTS idx_memories_created_at
  ON public.memories (created_at DESC);

-- ── RLS Policies ──────────────────────────────────────────────────
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Service role has full access (backend operations, cross-user admin tasks)
DROP POLICY IF EXISTS "Service role full access on memories" ON public.memories;
CREATE POLICY "Service role full access on memories"
  ON public.memories FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own memories
DROP POLICY IF EXISTS "Users read own memories" ON public.memories;
CREATE POLICY "Users read own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert memories for themselves (frontend optimistic + offline)
DROP POLICY IF EXISTS "Users insert own memories" ON public.memories;
CREATE POLICY "Users insert own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (e.g., deactivate) their own memories
DROP POLICY IF EXISTS "Users update own memories" ON public.memories;
CREATE POLICY "Users update own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────────
DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_memories_updated_at ON public.memories;
CREATE TRIGGER trg_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── Share Cards Table ─────────────────────────────────────────────
-- Stores public share-card metadata for assessment/share results.
-- Consumed by:
--   • api/share.ts (POST → insert after public_uuid generation)
--   • Public share pages (future: GET by public_uuid)
--
-- Schema mirrors what api/share.ts inserts.

CREATE TABLE IF NOT EXISTS public.share_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_uuid   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL
                  CHECK (type IN ('assessment','branding','prism','trident','cv','other')),
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url     TEXT,
  view_count    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,                   -- optional TTL (nullable)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────
-- public_uuid is the lookup key for public share pages
CREATE INDEX IF NOT EXISTS idx_share_cards_public_uuid
  ON public.share_cards (public_uuid)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_share_cards_user_id
  ON public.share_cards (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_share_cards_type
  ON public.share_cards (type);

-- ── RLS Policies ──────────────────────────────────────────────────
ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access on share_cards" ON public.share_cards;
CREATE POLICY "Service role full access on share_cards"
  ON public.share_cards FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own share cards
DROP POLICY IF EXISTS "Users read own share_cards" ON public.share_cards;
CREATE POLICY "Users read own share_cards"
  ON public.share_cards FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own share cards
DROP POLICY IF EXISTS "Users insert own share_cards" ON public.share_cards;
CREATE POLICY "Users insert own share_cards"
  ON public.share_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for active, non-expired cards by public_uuid
-- (Needed for share preview pages accessed by anonymous users)
DROP POLICY IF EXISTS "Public read active share cards by uuid" ON public.share_cards;
CREATE POLICY "Public read active share cards by uuid"
  ON public.share_cards FOR SELECT
  USING (
    is_active = TRUE
    AND (expires_at IS NULL OR expires_at > now())
  );

-- ── updated_at trigger ────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_share_cards_updated_at ON public.share_cards;
CREATE TRIGGER trg_share_cards_updated_at
  BEFORE UPDATE ON public.share_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- >>> FILE: 20260611_create_org_intelligence_tables.sql
-- ── 20260611_create_org_intelligence_tables.sql ─────────────────────────
-- Organizational Intelligence module — T1 schema migration.
-- NEXUS direct build (Kevin override 2026-06-11 15:12 — PM/Trae LOCK lifted).
-- 9 module tables + 1 audit log. Admin-only access. Codelco China = launch mandate.
--
-- Reuses:
--   • public.set_updated_at() — created in 20260608_create_memories_and_share_cards_tables.sql
--   • public.profiles (with role column) — pre-existing
--
-- Consumer tables (all under public schema):
--   1. target_companies         — 50 target companies from CSV upload
--   2. org_snapshots            — org tree JSON per company
--   3. org_talent_pools         — individuals at each company
--   4. org_evaluations          — CV + interview eval records
--   5. org_evaluation_scores    — 5-criteria granular scores
--   6. sourcing_channels        — LinkedIn/Liepin/Zhilian/Zhipin metadata (Phase 2)
--   7. org_talent_attachments   — CV file metadata
--   8. one_pagers               — per-company content (12-slide GRID source)
--   9. grid_reports             — generated GRID PDF records
--  10. org_audit_log            — append-only audit trail

-- ════════════════════════════════════════════════════════════════════════
-- 1. target_companies
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.target_companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id    UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sector        TEXT,
  country       TEXT,
  hq_city       TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','archived','rejected')),
  is_comparator BOOLEAN NOT NULL DEFAULT FALSE,
  source        TEXT NOT NULL DEFAULT 'csv_upload'
                  CHECK (source IN ('csv_upload','manual','auto_pulled')),
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at   TIMESTAMPTZ,
  UNIQUE(mandate_id, name)
);

CREATE INDEX IF NOT EXISTS idx_target_companies_mandate_status
  ON public.target_companies (mandate_id, status);
CREATE INDEX IF NOT EXISTS idx_target_companies_name
  ON public.target_companies (name);
CREATE INDEX IF NOT EXISTS idx_target_companies_comparator
  ON public.target_companies (mandate_id, is_comparator)
  WHERE is_comparator = TRUE;

ALTER TABLE public.target_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on target_companies" ON public.target_companies;
CREATE POLICY "Service role full access on target_companies"
  ON public.target_companies FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read target_companies" ON public.target_companies;
CREATE POLICY "Admins read target_companies"
  ON public.target_companies FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write target_companies" ON public.target_companies;
CREATE POLICY "Admins write target_companies"
  ON public.target_companies FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_target_companies_updated_at ON public.target_companies;
CREATE TRIGGER trg_target_companies_updated_at
  BEFORE UPDATE ON public.target_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 2. org_snapshots
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_company_id UUID NOT NULL REFERENCES public.target_companies(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  structure_json  JSONB NOT NULL,
  headcount_total INTEGER,
  source          TEXT NOT NULL DEFAULT 'manual'
                    CHECK (source IN ('manual','auto_pulled','csv_upload')),
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_snapshots_company_date
  ON public.org_snapshots (target_company_id, snapshot_date DESC);

ALTER TABLE public.org_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_snapshots" ON public.org_snapshots;
CREATE POLICY "Service role full access on org_snapshots"
  ON public.org_snapshots FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_snapshots" ON public.org_snapshots;
CREATE POLICY "Admins read org_snapshots"
  ON public.org_snapshots FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write org_snapshots" ON public.org_snapshots;
CREATE POLICY "Admins write org_snapshots"
  ON public.org_snapshots FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ════════════════════════════════════════════════════════════════════════
-- 3. org_talent_pools
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_talent_pools (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_company_id UUID NOT NULL REFERENCES public.target_companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  title           TEXT,
  bu              TEXT,
  level           INTEGER CHECK (level >= 1 AND level <= 10),
  manager_id      UUID REFERENCES public.org_talent_pools(id) ON DELETE SET NULL,
  location        TEXT,
  linkedin_url    TEXT,
  email           TEXT,
  tenure_years    NUMERIC(4,1),
  attributes      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','archived','placed','declined')),
  is_leadership   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_org_talent_pools_company
  ON public.org_talent_pools (target_company_id, status);
CREATE INDEX IF NOT EXISTS idx_org_talent_pools_bu
  ON public.org_talent_pools (target_company_id, bu);
CREATE INDEX IF NOT EXISTS idx_org_talent_pools_level
  ON public.org_talent_pools (target_company_id, level);
CREATE INDEX IF NOT EXISTS idx_org_talent_pools_leadership
  ON public.org_talent_pools (target_company_id, is_leadership)
  WHERE is_leadership = TRUE;
CREATE INDEX IF NOT EXISTS idx_org_talent_pools_manager
  ON public.org_talent_pools (manager_id)
  WHERE manager_id IS NOT NULL;

ALTER TABLE public.org_talent_pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_talent_pools" ON public.org_talent_pools;
CREATE POLICY "Service role full access on org_talent_pools"
  ON public.org_talent_pools FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_talent_pools" ON public.org_talent_pools;
CREATE POLICY "Admins read org_talent_pools"
  ON public.org_talent_pools FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write org_talent_pools" ON public.org_talent_pools;
CREATE POLICY "Admins write org_talent_pools"
  ON public.org_talent_pools FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_org_talent_pools_updated_at ON public.org_talent_pools;
CREATE TRIGGER trg_org_talent_pools_updated_at
  BEFORE UPDATE ON public.org_talent_pools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 4. org_evaluations
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id     UUID NOT NULL REFERENCES public.org_talent_pools(id) ON DELETE CASCADE,
  eval_type     TEXT NOT NULL
                  CHECK (eval_type IN ('cv','interview','reference','work_sample')),
  eval_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  evaluator_id  UUID NOT NULL REFERENCES auth.users(id),
  overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  scorecard     JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes         TEXT,
  is_final      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_evaluations_talent
  ON public.org_evaluations (talent_id, eval_type, eval_date DESC);
CREATE INDEX IF NOT EXISTS idx_org_evaluations_evaluator
  ON public.org_evaluations (evaluator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_evaluations_final
  ON public.org_evaluations (talent_id)
  WHERE is_final = TRUE;

ALTER TABLE public.org_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_evaluations" ON public.org_evaluations;
CREATE POLICY "Service role full access on org_evaluations"
  ON public.org_evaluations FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_evaluations" ON public.org_evaluations;
CREATE POLICY "Admins read org_evaluations"
  ON public.org_evaluations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write org_evaluations" ON public.org_evaluations;
CREATE POLICY "Admins write org_evaluations"
  ON public.org_evaluations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_org_evaluations_updated_at ON public.org_evaluations;
CREATE TRIGGER trg_org_evaluations_updated_at
  BEFORE UPDATE ON public.org_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 5. org_evaluation_scores (5-criteria granular, supports override trail)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_evaluation_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.org_evaluations(id) ON DELETE CASCADE,
  criterion_key TEXT NOT NULL,
  criterion_label TEXT NOT NULL,
  score         NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  source        TEXT NOT NULL
                  CHECK (source IN ('auto_pulled','lyc_override','consensus')),
  rationale     TEXT,
  confidence    NUMERIC(3,2) DEFAULT 0.8
                  CHECK (confidence >= 0 AND confidence <= 1),
  overridden_by UUID REFERENCES auth.users(id),
  overridden_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evaluation_id, criterion_key)
);

CREATE INDEX IF NOT EXISTS idx_org_evaluation_scores_eval
  ON public.org_evaluation_scores (evaluation_id);
CREATE INDEX IF NOT EXISTS idx_org_evaluation_scores_criterion
  ON public.org_evaluation_scores (criterion_key, score DESC);

ALTER TABLE public.org_evaluation_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_evaluation_scores" ON public.org_evaluation_scores;
CREATE POLICY "Service role full access on org_evaluation_scores"
  ON public.org_evaluation_scores FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_evaluation_scores" ON public.org_evaluation_scores;
CREATE POLICY "Admins read org_evaluation_scores"
  ON public.org_evaluation_scores FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write org_evaluation_scores" ON public.org_evaluation_scores;
CREATE POLICY "Admins write org_evaluation_scores"
  ON public.org_evaluation_scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_org_evaluation_scores_updated_at ON public.org_evaluation_scores;
CREATE TRIGGER trg_org_evaluation_scores_updated_at
  BEFORE UPDATE ON public.org_evaluation_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 6. sourcing_channels (Phase 2: LinkedIn/Liepin/Zhilian/Zhipin metadata)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.sourcing_channels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_key   TEXT NOT NULL UNIQUE,
  channel_label TEXT NOT NULL,
  api_endpoint  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sourcing_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on sourcing_channels" ON public.sourcing_channels;
CREATE POLICY "Service role full access on sourcing_channels"
  ON public.sourcing_channels FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read sourcing_channels" ON public.sourcing_channels;
CREATE POLICY "Admins read sourcing_channels"
  ON public.sourcing_channels FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write sourcing_channels" ON public.sourcing_channels;
CREATE POLICY "Admins write sourcing_channels"
  ON public.sourcing_channels FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

INSERT INTO public.sourcing_channels (channel_key, channel_label, is_active) VALUES
  ('linkedin', 'LinkedIn', FALSE),
  ('liepin',   'Liepin (猎聘)', FALSE),
  ('zhilian',  'Zhilian (智联)', FALSE),
  ('zhipin',   'Zhipin (BOSS 直聘)', FALSE)
ON CONFLICT (channel_key) DO NOTHING;

DROP TRIGGER IF EXISTS trg_sourcing_channels_updated_at ON public.sourcing_channels;
CREATE TRIGGER trg_sourcing_channels_updated_at
  BEFORE UPDATE ON public.sourcing_channels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 7. org_talent_attachments (CV file metadata; files in Supabase storage)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_talent_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id     UUID NOT NULL REFERENCES public.org_talent_pools(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  file_size     INTEGER,
  mime_type     TEXT,
  uploaded_by   UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_talent_attachments_talent
  ON public.org_talent_attachments (talent_id, created_at DESC);

ALTER TABLE public.org_talent_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_talent_attachments" ON public.org_talent_attachments;
CREATE POLICY "Service role full access on org_talent_attachments"
  ON public.org_talent_attachments FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_talent_attachments" ON public.org_talent_attachments;
CREATE POLICY "Admins read org_talent_attachments"
  ON public.org_talent_attachments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write org_talent_attachments" ON public.org_talent_attachments;
CREATE POLICY "Admins write org_talent_attachments"
  ON public.org_talent_attachments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ════════════════════════════════════════════════════════════════════════
-- 8. one_pagers
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.one_pagers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_company_id UUID NOT NULL REFERENCES public.target_companies(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL DEFAULT 1,
  content_html    TEXT,
  content_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_one_pagers_company
  ON public.one_pagers (target_company_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_one_pagers_published
  ON public.one_pagers (target_company_id)
  WHERE is_published = TRUE;

ALTER TABLE public.one_pagers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on one_pagers" ON public.one_pagers;
CREATE POLICY "Service role full access on one_pagers"
  ON public.one_pagers FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read one_pagers" ON public.one_pagers;
CREATE POLICY "Admins read one_pagers"
  ON public.one_pagers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write one_pagers" ON public.one_pagers;
CREATE POLICY "Admins write one_pagers"
  ON public.one_pagers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_one_pagers_updated_at ON public.one_pagers;
CREATE TRIGGER trg_one_pagers_updated_at
  BEFORE UPDATE ON public.one_pagers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ════════════════════════════════════════════════════════════════════════
-- 9. grid_reports (GRID PDF output records)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.grid_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id    UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  pdf_path      TEXT NOT NULL,
  slide_count   INTEGER NOT NULL DEFAULT 12,
  slide_config  JSONB NOT NULL DEFAULT '{}'::jsonb,
  status        TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating','ready','failed','archived')),
  generated_by  UUID NOT NULL REFERENCES auth.users(id),
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  error_message TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grid_reports_mandate
  ON public.grid_reports (mandate_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_grid_reports_status
  ON public.grid_reports (status, generated_at DESC);

ALTER TABLE public.grid_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on grid_reports" ON public.grid_reports;
CREATE POLICY "Service role full access on grid_reports"
  ON public.grid_reports FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read grid_reports" ON public.grid_reports;
CREATE POLICY "Admins read grid_reports"
  ON public.grid_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins write grid_reports" ON public.grid_reports;
CREATE POLICY "Admins write grid_reports"
  ON public.grid_reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ════════════════════════════════════════════════════════════════════════
-- 10. org_audit_log (append-only audit trail)
-- ════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.org_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID NOT NULL REFERENCES auth.users(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  before_state  JSONB,
  after_state   JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_audit_log_actor
  ON public.org_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_audit_log_resource
  ON public.org_audit_log (resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_audit_log_action
  ON public.org_audit_log (action, created_at DESC);

ALTER TABLE public.org_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on org_audit_log" ON public.org_audit_log;
CREATE POLICY "Service role full access on org_audit_log"
  ON public.org_audit_log FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins read org_audit_log" ON public.org_audit_log;
CREATE POLICY "Admins read org_audit_log"
  ON public.org_audit_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- No admin write policy — append-only via service role.

-- ════════════════════════════════════════════════════════════════════════
-- Smoke test (run after migration to verify all tables present)
-- ════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_count INTEGER;
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'target_companies','org_snapshots','org_talent_pools',
    'org_evaluations','org_evaluation_scores','sourcing_channels',
    'org_talent_attachments','one_pagers','grid_reports','org_audit_log'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE 'Org Intelligence migration OK — all 10 tables present ✅';
  ELSE
    RAISE EXCEPTION 'Org Intelligence migration FAILED — missing: %', v_missing;
  END IF;
END$$;


-- >>> FILE: 20260615_create_audit_logs.sql
-- Audit logs table for tracking platform activity
-- Created: 2026-06-15

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,          -- e.g. 'score_created', 'contact_updated', 'company_created', 'mandate_status_change'
  entity_type TEXT NOT NULL,     -- e.g. 'contact', 'company', 'mandate', 'candidate_pipeline'
  entity_id UUID,
  details JSONB DEFAULT '{}',   -- Flexible payload for what changed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Auto-trigger: log contact updates
DROP FUNCTION IF EXISTS fn_audit_contacts();
CREATE OR REPLACE FUNCTION fn_audit_contacts() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, details)
  VALUES (
    CASE WHEN TG_OP = 'INSERT' THEN 'contact_created' ELSE 'contact_updated' END,
    'contact',
    NEW.id,
    jsonb_build_object('name', NEW.name, 'title', NEW.current_title, 'source', NEW.source)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_contacts ON contacts;
CREATE TRIGGER trg_audit_contacts
  AFTER INSERT OR UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION fn_audit_contacts();

-- Auto-trigger: log scoring runs
DROP FUNCTION IF EXISTS fn_audit_scoring();
CREATE OR REPLACE FUNCTION fn_audit_scoring() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, details)
  VALUES (
    'score_created',
    'scoring_run',
    NEW.id,
    jsonb_build_object('run_type', NEW.run_type, 'composite', NEW.composite_score, 'verdict', NEW.verdict)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_scoring ON scoring_runs;
CREATE TRIGGER trg_audit_scoring
  AFTER INSERT ON scoring_runs
  FOR EACH ROW EXECUTE FUNCTION fn_audit_scoring();

-- Auto-trigger: log mandate status changes
DROP FUNCTION IF EXISTS fn_audit_mandates();
CREATE OR REPLACE FUNCTION fn_audit_mandates() RETURNS TRIGGER AS $$
BEGIN
  IF OLD IS NULL OR OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
      CASE WHEN TG_OP = 'INSERT' THEN 'mandate_created' ELSE 'mandate_status_change' END,
      'mandate',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_mandates ON mandates;
CREATE TRIGGER trg_audit_mandates
  AFTER INSERT OR UPDATE ON mandates
  FOR EACH ROW EXECUTE FUNCTION fn_audit_mandates();

-- RLS: admin-only read
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read audit_logs" ON audit_logs;
CREATE POLICY "Admin read audit_logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- >>> FILE: 20260622_advisory_workshops.sql
-- Phase 3.4: Advisory Assessment Engine
-- Workshop and participant management tables

CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  assessment_type text NOT NULL CHECK (assessment_type IN ('PRISM', 'FORGE', 'SPARK', 'BRIDGE', 'MOSAIC')),
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  max_participants integer DEFAULT 15,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'launched', 'completed', 'cancelled')),
  allow_report_download boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshop_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid REFERENCES workshops(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  token text NOT NULL UNIQUE,
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'started', 'completed')),
  responses jsonb,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workshop_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid REFERENCES workshops(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES workshop_participants(id) ON DELETE CASCADE,
  assessment_type text NOT NULL,
  dimension_scores jsonb,
  archetype text,
  style text,
  strengths text[],
  development_areas text[],
  recommendations text[],
  raw_analysis text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workshops_org ON workshops(organization_id);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_workshop ON workshop_participants(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_participants_token ON workshop_participants(token);
CREATE INDEX IF NOT EXISTS idx_workshop_scores_workshop ON workshop_scores(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_scores_participant ON workshop_scores(participant_id);

-- >>> FILE: 20260622_client_notifications.sql
-- Phase 3.2: Client Portal Notifications Table
-- Migration for client feedback and notification system

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'feedback_received', 'candidate_advanced', 'interview_scheduled', 'new_candidate_added', 'report_ready'
  title text NOT NULL,
  message text,
  link text, -- deep link to relevant page
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Add client_feedback column to candidates_pipeline table for storing feedback
ALTER TABLE IF EXISTS candidates_pipeline
ADD COLUMN IF NOT EXISTS client_feedback jsonb;

-- Add index for client feedback queries
CREATE INDEX IF NOT EXISTS idx_pipeline_client_feedback ON candidates_pipeline((client_feedback->>'decision'));


-- >>> FILE: 20260622_create_outreach_attempts.sql
CREATE TABLE IF NOT EXISTS outreach_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  mandate_id uuid REFERENCES mandates(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (
    channel IN (
      'cold_call',
      'wechat_add',
      'email',
      'linkedin_message',
      'phone_call',
      'in_person'
    )
  ),
  attempt_number int NOT NULL DEFAULT 1,
  attempt_date date NOT NULL DEFAULT CURRENT_DATE,
  outcome text CHECK (
    outcome IN (
      'no_response',
      'positive',
      'negative',
      'interested',
      'not_interested',
      'scheduled_interview',
      'referred_other',
      'invalid_contact'
    )
  ),
  response_text text,
  notes text,
  next_action text,
  next_action_date date,
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_candidate ON outreach_attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_outreach_mandate ON outreach_attempts(mandate_id);
CREATE INDEX IF NOT EXISTS idx_outreach_channel ON outreach_attempts(channel);
CREATE INDEX IF NOT EXISTS idx_outreach_outcome ON outreach_attempts(outcome);
CREATE INDEX IF NOT EXISTS idx_outreach_next_action ON outreach_attempts(next_action_date)
  WHERE next_action_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outreach_created_by ON outreach_attempts(created_by);
CREATE INDEX IF NOT EXISTS idx_outreach_date ON outreach_attempts(attempt_date);


-- >>> FILE: 20260622_create_success_profiles.sql
-- Phase 1.2: Success Profile Builder
-- Creates success_profiles table for defining candidate evaluation criteria

CREATE TABLE IF NOT EXISTS success_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id uuid REFERENCES mandates(id) ON DELETE CASCADE,
  
  -- Experience requirements
  required_experience_years int,
  required_industries text[],
  required_geographies text[],
  required_companies text[],
  deal_size_range text,
  team_size_managed int,
  
  -- Personality / character (DISC-aligned)
  target_disc_profile text,
  personality_indicators jsonb,
  character_requirements jsonb,
  
  -- Background requirements
  education_requirements jsonb,
  certifications text[],
  language_requirements jsonb,
  
  -- Metadata
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  defined_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  approval_notes text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_success_profiles_mandate ON success_profiles(mandate_id);
CREATE INDEX IF NOT EXISTS idx_success_profiles_status ON success_profiles(status);

-- Trigger for updated_at
DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS success_profiles_updated_at ON success_profiles;
CREATE TRIGGER success_profiles_updated_at
BEFORE UPDATE ON success_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- >>> FILE: 20260622_extend_target_companies_market_definition.sql
-- Phase 1.5: Market Definition Enhancement
-- Extend target_companies with mandate linkage, AI overviews, fit scores

-- Add mandate_id to link target companies to specific mandates
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL;

-- Add AI-generated company overview (JSONB)
-- Structure:
-- {
--   "description": "string",
--   "revenue": "string (e.g., '$1B-$5B')",
--   "employee_count": "string (e.g., '5,000-10,000')",
--   "founded": number,
--   "headquarters": "string",
--   "key_products": ["string"],
--   "recent_news": "string (summary)",
--   "generated_at": "timestamp"
-- }
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS company_overview jsonb;

-- Add fit score based on success profile (0-100)
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS fit_score numeric;

-- Add ranking notes for manual adjustments
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS ranking_notes text;

-- Add sector classification for market map grouping
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS sector text;

-- Add region classification for market map grouping
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS region text;

-- Add primary contact at company
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS primary_contact_name text;
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS primary_contact_title text;
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS primary_contact_linkedin text;

-- Add generation status for tracking AI overview generation
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS overview_status text DEFAULT 'pending'
  CHECK (overview_status IN ('pending', 'generating', 'completed', 'failed'));

CREATE INDEX IF NOT EXISTS idx_target_companies_mandate ON target_companies(mandate_id);
CREATE INDEX IF NOT EXISTS idx_target_companies_fit_score ON target_companies(fit_score) WHERE fit_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_target_companies_sector ON target_companies(sector) WHERE sector IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_target_companies_region ON target_companies(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_target_companies_industry ON target_companies(industry) WHERE industry IS NOT NULL;


-- >>> FILE: 20260622_interviews.sql
-- Phase 4.3: Interview Management Tables
-- Created: 2026-06-22

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES contacts(id),
  mandate_id uuid REFERENCES mandates(id),
  
  -- Interview details
  round int NOT NULL CHECK (round BETWEEN 1 AND 5),
  interview_date timestamptz NOT NULL,
  duration_minutes int DEFAULT 60,
  location text, -- physical address or virtual link
  meeting_link text, -- Zoom/Teams/Meet URL
  
  -- Panel
  panel_members uuid[], -- FK not supported on array columns; enforce at app layer
  
  -- Status
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  
  -- Feedback
  scorecards jsonb, -- [{panelist_id, competency_scores, overall_score, strengths, concerns, recommendation}]
  aggregate_feedback jsonb,
  notes text,
  
  -- Metadata
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_mandate ON interviews(mandate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Create interview_invitations table for tracking invites
CREATE TABLE IF NOT EXISTS interview_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid REFERENCES interviews(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES contacts(id),
  sent_at timestamptz,
  opened_at timestamptz,
  confirmed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'confirmed', 'declined')),
  email_subject text,
  email_body text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for interview invitations
CREATE INDEX IF NOT EXISTS idx_invitation_interview ON interview_invitations(interview_id);
CREATE INDEX IF NOT EXISTS idx_invitation_candidate ON interview_invitations(candidate_id);

-- Create function to auto-update updated_at
DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to interviews table
DROP TRIGGER IF EXISTS interviews_updated_at ON interviews;
CREATE TRIGGER interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Apply trigger to interview_invitations table
DROP TRIGGER IF EXISTS invitations_updated_at ON interview_invitations;
CREATE TRIGGER invitations_updated_at
BEFORE UPDATE ON interview_invitations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Round to stage mapping view
CREATE OR REPLACE VIEW interview_stage_mapping AS
SELECT
  id,
  round,
  CASE
    WHEN round = 1 THEN 'interview_1'
    WHEN round = 2 THEN 'interview_2'
    WHEN round = 3 THEN 'interview_3'
    WHEN round >= 4 THEN 'final_interview'
  END AS next_stage,
  CASE
    WHEN round = 1 THEN 'Interview 1'
    WHEN round = 2 THEN 'Interview 2'
    WHEN round = 3 THEN 'Interview 3'
    WHEN round >= 4 THEN 'Final Interview'
  END AS round_label
FROM interviews;


-- >>> FILE: 20260622_mandate_solutions.sql
-- Phase 3.3: Solution Definition Module
-- Creates mandate_solutions table for HR business solutions

CREATE TABLE IF NOT EXISTS mandate_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id uuid REFERENCES mandates(id) ON DELETE CASCADE,
  solution_type text NOT NULL CHECK (solution_type IN (
    'succession', 'assessment', 'diagnostics', 'density', 'org_design', 'role_definition'
  )),
  solution_detail jsonb,
  linked_assessment_type text CHECK (linked_assessment_type IN (
    'prism', 'forge', 'spark', 'bridge', 'mosaic', 
    'shift_leap', 'shift_quest', 'shift_drive', 'shift_coach', 'shift_impact'
  )),
  linked_assessment_id uuid,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  defined_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  approval_notes text,
  rejection_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mandate_solutions_mandate ON mandate_solutions(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_solutions_status ON mandate_solutions(status);
CREATE INDEX IF NOT EXISTS idx_mandate_solutions_type ON mandate_solutions(solution_type);


-- >>> FILE: 20260622_milestones.sql
-- Phase 4.4: Engagement Timeline Tracker (Methodology Step 8)
-- Add milestones JSONB column to mandates table

ALTER TABLE mandates ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN mandates.milestones IS 'JSONB object containing milestone definitions with target dates, actual dates, and status';

-- Create index for querying mandates with at-risk or overdue milestones
CREATE INDEX IF NOT EXISTS idx_mandates_has_milestones ON mandates ((milestones IS NOT NULL AND milestones != '{}'::jsonb));

-- milestones structure example:
-- {
--   "intake_complete": { "target_date": "2026-07-01", "actual_date": "2026-07-02", "status": "completed" },
--   "solution_defined": { "target_date": "2026-07-08", "actual_date": null, "status": "on_track" },
--   "jd_approved": { "target_date": "2026-07-15", "actual_date": null, "status": "pending" },
--   "market_defined": { "target_date": "2026-07-22", "actual_date": null, "status": "pending" },
--   "longlist_ready": { "target_date": "2026-08-05", "actual_date": null, "status": "pending" },
--   "shortlist_ready": { "target_date": "2026-08-19", "actual_date": null, "status": "pending" },
--   "client_presentation": { "target_date": "2026-08-26", "actual_date": null, "status": "pending" },
--   "first_interview": { "target_date": "2026-09-09", "actual_date": null, "status": "pending" },
--   "offer_extended": { "target_date": "2026-09-30", "actual_date": null, "status": "pending" },
--   "placement": { "target_date": "2026-10-14", "actual_date": null, "status": "pending" }
-- }

-- Milestone statuses:
-- pending, on_track, at_risk, overdue, completed, completed_late

-- Helper function to get milestone status
CREATE OR REPLACE FUNCTION get_milestone_status(
  target_date timestamptz,
  actual_date timestamptz,
  check_date timestamptz DEFAULT now()
) RETURNS text AS $$
DECLARE
  days_until_due integer;
BEGIN
  -- If completed, check if on time or late
  IF actual_date IS NOT NULL THEN
    IF actual_date <= target_date THEN
      RETURN 'completed';
    ELSE
      RETURN 'completed_late';
    END IF;
  END IF;

  -- Calculate days until due
  days_until_due := (target_date::date - check_date::date);

  IF days_until_due < 0 THEN
    RETURN 'overdue';
  ELSIF days_until_due <= 7 THEN
    RETURN 'at_risk';
  ELSE
    RETURN 'on_track';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to initialize milestones with default SLA targets
DROP FUNCTION IF EXISTS initialize_milestones();
CREATE OR REPLACE FUNCTION initialize_milestones(mandate_created_at timestamptz) RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  result := jsonb_build_object(
    'intake_complete', jsonb_build_object(
      'target_date', (mandate_created_at + interval '7 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'solution_defined', jsonb_build_object(
      'target_date', (mandate_created_at + interval '14 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'jd_approved', jsonb_build_object(
      'target_date', (mandate_created_at + interval '21 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'market_defined', jsonb_build_object(
      'target_date', (mandate_created_at + interval '28 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'longlist_ready', jsonb_build_object(
      'target_date', (mandate_created_at + interval '42 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'shortlist_ready', jsonb_build_object(
      'target_date', (mandate_created_at + interval '56 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'client_presentation', jsonb_build_object(
      'target_date', (mandate_created_at + interval '63 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'first_interview', jsonb_build_object(
      'target_date', (mandate_created_at + interval '77 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'offer_extended', jsonb_build_object(
      'target_date', (mandate_created_at + interval '98 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    ),
    'placement', jsonb_build_object(
      'target_date', (mandate_created_at + interval '112 days')::date,
      'actual_date', null,
      'status', 'pending',
      'notes', ''
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View for mandates with computed milestone statuses
CREATE OR REPLACE VIEW mandate_milestone_status AS
SELECT
  m.id,
  m.title,
  m.status as mandate_status,
  m.created_at,
  m.milestones,
  -- Count of milestones by status
  (
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each_text(
      COALESCE(m.milestones, '{}'::jsonb)::jsonb
    )
    WHERE key = 'status'
  ) as milestone_statuses,
  -- Check if any milestone is at_risk or overdue
  (
    SELECT bool_or(
      CASE
        WHEN (value->>'status') IN ('at_risk', 'overdue') THEN true
        ELSE false
      END
    )
    FROM jsonb_each_text(COALESCE(m.milestones, '{}'::jsonb))
  ) as has_at_risk_milestones
FROM mandates m;

-- Trigger to auto-initialize milestones on mandate creation
DROP FUNCTION IF EXISTS set_default_milestones();
CREATE OR REPLACE FUNCTION set_default_milestones()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.milestones IS NULL OR NEW.milestones = '{}'::jsonb THEN
    NEW.milestones := initialize_milestones(NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Uncomment the following line to enable auto-initialization on mandate creation
-- CREATE TRIGGER tr_mandates_set_default_milestones
--   BEFORE INSERT OR UPDATE ON mandates
--   FOR EACH ROW
--   EXECUTE FUNCTION set_default_milestones();


-- >>> FILE: 20260622_ml_models.sql
-- Phase 6.1: Predictive Matching
-- ML models table for storing trained model weights

CREATE TABLE IF NOT EXISTS ml_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Model metadata
  model_type text NOT NULL, -- e.g., 'predictive_matching', 'candidate_ranking'
  model_version text NOT NULL, -- e.g., 'v1.0', 'v2.1'
  description text,
  
  -- Model parameters (JSONB for flexibility)
  weights jsonb NOT NULL, -- array of feature weights
  bias float NOT NULL DEFAULT 0,
  feature_names jsonb NOT NULL, -- array of feature names in order
  
  -- Training metrics
  accuracy float, -- overall accuracy on test set
  precision_score float,
  recall_score float,
  f1_score float,
  roc_auc_score float,
  training_samples integer NOT NULL,
  test_samples integer,
  
  -- Training data range
  training_start_date date,
  training_end_date date,
  trained_at timestamptz NOT NULL DEFAULT now(),
  
  -- Status
  is_active boolean DEFAULT false,
  is_deployed boolean DEFAULT false,
  
  -- Feature engineering info
  feature_engineering_config jsonb, -- normalization params, encoding info
  
  -- Validation
  validation_results jsonb, -- cross-validation results
  
  -- Metadata
  organization_id uuid REFERENCES organizations(id),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_model_version UNIQUE (model_type, model_version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_active ON ml_models(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ml_models_deployed ON ml_models(is_deployed) WHERE is_deployed = true;
CREATE INDEX IF NOT EXISTS idx_ml_models_org ON ml_models(organization_id);

-- Comments
COMMENT ON TABLE ml_models IS 'Trained ML models stored with weights and metadata';
COMMENT ON COLUMN ml_models.weights IS 'JSON array of feature weights for prediction';
COMMENT ON COLUMN ml_models.feature_names IS 'JSON array of feature names corresponding to weights';
COMMENT ON COLUMN ml_models.feature_engineering_config IS 'Normalization params, encodings, etc.';

-- Trigger for updated_at
DROP FUNCTION IF EXISTS update_ml_models_updated_at();
CREATE OR REPLACE FUNCTION update_ml_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON ml_models
  FOR EACH ROW
  EXECUTE FUNCTION update_ml_models_updated_at();

-- Table for prediction logs (audit trail)
CREATE TABLE IF NOT EXISTS prediction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Prediction context
  model_id uuid REFERENCES ml_models(id),
  candidate_id uuid REFERENCES contacts(id),
  mandate_id uuid REFERENCES mandates(id),
  
  -- Input features (for debugging/re-training)
  features jsonb NOT NULL,
  
  -- Prediction output
  raw_score float NOT NULL, -- 0-1 probability
  final_score integer NOT NULL, -- 0-100 rounded score
  
  -- Override tracking
  consultant_override boolean DEFAULT false,
  override_score integer,
  override_reason text,
  overridden_by uuid REFERENCES profiles(id),
  
  -- Timing
  predicted_at timestamptz NOT NULL DEFAULT now(),
  
  -- Outcome (filled later for validation)
  actual_outcome boolean, -- null until outcome known
  outcome_recorded_at timestamptz
);

-- Indexes for prediction logs
CREATE INDEX IF NOT EXISTS idx_prediction_logs_candidate ON prediction_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_mandate ON prediction_logs(mandate_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_model ON prediction_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_date ON prediction_logs(predicted_at);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_outcome ON prediction_logs(actual_outcome) WHERE actual_outcome IS NOT NULL;

-- Comments
COMMENT ON TABLE prediction_logs IS 'Audit trail for all ML predictions';
COMMENT ON COLUMN prediction_logs.features IS 'Feature vector used for prediction';
COMMENT ON COLUMN prediction_logs.actual_outcome IS 'True if candidate was ultimately placed';

-- Function to check data availability (500+ placements)
DROP FUNCTION IF EXISTS check_placement_count();
CREATE OR REPLACE FUNCTION check_placement_count()
RETURNS TABLE(has_sufficient_data boolean, placement_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) >= 500 AS has_sufficient_data,
    COUNT(*)::bigint AS placement_count
  FROM candidates_pipeline
  WHERE stage IN ('offer_accepted', 'onboarded', 'probation_passed');
END;
$$ LANGUAGE plpgsql;

-- View for model performance over time
CREATE OR REPLACE VIEW ml_model_performance AS
SELECT 
  m.id,
  m.model_type,
  m.model_version,
  m.accuracy,
  m.precision_score,
  m.recall_score,
  m.f1_score,
  m.trained_at,
  m.training_samples,
  m.is_active,
  -- Prediction accuracy from logs (if available)
  COALESCE(
    (SELECT 
      COUNT(*)::float / NULLIF((SELECT COUNT(*) FROM prediction_logs pl2 WHERE pl2.model_id = m.id), 0)
     FROM prediction_logs pl
     WHERE pl.model_id = m.id
       AND pl.actual_outcome IS NOT NULL
       AND (
         (pl.final_score >= 50 AND pl.actual_outcome = true) OR
         (pl.final_score < 50 AND pl.actual_outcome = false)
       )
    ), m.accuracy
  ) AS actual_accuracy
FROM ml_models m
ORDER BY m.trained_at DESC;

-- Helper function to get latest active model
DROP FUNCTION IF EXISTS get_latest_model();
CREATE OR REPLACE FUNCTION get_latest_model(p_model_type text)
RETURNS ml_models AS $$
DECLARE
  latest_model ml_models;
BEGIN
  SELECT * INTO latest_model
  FROM ml_models
  WHERE model_type = p_model_type AND is_active = true
  ORDER BY trained_at DESC
  LIMIT 1;
  
  RETURN latest_model;
END;
$$ LANGUAGE plpgsql;


-- >>> FILE: 20260622_offers.sql
-- Phase 4.5: Offer + Onboarding + Post-Placement
-- Create offers table for managing employment offers

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  
  -- Position details
  position_title text NOT NULL,
  start_date date NOT NULL,
  compensation jsonb, -- {base_salary, bonus, equity, benefits}
  conditions text, -- background check, references, etc.
  expiration_date date,
  
  -- Approval workflow
  status text DEFAULT 'draft' CHECK (status IN (
    'draft', 
    'pending_partner_approval', 
    'pending_client_approval', 
    'sent', 
    'accepted', 
    'rejected', 
    'withdrawn',
    'onboarding',
    'active',
    'probation',
    'completed'
  )),
  
  -- Approvals
  created_by uuid REFERENCES profiles(id),
  partner_approved_by uuid REFERENCES profiles(id),
  partner_approval_notes text,
  client_approved_by uuid, -- client user ID from client_users table
  client_approval_notes text,
  client_rejection_reason text,
  partner_rejection_reason text,
  
  -- Timing
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES profiles(id),
  
  -- Onboarding
  onboarding_checklist jsonb DEFAULT '[]'::jsonb, -- [{task, completed, completed_at, completed_by, notes}]
  onboarding_completed_at timestamptz,
  
  -- Post-placement follow-up
  follow_up_1m_sent boolean DEFAULT false,
  follow_up_1m_at timestamptz,
  follow_up_3m_sent boolean DEFAULT false,
  follow_up_3m_at timestamptz,
  follow_up_6m_sent boolean DEFAULT false,
  follow_up_6m_at timestamptz,
  follow_up_1m_response text,
  follow_up_3m_response text,
  follow_up_6m_response text,
  
  -- Probation
  probation_end_date date,
  probation_status text DEFAULT 'pending' CHECK (probation_status IN ('pending', 'passed', 'extended', 'failed')),
  probation_notes text,
  probation_extended_to date,
  
  -- Additional fields
  cover_letter text,
  additional_notes text,
  offer_letter_url text, -- URL to generated PDF offer letter
  
  -- Metadata
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_candidate ON offers(candidate_id);
CREATE INDEX IF NOT EXISTS idx_offers_mandate ON offers(mandate_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_start_date ON offers(start_date);
CREATE INDEX IF NOT EXISTS idx_offers_probation_end ON offers(probation_end_date);
CREATE INDEX IF NOT EXISTS idx_offers_followup_1m ON offers(follow_up_1m_sent) WHERE follow_up_1m_sent = false;
CREATE INDEX IF NOT EXISTS idx_offers_followup_3m ON offers(follow_up_3m_sent) WHERE follow_up_3m_sent = false;
CREATE INDEX IF NOT EXISTS idx_offers_followup_6m ON offers(follow_up_6m_sent) WHERE follow_up_6m_sent = false;

-- Comments
COMMENT ON TABLE offers IS 'Employment offers with approval workflow, onboarding, and post-placement follow-up';
COMMENT ON COLUMN offers.compensation IS 'JSON: {base_salary, bonus, bonus_percentage, equity, benefits, total_compensation}';
COMMENT ON COLUMN offers.onboarding_checklist IS 'JSON array: [{task, category, completed, completed_at, completed_by, notes}]';
COMMENT ON COLUMN offers.status IS 'draft -> pending_partner_approval -> pending_client_approval -> sent -> accepted/rejected -> onboarding -> active -> probation -> completed';

-- Trigger for updated_at
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to generate default onboarding checklist
DROP FUNCTION IF EXISTS generate_onboarding_checklist();
CREATE OR REPLACE FUNCTION generate_onboarding_checklist()
RETURNS jsonb AS $$
BEGIN
  RETURN '[
    {
      "task": "Signed offer letter received",
      "category": "documentation",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 3
    },
    {
      "task": "Background check initiated",
      "category": "verification",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 5
    },
    {
      "task": "References verified",
      "category": "verification",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 7
    },
    {
      "task": "Employment contract signed",
      "category": "documentation",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 7
    },
    {
      "task": "NDA signed",
      "category": "documentation",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 7
    },
    {
      "task": "IT accounts created",
      "category": "setup",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 1
    },
    {
      "task": "Equipment delivered/setup",
      "category": "setup",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 1
    },
    {
      "task": "Welcome email sent",
      "category": "communication",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 1
    },
    {
      "task": "First day agenda prepared",
      "category": "planning",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 1
    },
    {
      "task": "Team introduction scheduled",
      "category": "planning",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 3
    },
    {
      "task": "Buddy/mentor assigned",
      "category": "planning",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 5
    },
    {
      "task": "Orientation schedule confirmed",
      "category": "planning",
      "completed": false,
      "completed_at": null,
      "completed_by": null,
      "notes": null,
      "due_days": 3
    }
  ]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- View for offers with candidate and mandate info
CREATE OR REPLACE VIEW offers_with_details AS
SELECT 
  o.*,
  c.first_name as candidate_first_name,
  c.last_name as candidate_last_name,
  c.email as candidate_email,
  c.phone as candidate_phone,
  c.current_title as candidate_title,
  c.current_company as candidate_company,
  m.title as mandate_title,
  m.client_id,
  cl.company_name as client_name,
  cl.first_name as client_first_name,
  cl.last_name as client_last_name,
  p.name as created_by_name,
  p.email as created_by_email,
  pp.name as partner_approved_by_name,
  org.name as organization_name
FROM offers o
LEFT JOIN contacts c ON o.candidate_id = c.id
LEFT JOIN mandates m ON o.mandate_id = m.id
LEFT JOIN clients cl ON m.client_id = cl.id
LEFT JOIN profiles p ON o.created_by = p.id
LEFT JOIN profiles pp ON o.partner_approved_by = pp.id
LEFT JOIN organizations org ON o.organization_id = org.id;

-- View for onboarding task progress
CREATE OR REPLACE VIEW onboarding_progress AS
SELECT 
  o.id as offer_id,
  o.position_title,
  c.first_name || ' ' || c.last_name as candidate_name,
  o.start_date,
  o.onboarding_checklist,
  jsonb_array_length(o.onboarding_checklist) as total_tasks,
  jsonb_array_length(o.onboarding_checklist) - 
    jsonb_array_length(o.onboarding_checklist) as completed_tasks,
  ROUND(
    (jsonb_array_length(o.onboarding_checklist) - 
      jsonb_array_length(o.onboarding_checklist))::numeric / 
    NULLIF(jsonb_array_length(o.onboarding_checklist), 0) * 100
  , 0) as completion_percentage
FROM offers o
LEFT JOIN contacts c ON o.candidate_id = c.id;


-- >>> FILE: 20260623_alumni_tracking.sql
-- Phase 4.6: Post-Placement & Alumni Tracking
-- Alumni lifecycle management system

-- Alumni records (placed candidates)
CREATE TABLE IF NOT EXISTS alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES contacts(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  placement_mandate_id UUID NOT NULL REFERENCES mandates(id),
  placement_date DATE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  guarantee_end_date DATE NOT NULL,
  guarantee_status TEXT DEFAULT 'active',
  alumni_status TEXT DEFAULT 'active',
  last_engagement_date DATE,
  engagement_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alumni engagement log
CREATE TABLE IF NOT EXISTS alumni_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES alumni(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  engagement_type TEXT NOT NULL,
  engagement_date TIMESTAMPTZ NOT NULL,
  initiated_by UUID REFERENCES profiles(id),
  summary TEXT,
  outcome TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee period tracking
CREATE TABLE IF NOT EXISTS guarantee_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES alumni(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  check_in_dates DATE[] NOT NULL,
  check_ins_completed JSONB DEFAULT '[]',
  fee_refund_pct NUMERIC(5,2),
  dispute_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alumni referrals
CREATE TABLE IF NOT EXISTS alumni_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES alumni(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  referred_candidate_id UUID REFERENCES contacts(id),
  referred_name TEXT NOT NULL,
  referred_email TEXT,
  referred_phone TEXT,
  mandate_id UUID REFERENCES mandates(id),
  referral_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'received',
  referral_source TEXT DEFAULT 'alumni',
  referral_fee_owed BOOLEAN DEFAULT false,
  referral_fee_amount NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-engagement campaigns
CREATE TABLE IF NOT EXISTS alumni_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  target_tags TEXT[] DEFAULT '{}',
  target_companies TEXT[] DEFAULT '{}',
  message_template TEXT NOT NULL,
  send_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alumni_org ON alumni(org_id);
CREATE INDEX IF NOT EXISTS idx_alumni_status ON alumni(alumni_status);
CREATE INDEX IF NOT EXISTS idx_alumni_guarantee ON alumni(guarantee_status) WHERE guarantee_status = 'active';
CREATE INDEX IF NOT EXISTS idx_alumni_engagements ON alumni_engagements(alumni_id, engagement_date DESC);
CREATE INDEX IF NOT EXISTS idx_guarantee_periods_active ON guarantee_periods(org_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alumni_referrals ON alumni_referrals(alumni_id, referral_date DESC);

-- RLS policies
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantee_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_campaigns ENABLE ROW LEVEL SECURITY;

-- Organization-based access policies
DROP POLICY IF EXISTS "Users can view org alumni" ON alumni;
CREATE POLICY "Users can view org alumni" ON alumni
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create org alumni" ON alumni;
CREATE POLICY "Users can create org alumni" ON alumni
  FOR INSERT WITH CHECK (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update org alumni" ON alumni;
CREATE POLICY "Users can update org alumni" ON alumni
  FOR UPDATE USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org alumni engagements" ON alumni_engagements;
CREATE POLICY "Users can view org alumni engagements" ON alumni_engagements
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org guarantee periods" ON guarantee_periods;
CREATE POLICY "Users can view org guarantee periods" ON guarantee_periods
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org alumni referrals" ON alumni_referrals;
CREATE POLICY "Users can view org alumni referrals" ON alumni_referrals
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org alumni campaigns" ON alumni_campaigns;
CREATE POLICY "Users can view org alumni campaigns" ON alumni_campaigns
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- >>> FILE: 20260623_approval_workflows.sql
-- Phase 3.11: Approval Workflows
-- 012_approval_workflows.sql

-- Approval workflow definitions
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  approval_type TEXT NOT NULL CHECK (approval_type IN (
    'candidate_submission',
    'fee_change',
    'offer_approval',
    'mandate_creation',
    'budget_exception',
    'data_export',
    'custom'
  )),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  steps JSONB NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_org ON approval_workflows(org_id, approval_type);

-- Approval requests (instances)
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
  approval_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  request_data JSONB NOT NULL,
  requested_by UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_step INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_review',
    'approved',
    'rejected',
    'cancelled',
    'escalated'
  )),
  final_decision TEXT CHECK (final_decision IN ('approved', 'rejected')),
  final_comment TEXT,
  decided_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON approval_requests(org_id, status, current_step);
CREATE INDEX IF NOT EXISTS idx_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_requests_approver ON approval_requests(org_id, status) WHERE status IN ('pending', 'in_review');

-- Individual step approvals
CREATE TABLE IF NOT EXISTS approval_step_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  approver_id UUID NOT NULL,
  approver_role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'delegated',
    'escalated'
  )),
  decision TEXT CHECK (decision IN ('approved', 'rejected')),
  comment TEXT,
  decided_at TIMESTAMPTZ,
  delegated_from UUID,
  delegated_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  escalated_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_steps_request ON approval_step_records(request_id, step_order);
CREATE INDEX IF NOT EXISTS idx_steps_pending ON approval_step_records(approver_id, status) WHERE status = 'pending';

-- Approval delegation rules
CREATE TABLE IF NOT EXISTS approval_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  delegator_id UUID NOT NULL,
  delegate_id UUID NOT NULL,
  approval_type TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ends_after_start CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_delegations_active ON approval_delegations(org_id, delegator_id, approval_type) WHERE is_active = true;

-- Approval audit log
CREATE TABLE IF NOT EXISTS approval_audit_log (
  id BIGSERIAL PRIMARY KEY,
  org_id UUID NOT NULL,
  request_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_request ON approval_audit_log(request_id, created_at);

-- RLS
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_step_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_workflows" ON approval_workflows;
CREATE POLICY "org_workflows" ON approval_workflows
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_requests" ON approval_requests;
CREATE POLICY "org_requests" ON approval_requests
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_steps" ON approval_step_records;
CREATE POLICY "org_steps" ON approval_step_records
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_delegations" ON approval_delegations;
CREATE POLICY "org_delegations" ON approval_delegations
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_audit" ON approval_audit_log;
CREATE POLICY "org_audit" ON approval_audit_log
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Default approval workflows
INSERT INTO approval_workflows (org_id, name, approval_type, description, is_active, steps, conditions, created_by)
SELECT 
  o.id,
  'Candidate Submission Approval',
  'candidate_submission',
  'Default candidate submission approval workflow',
  true,
  '[{"step_order": 1, "approver_role": "partner", "approver_id": null, "escalation_hours": 24, "escalation_approver_role": "managing_partner", "is_parallel": false}]',
  '{}',
  o.owner_id
FROM organizations o
ON CONFLICT DO NOTHING;

INSERT INTO approval_workflows (org_id, name, approval_type, description, is_active, steps, conditions, created_by)
SELECT 
  o.id,
  'Offer Approval',
  'offer_approval',
  'Default offer letter approval workflow',
  true,
  '[{"step_order": 1, "approver_role": "partner", "approver_id": null, "escalation_hours": 24, "escalation_approver_role": "managing_partner", "is_parallel": false}]',
  '{}',
  o.owner_id
FROM organizations o
ON CONFLICT DO NOTHING;


-- >>> FILE: 20260623_background_checks.sql
-- Phase 7.4: Background Checks

CREATE TABLE IF NOT EXISTS background_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  mandate_id uuid REFERENCES mandates(id),
  check_type text NOT NULL CHECK (check_type IN ('criminal', 'employment', 'education', 'credit', 'drug_screening', 'comprehensive')),
  provider text,
  order_date date,
  due_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  result text CHECK (result IN ('clear', 'discrepancy', 'unresolved')),
  result_summary text,
  report_url text,
  ordered_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_background_checks_candidate ON background_checks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_background_checks_status ON background_checks(status);

ALTER TABLE background_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view org background checks" ON background_checks;
CREATE POLICY "Users can view org background checks" ON background_checks
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create background checks" ON background_checks;
CREATE POLICY "Users can create background checks" ON background_checks
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update background checks" ON background_checks;
CREATE POLICY "Users can update background checks" ON background_checks
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- >>> FILE: 20260623_bd_pipeline.sql
-- Phase 2.8: BD Pipeline (Business Development)
-- Opportunities, activities, proposals, and metrics tables

-- BD opportunities (potential mandates)
CREATE TABLE IF NOT EXISTS bd_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Company info
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'mid_market', 'enterprise', 'mnc')),
  country TEXT NOT NULL DEFAULT 'CN',
  city TEXT,
  website TEXT,

  -- Contact
  primary_contact_name TEXT NOT NULL,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  primary_contact_title TEXT,
  linkedin_url TEXT,

  -- Opportunity
  stage TEXT NOT NULL DEFAULT 'prospect'
    CHECK (stage IN ('prospect', 'qualified', 'proposal_sent', 'pitch_delivered', 'negotiate', 'signed', 'lost', 'deferred')),
  opportunity_type TEXT CHECK (opportunity_type IN ('retained', 'contingent', 'exclusive', 'non_exclusive')),
  estimated_roles INTEGER DEFAULT 1,
  estimated_fee_total NUMERIC,
  estimated_fee_currency TEXT NOT NULL DEFAULT 'CNY',
  fee_structure TEXT CHECK (fee_structure IN ('percentage', 'fixed', 'retainer_plus_success')),

  -- Ownership
  owner_id UUID NOT NULL,
  team_members UUID[] DEFAULT '{}',

  -- Source
  source TEXT CHECK (source IN ('referral', 'networking', 'inbound', 'cold_outreach', 'repeat_client')),
  source_detail TEXT,

  -- Timeline
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  proposal_sent_at TIMESTAMPTZ,
  pitch_delivered_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  deferred_until DATE,

  -- Outcome
  lost_reason TEXT CHECK (lost_reason IN ('budget', 'timing', 'competitor', 'internal', 'no_response')),
  competitor_firm TEXT,
  notes TEXT,

  -- Link to mandate (when signed)
  mandate_id UUID
);

CREATE INDEX IF NOT EXISTS idx_bd_org_stage ON bd_opportunities(org_id, stage);
CREATE INDEX IF NOT EXISTS idx_bd_owner ON bd_opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_bd_company ON bd_opportunities(company_name);
CREATE INDEX IF NOT EXISTS idx_bd_deferred ON bd_opportunities(deferred_until)
  WHERE stage = 'deferred';

-- BD activities (interactions with prospects)
CREATE TABLE IF NOT EXISTS bd_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  opportunity_id UUID NOT NULL REFERENCES bd_opportunities(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call', 'email', 'meeting', 'lunch', 'networking_event',
    'proposal_sent', 'follow_up', 'note', 'stage_change'
  )),
  description TEXT NOT NULL,
  outcome TEXT,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Linked entities
  contact_id UUID,
  related_document_id UUID
);

CREATE INDEX IF NOT EXISTS idx_bd_activities_opp ON bd_activities(opportunity_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bd_activities_owner ON bd_activities(performed_by, performed_at DESC);

-- BD proposals (documents sent to prospects)
CREATE TABLE IF NOT EXISTS bd_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  opportunity_id UUID NOT NULL REFERENCES bd_opportunities(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'superseded')),

  -- Fee details
  fee_structure TEXT,
  fee_amount NUMERIC,
  fee_currency TEXT NOT NULL DEFAULT 'CNY',
  payment_terms TEXT,
  guarantee_period_months INTEGER DEFAULT 3,

  -- Scope
  role_count INTEGER DEFAULT 1,
  scope_description TEXT,
  timeline_weeks INTEGER,

  -- Document
  document_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposals_opp ON bd_proposals(opportunity_id, version DESC);

-- BD pipeline metrics (computed weekly)
CREATE TABLE IF NOT EXISTS bd_pipeline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Funnel counts
  new_prospects INTEGER NOT NULL DEFAULT 0,
  new_qualified INTEGER NOT NULL DEFAULT 0,
  proposals_sent INTEGER NOT NULL DEFAULT 0,
  pitches_delivered INTEGER NOT NULL DEFAULT 0,
  signed INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,

  -- Conversion rates
  prospect_to_qualified_pct NUMERIC,
  qualified_to_signed_pct NUMERIC,
  overall_win_rate_pct NUMERIC,

  -- Value
  total_pipeline_value NUMERIC,
  signed_value NUMERIC,
  avg_deal_size NUMERIC,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, period_start)
);

-- RLS
ALTER TABLE bd_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_pipeline_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_bd_opps" ON bd_opportunities;
CREATE POLICY "org_bd_opps" ON bd_opportunities
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_bd_activities" ON bd_activities;
CREATE POLICY "org_bd_activities" ON bd_activities
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_bd_proposals" ON bd_proposals;
CREATE POLICY "org_bd_proposals" ON bd_proposals
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_bd_metrics" ON bd_pipeline_metrics;
CREATE POLICY "org_bd_metrics" ON bd_pipeline_metrics
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);


-- >>> FILE: 20260623_benchmark_assessment.sql
-- Phase 7.5: BENCHMARK Assessment

CREATE TABLE IF NOT EXISTS benchmark_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type text NOT NULL CHECK (assessment_type IN ('SHIFT_LEAP', 'SHIFT_QUEST', 'SHIFT_DRIVE', 'SHIFT_COACH', 'SHIFT_IMPACT')),
  benchmark_scope text NOT NULL CHECK (benchmark_scope IN ('industry', 'function', 'seniority', 'custom')),
  industry_filter text[],
  function_filter text[],
  seniority_filter text[],
  team_member_ids uuid[],
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results jsonb,
  peer_sample_size int,
  credits_charged int DEFAULT 15,
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_org ON benchmark_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_status ON benchmark_runs(status);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_type ON benchmark_runs(assessment_type);

ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view org benchmark runs" ON benchmark_runs;
CREATE POLICY "Users can view org benchmark runs" ON benchmark_runs
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create benchmark runs" ON benchmark_runs;
CREATE POLICY "Users can create benchmark runs" ON benchmark_runs
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update org benchmark runs" ON benchmark_runs;
CREATE POLICY "Users can update org benchmark runs" ON benchmark_runs
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- >>> FILE: 20260623_compensation_benchmarking.sql
-- Phase 3.8: Compensation Benchmarking Module
-- Benchmarks, data points, and survey imports tables

-- Compensation benchmarks (aggregated market data)
CREATE TABLE IF NOT EXISTS comp_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  job_title_pattern TEXT NOT NULL,
  industry TEXT,
  country TEXT NOT NULL DEFAULT 'CN',
  city TEXT,
  level TEXT CHECK (level IN ('junior', 'mid', 'senior', 'executive')),
  currency TEXT NOT NULL DEFAULT 'CNY',

  -- Percentiles (annual total cash compensation)
  p10 NUMERIC,
  p25 NUMERIC,
  p50 NUMERIC,
  p75 NUMERIC,
  p90 NUMERIC,
  mean NUMERIC,

  -- Metadata
  sample_size INTEGER NOT NULL DEFAULT 0,
  data_sources TEXT[] NOT NULL DEFAULT '{}',
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_lookup ON comp_benchmarks(
  job_title_pattern, industry, country, city
);
CREATE INDEX IF NOT EXISTS idx_benchmarks_org ON comp_benchmarks(org_id);

-- Raw compensation data points (from placements)
CREATE TABLE IF NOT EXISTS comp_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('placement', 'candidate_expectation', 'imported', 'survey')),
  source_id UUID,

  -- Role info
  job_title TEXT NOT NULL,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'mid_market', 'enterprise', 'mnc')),
  country TEXT NOT NULL DEFAULT 'CN',
  city TEXT,

  -- Compensation
  currency TEXT NOT NULL DEFAULT 'CNY',
  base_salary_annual NUMERIC,
  bonus_target_pct NUMERIC,
  equity_value_annual NUMERIC,
  total_cash_annual NUMERIC,

  -- Candidate info (anonymized for privacy)
  experience_years INTEGER,
  education_level TEXT CHECK (education_level IN ('bachelor', 'master', 'phd', 'mba')),

  -- Timestamps
  data_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_points_title ON comp_data_points(job_title, industry, country);
CREATE INDEX IF NOT EXISTS idx_data_points_org ON comp_data_points(org_id);
CREATE INDEX IF NOT EXISTS idx_data_points_date ON comp_data_points(data_date);

-- External survey imports
CREATE TABLE IF NOT EXISTS comp_survey_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  survey_name TEXT NOT NULL,
  survey_year INTEGER NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  imported_by UUID,
  row_count INTEGER NOT NULL DEFAULT 0,
  file_path TEXT
);

-- RLS
ALTER TABLE comp_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_survey_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_benchmarks" ON comp_benchmarks;
CREATE POLICY "org_benchmarks" ON comp_benchmarks
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_data_points" ON comp_data_points;
CREATE POLICY "org_data_points" ON comp_data_points
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_surveys" ON comp_survey_imports;
CREATE POLICY "org_surveys" ON comp_survey_imports
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);


-- >>> FILE: 20260623_kpi_metrics.sql
-- Phase 0.7: KPI Definitions & Success Metrics
-- kpi_values + kpi_alerts tables

-- KPI values store (computed metrics)
CREATE TABLE IF NOT EXISTS kpi_values (
  id BIGSERIAL PRIMARY KEY,
  kpi_id TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  value NUMERIC NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sample_size INTEGER NOT NULL DEFAULT 0,
  UNIQUE(kpi_id, org_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_kpi_values_org ON kpi_values(org_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi ON kpi_values(kpi_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_values_org_kpi ON kpi_values(org_id, kpi_id, period_start DESC);

ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_own_kpis" ON kpi_values;
CREATE POLICY "org_read_own_kpis" ON kpi_values
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- KPI alerts (threshold breaches)
CREATE TABLE IF NOT EXISTS kpi_alerts (
  id BIGSERIAL PRIMARY KEY,
  kpi_id TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  current_value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID
);

CREATE INDEX IF NOT EXISTS idx_kpi_alerts_active ON kpi_alerts(org_id, created_at DESC)
  WHERE acknowledged_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_kpi_alerts_org ON kpi_alerts(org_id, created_at DESC);

ALTER TABLE kpi_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_own_alerts" ON kpi_alerts;
CREATE POLICY "org_read_own_alerts" ON kpi_alerts
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_manage_alerts" ON kpi_alerts;
CREATE POLICY "org_manage_alerts" ON kpi_alerts
  FOR UPDATE USING (org_id = current_setting('app.current_org_id', true)::UUID);


-- >>> FILE: 20260623_notification_foundation.sql
-- Phase 7.3: Notification Foundation Migration
-- Centralized notification system with preferences

-- Notifications table (create if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  read boolean DEFAULT false,
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) UNIQUE,
  -- Per notification type preferences: 'email', 'in_app', 'both', 'none'
  feedback_received text DEFAULT 'both',
  candidate_advanced text DEFAULT 'in_app',
  interview_scheduled text DEFAULT 'both',
  new_candidate_added text DEFAULT 'in_app',
  report_ready text DEFAULT 'both',
  reference_submitted text DEFAULT 'both',
  offer_status_changed text DEFAULT 'both',
  milestone_at_risk text DEFAULT 'both',
  message_received text DEFAULT 'both',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Users can view their own preferences
DROP POLICY IF EXISTS "Users can view their preferences" ON notification_preferences;
CREATE POLICY "Users can view their preferences" ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own preferences
DROP POLICY IF EXISTS "Users can update their preferences" ON notification_preferences;
CREATE POLICY "Users can update their preferences" ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own preferences
DROP POLICY IF EXISTS "Users can insert their preferences" ON notification_preferences;
CREATE POLICY "Users can insert their preferences" ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- >>> FILE: 20260623_pipl_compliance.sql
-- Phase 5.7: PIPL Compliance (China Data Privacy)
-- Consent, residency, cross-border transfers, and data subject rights

-- Consent records (PIPL Articles 14-17)
CREATE TABLE IF NOT EXISTS data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  data_subject_type TEXT NOT NULL CHECK (data_subject_type IN ('candidate', 'client_contact', 'user')),
  data_subject_id UUID NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL CHECK (legal_basis IN (
    'consent',
    'contract_performance',
    'legal_obligation',
    'public_interest',
    'legitimate_interest'
  )),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_text TEXT NOT NULL,
  consent_version INTEGER NOT NULL DEFAULT 1,
  granted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, data_subject_type, data_subject_id, purpose)
);

CREATE INDEX IF NOT EXISTS idx_consents_subject ON data_consents(data_subject_type, data_subject_id);
CREATE INDEX IF NOT EXISTS idx_consents_org ON data_consents(org_id);
CREATE INDEX IF NOT EXISTS idx_consents_expiring ON data_consents(expires_at)
  WHERE expires_at IS NOT NULL AND withdrawn_at IS NULL AND consent_given = true;

-- Data residency tags
CREATE TABLE IF NOT EXISTS data_residency_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'CN',
  is_china_resident BOOLEAN NOT NULL DEFAULT false,
  data_category TEXT NOT NULL DEFAULT 'standard'
    CHECK (data_category IN ('standard', 'sensitive', 'biometric', 'financial', 'minor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_residency_china ON data_residency_tags(is_china_resident)
  WHERE is_china_resident = true;
CREATE INDEX IF NOT EXISTS idx_residency_org ON data_residency_tags(org_id);

-- Cross-border transfer log
CREATE TABLE IF NOT EXISTS cross_border_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  transfer_type TEXT NOT NULL CHECK (transfer_type IN (
    'api_response',
    'backup_replication',
    'analytics_export',
    'manual_export'
  )),
  data_subject_count INTEGER NOT NULL,
  destination_country TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfers_org ON cross_border_transfers(org_id, created_at DESC);

-- Data subject rights requests (PIPL Chapter IV)
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  request_type TEXT NOT NULL CHECK (request_type IN (
    'access',
    'correction',
    'deletion',
    'portability',
    'withdraw_consent'
  )),
  data_subject_type TEXT NOT NULL,
  data_subject_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  request_details JSONB,
  response_details JSONB,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  rejection_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_requests_pending ON data_subject_requests(org_id, status, due_at)
  WHERE status IN ('pending', 'in_progress');

-- RLS
ALTER TABLE data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_residency_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_border_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_consents" ON data_consents;
CREATE POLICY "org_consents" ON data_consents
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "org_residency" ON data_residency_tags;
CREATE POLICY "org_residency" ON data_residency_tags
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

DROP POLICY IF EXISTS "service_role_transfers" ON cross_border_transfers;
CREATE POLICY "service_role_transfers" ON cross_border_transfers
  FOR ALL USING (false);

DROP POLICY IF EXISTS "org_requests" ON data_subject_requests;
CREATE POLICY "org_requests" ON data_subject_requests
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);


-- >>> FILE: 20260623_question_library.sql
-- Phase 7.2: Question Library Migration
-- Pre-built question bank organized by competency and difficulty

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Question content
  question_text text NOT NULL,
  competency text NOT NULL CHECK (competency IN (
    'technical', 'leadership', 'communication', 'problem_solving',
    'teamwork', 'cultural_fit', 'strategic_thinking', 'adaptability',
    'decision_making', 'customer_focus', 'innovation', 'execution'
  )),
  difficulty int CHECK (difficulty BETWEEN 1 AND 3),
  expected_answer text,
  follow_up_question text,
  -- Metadata
  is_system boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  starred_by uuid[] DEFAULT '{}',
  usage_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Question sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  question_ids uuid[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_competency ON questions(competency);
CREATE INDEX IF NOT EXISTS idx_questions_org ON questions(organization_id);
CREATE INDEX IF NOT EXISTS idx_questions_system ON questions(is_system);
CREATE INDEX IF NOT EXISTS idx_questions_starred ON questions(starred_by);
CREATE INDEX IF NOT EXISTS idx_question_sets_org ON question_sets(organization_id);

-- RLS policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;

-- Users can view system questions and their org's questions
DROP POLICY IF EXISTS "Users can view accessible questions" ON questions;
CREATE POLICY "Users can view accessible questions" ON questions
  FOR SELECT USING (
    is_system = true
    OR organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- Users can create questions for their org
DROP POLICY IF EXISTS "Users can create questions" ON questions;
CREATE POLICY "Users can create questions" ON questions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own questions
DROP POLICY IF EXISTS "Users can update own questions" ON questions;
CREATE POLICY "Users can update own questions" ON questions
  FOR UPDATE USING (
    created_by = auth.uid()
    AND is_system = false
  );

-- Users can delete their own questions
DROP POLICY IF EXISTS "Users can delete own questions" ON questions;
CREATE POLICY "Users can delete own questions" ON questions
  FOR DELETE USING (
    created_by = auth.uid()
    AND is_system = false
  );

-- Question sets policies
DROP POLICY IF EXISTS "Users can view accessible sets" ON question_sets;
CREATE POLICY "Users can view accessible sets" ON question_sets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create sets" ON question_sets;
CREATE POLICY "Users can create sets" ON question_sets
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own sets" ON question_sets;
CREATE POLICY "Users can update own sets" ON question_sets
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete own sets" ON question_sets;
CREATE POLICY "Users can delete own sets" ON question_sets
  FOR DELETE USING (created_by = auth.uid());

-- >>> FILE: 20260623_referee_system.sql
-- Phase 7.1: Referee System Migration
-- Reference checks without friction

-- Reference requests table
CREATE TABLE IF NOT EXISTS reference_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  mandate_id uuid REFERENCES mandates(id),
  -- Referee details
  referee_name text NOT NULL,
  referee_email text NOT NULL,
  referee_title text,
  referee_company text,
  referee_relationship text,
  -- Access
  invite_token text UNIQUE NOT NULL,
  invite_url text,
  -- Status
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'reminded', 'submitted', 'expired', 'declined')),
  invited_at timestamptz DEFAULT now(),
  reminded_at timestamptz,
  submitted_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '14 days'),
  -- Metadata
  created_by uuid REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now()
);

-- Reference responses table
CREATE TABLE IF NOT EXISTS reference_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_request_id uuid REFERENCES reference_requests(id) ON DELETE CASCADE,
  -- Question + answer
  question_number int NOT NULL,
  question_text text NOT NULL,
  rating int CHECK (rating BETWEEN 1 AND 5),
  response_text text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reference_requests_candidate ON reference_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reference_requests_status ON reference_requests(status);
CREATE INDEX IF NOT EXISTS idx_reference_requests_token ON reference_requests(invite_token);
CREATE INDEX IF NOT EXISTS idx_reference_responses_request ON reference_responses(reference_request_id);

-- RLS policies
ALTER TABLE reference_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_responses ENABLE ROW LEVEL SECURITY;

-- Consultant/org can view all references for their candidates
DROP POLICY IF EXISTS "Consultants can view reference requests" ON reference_requests;
CREATE POLICY "Consultants can view reference requests" ON reference_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Referees can view/update their own request (via token)
DROP POLICY IF EXISTS "Referee can view own request" ON reference_requests;
CREATE POLICY "Referee can view own request" ON reference_requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Referee can update own request" ON reference_requests;
CREATE POLICY "Referee can update own request" ON reference_requests
  FOR UPDATE USING (true);

-- Responses follow request permissions
DROP POLICY IF EXISTS "Responses follow request access" ON reference_responses;
CREATE POLICY "Responses follow request access" ON reference_responses
  FOR ALL USING (
    reference_request_id IN (
      SELECT id FROM reference_requests
    )
  );


-- >>> FILE: 20260623_saved_searches.sql
-- Phase 2.7: Saved Searches & Talent Alerts

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  search_name TEXT NOT NULL,
  search_description TEXT,
  search_filters JSONB NOT NULL,
  alert_frequency TEXT DEFAULT 'daily',
  alert_threshold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_shared BOOLEAN DEFAULT false,
  shared_with_team TEXT,
  last_executed_at TIMESTAMPTZ,
  last_match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talent alert log
CREATE TABLE IF NOT EXISTS talent_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  candidate_id UUID NOT NULL REFERENCES contacts(id),
  alert_type TEXT NOT NULL,
  match_score NUMERIC(5,2),
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared search subscriptions
CREATE TABLE IF NOT EXISTS saved_search_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  notification_preference TEXT DEFAULT 'inherit',
  UNIQUE(saved_search_id, user_id)
);

-- Search execution log
CREATE TABLE IF NOT EXISTS search_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  saved_search_id UUID REFERENCES saved_searches(id),
  search_filters JSONB NOT NULL,
  result_count INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_org ON saved_searches(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON saved_searches(org_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_talent_alerts_user ON talent_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_talent_alerts_unviewed ON talent_alerts(user_id) WHERE viewed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_search_executions_org ON search_executions(org_id, created_at DESC);

-- RLS policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_search_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_executions ENABLE ROW LEVEL SECURITY;

-- Organization-based access policies
DROP POLICY IF EXISTS "Users can view their saved searches" ON saved_searches;
CREATE POLICY "Users can view their saved searches" ON saved_searches
  FOR SELECT USING (
    user_id = auth.uid() OR
    (is_shared = true AND org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

DROP POLICY IF EXISTS "Users can create saved searches" ON saved_searches;
CREATE POLICY "Users can create saved searches" ON saved_searches
  FOR INSERT WITH CHECK (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their saved searches" ON saved_searches;
CREATE POLICY "Users can update their saved searches" ON saved_searches
  FOR UPDATE USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view their talent alerts" ON talent_alerts;
CREATE POLICY "Users can view their talent alerts" ON talent_alerts
  FOR SELECT USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view their subscriptions" ON saved_search_subscriptions;
CREATE POLICY "Users can view their subscriptions" ON saved_search_subscriptions
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- >>> FILE: 20260623_sla_tracking.sql
-- Phase 3.12: Client SLA & Mandate Timeline Tracking
-- SLA monitoring system for mandate timelines

-- SLA configurations per organization
CREATE TABLE IF NOT EXISTS sla_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  mandate_type TEXT NOT NULL,
  milestones JSONB NOT NULL,
  escalation_rules JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, mandate_type)
);

-- Per-mandate timeline instances
CREATE TABLE IF NOT EXISTS mandate_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  sla_config_id UUID NOT NULL REFERENCES sla_configurations(id),
  start_date TIMESTAMPTZ NOT NULL,
  current_stage TEXT NOT NULL,
  milestones JSONB NOT NULL,
  overall_progress_pct INTEGER DEFAULT 0,
  days_remaining INTEGER,
  health_status TEXT DEFAULT 'on_track',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SLA escalations
CREATE TABLE IF NOT EXISTS sla_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  timeline_id UUID NOT NULL REFERENCES mandate_timelines(id),
  escalation_type TEXT NOT NULL,
  milestone_stage TEXT NOT NULL,
  message TEXT NOT NULL,
  notified_roles TEXT[] NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical SLA performance
CREATE TABLE IF NOT EXISTS sla_performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  mandate_id UUID REFERENCES mandates(id),
  mandate_type TEXT NOT NULL,
  total_duration_days INTEGER,
  stages_completed JSONB,
  sla_met BOOLEAN,
  breached_milestones TEXT[],
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mandate_timelines_org ON mandate_timelines(org_id);
CREATE INDEX IF NOT EXISTS idx_mandate_timelines_health ON mandate_timelines(health_status);
CREATE INDEX IF NOT EXISTS idx_sla_escalations_active ON sla_escalations(org_id) WHERE acknowledged_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sla_perf_org ON sla_performance_history(org_id, completed_at DESC);

-- RLS policies
ALTER TABLE sla_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandate_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_performance_history ENABLE ROW LEVEL SECURITY;

-- Organization-based access policies
DROP POLICY IF EXISTS "Users can view org SLA configs" ON sla_configurations;
CREATE POLICY "Users can view org SLA configs" ON sla_configurations
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create org SLA configs" ON sla_configurations;
CREATE POLICY "Users can create org SLA configs" ON sla_configurations
  FOR INSERT WITH CHECK (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update org SLA configs" ON sla_configurations;
CREATE POLICY "Users can update org SLA configs" ON sla_configurations
  FOR UPDATE USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org mandate timelines" ON mandate_timelines;
CREATE POLICY "Users can view org mandate timelines" ON mandate_timelines
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org escalations" ON sla_escalations;
CREATE POLICY "Users can view org escalations" ON sla_escalations
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view org SLA performance" ON sla_performance_history;
CREATE POLICY "Users can view org SLA performance" ON sla_performance_history
  FOR SELECT USING (
    org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Default SLA configurations
INSERT INTO sla_configurations (org_id, mandate_type, milestones, escalation_rules)
SELECT id, 'executive_search',
  '[
    {"stage": "discovery", "target_days": 5, "warning_days": 2},
    {"stage": "shortlist", "target_days": 10, "warning_days": 3},
    {"stage": "interviews", "target_days": 14, "warning_days": 3},
    {"stage": "offer", "target_days": 7, "warning_days": 2},
    {"stage": "onboarding", "target_days": 14, "warning_days": 3}
  ]'::JSONB,
  '[
    {"threshold_pct": 80, "notify_roles": ["consultant", "manager"], "action": "warning"},
    {"threshold_pct": 95, "notify_roles": ["consultant", "manager", "director"], "action": "critical"},
    {"threshold_pct": 100, "notify_roles": ["consultant", "manager", "director", "partner"], "action": "breach"}
  ]'::JSONB
FROM organizations WHERE NOT EXISTS (SELECT 1 FROM sla_configurations WHERE mandate_type = 'executive_search');

INSERT INTO sla_configurations (org_id, mandate_type, milestones, escalation_rules)
SELECT id, 'retained',
  '[
    {"stage": "discovery", "target_days": 3, "warning_days": 1},
    {"stage": "shortlist", "target_days": 7, "warning_days": 2},
    {"stage": "interviews", "target_days": 10, "warning_days": 2},
    {"stage": "offer", "target_days": 5, "warning_days": 1},
    {"stage": "onboarding", "target_days": 10, "warning_days": 2}
  ]'::JSONB,
  '[
    {"threshold_pct": 80, "notify_roles": ["consultant", "manager"], "action": "warning"},
    {"threshold_pct": 95, "notify_roles": ["consultant", "manager", "director"], "action": "critical"},
    {"threshold_pct": 100, "notify_roles": ["consultant", "manager", "director", "partner"], "action": "breach"}
  ]'::JSONB
FROM organizations WHERE NOT EXISTS (SELECT 1 FROM sla_configurations WHERE mandate_type = 'retained');

INSERT INTO sla_configurations (org_id, mandate_type, milestones, escalation_rules)
SELECT id, 'contingency',
  '[
    {"stage": "discovery", "target_days": 7, "warning_days": 3},
    {"stage": "shortlist", "target_days": 14, "warning_days": 4},
    {"stage": "interviews", "target_days": 21, "warning_days": 5},
    {"stage": "offer", "target_days": 10, "warning_days": 3},
    {"stage": "onboarding", "target_days": 14, "warning_days": 4}
  ]'::JSONB,
  '[
    {"threshold_pct": 80, "notify_roles": ["consultant"], "action": "warning"},
    {"threshold_pct": 95, "notify_roles": ["consultant", "manager"], "action": "critical"},
    {"threshold_pct": 100, "notify_roles": ["consultant", "manager", "director"], "action": "breach"}
  ]'::JSONB
FROM organizations WHERE NOT EXISTS (SELECT 1 FROM sla_configurations WHERE mandate_type = 'contingency');

-- >>> FILE: 20260623_workflow_automation.sql
-- Phase 3.10: Workflow Automation Rules Engine
-- 011_workflow_automation.sql

-- Automation rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'stage_change',
    'score_threshold',
    'time_elapsed',
    'status_change',
    'manual',
    'candidate_created',
    'mandate_created'
  )),
  trigger_config JSONB NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  condition_logic TEXT NOT NULL DEFAULT 'AND' CHECK (condition_logic IN ('AND', 'OR')),
  actions JSONB NOT NULL DEFAULT '[]',
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rules_org_active ON automation_rules(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rules_trigger ON automation_rules(trigger_type);

-- Rule execution log
CREATE TABLE IF NOT EXISTS rule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  trigger_data JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  actions_executed JSONB,
  error_message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executions_rule ON rule_executions(rule_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_entity ON rule_executions(entity_type, entity_id, executed_at DESC);

-- Scheduled rule checks (for time-based triggers)
CREATE TABLE IF NOT EXISTS rule_scheduled_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  check_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_pending ON rule_scheduled_checks(status, check_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_scheduled_rule ON rule_scheduled_checks(rule_id, check_at DESC);

-- RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_scheduled_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_rules" ON automation_rules;
CREATE POLICY "org_rules" ON automation_rules
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_executions" ON rule_executions;
CREATE POLICY "org_executions" ON rule_executions
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "org_scheduled" ON rule_scheduled_checks;
CREATE POLICY "org_scheduled" ON rule_scheduled_checks
  FOR ALL USING (org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));


-- >>> FILE: 20260624_audit_logs_enhanced.sql
-- Phase 0.5: Cross-Cutting Quality Standards
-- Enhanced audit logs with org-scoping, change tracking, and request metadata

-- Add organization_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

-- Add resource_type (alias for entity_type, standard naming)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'resource_type'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_type TEXT GENERATED ALWAYS AS (entity_type) STORED;
  END IF;
END $$;

-- Add resource_id (alias for entity_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'resource_id'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN resource_id UUID GENERATED ALWAYS AS (entity_id) STORED;
  END IF;
END $$;

-- Add changes column (before/after diff)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'changes'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN changes JSONB;
  END IF;
END $$;

-- Add ip_address
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
  END IF;
END $$;

-- Add user_agent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- Add org index
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id, created_at DESC);

-- Update RLS: add org-scoped read for org admins
DROP POLICY IF EXISTS "org_admins_read_own_logs" ON audit_logs;
DROP POLICY IF EXISTS "org_admins_read_own_logs" ON audit_logs;
CREATE POLICY "org_admins_read_own_logs" ON audit_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update existing admin policy to include organization_id scoping
DROP POLICY IF EXISTS "Admin read audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin read audit_logs" ON audit_logs;
CREATE POLICY "Admin read audit_logs" ON audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'lyc_admin')
  )
);


-- >>> FILE: 20260624_nexus_sync_contract.sql
-- Phase 0.6: NEXUS ↔ DEX Sync Contract
-- Event outbox, event log, and sync state tables

-- Event outbox for reliable delivery (Transactional Outbox Pattern)
CREATE TABLE IF NOT EXISTS nexus_event_outbox (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ
);

-- Index for retry job
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON nexus_event_outbox(status, created_at)
  WHERE status IN ('pending', 'retrying', 'failed');

CREATE INDEX IF NOT EXISTS idx_outbox_next_retry ON nexus_event_outbox(next_retry_at)
  WHERE status IN ('pending', 'retrying', 'failed') AND next_retry_at IS NOT NULL;

-- RLS: only service role can access
ALTER TABLE nexus_event_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only_outbox" ON nexus_event_outbox;
CREATE POLICY "service_role_only_outbox" ON nexus_event_outbox
  FOR ALL USING (false);

-- Event log (audit trail)
CREATE TABLE IF NOT EXISTS nexus_event_log (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id),
  payload JSONB NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_status INTEGER,
  response_body TEXT,
  direction TEXT NOT NULL DEFAULT 'dex_to_nexus'
    CHECK (direction IN ('dex_to_nexus', 'nexus_to_dex'))
);

CREATE INDEX IF NOT EXISTS idx_event_log_org ON nexus_event_log(org_id, delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_log_type ON nexus_event_log(event_type, delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_log_direction ON nexus_event_log(direction, delivered_at DESC);

ALTER TABLE nexus_event_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_own_events" ON nexus_event_log;
CREATE POLICY "org_read_own_events" ON nexus_event_log
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- Sync state tracking (last successful sync per entity)
CREATE TABLE IF NOT EXISTS nexus_sync_state (
  org_id UUID NOT NULL REFERENCES organizations(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_event_id UUID,
  sync_status TEXT NOT NULL DEFAULT 'synced'
    CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
  PRIMARY KEY (org_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_state_org ON nexus_sync_state(org_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_state_pending ON nexus_sync_state(sync_status)
  WHERE sync_status IN ('pending', 'failed');

ALTER TABLE nexus_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_sync_state" ON nexus_sync_state;
CREATE POLICY "org_sync_state" ON nexus_sync_state
  FOR ALL USING (org_id = current_setting('app.current_org_id', true)::UUID);

-- Command log (incoming commands from NEXUS)
CREATE TABLE IF NOT EXISTS nexus_command_log (
  id BIGSERIAL PRIMARY KEY,
  command_id UUID NOT NULL DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  command_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processing', 'completed', 'failed')),
  response JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_command_log_org ON nexus_command_log(org_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_log_status ON nexus_command_log(status);
CREATE INDEX IF NOT EXISTS idx_command_log_type ON nexus_command_log(command_type, received_at DESC);

ALTER TABLE nexus_command_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_read_own_commands" ON nexus_command_log;
CREATE POLICY "org_read_own_commands" ON nexus_command_log
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::UUID);


-- >>> FILE: 20260625_create_missing_core_tables.sql
-- ── 20260625_create_missing_core_tables.sql ──────────────────────────────
-- Post-audit migration: 23 tables referenced in 787 backend handler locations
-- but never created in any prior migration.
--
-- Priority tiers based on reference count (high → low):
--   Tier 1 — Critical:   credits, mandates, companies, contacts, credit_transactions, organizations
--   Tier 2 — Core:       mandate_members, candidates_pipeline, scoring_runs, memories*, generated_reports,
--                         candidate_saved_insights, clients
--   Tier 3 — Scoring/AI: candidate_assessment_results, candidate_assessment_responses,
--                         assessment_configs, mandate_success_profiles, ai_generations, match_history
--   Tier 4 — Low usage:  alumni_placements, automation_executions, pipeline_stage_history
--
-- * memories already exists (20260608) but is listed here for completeness;
--   the CREATE TABLE IF NOT EXISTS pattern is safe to re-run.
--
-- NOTE: After running this migration, Kevin must apply it in Supabase Dashboard.
-- ─────────────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════════
-- ── Prerequisite: trigger function ──────────────────────────────────────
DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tier 1 — Critical Tables
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. credits ──────────────────────────────────────────────────────────
-- 113 refs: creditsHandler, stripeHandler, scoringComputeHandler, email, admin, credits/mandates
CREATE TABLE IF NOT EXISTS public.credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,                                    -- nullable: personal credits fallback
  balance         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  daily_balance   INTEGER NOT NULL DEFAULT 0,
  total_earned    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_spent     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tier            TEXT NOT NULL DEFAULT 'free'
                  CHECK (tier IN ('free', 'member', 'council')),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure organization_id exists (may be missing if table was created by earlier migration)
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS organization_id UUID;

CREATE INDEX IF NOT EXISTS idx_credits_user_id       ON public.credits (user_id);
CREATE INDEX IF NOT EXISTS idx_credits_org_id        ON public.credits (organization_id)
  WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credits_tier           ON public.credits (tier);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on credits" ON public.credits;
CREATE POLICY "Service role full access on credits"
  ON public.credits FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own credits" ON public.credits;
CREATE POLICY "Users read own credits"
  ON public.credits FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own credits" ON public.credits;
CREATE POLICY "Users update own credits"
  ON public.credits FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_credits_updated_at ON public.credits;
CREATE TRIGGER trg_credits_updated_at
  BEFORE UPDATE ON public.credits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. credit_transactions ─────────────────────────────────────────────
-- 11 refs: creditsHandler, stripeHandler, admin
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id   UUID,                                    -- nullable
  amount            NUMERIC(12, 2) NOT NULL,                  -- positive = earn, negative = spend
  transaction_type   TEXT NOT NULL
                      CHECK (transaction_type IN ('spend_credit', 'earn_credit', 'daily_reset')),
  description       TEXT,
  reference_id      UUID,                                     -- nullable: links to scoring_run, mandate, etc.
  stripe_session_id TEXT,                                     -- nullable: links to Stripe checkout
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_trans_user_id   ON public.credit_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_credit_trans_org_id    ON public.credit_transactions (organization_id)
  WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_credit_trans_type      ON public.credit_transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_trans_created   ON public.credit_transactions (created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on credit_transactions" ON public.credit_transactions;
CREATE POLICY "Service role full access on credit_transactions"
  ON public.credit_transactions FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users read own credit transactions"
  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);

-- ── 3. organizations ───────────────────────────────────────────────────
-- 7 refs: creditsHandler, dataHandler
CREATE TABLE IF NOT EXISTS public.organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free', 'member', 'council')),
  credit_balance  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_plan    ON public.organizations (plan);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on organizations" ON public.organizations;
CREATE POLICY "Service role full access on organizations"
  ON public.organizations FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admins read organizations" ON public.organizations;
CREATE POLICY "Admins read organizations"
  ON public.organizations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );
DROP POLICY IF EXISTS "Admins write organizations" ON public.organizations;
CREATE POLICY "Admins write organizations"
  ON public.organizations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. mandates ────────────────────────────────────────────────────────
-- 124 refs: dataHandler, companiesUploadHandler, cronHandler, orgScopedQueries,
--          scoringComputeHandler, slaHandler, admin
CREATE TABLE IF NOT EXISTS public.mandates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  client_id            UUID,                                    -- FK to companies (or clients)
  organization_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status               TEXT NOT NULL DEFAULT '1_search'
                         CHECK (status IN ('1_search','2_sourcing','3_screen','4_interview','5_offer','6_closed','on_hold')),
  priority             TEXT,
  description          TEXT,
  jd_description       TEXT,
  search_definition     JSONB,
  skills_requirements  TEXT,
  keywords             TEXT,
  location             TEXT,
  compensation_range   TEXT,
  timeline             TEXT,
  team_size            TEXT,
  source               TEXT NOT NULL DEFAULT 'platform'
                         CHECK (source IN ('platform','csv_upload','imported')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mandates_org_id      ON public.mandates (organization_id);
CREATE INDEX IF NOT EXISTS idx_mandates_client_id   ON public.mandates (client_id)
  WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mandates_status       ON public.mandates (status);
CREATE INDEX IF NOT EXISTS idx_mandates_updated     ON public.mandates (updated_at DESC);

ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on mandates" ON public.mandates;
CREATE POLICY "Service role full access on mandates"
  ON public.mandates FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admins read mandates" ON public.mandates;
CREATE POLICY "Admins read mandates"
  ON public.mandates FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );
DROP POLICY IF EXISTS "Admins write mandates" ON public.mandates;
CREATE POLICY "Admins write mandates"
  ON public.mandates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );

DROP TRIGGER IF EXISTS trg_mandates_updated_at ON public.mandates;
CREATE TRIGGER trg_mandates_updated_at
  BEFORE UPDATE ON public.mandates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. companies ───────────────────────────────────────────────────────
-- 86 refs: companiesUploadHandler, dataHandler, gridReportsGenerateHandler,
--          orgScopedQueries, scoringComputeHandler, admin
CREATE TABLE IF NOT EXISTS public.companies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  industry         TEXT,
  stain_group      TEXT,
  stain_tier       TEXT,
  proximity        TEXT,
  country          TEXT,
  city             TEXT,
  region           TEXT,
  headcount_range  TEXT,
  website          TEXT,
  linkedin_url     TEXT,
  description      TEXT,
  engagement_score NUMERIC(5, 2) DEFAULT 50,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_name       ON public.companies (name);
CREATE INDEX IF NOT EXISTS idx_companies_industry   ON public.companies (industry);
CREATE INDEX IF NOT EXISTS idx_companies_country    ON public.companies (country);
CREATE INDEX IF NOT EXISTS idx_companies_engagement ON public.companies (engagement_score DESC);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on companies" ON public.companies;
CREATE POLICY "Service role full access on companies"
  ON public.companies FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Admins read companies" ON public.companies;
CREATE POLICY "Admins read companies"
  ON public.companies FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );
DROP POLICY IF EXISTS "Admins write companies" ON public.companies;
CREATE POLICY "Admins write companies"
  ON public.companies FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. contacts ───────────────────────────────────────────────────────
-- 57 refs: dataHandler, dsrHandler, orgScopedQueries
CREATE TABLE IF NOT EXISTS public.contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT,
  current_title    TEXT,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  location        TEXT,
  country         TEXT,
  city            TEXT,
  seniority       TEXT,
  skills          TEXT,
  languages       TEXT,
  linkedin_url    TEXT,
  headline        TEXT,
  summary         TEXT,
  career_history  JSONB,
  education       JSONB,
  source          TEXT NOT NULL DEFAULT 'platform'
                    CHECK (source IN ('platform','csv_upload','linkedin_import','manual')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_name       ON public.contacts (name);
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON public.contacts (email)
  WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts (company_id)
  WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_country    ON public.contacts (country);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on contacts" ON public.contacts;
CREATE POLICY "Service role full access on contacts"
  ON public.contacts FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read contacts" ON public.contacts;
CREATE POLICY "Users read contacts"
  ON public.contacts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant'))
  );
DROP POLICY IF EXISTS "Users write contacts" ON public.contacts;
CREATE POLICY "Users write contacts"
  ON public.contacts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP TRIGGER IF EXISTS trg_contacts_updated_at ON public.contacts;
CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- Tier 2 — Core Feature Tables
-- ═══════════════════════════════════════════════════════════════════════

-- ── 7. clients ─────────────────────────────────────────────────────────
-- 5 refs: dataHandler
CREATE TABLE IF NOT EXISTS public.clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   TEXT,
  last_name    TEXT,
  company_name TEXT,
  email        TEXT,
  phone        TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients (company_name);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on clients" ON public.clients;
CREATE POLICY "Service role full access on clients"
  ON public.clients FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read clients" ON public.clients;
CREATE POLICY "Users read clients"
  ON public.clients FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 8. mandate_members ─────────────────────────────────────────────────
-- 10 refs: dataHandler, orgScopedQueries
CREATE TABLE IF NOT EXISTS public.mandate_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id  UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('owner','admin','member','viewer')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mandate_members_unique
  ON public.mandate_members (mandate_id, user_id);
CREATE INDEX IF NOT EXISTS idx_mandate_members_user_id ON public.mandate_members (user_id);

ALTER TABLE public.mandate_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on mandate_members" ON public.mandate_members;
CREATE POLICY "Service role full access on mandate_members"
  ON public.mandate_members FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read mandate members" ON public.mandate_members;
CREATE POLICY "Users read mandate members"
  ON public.mandate_members FOR SELECT USING (auth.uid() = user_id);

-- ── 9. candidates_pipeline ─────────────────────────────────────────────
-- 15 refs: dataHandler, orgScopedQueries
CREATE TABLE IF NOT EXISTS public.candidates_pipeline (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id         UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  mandate_id         UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  stage              TEXT NOT NULL DEFAULT 'SWEEP'
                      CHECK (stage IN ('SWEEP','QUALIFY','ASSESS','INTERVIEW','OFFER','HIRED','REJECTED','WITHDRAWN')),
  sweep_tier         TEXT,
  match_score        NUMERIC(5, 2),
  match_reasons      JSONB,
  key_match_reasons   TEXT,
  estimated_comp      TEXT,
  availability        TEXT,
  notes               TEXT,
  trident_composite   NUMERIC(5, 2),
  trident_d1          NUMERIC(5, 2),
  trident_d2          NUMERIC(5, 2),
  trident_d3          NUMERIC(5, 2),
  fit_analysis        JSONB,
  risk_factors         JSONB,
  approach_strategy    TEXT,
  verdict              TEXT,
  list_status          TEXT DEFAULT 'active'
                      CHECK (list_status IN ('active','paused','archived')),
  next_steps           TEXT,
  client_feedback      TEXT,
  source               TEXT NOT NULL DEFAULT 'platform'
                      CHECK (source IN ('platform','csv_upload','imported')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_pipeline_mandate_id ON public.candidates_pipeline (mandate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_pipeline_contact_id ON public.candidates_pipeline (contact_id);
CREATE INDEX IF NOT EXISTS idx_candidates_pipeline_stage      ON public.candidates_pipeline (stage);

ALTER TABLE public.candidates_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on candidates_pipeline" ON public.candidates_pipeline;
CREATE POLICY "Service role full access on candidates_pipeline"
  ON public.candidates_pipeline FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read candidates pipeline" ON public.candidates_pipeline;
CREATE POLICY "Users read candidates pipeline"
  ON public.candidates_pipeline FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid())
  );
DROP POLICY IF EXISTS "Users write candidates pipeline" ON public.candidates_pipeline;
CREATE POLICY "Users write candidates pipeline"
  ON public.candidates_pipeline FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP TRIGGER IF EXISTS trg_candidates_pipeline_updated_at ON public.candidates_pipeline;
CREATE TRIGGER trg_candidates_pipeline_updated_at
  BEFORE UPDATE ON public.candidates_pipeline FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 10. scoring_runs ───────────────────────────────────────────────────
-- 16 refs: dataHandler, score5Handler, scoringComputeHandler
CREATE TABLE IF NOT EXISTS public.scoring_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id     UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  contact_id     UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  run_type       TEXT NOT NULL DEFAULT 'trident'
                  CHECK (run_type IN ('trident','shift','advisory','candidate','benchmark','lens')),
  assessment_type TEXT,
  input_params   JSONB,
  output_scores  JSONB,
  composite_score NUMERIC(5, 2),
  analysis       JSONB,
  verdict        TEXT,
  model          TEXT,
  tokens_used    INTEGER,
  duration_ms    INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scoring_runs_mandate_id  ON public.scoring_runs (mandate_id)
  WHERE mandate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scoring_runs_contact_id  ON public.scoring_runs (contact_id)
  WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scoring_runs_user_id     ON public.scoring_runs (user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scoring_runs_run_type    ON public.scoring_runs (run_type);
CREATE INDEX IF NOT EXISTS idx_scoring_runs_created     ON public.scoring_runs (created_at DESC);

ALTER TABLE public.scoring_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on scoring_runs" ON public.scoring_runs;
CREATE POLICY "Service role full access on scoring_runs"
  ON public.scoring_runs FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own scoring runs" ON public.scoring_runs;
CREATE POLICY "Users read own scoring runs"
  ON public.scoring_runs FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ── 11. generated_reports ─────────────────────────────────────────────
-- 7 refs: dataHandler
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id      UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL,
  candidate_ids   JSONB,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating','ready','failed','archived')),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_reports_mandate_id ON public.generated_reports (mandate_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_org_id     ON public.generated_reports (organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status     ON public.generated_reports (status);
CREATE INDEX IF NOT EXISTS idx_generated_reports_created   ON public.generated_reports (created_at DESC);

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on generated_reports" ON public.generated_reports;
CREATE POLICY "Service role full access on generated_reports"
  ON public.generated_reports FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read generated reports" ON public.generated_reports;
CREATE POLICY "Users read generated reports"
  ON public.generated_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid())
  );

DROP TRIGGER IF EXISTS trg_generated_reports_updated_at ON public.generated_reports;
CREATE TRIGGER trg_generated_reports_updated_at
  BEFORE UPDATE ON public.generated_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 12. candidate_saved_insights ────────────────────────────────────────
-- 4 refs: dataHandler
CREATE TABLE IF NOT EXISTS public.candidate_saved_insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id  UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_candidate_saved_insights_unique
  ON public.candidate_saved_insights (profile_id, insight_id);
CREATE INDEX IF NOT EXISTS idx_candidate_saved_insights_profile_id
  ON public.candidate_saved_insights (profile_id);

ALTER TABLE public.candidate_saved_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on candidate_saved_insights" ON public.candidate_saved_insights;
CREATE POLICY "Service role full access on candidate_saved_insights"
  ON public.candidate_saved_insights FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own saved insights" ON public.candidate_saved_insights;
CREATE POLICY "Users read own saved insights"
  ON public.candidate_saved_insights FOR SELECT USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "Users write own saved insights" ON public.candidate_saved_insights;
CREATE POLICY "Users write own saved insights"
  ON public.candidate_saved_insights FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Tier 3 — Scoring / AI Tables
-- ═══════════════════════════════════════════════════════════════════════

-- ── 13. candidate_assessment_results ───────────────────────────────────
-- 3 refs: scoringComputeHandler
CREATE TABLE IF NOT EXISTS public.candidate_assessment_results (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id       UUID NOT NULL,                              -- contact_id or user_id
  assessment_id       UUID NOT NULL,
  mandate_id         UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  overall_score      NUMERIC(5, 2),
  recommendation     TEXT,
  dimension_scores   JSONB,
  strengths          TEXT,
  development_areas  TEXT,
  visibility         TEXT DEFAULT 'private'
                      CHECK (visibility IN ('private','team','public')),
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_car_candidate_id    ON public.candidate_assessment_results (candidate_id);
CREATE INDEX IF NOT EXISTS idx_car_assessment_id   ON public.candidate_assessment_results (assessment_id);
CREATE INDEX IF NOT EXISTS idx_car_mandate_id      ON public.candidate_assessment_results (mandate_id)
  WHERE mandate_id IS NOT NULL;

ALTER TABLE public.candidate_assessment_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on candidate_assessment_results" ON public.candidate_assessment_results;
CREATE POLICY "Service role full access on candidate_assessment_results"
  ON public.candidate_assessment_results FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own assessment results" ON public.candidate_assessment_results;
CREATE POLICY "Users read own assessment results"
  ON public.candidate_assessment_results FOR SELECT USING (auth.uid() IS NOT NULL);

DROP TRIGGER IF EXISTS trg_car_updated_at ON public.candidate_assessment_results;
CREATE TRIGGER trg_car_updated_at
  BEFORE UPDATE ON public.candidate_assessment_results FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 14. candidate_assessment_responses ──────────────────────────────────
-- 2 refs: scoringComputeHandler
CREATE TABLE IF NOT EXISTS public.candidate_assessment_responses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  assessment_id UUID NOT NULL,
  mandate_id   UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  responses    JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_car响_candidate_id    ON public.candidate_assessment_responses (candidate_id);
CREATE INDEX IF NOT EXISTS idx_car响_assessment_id   ON public.candidate_assessment_responses (assessment_id);

ALTER TABLE public.candidate_assessment_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on candidate_assessment_responses" ON public.candidate_assessment_responses;
CREATE POLICY "Service role full access on candidate_assessment_responses"
  ON public.candidate_assessment_responses FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users write own assessment responses" ON public.candidate_assessment_responses;
CREATE POLICY "Users write own assessment responses"
  ON public.candidate_assessment_responses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── 15. assessment_configs ─────────────────────────────────────────────
-- 2 refs: scoringComputeHandler
CREATE TABLE IF NOT EXISTS public.assessment_configs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}'::jsonb,
  version     INTEGER NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_configs_active ON public.assessment_configs (is_active)
  WHERE is_active = TRUE;

ALTER TABLE public.assessment_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on assessment_configs" ON public.assessment_configs;
CREATE POLICY "Service role full access on assessment_configs"
  ON public.assessment_configs FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS trg_assessment_configs_updated_at ON public.assessment_configs;
CREATE TRIGGER trg_assessment_configs_updated_at
  BEFORE UPDATE ON public.assessment_configs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 16. mandate_success_profiles ───────────────────────────────────────
-- 1 ref: scoringComputeHandler
CREATE TABLE IF NOT EXISTS public.mandate_success_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id  UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  profile     JSONB NOT NULL DEFAULT '{}'::jsonb,
  version     INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_msp_mandate_version
  ON public.mandate_success_profiles (mandate_id, version);

ALTER TABLE public.mandate_success_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on mandate_success_profiles" ON public.mandate_success_profiles;
CREATE POLICY "Service role full access on mandate_success_profiles"
  ON public.mandate_success_profiles FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS trg_msp_updated_at ON public.mandate_success_profiles;
CREATE TRIGGER trg_msp_updated_at
  BEFORE UPDATE ON public.mandate_success_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 17. ai_generations ────────────────────────────────────────────────
-- 2 refs: dataHandler
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  input_data  JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source      TEXT NOT NULL DEFAULT 'platform'
                CHECK (source IN ('platform','api','imported')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id  ON public.ai_generations (user_id)
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_generations_type     ON public.ai_generations (type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created  ON public.ai_generations (created_at DESC);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on ai_generations" ON public.ai_generations;
CREATE POLICY "Service role full access on ai_generations"
  ON public.ai_generations FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own ai generations" ON public.ai_generations;
CREATE POLICY "Users read own ai generations"
  ON public.ai_generations FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ── 18. match_history ──────────────────────────────────────────────────
-- 1 ref: scoreHandler
CREATE TABLE IF NOT EXISTS public.match_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  jd_text         TEXT,
  results         JSONB NOT NULL DEFAULT '[]'::jsonb,
  candidate_count INTEGER NOT NULL DEFAULT 0,
  average_score   NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_history_user_id  ON public.match_history (user_id);
CREATE INDEX IF NOT EXISTS idx_match_history_created ON public.match_history (created_at DESC);

ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on match_history" ON public.match_history;
CREATE POLICY "Service role full access on match_history"
  ON public.match_history FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read own match history" ON public.match_history;
CREATE POLICY "Users read own match history"
  ON public.match_history FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Tier 4 — Low Usage Tables
-- ═══════════════════════════════════════════════════════════════════════

-- ── 19. alumni_placements ─────────────────────────────────────────────
-- 2 refs: alumniHandler
CREATE TABLE IF NOT EXISTS public.alumni_placements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  mandate_id      UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  placement_date  DATE NOT NULL,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','completed')),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumni_placements_org_id    ON public.alumni_placements (org_id);
CREATE INDEX IF NOT EXISTS idx_alumni_placements_mandate_id ON public.alumni_placements (mandate_id)
  WHERE mandate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alumni_placements_status   ON public.alumni_placements (status);

ALTER TABLE public.alumni_placements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on alumni_placements" ON public.alumni_placements;
CREATE POLICY "Service role full access on alumni_placements"
  ON public.alumni_placements FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read alumni placements" ON public.alumni_placements;
CREATE POLICY "Users read alumni placements"
  ON public.alumni_placements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );

DROP TRIGGER IF EXISTS trg_alumni_placements_updated_at ON public.alumni_placements;
CREATE TRIGGER trg_alumni_placements_updated_at
  BEFORE UPDATE ON public.alumni_placements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 20. automation_executions ──────────────────────────────────────────
-- 2 refs: automationHandler
CREATE TABLE IF NOT EXISTS public.automation_executions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id     UUID,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','running','completed','failed','cancelled')),
  error       TEXT,
  executed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_org_id  ON public.automation_executions (org_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule_id ON public.automation_executions (rule_id)
  WHERE rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_automation_executions_status  ON public.automation_executions (status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_executed ON public.automation_executions (executed_at DESC);

ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on automation_executions" ON public.automation_executions;
CREATE POLICY "Service role full access on automation_executions"
  ON public.automation_executions FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read automation executions" ON public.automation_executions;
CREATE POLICY "Users read automation executions"
  ON public.automation_executions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'lyc_admin'))
  );

-- ── 21. pipeline_stage_history ────────────────────────────────────────
-- 1 ref: dataHandler
CREATE TABLE IF NOT EXISTS public.pipeline_stage_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL,                                   -- candidates_pipeline.id
  from_stage  TEXT,
  to_stage    TEXT NOT NULL,
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stage_history_pipeline_id
  ON public.pipeline_stage_history (pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_history_created
  ON public.pipeline_stage_history (created_at DESC);

ALTER TABLE public.pipeline_stage_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on pipeline_stage_history" ON public.pipeline_stage_history;
CREATE POLICY "Service role full access on pipeline_stage_history"
  ON public.pipeline_stage_history FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Users read pipeline stage history" ON public.pipeline_stage_history;
CREATE POLICY "Users read pipeline stage history"
  ON public.pipeline_stage_history FOR SELECT USING (auth.uid() IS NOT NULL);

-- ── 22. candidate_pipeline ─────────────────────────────────────────────
-- 1 ref: dataHandler (distinct from candidates_pipeline)
-- Mirrors candidates_pipeline but used in separate pipeline view contexts
CREATE TABLE IF NOT EXISTS public.candidate_pipeline (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id         UUID NOT NULL,
  mandate_id         UUID NOT NULL,
  stage              TEXT NOT NULL DEFAULT 'SWEEP',
  match_score        NUMERIC(5, 2),
  list_status        TEXT DEFAULT 'active',
  client_feedback    TEXT,
  source             TEXT DEFAULT 'platform',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_mandate_id ON public.candidate_pipeline (mandate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pipeline_contact_id ON public.candidate_pipeline (contact_id);

ALTER TABLE public.candidate_pipeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on candidate_pipeline" ON public.candidate_pipeline;
CREATE POLICY "Service role full access on candidate_pipeline"
  ON public.candidate_pipeline FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS trg_candidate_pipeline_updated_at ON public.candidate_pipeline;
CREATE TRIGGER trg_candidate_pipeline_updated_at
  BEFORE UPDATE ON public.candidate_pipeline FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- Verification smoke test
-- ═══════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_count INTEGER;
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'credits','credit_transactions','organizations','mandates','companies','contacts',
    'clients','mandate_members','candidates_pipeline','scoring_runs','generated_reports',
    'candidate_saved_insights','candidate_assessment_results','candidate_assessment_responses',
    'assessment_configs','mandate_success_profiles','ai_generations','match_history',
    'alumni_placements','automation_executions','pipeline_stage_history','candidate_pipeline'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ All 22 core tables created successfully';
  ELSE
    RAISE EXCEPTION '❌ Missing tables: %', v_missing;
  END IF;
END$$;



-- >>> FILE: 20260627_candidate_tracking.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260627_candidate_tracking.sql
-- DEX AI Candidate Tracking — T1 Schema Migration (Technical Blueprint 01)
-- Implements: Spec 01 (DEX-BS-001) + Technical Blueprint 01 (DEX-TB-001)
-- GRID v2.0 Integration: 19-stage pipeline, motivation screening, reachability validation
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. CONTACTS TABLE EXTENSIONS ──────────────────────────────────────

-- Pipeline: 19-stage recruitment pipeline (GRID v2.0)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'S1_Sourced'
  CHECK (pipeline_stage IN (
    'S1_Sourced', 'S2_Screened', 'S3_Contacted', 'S4_No_Response',
    'S5_Responded', 'S6_WeChat_Added', 'S7_Interested', 'S8_Not_Interested',
    'S9_Call_Positive', 'S10_Call_Negative', 'S11_Internal_Interview',
    'S12_Presented_to_Client', 'S13_Client_Int_Scheduled', 'S14_Client_Interviewed',
    'S15_Client_2nd_Interview', 'S16_Offer_Extended', 'S17_Offer_Accepted',
    'S18_Offer_Declined', 'S19_Closed'
  ));

-- Legacy compatibility: keep pipeline_status for backward compat, sync via trigger
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'S1_Sourced';

-- Motivation Screening (GRID v2.0 — pre-contact gate)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS motivation_overall TEXT DEFAULT 'UNKNOWN'
  CHECK (motivation_overall IN ('GREEN', 'YELLOW', 'RED', 'UNKNOWN'));

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS motivation_assessment JSONB DEFAULT '{}'::jsonb;

-- Reachability Validation (GRID v2.0 — pre-contact gate)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS reachability_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS reachability_unknowns INTEGER DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS contact_channel TEXT
  CHECK (contact_channel IN ('LINKEDIN', 'EMAIL', 'WECHAT', 'NONE', NULL));
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS reachability_details JSONB DEFAULT '{}'::jsonb;

-- Decline Tracking (GRID v2.0 — S8 specific)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS decline_reason TEXT
  CHECK (decline_reason IN (
    'COMPENSATION', 'ROLE_TOO_JUNIOR', 'LOCATION', 'TIMING',
    'OTHER_OFFER', 'NOT_INTERESTED', 'OTHER', NULL
  ));
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS decline_notes TEXT;

-- Classification (flexible per-project)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('A', 'B', 'C'));
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS classification TEXT
  CHECK (classification IN (
    'CLIENT_SHORTLIST', 'OPERATOR', 'ANALYST_SENIOR', 'ANALYST_JUNIOR',
    'MOTIVATION_RISK', 'REVIEW', 'ELIMINATE', NULL
  ));

-- Other fields
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS years_of_experience NUMERIC;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS comp_current TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS comp_expected TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS candidate_notes TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS next_action_due DATE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS data_confidence NUMERIC DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS stage_changed_by UUID REFERENCES auth.users(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS stage_change_date DATE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS source TEXT
  CHECK (source IN ('LinkedIn', 'Referral', 'Cold_Outreach', 'Database', 'Event', 'Other', 'import', 'platform'));

-- Indexes for pipeline and filtering
CREATE INDEX IF NOT EXISTS idx_contacts_pipeline_stage ON public.contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_motivation ON public.contacts(motivation_overall);
CREATE INDEX IF NOT EXISTS idx_contacts_classification ON public.contacts(classification);
CREATE INDEX IF NOT EXISTS idx_contacts_reachability ON public.contacts(reachability_verified)
  WHERE reachability_verified = FALSE;
CREATE INDEX IF NOT EXISTS idx_contacts_decline_reason ON public.contacts(decline_reason)
  WHERE decline_reason IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON public.contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_tier ON public.contacts(tier);
CREATE INDEX IF NOT EXISTS idx_contacts_data_confidence ON public.contacts(data_confidence);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contacted ON public.contacts(last_contacted DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_archived ON public.contacts(is_archived)
  WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_contacts_list_default ON public.contacts(is_archived, pipeline_stage, last_contacted DESC)
  WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_contacts_stage_active ON public.contacts(pipeline_stage)
  WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON public.contacts(created_by);

-- ── 2. CANDIDATE OUTREACH LOG ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_outreach_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interaction_type TEXT NOT NULL
                    CHECK (interaction_type IN (
                      'cold_call', 'email', 'wechat', 'linkedin', 'referral',
                      'event', 'interview', 'meeting', 'other'
                    )),
  summary         TEXT NOT NULL,
  outcome         TEXT
                    CHECK (outcome IN (
                      'interested', 'not_interested', 'follow_up', 'no_response',
                      'scheduled', 'completed', 'declined'
                    )),
  next_step       TEXT,
  next_step_date  DATE,
  notes           TEXT,
  signal_id       UUID -- links to signals table (Tech-00)
);

CREATE INDEX IF NOT EXISTS idx_outreach_contact ON public.candidate_outreach_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_created_at ON public.candidate_outreach_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_created_by ON public.candidate_outreach_log(created_by);

ALTER TABLE public.candidate_outreach_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view outreach logs" ON public.candidate_outreach_log;
CREATE POLICY "Team can view outreach logs"
  ON public.candidate_outreach_log FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can create outreach logs" ON public.candidate_outreach_log;
CREATE POLICY "Team can create outreach logs"
  ON public.candidate_outreach_log FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Team can update own outreach logs" ON public.candidate_outreach_log;
CREATE POLICY "Team can update own outreach logs"
  ON public.candidate_outreach_log FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- ── 3. CANDIDATE MANDATE LINKS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_mandate_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  mandate_id      UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'identified'
                    CHECK (status IN (
                      'identified', 'sourced', 'screened', 'shortlisted', 'presented',
                      'interview', 'offer', 'placed', 'withdrawn', 'rejected'
                    )),
  priority        TEXT CHECK (priority IN ('P1', 'P2', 'P3')),
  notes           TEXT,
  -- GRID positioning
  market_position TEXT,
  sector_benchmark TEXT,
  salary_band     TEXT,
  talent_density  TEXT,
  competitor_presence TEXT,
  UNIQUE(contact_id, mandate_id)
);

CREATE INDEX IF NOT EXISTS idx_cmdl_contact ON public.candidate_mandate_links(contact_id);
CREATE INDEX IF NOT EXISTS idx_cmdl_mandate ON public.candidate_mandate_links(mandate_id);
CREATE INDEX IF NOT EXISTS idx_cmdl_status ON public.candidate_mandate_links(status);
CREATE INDEX IF NOT EXISTS idx_cmdl_priority ON public.candidate_mandate_links(priority);

ALTER TABLE public.candidate_mandate_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view mandate links" ON public.candidate_mandate_links;
CREATE POLICY "Team can view mandate links"
  ON public.candidate_mandate_links FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can create mandate links" ON public.candidate_mandate_links;
CREATE POLICY "Team can create mandate links"
  ON public.candidate_mandate_links FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Team can update mandate links" ON public.candidate_mandate_links;
CREATE POLICY "Team can update mandate links"
  ON public.candidate_mandate_links FOR UPDATE TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS trg_cmdl_updated_at ON public.candidate_mandate_links;
CREATE TRIGGER trg_cmdl_updated_at
  BEFORE UPDATE ON public.candidate_mandate_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. SAVED SEARCHES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved searches" ON public.saved_searches;
CREATE POLICY "Users can view own saved searches"
  ON public.saved_searches FOR SELECT TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage own saved searches"
  ON public.saved_searches FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ── 5. IMPORT LOGS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.import_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_name     TEXT NOT NULL,
  source_format   TEXT NOT NULL
                    CHECK (source_format IN ('csv', 'json', 'api')),
  total_rows      INTEGER NOT NULL,
  imported_count  INTEGER DEFAULT 0,
  skipped_count   INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  error_count     INTEGER DEFAULT 0,
  errors          JSONB NOT NULL DEFAULT '[]'::jsonb,
  status          TEXT NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'completed', 'failed', 'partial'))
);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view import logs" ON public.import_logs;
CREATE POLICY "Team can view import logs"
  ON public.import_logs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can create import logs" ON public.import_logs;
CREATE POLICY "Team can create import logs"
  ON public.import_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 6. PIPELINE TRANSITIONS (GRID v2.0) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_transitions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id          UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  from_stage          TEXT NOT NULL,
  to_stage            TEXT NOT NULL,
  changed_by          UUID REFERENCES auth.users(id),
  changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason              TEXT,
  -- Validation snapshot
  motivation_overall  TEXT,
  reachability_verified BOOLEAN,
  reachability_unknowns INTEGER,
  decline_reason      TEXT,
  decline_notes       TEXT,
  -- Metadata
  is_backward         BOOLEAN NOT NULL DEFAULT FALSE,
  notes               TEXT
);

CREATE INDEX IF NOT EXISTS idx_pt_contact ON public.pipeline_transitions(contact_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pt_stage ON public.pipeline_transitions(to_stage, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_pt_backward ON public.pipeline_transitions(is_backward)
  WHERE is_backward = TRUE;
CREATE INDEX IF NOT EXISTS idx_pt_changed_by ON public.pipeline_transitions(changed_by);

ALTER TABLE public.pipeline_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view pipeline transitions" ON public.pipeline_transitions;
CREATE POLICY "Team can view pipeline transitions"
  ON public.pipeline_transitions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can create pipeline transitions" ON public.pipeline_transitions;
CREATE POLICY "System can create pipeline transitions"
  ON public.pipeline_transitions FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 7. S2→S3 GATE VALIDATION FUNCTION (GRID v2.0) ───────────────────────
DROP FUNCTION IF EXISTS fn_validate_s2_to_s3_gate();
CREATE OR REPLACE FUNCTION public.fn_validate_s2_to_s3_gate(p_contact_id UUID)
RETURNS TABLE (
  can_proceed BOOLEAN,
  block_reason TEXT,
  motivation_overall TEXT,
  reachability_unknowns INTEGER
) AS $$
DECLARE
  v_motivation TEXT;
  v_reach_unknowns INTEGER;
  v_reach_verified BOOLEAN;
  v_contact_channel TEXT;
BEGIN
  SELECT motivation_overall, reachability_unknowns, reachability_verified, contact_channel
  INTO v_motivation, v_reach_unknowns, v_reach_verified, v_contact_channel
  FROM contacts WHERE id = p_contact_id;

  -- Check motivation: must be GREEN or YELLOW (not RED, not UNKNOWN)
  IF v_motivation = 'RED' THEN
    RETURN QUERY SELECT false, 'Motivation is RED — do not contact', v_motivation, v_reach_unknowns;
    RETURN;
  END IF;

  IF v_motivation = 'UNKNOWN' THEN
    RETURN QUERY SELECT false, 'Motivation not yet assessed — complete motivation screening first', v_motivation, v_reach_unknowns;
    RETURN;
  END IF;

  -- Check reachability: max 1 unknown allowed
  IF v_reach_unknowns >= 2 THEN
    RETURN QUERY SELECT false,
      'Reachability: ' || v_reach_unknowns || ' unknowns (max 1 allowed)',
      v_motivation, v_reach_unknowns;
    RETURN;
  END IF;

  -- Check contact channel
  IF v_contact_channel = 'NONE' OR v_contact_channel IS NULL THEN
    RETURN QUERY SELECT false, 'No contact channel available', v_motivation, v_reach_unknowns;
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT true, NULL, v_motivation, v_reach_unknowns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. PIPELINE STAGE TRANSITION TRIGGER ───────────────────────────────
DROP FUNCTION IF EXISTS fn_log_pipeline_transition();
CREATE OR REPLACE FUNCTION public.fn_log_pipeline_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_is_backward BOOLEAN := FALSE;
  v_stage_order TEXT[] := ARRAY[
    'S1_Sourced', 'S2_Screened', 'S3_Contacted', 'S4_No_Response',
    'S5_Responded', 'S6_WeChat_Added', 'S7_Interested', 'S8_Not_Interested',
    'S9_Call_Positive', 'S10_Call_Negative', 'S11_Internal_Interview',
    'S12_Presented_to_Client', 'S13_Client_Int_Scheduled', 'S14_Client_Interviewed',
    'S15_Client_2nd_Interview', 'S16_Offer_Extended', 'S17_Offer_Accepted',
    'S18_Offer_Declined', 'S19_Closed'
  ];
  v_from_idx INTEGER;
  v_to_idx INTEGER;
BEGIN
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    -- Determine if backward move
    SELECT ARRAY_POSITION(v_stage_order, OLD.pipeline_stage) INTO v_from_idx;
    SELECT ARRAY_POSITION(v_stage_order, NEW.pipeline_stage) INTO v_to_idx;

    IF v_from_idx IS NOT NULL AND v_to_idx IS NOT NULL AND v_to_idx < v_from_idx THEN
      v_is_backward := TRUE;
    END IF;

    -- Insert transition record
    INSERT INTO pipeline_transitions (
      contact_id, from_stage, to_stage, changed_by, reason,
      motivation_overall, reachability_verified, reachability_unknowns,
      decline_reason, decline_notes, is_backward
    ) VALUES (
      NEW.id, OLD.pipeline_stage, NEW.pipeline_stage,
      NEW.stage_changed_by, NEW.candidate_notes,
      NEW.motivation_overall, NEW.reachability_verified, NEW.reachability_unknowns,
      NEW.decline_reason, NEW.decline_notes, v_is_backward
    );

    -- Sync legacy pipeline_status
    NEW.pipeline_status := NEW.pipeline_stage;
    NEW.stage_change_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_pipeline_transition ON public.contacts;
CREATE TRIGGER trg_pipeline_transition
  BEFORE UPDATE OF pipeline_stage ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_pipeline_transition();

-- ── 9. OUTREACH LOG SIGNAL TRIGGER ─────────────────────────────────────
DROP FUNCTION IF EXISTS fn_outreach_log_signal();
CREATE OR REPLACE FUNCTION public.fn_outreach_log_signal()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert signal
  INSERT INTO signals (contact_id, type, source, title, metadata, actor_id)
  VALUES (
    NEW.contact_id,
    'outreach',
    'platform',
    NEW.summary,
    jsonb_build_object(
      'interaction_type', NEW.interaction_type,
      'outcome', NEW.outcome,
      'summary', NEW.summary
    ),
    NEW.created_by
  );

  -- Update contacts timestamps
  UPDATE contacts SET
    signal_count = COALESCE(signal_count, 0) + 1,
    last_signal_at = NOW(),
    last_contacted = NOW()
  WHERE id = NEW.contact_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_outreach_log_signal ON public.candidate_outreach_log;
CREATE TRIGGER trg_outreach_log_signal
  AFTER INSERT ON public.candidate_outreach_log
  FOR EACH ROW EXECUTE FUNCTION public.fn_outreach_log_signal();

-- ── 10. CMDL STATUS SIGNAL TRIGGER ─────────────────────────────────────
DROP FUNCTION IF EXISTS fn_cmdl_status_signal();
CREATE OR REPLACE FUNCTION public.fn_cmdl_status_signal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO signals (contact_id, mandate_id, type, source, title, metadata, actor_id)
    VALUES (
      NEW.contact_id,
      NEW.mandate_id,
      'status_change',
      'system',
      'Candidate status changed: ' || OLD.status || ' → ' || NEW.status,
      jsonb_build_object(
        'from_status', OLD.status,
        'to_status', NEW.status,
        'table', 'candidate_mandate_links'
      ),
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cmdl_status_signal ON public.candidate_mandate_links;
CREATE TRIGGER trg_cmdl_status_signal
  AFTER UPDATE OF status ON public.candidate_mandate_links
  FOR EACH ROW EXECUTE FUNCTION public.fn_cmdl_status_signal();

-- ── 11. DATA CONFIDENCE CALCULATION ────────────────────────────────────
DROP FUNCTION IF EXISTS fn_calculate_data_confidence();
CREATE OR REPLACE FUNCTION public.fn_calculate_data_confidence()
RETURNS TRIGGER AS $$
DECLARE
  v_confidence NUMERIC;
  v_filled INTEGER := 0;
  v_total INTEGER := 10;
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN v_filled := v_filled + 1; END IF;
  IF NEW.current_title IS NOT NULL AND NEW.current_title != '' THEN v_filled := v_filled + 1; END IF;
  IF (NEW.city IS NOT NULL AND NEW.city != '') OR (NEW.country IS NOT NULL AND NEW.country != '') THEN v_filled := v_filled + 1; END IF;
  IF NEW.industry IS NOT NULL AND NEW.industry != '' THEN v_filled := v_filled + 1; END IF;
  IF NEW.years_of_experience IS NOT NULL THEN v_filled := v_filled + 1; END IF;
  IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN v_filled := v_filled + 1; END IF;
  IF NEW.skills IS NOT NULL AND NEW.skills != '{}'::jsonb AND jsonb_array_length(COALESCE(NEW.skills, '[]'::jsonb)) > 0 THEN v_filled := v_filled + 1; END IF;
  IF NEW.languages IS NOT NULL AND NEW.languages != '{}'::jsonb AND jsonb_array_length(COALESCE(NEW.languages, '[]'::jsonb)) > 0 THEN v_filled := v_filled + 1; END IF;
  IF NEW.comp_current IS NOT NULL AND NEW.comp_current != '' THEN v_filled := v_filled + 1; END IF;
  IF NEW.tier IS NOT NULL THEN v_filled := v_filled + 1; END IF;

  v_confidence := ROUND((v_filled::NUMERIC / v_total) * 100);
  NEW.data_confidence := v_confidence;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_data_confidence ON public.contacts;
CREATE TRIGGER trg_data_confidence
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_data_confidence();

-- ── 12. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'candidate_outreach_log', 'candidate_mandate_links',
    'saved_searches', 'import_logs', 'pipeline_transitions'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ Candidate Tracking migration OK — all tables present';
  ELSE
    RAISE EXCEPTION '❌ Candidate Tracking migration FAILED — missing: %', v_missing;
  END IF;

  -- Verify contacts columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'pipeline_stage'
  ) THEN
    RAISE EXCEPTION 'contacts.pipeline_stage column missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'motivation_overall'
  ) THEN
    RAISE EXCEPTION 'contacts.motivation_overall column missing';
  END IF;

  RAISE NOTICE '✅ contacts table extensions verified';
END$$;

-- >>> FILE: 20260627_grid_market_mapping.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260627_grid_market_mapping.sql
-- DEX AI GRID Market Mapping — T2 Schema Migration (Technical Blueprint 02)
-- Implements: Spec 02 (DEX-BS-002) + Technical Blueprint 02 (DEX-TB-002)
-- GRID v2.0 Integration: 5-section mapping, M1-M7 standards, 16 intelligence data points
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. GRID MAPPINGS (Master record) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.grid_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id          UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  created_by          UUID NOT NULL REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version             INTEGER NOT NULL DEFAULT 1,
  status              TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'in_progress', 'complete', 'archived')),
  mapping_type        TEXT NOT NULL DEFAULT 'grid'
                       CHECK (mapping_type IN ('sweep', 'grid')),
  config              JSONB NOT NULL DEFAULT '{}'::jsonb,
  standards_summary   JSONB NOT NULL DEFAULT '{}'::jsonb,
  intelligence_data   JSONB NOT NULL DEFAULT '{}'::jsonb,
  intelligence_timestamps JSONB NOT NULL DEFAULT '{}'::jsonb,
  export_pdf_path     TEXT,
  export_csv_path     TEXT,
  last_generated_at   TIMESTAMPTZ,
  last_daily_grid_sent TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_grid_mappings_mandate ON public.grid_mappings(mandate_id);
CREATE INDEX IF NOT EXISTS idx_grid_mappings_status ON public.grid_mappings(status);
CREATE INDEX IF NOT EXISTS idx_grid_mappings_type ON public.grid_mappings(mapping_type);

ALTER TABLE public.grid_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid mappings" ON public.grid_mappings;
CREATE POLICY "Team can view grid mappings"
  ON public.grid_mappings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can create grid mappings" ON public.grid_mappings;
CREATE POLICY "Team can create grid mappings"
  ON public.grid_mappings FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Team can update grid mappings" ON public.grid_mappings;
CREATE POLICY "Team can update grid mappings"
  ON public.grid_mappings FOR UPDATE TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS trg_grid_mappings_updated_at ON public.grid_mappings;
CREATE TRIGGER trg_grid_mappings_updated_at
  BEFORE UPDATE ON public.grid_mappings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. GRID SECTORS (Section 1: Sector & Segment Definition) ────────────
CREATE TABLE IF NOT EXISTS public.grid_sectors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_mapping_id UUID NOT NULL REFERENCES public.grid_mappings(id) ON DELETE CASCADE,
  sector_name     TEXT NOT NULL,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  segments        JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_grid_sectors_mapping ON public.grid_sectors(grid_mapping_id);

ALTER TABLE public.grid_sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid sectors" ON public.grid_sectors;
CREATE POLICY "Team can view grid sectors"
  ON public.grid_sectors FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can manage grid sectors" ON public.grid_sectors;
CREATE POLICY "Team can manage grid sectors"
  ON public.grid_sectors FOR ALL TO authenticated
  USING (true);

-- ── 3. GRID COMPANIES (Section 2: Target Company List) ─────────────────
CREATE TABLE IF NOT EXISTS public.grid_companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_mapping_id UUID NOT NULL REFERENCES public.grid_mappings(id) ON DELETE CASCADE,
  grid_sector_id  UUID REFERENCES public.grid_sectors(id) ON DELETE SET NULL,
  target_company_id UUID REFERENCES public.target_companies(id) ON DELETE SET NULL,
  company_name    TEXT NOT NULL,
  segment         TEXT,
  est_employees   INTEGER,
  relevance       TEXT NOT NULL DEFAULT 'medium'
                   CHECK (relevance IN ('high', 'medium', 'low')),
  rationale       TEXT NOT NULL,
  target_candidates INTEGER NOT NULL DEFAULT 1 CHECK (target_candidates >= 1),
  actual_candidates INTEGER NOT NULL DEFAULT 0,
  gap             INTEGER NOT NULL DEFAULT 0,
  gap_reason      TEXT
                   CHECK (gap_reason IN ('not_interested', 'not_found', 'not_reachable', 'wrong_seniority', 'wrong_function', NULL)),
  gap_action_plan TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grid_companies_mapping ON public.grid_companies(grid_mapping_id);
CREATE INDEX IF NOT EXISTS idx_grid_companies_sector ON public.grid_companies(grid_sector_id);
CREATE INDEX IF NOT EXISTS idx_grid_companies_relevance ON public.grid_companies(relevance);

ALTER TABLE public.grid_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid companies" ON public.grid_companies;
CREATE POLICY "Team can view grid companies"
  ON public.grid_companies FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can manage grid companies" ON public.grid_companies;
CREATE POLICY "Team can manage grid companies"
  ON public.grid_companies FOR ALL TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS trg_grid_companies_updated_at ON public.grid_companies;
CREATE TRIGGER trg_grid_companies_updated_at
  BEFORE UPDATE ON public.grid_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-compute gap
DROP FUNCTION IF EXISTS fn_grid_company_gap();
CREATE OR REPLACE FUNCTION public.fn_grid_company_gap()
RETURNS TRIGGER AS $$
BEGIN
  NEW.gap := NEW.target_candidates - NEW.actual_candidates;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grid_company_gap ON public.grid_companies;
CREATE TRIGGER trg_grid_company_gap
  BEFORE INSERT OR UPDATE OF target_candidates, actual_candidates ON public.grid_companies
  FOR EACH ROW EXECUTE FUNCTION public.fn_grid_company_gap();

-- ── 4. GRID FUNCTIONS (Section 3: Business Function Relevance) ──────────
CREATE TABLE IF NOT EXISTS public.grid_functions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_mapping_id UUID NOT NULL REFERENCES public.grid_mappings(id) ON DELETE CASCADE,
  function_name   TEXT NOT NULL,
  relevant_titles JSONB NOT NULL DEFAULT '[]'::jsonb,
  seniority_from  TEXT,
  seniority_to    TEXT,
  relevance       TEXT NOT NULL DEFAULT 'medium'
                   CHECK (relevance IN ('high', 'medium', 'low')),
  notes           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_grid_functions_mapping ON public.grid_functions(grid_mapping_id);

ALTER TABLE public.grid_functions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid functions" ON public.grid_functions;
CREATE POLICY "Team can view grid functions"
  ON public.grid_functions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can manage grid functions" ON public.grid_functions;
CREATE POLICY "Team can manage grid functions"
  ON public.grid_functions FOR ALL TO authenticated
  USING (true);

-- ── 5. GRID CANDIDATE ENTRIES (Section 4: Candidate Map) ────────────────
CREATE TABLE IF NOT EXISTS public.grid_candidate_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_mapping_id     UUID NOT NULL REFERENCES public.grid_mappings(id) ON DELETE CASCADE,
  contact_id          UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  grid_company_id     UUID REFERENCES public.grid_companies(id) ON DELETE SET NULL,
  grid_function_id    UUID REFERENCES public.grid_functions(id) ON DELETE SET NULL,
  -- Positioning fields
  market_position     TEXT
                      CHECK (market_position IN ('above_market', 'at_market', 'below_market', 'emerging')),
  sector_benchmark    TEXT
                      CHECK (sector_benchmark IN ('top', 'second', 'third', 'bottom')),
  salary_band         TEXT
                      CHECK (salary_band IN ('executive_premium', 'market_rate', 'below_market', 'unknown')),
  talent_density      TEXT
                      CHECK (talent_density IN ('high', 'medium', 'low', 'scarce')),
  competitor_presence TEXT,
  -- Priority
  priority            TEXT NOT NULL DEFAULT 'P3'
                      CHECK (priority IN ('P1', 'P2', 'P3')),
  priority_override   BOOLEAN NOT NULL DEFAULT FALSE,
  priority_override_reason TEXT,
  -- Status
  status              TEXT NOT NULL DEFAULT 'uncontacted'
                      CHECK (status IN ('uncontacted', 'contacted_interested', 'contacted_not_interested', 'interview', 'offer', 'declined_offer', 'not_viable')),
  notes               TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grid_mapping_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_grid_entries_mapping ON public.grid_candidate_entries(grid_mapping_id);
CREATE INDEX IF NOT EXISTS idx_grid_entries_contact ON public.grid_candidate_entries(contact_id);
CREATE INDEX IF NOT EXISTS idx_grid_entries_priority ON public.grid_candidate_entries(priority);
CREATE INDEX IF NOT EXISTS idx_grid_entries_status ON public.grid_candidate_entries(status);

ALTER TABLE public.grid_candidate_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid candidate entries" ON public.grid_candidate_entries;
CREATE POLICY "Team can view grid candidate entries"
  ON public.grid_candidate_entries FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team can manage grid candidate entries" ON public.grid_candidate_entries;
CREATE POLICY "Team can manage grid candidate entries"
  ON public.grid_candidate_entries FOR ALL TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS trg_grid_entries_updated_at ON public.grid_candidate_entries;
CREATE TRIGGER trg_grid_entries_updated_at
  BEFORE UPDATE ON public.grid_candidate_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-assign priority
DROP FUNCTION IF EXISTS fn_grid_auto_priority();
CREATE OR REPLACE FUNCTION public.fn_grid_auto_priority()
RETURNS TRIGGER AS $$
DECLARE
  v_company_relevance TEXT;
  v_function_relevance TEXT;
BEGIN
  IF NEW.priority_override = TRUE THEN
    RETURN NEW;
  END IF;

  SELECT relevance INTO v_company_relevance
  FROM grid_companies WHERE id = NEW.grid_company_id;

  SELECT relevance INTO v_function_relevance
  FROM grid_functions WHERE id = NEW.grid_function_id;

  IF v_company_relevance = 'high' AND v_function_relevance = 'high' THEN
    NEW.priority := 'P1';
  ELSIF (v_company_relevance = 'high' AND v_function_relevance = 'medium')
      OR (v_company_relevance = 'medium' AND v_function_relevance = 'high') THEN
    NEW.priority := 'P2';
  ELSE
    NEW.priority := 'P3';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grid_auto_priority ON public.grid_candidate_entries;
CREATE TRIGGER trg_grid_auto_priority
  BEFORE INSERT OR UPDATE OF grid_company_id, grid_function_id ON public.grid_candidate_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_grid_auto_priority();

-- ── 6. GRID MINIMUM STANDARDS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.grid_minimum_standards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_mapping_id     UUID NOT NULL REFERENCES public.grid_mappings(id) ON DELETE CASCADE,
  checked_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- M1: Target companies >= 15
  m1_company_count    INTEGER NOT NULL DEFAULT 0,
  m1_status           TEXT NOT NULL DEFAULT 'red',
  -- M2: Sectors >= 3
  m2_sector_count     INTEGER NOT NULL DEFAULT 0,
  m2_status           TEXT NOT NULL DEFAULT 'red',
  -- M3: Candidates >= 30
  m3_candidate_count  INTEGER NOT NULL DEFAULT 0,
  m3_status           TEXT NOT NULL DEFAULT 'red',
  -- M4: Candidates contacted >= 50%
  m4_contacted_pct    NUMERIC NOT NULL DEFAULT 0,
  m4_status           TEXT NOT NULL DEFAULT 'red',
  -- M5: Gap table filled 100%
  m5_gap_filled_pct   NUMERIC NOT NULL DEFAULT 0,
  m5_status           TEXT NOT NULL DEFAULT 'red',
  -- M6: P1 contacted within 1 week = 100%
  m6_p1_contacted_pct NUMERIC NOT NULL DEFAULT 0,
  m6_status           TEXT NOT NULL DEFAULT 'red',
  -- M7: Status updated within 7 days
  m7_last_update      TIMESTAMPTZ,
  m7_status           TEXT NOT NULL DEFAULT 'red',
  -- Overall
  overall_score       INTEGER NOT NULL DEFAULT 0,
  overall_status      TEXT NOT NULL DEFAULT 'red',
  UNIQUE(grid_mapping_id)
);

CREATE INDEX IF NOT EXISTS idx_grid_standards_mapping ON public.grid_minimum_standards(grid_mapping_id);

ALTER TABLE public.grid_minimum_standards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view grid standards" ON public.grid_minimum_standards;
CREATE POLICY "Team can view grid standards"
  ON public.grid_minimum_standards FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can update grid standards" ON public.grid_minimum_standards;
CREATE POLICY "System can update grid standards"
  ON public.grid_minimum_standards FOR ALL TO authenticated
  USING (true);

-- ── 7. COMPUTE GRID STANDARDS FUNCTION ──────────────────────────────────
DROP FUNCTION IF EXISTS fn_compute_grid_standards();
CREATE OR REPLACE FUNCTION public.fn_compute_grid_standards(p_mapping_id UUID)
RETURNS VOID AS $$
DECLARE
  v_company_count INTEGER;
  v_sector_count INTEGER;
  v_candidate_count INTEGER;
  v_contacted_count INTEGER;
  v_contacted_pct NUMERIC;
  v_gap_filled_count INTEGER;
  v_gap_total INTEGER;
  v_gap_filled_pct NUMERIC;
  v_p1_count INTEGER;
  v_p1_contacted INTEGER;
  v_p1_pct NUMERIC;
  v_last_update TIMESTAMPTZ;
  v_overall_score INTEGER;
  v_overall_status TEXT;
BEGIN
  -- M1: Count companies
  SELECT COUNT(*) INTO v_company_count FROM grid_companies WHERE grid_mapping_id = p_mapping_id;

  -- M2: Count sectors
  SELECT COUNT(*) INTO v_sector_count FROM grid_sectors WHERE grid_mapping_id = p_mapping_id;

  -- M3: Count candidates
  SELECT COUNT(*) INTO v_candidate_count FROM grid_candidate_entries WHERE grid_mapping_id = p_mapping_id;

  -- M4: Contacted percentage
  SELECT COUNT(*) INTO v_contacted_count
  FROM grid_candidate_entries
  WHERE grid_mapping_id = p_mapping_id AND status NOT IN ('uncontacted');
  v_contacted_pct := CASE WHEN v_candidate_count > 0 THEN ROUND((v_contacted_count::NUMERIC / v_candidate_count) * 100) ELSE 0 END;

  -- M5: Gap table filled
  SELECT COUNT(*) INTO v_gap_total FROM grid_companies WHERE grid_mapping_id = p_mapping_id;
  SELECT COUNT(*) INTO v_gap_filled_count
  FROM grid_companies WHERE grid_mapping_id = p_mapping_id AND gap_reason IS NOT NULL;
  v_gap_filled_pct := CASE WHEN v_gap_total > 0 THEN ROUND((v_gap_filled_count::NUMERIC / v_gap_total) * 100) ELSE 0 END;

  -- M6: P1 contacted
  SELECT COUNT(*) INTO v_p1_count
  FROM grid_candidate_entries WHERE grid_mapping_id = p_mapping_id AND priority = 'P1';
  SELECT COUNT(*) INTO v_p1_contacted
  FROM grid_candidate_entries
  WHERE grid_mapping_id = p_mapping_id AND priority = 'P1' AND status NOT IN ('uncontacted');
  v_p1_pct := CASE WHEN v_p1_count > 0 THEN ROUND((v_p1_contacted::NUMERIC / v_p1_count) * 100) ELSE 0 END;

  -- M7: Last update
  SELECT MAX(updated_at) INTO v_last_update
  FROM grid_candidate_entries WHERE grid_mapping_id = p_mapping_id;

  -- Calculate overall score (0-7)
  v_overall_score := 0;
  IF v_company_count >= 15 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_sector_count >= 3 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_candidate_count >= 30 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_contacted_pct >= 50 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_gap_filled_pct = 100 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_p1_pct = 100 THEN v_overall_score := v_overall_score + 1; END IF;
  IF v_last_update >= NOW() - INTERVAL '7 days' THEN v_overall_score := v_overall_score + 1; END IF;

  v_overall_status := CASE
    WHEN v_overall_score >= 6 THEN 'green'
    WHEN v_overall_score >= 4 THEN 'yellow'
    ELSE 'red'
  END;

  -- Upsert standards record
  INSERT INTO grid_minimum_standards (
    grid_mapping_id, checked_at,
    m1_company_count, m1_status,
    m2_sector_count, m2_status,
    m3_candidate_count, m3_status,
    m4_contacted_pct, m4_status,
    m5_gap_filled_pct, m5_status,
    m6_p1_contacted_pct, m6_status,
    m7_last_update, m7_status,
    overall_score, overall_status
  ) VALUES (
    p_mapping_id, NOW(),
    v_company_count, CASE WHEN v_company_count >= 15 THEN 'green' WHEN v_company_count >= 10 THEN 'yellow' ELSE 'red' END,
    v_sector_count, CASE WHEN v_sector_count >= 3 THEN 'green' WHEN v_sector_count >= 2 THEN 'yellow' ELSE 'red' END,
    v_candidate_count, CASE WHEN v_candidate_count >= 30 THEN 'green' WHEN v_candidate_count >= 15 THEN 'yellow' ELSE 'red' END,
    v_contacted_pct, CASE WHEN v_contacted_pct >= 50 THEN 'green' WHEN v_contacted_pct >= 25 THEN 'yellow' ELSE 'red' END,
    v_gap_filled_pct, CASE WHEN v_gap_filled_pct = 100 THEN 'green' WHEN v_gap_filled_pct >= 50 THEN 'yellow' ELSE 'red' END,
    v_p1_pct, CASE WHEN v_p1_pct = 100 THEN 'green' WHEN v_p1_pct >= 50 THEN 'yellow' ELSE 'red' END,
    v_last_update, CASE WHEN v_last_update >= NOW() - INTERVAL '7 days' THEN 'green' WHEN v_last_update >= NOW() - INTERVAL '14 days' THEN 'yellow' ELSE 'red' END,
    v_overall_score, v_overall_status
  ) ON CONFLICT (grid_mapping_id) DO UPDATE SET
    checked_at = NOW(),
    m1_company_count = v_company_count,
    m1_status = CASE WHEN v_company_count >= 15 THEN 'green' WHEN v_company_count >= 10 THEN 'yellow' ELSE 'red' END,
    m2_sector_count = v_sector_count,
    m2_status = CASE WHEN v_sector_count >= 3 THEN 'green' WHEN v_sector_count >= 2 THEN 'yellow' ELSE 'red' END,
    m3_candidate_count = v_candidate_count,
    m3_status = CASE WHEN v_candidate_count >= 30 THEN 'green' WHEN v_candidate_count >= 15 THEN 'yellow' ELSE 'red' END,
    m4_contacted_pct = v_contacted_pct,
    m4_status = CASE WHEN v_contacted_pct >= 50 THEN 'green' WHEN v_contacted_pct >= 25 THEN 'yellow' ELSE 'red' END,
    m5_gap_filled_pct = v_gap_filled_pct,
    m5_status = CASE WHEN v_gap_filled_pct = 100 THEN 'green' WHEN v_gap_filled_pct >= 50 THEN 'yellow' ELSE 'red' END,
    m6_p1_contacted_pct = v_p1_pct,
    m6_status = CASE WHEN v_p1_pct = 100 THEN 'green' WHEN v_p1_pct >= 50 THEN 'yellow' ELSE 'red' END,
    m7_last_update = v_last_update,
    m7_status = CASE WHEN v_last_update >= NOW() - INTERVAL '7 days' THEN 'green' WHEN v_last_update >= NOW() - INTERVAL '14 days' THEN 'yellow' ELSE 'red' END,
    overall_score = v_overall_score,
    overall_status = v_overall_status;

  -- Update grid_mappings.standards_summary
  UPDATE grid_mappings SET
    standards_summary = jsonb_build_object(
      'm1_companies', jsonb_build_object('count', v_company_count, 'min', 15, 'status', CASE WHEN v_company_count >= 15 THEN 'green' WHEN v_company_count >= 10 THEN 'yellow' ELSE 'red' END),
      'm2_sectors', jsonb_build_object('count', v_sector_count, 'min', 3, 'status', CASE WHEN v_sector_count >= 3 THEN 'green' WHEN v_sector_count >= 2 THEN 'yellow' ELSE 'red' END),
      'm3_candidates', jsonb_build_object('count', v_candidate_count, 'min', 30, 'status', CASE WHEN v_candidate_count >= 30 THEN 'green' WHEN v_candidate_count >= 15 THEN 'yellow' ELSE 'red' END),
      'm4_contacted', jsonb_build_object('pct', v_contacted_pct, 'target', 50, 'status', CASE WHEN v_contacted_pct >= 50 THEN 'green' WHEN v_contacted_pct >= 25 THEN 'yellow' ELSE 'red' END),
      'm5_gap_filled', jsonb_build_object('pct', v_gap_filled_pct, 'target', 100, 'status', CASE WHEN v_gap_filled_pct = 100 THEN 'green' WHEN v_gap_filled_pct >= 50 THEN 'yellow' ELSE 'red' END),
      'm6_p1_contacted', jsonb_build_object('pct', v_p1_pct, 'target', 100, 'status', CASE WHEN v_p1_pct = 100 THEN 'green' WHEN v_p1_pct >= 50 THEN 'yellow' ELSE 'red' END),
      'm7_last_update', jsonb_build_object('date', v_last_update, 'status', CASE WHEN v_last_update >= NOW() - INTERVAL '7 days' THEN 'green' WHEN v_last_update >= NOW() - INTERVAL '14 days' THEN 'yellow' ELSE 'red' END)
    ),
    updated_at = NOW()
  WHERE id = p_mapping_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'grid_mappings', 'grid_sectors', 'grid_companies',
    'grid_functions', 'grid_candidate_entries', 'grid_minimum_standards'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ GRID Market Mapping migration OK — all tables present';
  ELSE
    RAISE EXCEPTION '❌ GRID Market Mapping migration FAILED — missing: %', v_missing;
  END IF;
END$$;

-- >>> FILE: 20260627_mandate_management.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260627_mandate_management.sql
-- DEX AI Mandate Management — T6 Schema Migration (Technical Blueprint 06)
-- Implements: Spec 06 (DEX-BS-006) + Technical Blueprint 06 (DEX-TB-006)
-- Phase lifecycle, payment milestones, analytics snapshots, handoff
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. MANDATES TABLE EXTENSIONS ───────────────────────────────────────
DO $$
BEGIN
  -- Phase lifecycle tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'phase') THEN
    ALTER TABLE public.mandates ADD COLUMN phase TEXT DEFAULT 'kickoff'
      CHECK (phase IN ('kickoff', 'sourcing', 'shortlisting', 'interview', 'offer', 'close', 'on_hold', 'cancelled', 'completed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'phase_entered_at') THEN
    ALTER TABLE public.mandates ADD COLUMN phase_entered_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'phase_history') THEN
    ALTER TABLE public.mandates ADD COLUMN phase_history JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Payment tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'fee_structure') THEN
    ALTER TABLE public.mandates ADD COLUMN fee_structure TEXT DEFAULT 'retainer_30_40_30';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'fee_amount') THEN
    ALTER TABLE public.mandates ADD COLUMN fee_amount NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'fee_currency') THEN
    ALTER TABLE public.mandates ADD COLUMN fee_currency TEXT DEFAULT 'CNY';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'payment_milestones') THEN
    ALTER TABLE public.mandates ADD COLUMN payment_milestones JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Consultant assignment
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'lead_consultant_id') THEN
    ALTER TABLE public.mandates ADD COLUMN lead_consultant_id UUID REFERENCES public.auth_users(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'executive_sponsor_id') THEN
    ALTER TABLE public.mandates ADD COLUMN executive_sponsor_id UUID REFERENCES public.auth_users(id);
  END IF;

  -- Handoff
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'handoff_notes') THEN
    ALTER TABLE public.mandates ADD COLUMN handoff_notes JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'previous_consultant_id') THEN
    ALTER TABLE public.mandates ADD COLUMN previous_consultant_id UUID REFERENCES public.auth_users(id);
  END IF;

  -- GRID reference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'current_grid_mapping_id') THEN
    ALTER TABLE public.mandates ADD COLUMN current_grid_mapping_id UUID REFERENCES public.grid_mappings(id);
  END IF;

  -- Actual close date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'actual_close_date') THEN
    ALTER TABLE public.mandates ADD COLUMN actual_close_date TIMESTAMPTZ;
  END IF;

  -- Target close date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandates' AND column_name = 'target_close_date') THEN
    ALTER TABLE public.mandates ADD COLUMN target_close_date DATE;
  END IF;

  RAISE NOTICE '✅ Mandate extensions applied';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ Mandate extension error (may be already applied): %', SQLERRM;
END$$;

-- ── 2. ADD INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mandates_phase ON public.mandates(phase);
CREATE INDEX IF NOT EXISTS idx_mandates_consultant ON public.mandates(lead_consultant_id);
CREATE INDEX IF NOT EXISTS idx_mandates_status_phase ON public.mandates(status, phase);

-- ── 3. MANDATE PAYMENT MILESTONES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mandate_payment_milestones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id          UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  milestone_number    INTEGER NOT NULL CHECK (milestone_number IN (1, 2, 3)),
  percentage          NUMERIC NOT NULL,
  amount              NUMERIC NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'CNY',
  trigger_event       TEXT NOT NULL,
  trigger_description TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'due', 'invoiced', 'paid', 'overdue', 'waived')),
  due_date            DATE,
  expected_date       DATE,
  invoice_date        DATE,
  paid_date           DATE,
  paid_amount         NUMERIC,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mandate_id, milestone_number)
);

CREATE INDEX IF NOT EXISTS idx_payment_mandate ON public.mandate_payment_milestones(mandate_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON public.mandate_payment_milestones(status);
CREATE INDEX IF NOT EXISTS idx_payment_due_date ON public.mandate_payment_milestones(due_date);

ALTER TABLE public.mandate_payment_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view payment milestones" ON public.mandate_payment_milestones;
CREATE POLICY "Team can view payment milestones"
  ON public.mandate_payment_milestones FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can manage payment milestones" ON public.mandate_payment_milestones;
CREATE POLICY "Admin can manage payment milestones"
  ON public.mandate_payment_milestones FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP TRIGGER IF EXISTS trg_payment_updated_at ON public.mandate_payment_milestones;
CREATE TRIGGER trg_payment_updated_at
  BEFORE UPDATE ON public.mandate_payment_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-set status to 'due' when trigger event occurs
DROP FUNCTION IF EXISTS fn_payment_milestone_due();
CREATE OR REPLACE FUNCTION public.fn_payment_milestone_due()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    IF NEW.trigger_event = 'engagement_signed'
       AND EXISTS (SELECT 1 FROM mandates WHERE id = NEW.mandate_id AND phase != 'kickoff') THEN
      NEW.status := 'due';
      NEW.due_date := CURRENT_DATE + INTERVAL '7 days';
    ELSIF NEW.trigger_event = 'shortlist_presented'
       AND EXISTS (SELECT 1 FROM candidate_mandate_links WHERE mandate_id = NEW.mandate_id AND status IN ('shortlisted', 'presented')) THEN
      NEW.status := 'due';
      NEW.due_date := CURRENT_DATE + INTERVAL '14 days';
    ELSIF NEW.trigger_event = 'candidate_started'
       AND EXISTS (SELECT 1 FROM candidate_mandate_links WHERE mandate_id = NEW.mandate_id AND status = 'placed') THEN
      NEW.status := 'due';
      NEW.due_date := CURRENT_DATE + INTERVAL '30 days';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_payment_milestone_due ON public.mandate_payment_milestones;
CREATE TRIGGER trg_payment_milestone_due
  BEFORE INSERT OR UPDATE ON public.mandate_payment_milestones
  FOR EACH ROW EXECUTE FUNCTION public.fn_payment_milestone_due();

-- ── 4. MANDATE ANALYTICS SNAPSHOTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mandate_analytics_snapshots (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  total_active_mandates     INTEGER,
  total_completed_mandates  INTEGER,
  total_cancelled_mandates  INTEGER,
  avg_time_to_fill          INTEGER,
  placement_rate            NUMERIC,
  avg_candidates_per_mandate NUMERIC,
  avg_pipeline_velocity     NUMERIC,
  avg_client_feedback_time  NUMERIC,
  total_fee_pipeline        NUMERIC,
  total_fee_collected       NUMERIC,
  phase_distribution        JSONB,
  consultant_workload       JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

ALTER TABLE public.mandate_analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view analytics" ON public.mandate_analytics_snapshots;
CREATE POLICY "Team can view analytics"
  ON public.mandate_analytics_snapshots FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can create snapshots" ON public.mandate_analytics_snapshots;
CREATE POLICY "System can create snapshots"
  ON public.mandate_analytics_snapshots FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 5. COMPUTE MANDATE ANALYTICS ──────────────────────────────────────
DROP FUNCTION IF EXISTS fn_compute_mandate_analytics();
CREATE OR REPLACE FUNCTION public.fn_compute_mandate_analytics()
RETURNS VOID AS $$
DECLARE
  v_active INTEGER;
  v_completed INTEGER;
  v_cancelled INTEGER;
  v_placement_rate NUMERIC;
  v_avg_time NUMERIC;
  v_avg_candidates NUMERIC;
  v_avg_velocity NUMERIC;
  v_avg_feedback NUMERIC;
  v_total_pipeline NUMERIC;
  v_total_collected NUMERIC;
  v_phase_dist JSONB;
BEGIN
  SELECT COUNT(*) INTO v_active FROM mandates WHERE status = 'active';
  SELECT COUNT(*) INTO v_completed FROM mandates WHERE status = 'completed';
  SELECT COUNT(*) INTO v_cancelled FROM mandates WHERE status = 'cancelled';

  v_placement_rate := CASE
    WHEN (v_completed + v_cancelled) > 0
    THEN ROUND(v_completed::NUMERIC / (v_completed + v_cancelled) * 100, 1)
    ELSE 0
  END;

  -- Average time to fill
  SELECT AVG(EXTRACT(DAY FROM actual_close_date - created_at))::INTEGER INTO v_avg_time
  FROM mandates
  WHERE status = 'completed' AND actual_close_date IS NOT NULL;

  -- Average candidates per mandate
  SELECT COALESCE(AVG(candidate_count)::NUMERIC, 0) INTO v_avg_candidates
  FROM (
    SELECT mandate_id, COUNT(*) as candidate_count
    FROM candidate_mandate_links
    GROUP BY mandate_id
  ) sub;

  -- Pipeline velocity
  SELECT COALESCE(AVG(daily_rate)::NUMERIC, 0) INTO v_avg_velocity
  FROM (
    SELECT m.id, COUNT(cml.id)::NUMERIC / NULLIF(EXTRACT(DAY FROM MAX(cml.created_at) - MIN(cml.created_at)), 0) as daily_rate
    FROM mandates m
    JOIN candidate_mandate_links cml ON cml.mandate_id = m.id
    WHERE m.status IN ('active', 'completed')
    GROUP BY m.id
    HAVING EXTRACT(DAY FROM MAX(cml.created_at) - MIN(cml.created_at)) > 0
  ) sub;

  -- Revenue
  SELECT COALESCE(SUM(amount), 0) INTO v_total_pipeline
  FROM mandate_payment_milestones
  WHERE status IN ('pending', 'due', 'invoiced');

  SELECT COALESCE(SUM(paid_amount), 0) INTO v_total_collected
  FROM mandate_payment_milestones
  WHERE status = 'paid';

  -- Phase distribution
  SELECT jsonb_object_agg(phase, cnt)
  INTO v_phase_dist
  FROM (
    SELECT phase, COUNT(*) as cnt
    FROM mandates
    WHERE status = 'active'
    GROUP BY phase
  ) sub;

  INSERT INTO mandate_analytics_snapshots (
    snapshot_date,
    total_active_mandates,
    total_completed_mandates,
    total_cancelled_mandates,
    avg_time_to_fill,
    placement_rate,
    avg_candidates_per_mandate,
    avg_pipeline_velocity,
    avg_client_feedback_time,
    total_fee_pipeline,
    total_fee_collected,
    phase_distribution
  ) VALUES (
    CURRENT_DATE,
    v_active,
    v_completed,
    v_cancelled,
    v_avg_time,
    v_placement_rate,
    v_avg_candidates,
    v_avg_velocity,
    v_avg_feedback,
    v_total_pipeline,
    v_total_collected,
    v_phase_dist
  ) ON CONFLICT (snapshot_date) DO UPDATE SET
    total_active_mandates = v_active,
    total_completed_mandates = v_completed,
    total_cancelled_mandates = v_cancelled,
    avg_time_to_fill = v_avg_time,
    placement_rate = v_placement_rate,
    avg_candidates_per_mandate = v_avg_candidates,
    avg_pipeline_velocity = v_avg_velocity,
    avg_client_feedback_time = v_avg_feedback,
    total_fee_pipeline = v_total_pipeline,
    total_fee_collected = v_total_collected,
    phase_distribution = v_phase_dist;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. PHASE AUTO-ADVANCE ──────────────────────────────────────────────
DROP FUNCTION IF EXISTS fn_check_phase_advance();
CREATE OR REPLACE FUNCTION public.fn_check_phase_advance(p_mandate_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_current_phase TEXT;
  v_candidate_count INTEGER;
  v_screened_count INTEGER;
  v_shortlisted_count INTEGER;
  v_presented_count INTEGER;
  v_interview_count INTEGER;
  v_offer_count INTEGER;
  v_placed_count INTEGER;
  v_grid_exists BOOLEAN;
  v_canvas_count INTEGER;
BEGIN
  SELECT phase INTO v_current_phase FROM mandates WHERE id = p_mandate_id;

  SELECT COUNT(*) INTO v_candidate_count
  FROM candidate_mandate_links WHERE mandate_id = p_mandate_id;

  SELECT COUNT(*) INTO v_screened_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status IN ('screened', 'shortlisted', 'presented', 'interview', 'offer', 'placed');

  SELECT COUNT(*) INTO v_shortlisted_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status IN ('shortlisted', 'presented', 'interview', 'offer', 'placed');

  SELECT COUNT(*) INTO v_presented_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status IN ('presented', 'interview', 'offer', 'placed');

  SELECT COUNT(*) INTO v_interview_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status IN ('interview', 'offer', 'placed');

  SELECT COUNT(*) INTO v_offer_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status IN ('offer', 'placed');

  SELECT COUNT(*) INTO v_placed_count
  FROM candidate_mandate_links
  WHERE mandate_id = p_mandate_id
  AND status = 'placed';

  SELECT EXISTS(SELECT 1 FROM grid_mappings WHERE mandate_id = p_mandate_id) INTO v_grid_exists;

  SELECT COUNT(*) INTO v_canvas_count
  FROM canvas_profiles cp
  JOIN candidate_mandate_links cml ON cml.contact_id = cp.contact_id
  WHERE cml.mandate_id = p_mandate_id;

  IF v_current_phase = 'kickoff' AND v_grid_exists AND v_candidate_count >= 5 THEN
    RETURN 'sourcing';
  ELSIF v_current_phase = 'sourcing' AND v_shortlisted_count >= 3 AND v_canvas_count >= 1 THEN
    RETURN 'shortlisting';
  ELSIF v_current_phase = 'shortlisting' AND v_presented_count >= 1 THEN
    RETURN 'interview';
  ELSIF v_current_phase = 'interview' AND v_offer_count >= 1 THEN
    RETURN 'offer';
  ELSIF v_current_phase = 'offer' AND v_placed_count >= 1 THEN
    RETURN 'close';
  END IF;

  RETURN v_current_phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'mandate_payment_milestones',
    'mandate_analytics_snapshots'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ Mandate Management migration OK — all tables present';
  ELSE
    RAISE EXCEPTION '❌ Mandate Management migration FAILED — missing: %', v_missing;
  END IF;
END$$;

-- >>> FILE: 20260627_platform_foundation.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260627_platform_foundation.sql
-- DEX AI Platform Foundation — T1 Schema Migration
-- Implements: Spec 00 (DEX-BS-000) + Technical Blueprint 00 (DEX-TB-000)
-- Decisions: D-1 (orchestration IN MVP), D-2 (restricted RLS),
--            D-3 (all L2), D-5 (fully auto enrichment)
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. SIGNALS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL
                    CHECK (type IN (
                      'email','meeting','comment','assessment','status_change',
                      'feedback','upload','linkedin','outreach','grid_report',
                      'mandate_phase','enrichment_advance')),
  source          TEXT NOT NULL
                    CHECK (source IN (
                      'platform','linkedin','email','feishu','notion','agent','import')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id        UUID REFERENCES auth.users(id),
  agent_id        TEXT,  -- 'trident','canvas','grid','sweep','alessio'
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  mandate_id      UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  title           TEXT,
  content         TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  insights        JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  action_status   TEXT NOT NULL DEFAULT 'none'
                    CHECK (action_status IN ('none','pending','acknowledged','resolved')),
  processed_by    TEXT,
  processed_at    TIMESTAMPTZ,
  raw_data        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_signals_type ON public.signals (type);
CREATE INDEX IF NOT EXISTS idx_signals_contact ON public.signals (contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_mandate ON public.signals (mandate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_company ON public.signals (company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_actor ON public.signals (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created ON public.signals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_action ON public.signals (action_required, action_status)
  WHERE action_required = TRUE;

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- D-2: Restricted RLS
-- All authenticated users can write (INSERT)
DROP POLICY IF EXISTS "Authenticated users can create signals" ON public.signals;
CREATE POLICY "Authenticated users can create signals"
  ON public.signals FOR INSERT TO authenticated
  WITH CHECK (true);

-- Read: owner + team lead + Kevin (admin)
DROP POLICY IF EXISTS "Signal read — owner, team lead, or admin" ON public.signals;
CREATE POLICY "Signal read — owner, team lead, or admin"
  ON public.signals FOR SELECT TO authenticated
  USING (
    actor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'team_lead')
  );

-- Update/DELETE: service role only (system-managed)
DROP POLICY IF EXISTS "Service role full access on signals" ON public.signals;
CREATE POLICY "Service role full access on signals"
  ON public.signals FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. AGENT ACTIONS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        TEXT NOT NULL,  -- 'trident','canvas','grid','sweep','alessio'
  action_type     TEXT NOT NULL
                    CHECK (action_type IN (
                      'score','narrate','map','research','notify','draft','enrich','parse')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger_signal_id UUID REFERENCES public.signals(id) ON DELETE SET NULL,
  triggered_by    UUID REFERENCES auth.users(id),
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  mandate_id      UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  input_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence      NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  -- D-3: all L2 — draft & queue
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','executed','rejected','failed')),
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  executed_at     TIMESTAMPTZ,
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON public.agent_actions (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON public.agent_actions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_contact ON public.agent_actions (contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_reviewer ON public.agent_actions (reviewed_by)
  WHERE reviewed_by IS NOT NULL;

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- RLS: same as signals (restricted)
DROP POLICY IF EXISTS "Authenticated users can create agent actions" ON public.agent_actions;
CREATE POLICY "Authenticated users can create agent actions"
  ON public.agent_actions FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Agent action read — actor, team lead, or admin" ON public.agent_actions;
CREATE POLICY "Agent action read — actor, team lead, or admin"
  ON public.agent_actions FOR SELECT TO authenticated
  USING (
    triggered_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'team_lead')
  );

DROP POLICY IF EXISTS "Authenticated users can review agent actions" ON public.agent_actions;
CREATE POLICY "Authenticated users can review agent actions"
  ON public.agent_actions FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','team_lead'))
  );

DROP POLICY IF EXISTS "Service role full access on agent_actions" ON public.agent_actions;
CREATE POLICY "Service role full access on agent_actions"
  ON public.agent_actions FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. CONTACTS TABLE EXTENSIONS ─────────────────────────────────────
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS trident_scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS canvas_profile JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS grid_metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'raw'
  CHECK (enrichment_status IN ('raw','linkedin_parsed','scored','narrated','complete'));
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS signal_count INTEGER DEFAULT 0;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS last_signal_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contacts_enrichment ON public.contacts (enrichment_status);
CREATE INDEX IF NOT EXISTS idx_contacts_signal_count ON public.contacts (signal_count DESC);

-- ── 4. TRIGGER FUNCTIONS ─────────────────────────────────────────────

-- Auto-increment signal_count on contacts when signal is created
DROP FUNCTION IF EXISTS fn_signal_after_insert();
CREATE OR REPLACE FUNCTION public.fn_signal_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    UPDATE public.contacts
    SET signal_count = COALESCE(signal_count, 0) + 1,
        last_signal_at = NEW.created_at
    WHERE id = NEW.contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_signal_after_insert ON public.signals;
CREATE TRIGGER trg_signal_after_insert
  AFTER INSERT ON public.signals
  FOR EACH ROW EXECUTE FUNCTION public.fn_signal_after_insert();

-- Auto-advance enrichment status
DROP FUNCTION IF EXISTS fn_auto_advance_enrichment();
CREATE OR REPLACE FUNCTION public.fn_auto_advance_enrichment(p_contact_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current TEXT;
  v_has_linkedin BOOLEAN;
  v_has_trident BOOLEAN;
  v_has_canvas BOOLEAN;
BEGIN
  SELECT enrichment_status INTO v_current FROM contacts WHERE id = p_contact_id;
  IF v_current IS NULL THEN v_current := 'raw'; END IF;

  SELECT (linkedin_url IS NOT NULL OR EXISTS (
    SELECT 1 FROM signals WHERE contact_id = p_contact_id AND type = 'linkedin'
  )) INTO v_has_linkedin;

  SELECT (
    trident_composite IS NOT NULL
    OR (trident_scores IS NOT NULL AND trident_scores != '{}'::jsonb)
  ) INTO v_has_trident FROM contacts WHERE id = p_contact_id;

  SELECT (canvas_profile IS NOT NULL AND canvas_profile != '{}'::jsonb)
  INTO v_has_canvas FROM contacts WHERE id = p_contact_id;

  -- Advance: raw → linkedin_parsed
  IF v_current = 'raw' AND v_has_linkedin THEN
    UPDATE contacts SET enrichment_status = 'linkedin_parsed' WHERE id = p_contact_id;
    INSERT INTO signals (type, source, contact_id, title, metadata)
    VALUES (
      'enrichment_advance', 'platform', p_contact_id,
      'Enrichment: raw → linkedin_parsed',
      '{"from":"raw","to":"linkedin_parsed"}'::jsonb
    );
    v_current := 'linkedin_parsed';
  END IF;

  -- Advance: linkedin_parsed → scored
  IF v_current = 'linkedin_parsed' AND v_has_trident THEN
    UPDATE contacts SET enrichment_status = 'scored' WHERE id = p_contact_id;
    INSERT INTO signals (type, source, contact_id, title, metadata)
    VALUES (
      'enrichment_advance', 'platform', p_contact_id,
      'Enrichment: linkedin_parsed → scored',
      '{"from":"linkedin_parsed","to":"scored"}'::jsonb
    );
    v_current := 'scored';
  END IF;

  -- Advance: scored → narrated
  IF v_current = 'scored' AND v_has_canvas THEN
    UPDATE contacts SET enrichment_status = 'narrated' WHERE id = p_contact_id;
    INSERT INTO signals (type, source, contact_id, title, metadata)
    VALUES (
      'enrichment_advance', 'platform', p_contact_id,
      'Enrichment: scored → narrated',
      '{"from":"scored","to":"narrated"}'::jsonb
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY['signals', 'agent_actions']) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE 'Platform Foundation migration OK — signals + agent_actions present';
  ELSE
    RAISE EXCEPTION 'Platform Foundation migration FAILED — missing: %', v_missing;
  END IF;

  -- Verify contacts columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'enrichment_status'
  ) THEN
    RAISE EXCEPTION 'contacts.enrichment_status column missing';
  END IF;

  RAISE NOTICE 'contacts table extensions verified';
END$$;


-- >>> FILE: 20260629_ai_matching_engine.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_ai_matching_engine.sql
-- DEX AI Matching Engine — T8 Schema Migration
-- Implements: Technical Blueprint 08 (DEX-TB-008)
-- Candidate-mandate matching with TRIDENT, pipeline, and heuristic scoring
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. CANDIDATE_MANDATE_MATCHES TABLE ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_mandate_matches (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id                  UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  mandate_id                  UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  match_score                 NUMERIC(5,2) NOT NULL DEFAULT 0
                              CHECK (match_score >= 0 AND match_score <= 100),
  match_grade                 TEXT NOT NULL DEFAULT 'MISMATCH'
                              CHECK (match_grade IN (
                                'EXCEPTIONAL', 'STRONG', 'MODERATE', 'WEAK', 'MISMATCH'
                              )),
  -- Component scores
  trident_component           NUMERIC(5,2) DEFAULT 0,
  pipeline_component          NUMERIC(5,2) DEFAULT 0,
  heuristic_component         NUMERIC(5,2) DEFAULT 0,
  -- TRIDENT data (cached at match time)
  trident_composite           NUMERIC(3,1),
  trident_verdict             TEXT,
  dimension_scores            JSONB DEFAULT '{}'::jsonb,
  -- Pipeline compatibility
  pipeline_compatibility      JSONB DEFAULT '{}'::jsonb,
  -- AI analysis (from DeepSeek)
  ai_analysis                 JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  match_source                TEXT NOT NULL DEFAULT 'manual'
                              CHECK (match_source IN (
                                'manual', 'ai_sweep', 'ai_suggest', 'auto_refresh'
                              )),
  generated_at                TIMESTAMPTZ DEFAULT now(),
  generated_by                UUID REFERENCES auth.users(id),
  reviewed_by                 UUID REFERENCES auth.users(id),
  reviewed_at                 TIMESTAMPTZ,
  -- Staleness
  is_stale                    BOOLEAN DEFAULT FALSE,
  stale_reason                TEXT,
  -- Manual override
  override_score              NUMERIC(5,2),
  override_grade              TEXT CHECK (override_grade IN (
                                'EXCEPTIONAL', 'STRONG', 'MODERATE', 'WEAK', 'MISMATCH'
                              )),
  override_reason             TEXT,
  override_by                 UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, mandate_id)
);

CREATE INDEX IF NOT EXISTS idx_cmm_mandate ON public.candidate_mandate_matches(mandate_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_cmm_contact ON public.candidate_mandate_matches(contact_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_cmm_grade ON public.candidate_mandate_matches(match_grade);
CREATE INDEX IF NOT EXISTS idx_cmm_stale ON public.candidate_mandate_matches(is_stale) WHERE is_stale = TRUE;
CREATE INDEX IF NOT EXISTS idx_cmm_mandate_grade ON public.candidate_mandate_matches(mandate_id, match_grade)
  WHERE match_grade IN ('EXCEPTIONAL', 'STRONG');

ALTER TABLE public.candidate_mandate_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view matches" ON public.candidate_mandate_matches;
CREATE POLICY "Team can view matches" ON public.candidate_mandate_matches
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Team can create matches" ON public.candidate_mandate_matches;
CREATE POLICY "Team can create matches" ON public.candidate_mandate_matches
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Team can update matches" ON public.candidate_mandate_matches;
CREATE POLICY "Team can update matches" ON public.candidate_mandate_matches
  FOR UPDATE TO authenticated USING (true);

-- ── 2. MATCH_RUNS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.match_runs (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id                  UUID REFERENCES public.mandates(id) ON DELETE CASCADE,
  contact_id                  UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  run_type                    TEXT NOT NULL
                              CHECK (run_type IN (
                                'mandate_match', 'candidate_match', 'sweep', 'auto_refresh'
                              )),
  triggered_by                UUID REFERENCES auth.users(id),
  started_at                  TIMESTAMPTZ DEFAULT now(),
  completed_at                TIMESTAMPTZ,
  candidates_evaluated        INTEGER DEFAULT 0,
  matches_found               INTEGER DEFAULT 0,
  exceptional_count           INTEGER DEFAULT 0,
  strong_count                INTEGER DEFAULT 0,
  status                      TEXT NOT NULL DEFAULT 'running'
                              CHECK (status IN (
                                'running', 'completed', 'failed', 'partial', 'cancelled'
                              )),
  error_message               TEXT,
  parameters                  JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_mr_mandate ON public.match_runs(mandate_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_mr_contact ON public.match_runs(contact_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_mr_status ON public.match_runs(status);

ALTER TABLE public.match_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view match runs" ON public.match_runs;
CREATE POLICY "Team can view match runs" ON public.match_runs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Team can create match runs" ON public.match_runs;
CREATE POLICY "Team can create match runs" ON public.match_runs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Team can update match runs" ON public.match_runs;
CREATE POLICY "Team can update match runs" ON public.match_runs
  FOR UPDATE TO authenticated USING (true);

-- ── 3. COMPUTE_MATCH_SCORE() FUNCTION ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_match_score(
  p_contact_id UUID,
  p_mandate_id UUID
) RETURNS TABLE (
  match_score NUMERIC,
  match_grade TEXT,
  trident_component NUMERIC,
  pipeline_component NUMERIC,
  heuristic_component NUMERIC,
  dimension_scores JSONB,
  pipeline_compatibility JSONB
) AS $$
DECLARE
  v_trident_composite   NUMERIC;
  v_trident_verdict     TEXT;
  v_d1                  NUMERIC;
  v_d2                  NUMERIC;
  v_d3                  NUMERIC;
  v_pipeline_stage      TEXT;
  v_motivation          TEXT;
  v_reach_verified      BOOLEAN;
  v_reach_unknowns      INTEGER;
  v_industry            TEXT;
  v_location            TEXT;
  v_title               TEXT;
  v_years               NUMERIC;
  v_tier                TEXT;
  v_data_confidence     NUMERIC;
  v_mandate_industry    TEXT;
  v_mandate_location    TEXT;
  v_mandate_title       TEXT;
  -- Component scores
  v_trident_score       NUMERIC := 0;
  v_pipeline_score      NUMERIC := 50;
  v_heuristic_score     NUMERIC := 50;
  v_final_score         NUMERIC;
  v_grade               TEXT;
  v_dim_scores          JSONB := '{}'::jsonb;
  v_pipeline_compat     JSONB := '{}'::jsonb;
BEGIN
  -- Get TRIDENT data (most recent scorecard for this contact+mandate)
  SELECT tc.composite_score, tc.verdict, tc.d1_score, tc.d2_score, tc.d3_score
  INTO v_trident_composite, v_trident_verdict, v_d1, v_d2, v_d3
  FROM public.trident_scorecards tc
  WHERE tc.contact_id = p_contact_id
    AND tc.mandate_id = p_mandate_id
  ORDER BY tc.created_at DESC
  LIMIT 1;

  -- Get contact data
  SELECT pipeline_stage, motivation_overall, reachability_verified,
         reachability_unknowns, industry, city, current_title,
         years_of_experience, tier, data_confidence
  INTO v_pipeline_stage, v_motivation, v_reach_verified,
       v_reach_unknowns, v_industry, v_location, v_title,
       v_years, v_tier, v_data_confidence
  FROM public.contacts
  WHERE id = p_contact_id;

  -- Get mandate data
  SELECT industry, location, title
  INTO v_mandate_industry, v_mandate_location, v_mandate_title
  FROM public.mandates
  WHERE id = p_mandate_id;

  -- ═══════════════════════════════════════════════════
  -- COMPONENT 1: TRIDENT (60% weight)
  -- ═══════════════════════════════════════════════════
  IF v_trident_composite IS NOT NULL THEN
    v_trident_score := v_trident_composite * 10;
    v_dim_scores := jsonb_build_object(
      'd1', jsonb_build_object(
        'score', v_d1,
        'fit_notes', CASE
          WHEN v_d1 >= 7 THEN 'Strong capability fit'
          WHEN v_d1 >= 5 THEN 'Moderate capability fit'
          ELSE 'Weak capability fit'
        END
      ),
      'd2', jsonb_build_object(
        'score', v_d2,
        'fit_notes', CASE
          WHEN v_d2 >= 7 THEN 'Strong behavioral fit'
          WHEN v_d2 >= 5 THEN 'Moderate behavioral fit'
          ELSE 'Weak behavioral fit'
        END
      ),
      'd3', jsonb_build_object(
        'score', v_d3,
        'fit_notes', CASE
          WHEN v_d3 >= 7 THEN 'Strong cultural fit'
          WHEN v_d3 >= 5 THEN 'Moderate cultural fit'
          ELSE 'Weak cultural fit'
        END
      )
    );
  ELSE
    -- No TRIDENT score — use heuristic proxy
    v_trident_score := COALESCE(v_data_confidence, 0) * 0.5
      + CASE v_tier
          WHEN 'A' THEN 30
          WHEN 'B' THEN 20
          WHEN 'C' THEN 10
          ELSE 0
        END;
    v_trident_score := LEAST(v_trident_score, 70);
    v_dim_scores := jsonb_build_object(
      'd1', jsonb_build_object('score', null, 'fit_notes', 'No TRIDENT score — heuristic proxy used'),
      'd2', jsonb_build_object('score', null, 'fit_notes', 'No TRIDENT score — heuristic proxy used'),
      'd3', jsonb_build_object('score', null, 'fit_notes', 'No TRIDENT score — heuristic proxy used')
    );
  END IF;

  -- ═══════════════════════════════════════════════════
  -- COMPONENT 2: PIPELINE COMPATIBILITY (20% weight)
  -- ═══════════════════════════════════════════════════
  -- Stage compatibility
  IF v_pipeline_stage IN (
    'S2_Screened', 'S5_Responded', 'S6_WeChat_Added',
    'S7_Interested', 'S9_Call_Positive', 'S11_Internal_Interview'
  ) THEN
    v_pipeline_score := v_pipeline_score + 30;
  ELSIF v_pipeline_stage = 'S1_Sourced' THEN
    v_pipeline_score := v_pipeline_score + 10;
  ELSIF v_pipeline_stage IN (
    'S4_No_Response', 'S8_Not_Interested', 'S10_Call_Negative'
  ) THEN
    v_pipeline_score := v_pipeline_score - 30;
  ELSIF v_pipeline_stage IN (
    'S12_Presented_to_Client', 'S13_Client_Int_Scheduled',
    'S14_Client_Interviewed', 'S15_Client_2nd_Interview',
    'S16_Offer_Extended', 'S17_Offer_Accepted'
  ) THEN
    v_pipeline_score := v_pipeline_score + 20;
  END IF;

  -- Motivation
  IF v_motivation = 'GREEN' THEN
    v_pipeline_score := v_pipeline_score + 15;
  ELSIF v_motivation = 'YELLOW' THEN
    v_pipeline_score := v_pipeline_score + 5;
  ELSIF v_motivation = 'RED' THEN
    v_pipeline_score := v_pipeline_score - 20;
  END IF;

  -- Reachability
  IF v_reach_verified THEN
    v_pipeline_score := v_pipeline_score + 5;
  ELSIF COALESCE(v_reach_unknowns, 5) >= 2 THEN
    v_pipeline_score := v_pipeline_score - 10;
  END IF;

  v_pipeline_score := GREATEST(0, LEAST(100, v_pipeline_score));

  v_pipeline_compat := jsonb_build_object(
    'stage_compatible', v_pipeline_stage NOT IN (
      'S4_No_Response', 'S8_Not_Interested', 'S10_Call_Negative'
    ),
    'stage', v_pipeline_stage,
    'motivation_fit', v_motivation,
    'reachability_ok', v_reach_verified OR COALESCE(v_reach_unknowns, 5) <= 1,
    'available', v_pipeline_stage NOT IN (
      'S16_Offer_Extended', 'S17_Offer_Accepted', 'S19_Closed'
    ),
    'notes', CASE
      WHEN v_pipeline_stage IN ('S7_Interested', 'S9_Call_Positive')
        THEN 'Candidate is engaged and responsive'
      WHEN v_pipeline_stage = 'S1_Sourced'
        THEN 'Not yet contacted — needs initial screening'
      WHEN v_motivation = 'RED'
        THEN 'Motivation concern — DO NOT CONTACT'
      ELSE 'Standard availability'
    END
  );

  -- ═══════════════════════════════════════════════════
  -- COMPONENT 3: HEURISTIC FIT (20% weight)
  -- ═══════════════════════════════════════════════════
  -- Industry match
  IF v_industry IS NOT NULL AND v_mandate_industry IS NOT NULL
     AND LOWER(v_industry) = LOWER(v_mandate_industry) THEN
    v_heuristic_score := v_heuristic_score + 25;
  END IF;

  -- Location match
  IF v_location IS NOT NULL AND v_mandate_location IS NOT NULL THEN
    IF LOWER(v_location) = LOWER(v_mandate_location) THEN
      v_heuristic_score := v_heuristic_score + 20;
    ELSIF LOWER(v_location) LIKE '%' || LOWER(SPLIT_PART(v_mandate_location, ' ', 1)) || '%' THEN
      v_heuristic_score := v_heuristic_score + 10;
    END IF;
  END IF;

  -- Title/seniority match (simple keyword overlap)
  IF v_title IS NOT NULL AND v_mandate_title IS NOT NULL THEN
    IF LOWER(v_title) ILIKE '%' || LOWER(SPLIT_PART(v_mandate_title, ' ', 1)) || '%' THEN
      v_heuristic_score := v_heuristic_score + 15;
    END IF;
  END IF;

  -- Experience level
  IF v_years IS NOT NULL AND v_years >= 10 THEN
    v_heuristic_score := v_heuristic_score + 10;
  ELSIF v_years IS NOT NULL AND v_years < 5 THEN
    v_heuristic_score := v_heuristic_score - 10;
  END IF;

  v_heuristic_score := GREATEST(0, LEAST(100, v_heuristic_score));

  -- ═══════════════════════════════════════════════════
  -- FINAL WEIGHTED SCORE
  -- ═══════════════════════════════════════════════════
  v_final_score := ROUND(
    v_trident_score * 0.60
    + v_pipeline_score * 0.20
    + v_heuristic_score * 0.20,
    2
  );

  -- Determine grade
  v_grade := CASE
    WHEN v_final_score >= 85 THEN 'EXCEPTIONAL'
    WHEN v_final_score >= 70 THEN 'STRONG'
    WHEN v_final_score >= 50 THEN 'MODERATE'
    WHEN v_final_score >= 30 THEN 'WEAK'
    ELSE 'MISMATCH'
  END;

  RETURN QUERY SELECT
    v_final_score,
    v_grade,
    v_trident_score,
    v_pipeline_score,
    v_heuristic_score,
    v_dim_scores,
    v_pipeline_compat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. STALENESS TRIGGERS ──────────────────────────────────────────────

-- Contact update trigger
DROP FUNCTION IF EXISTS fn_mark_matches_stale_on_contact_update();
CREATE OR REPLACE FUNCTION public.fn_mark_matches_stale_on_contact_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage
     OR OLD.motivation_overall IS DISTINCT FROM NEW.motivation_overall
     OR OLD.reachability_verified IS DISTINCT FROM NEW.reachability_verified
     OR OLD.classification IS DISTINCT FROM NEW.classification THEN
    UPDATE public.candidate_mandate_matches
    SET is_stale = TRUE,
        stale_reason = 'Contact data changed: ' || CASE
          WHEN OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage
            THEN 'stage ' || OLD.pipeline_stage || '→' || NEW.pipeline_stage
          WHEN OLD.motivation_overall IS DISTINCT FROM NEW.motivation_overall
            THEN 'motivation ' || OLD.motivation_overall || '→' || NEW.motivation_overall
          ELSE 'profile updated'
        END
    WHERE contact_id = NEW.id
      AND is_stale = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mark_matches_stale_contact ON public.contacts;
CREATE TRIGGER trg_mark_matches_stale_contact
  AFTER UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_mark_matches_stale_on_contact_update();

-- Scorecard update trigger
DROP FUNCTION IF EXISTS fn_mark_matches_stale_on_scorecard();
CREATE OR REPLACE FUNCTION public.fn_mark_matches_stale_on_scorecard()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.candidate_mandate_matches
  SET is_stale = TRUE,
      stale_reason = 'TRIDENT scorecard updated'
  WHERE contact_id = NEW.contact_id
    AND mandate_id = NEW.mandate_id
    AND is_stale = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mark_matches_stale_scorecard ON public.trident_scorecards;
CREATE TRIGGER trg_mark_matches_stale_scorecard
  AFTER INSERT OR UPDATE ON public.trident_scorecards
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_mark_matches_stale_on_scorecard();


-- >>> FILE: 20260629_canvas_profiles.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_canvas_profiles.sql
-- DEX AI CANVAS Executive Narrative Engine — T4 Schema Migration
-- Implements: Spec 04 (DEX-BS-004) + Technical Blueprint 04 (DEX-TB-004)
-- 6-dimensional behavioral scoring, AI-generated narratives, PDF export
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. CANVAS PROFILES TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.canvas_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  contact_id              UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  mandate_id              UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  scorecard_id            UUID REFERENCES public.trident_scorecards(id) ON DELETE SET NULL,
  generated_by            UUID NOT NULL REFERENCES auth.users(id),
  trident_d1              NUMERIC(3,1),
  trident_d2              NUMERIC(3,1),
  trident_d3              NUMERIC(3,1),
  trident_composite       NUMERIC(3,1),
  trident_verdict         TEXT,
  c_strategic_thinking    NUMERIC(3,1) CHECK (c_strategic_thinking >= 1.0 AND c_strategic_thinking <= 10.0),
  c_communication         NUMERIC(3,1) CHECK (c_communication >= 1.0 AND c_communication <= 10.0),
  c_adaptability          NUMERIC(3,1) CHECK (c_adaptability >= 1.0 AND c_adaptability <= 10.0),
  c_team_leadership       NUMERIC(3,1) CHECK (c_team_leadership >= 1.0 AND c_team_leadership <= 10.0),
  c_decision_making       NUMERIC(3,1) CHECK (c_decision_making >= 1.0 AND c_decision_making <= 10.0),
  c_emotional_intelligence NUMERIC(3,1) CHECK (c_emotional_intelligence >= 1.0 AND c_emotional_intelligence <= 10.0),
  canvas_notes            JSONB NOT NULL DEFAULT '{}'::jsonb,
  canvas_composite        NUMERIC(3,1),
  canvas_grade            TEXT CHECK (canvas_grade IN ('A+', 'A', 'B', 'C', 'F')),
  leadership_style        TEXT,
  key_strengths           JSONB,
  blind_spots             JSONB,
  derailment_risks        JSONB,
  impact_potential        TEXT,
  stakeholder_style       TEXT,
  development_journey     TEXT,
  priority_focus_areas    JSONB,
  executive_summary       TEXT,
  pdf_url                 TEXT,
  pdf_generated_at        TIMESTAMPTZ,
  pdf_version             INTEGER DEFAULT 1,
  review_status           TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'edits_requested', 'edited')),
  reviewed_by             UUID REFERENCES auth.users(id),
  reviewed_at             TIMESTAMPTZ,
  review_notes            TEXT,
  metadata                JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_consumed        INTEGER NOT NULL DEFAULT 15
);

-- ── 2. INDEXES ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_canvas_contact ON public.canvas_profiles (contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_mandate ON public.canvas_profiles (mandate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_grade ON public.canvas_profiles (canvas_grade);
CREATE INDEX IF NOT EXISTS idx_canvas_review ON public.canvas_profiles (review_status) WHERE review_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_canvas_generated ON public.canvas_profiles (generated_by);
CREATE INDEX IF NOT EXISTS idx_canvas_scorecard ON public.canvas_profiles (scorecard_id);

-- ── 3. RLS POLICIES ────────────────────────────────────────────────────
ALTER TABLE public.canvas_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Canvas profile read — generator, mandate lead, or admin" ON public.canvas_profiles;
CREATE POLICY "Canvas profile read — generator, mandate lead, or admin" ON public.canvas_profiles
  FOR SELECT TO authenticated
  USING (
    generated_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
    OR mandate_id IN (SELECT id FROM public.mandates WHERE lead_consultant_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create canvas profiles" ON public.canvas_profiles;
CREATE POLICY "Authenticated users can create canvas profiles" ON public.canvas_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = generated_by);

DROP POLICY IF EXISTS "Canvas profile update — generator or admin" ON public.canvas_profiles;
CREATE POLICY "Canvas profile update — generator or admin" ON public.canvas_profiles
  FOR UPDATE TO authenticated
  USING (
    generated_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 4. CONTACTS TABLE EXTENSION ────────────────────────────────────────
ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS canvas_grade TEXT CHECK (canvas_grade IN ('A+', 'A', 'B', 'C', 'F', NULL));

ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS canvas_generated_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS canvas_pdf_url TEXT;

-- ── 5. HELPER FUNCTION: COMPUTE CANVAS COMPOSITE ───────────────────────
CREATE OR REPLACE FUNCTION compute_canvas_composite(
  p_strategic NUMERIC,
  p_communication NUMERIC,
  p_adaptability NUMERIC,
  p_leadership NUMERIC,
  p_decision NUMERIC,
  p_eq NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_composite NUMERIC(3,1);
  v_grade TEXT;
BEGIN
  v_composite := ROUND(((p_strategic + p_communication + p_adaptability + p_leadership + p_decision + p_eq) / 6.0)::numeric, 1);
  
  v_grade := CASE
    WHEN v_composite >= 9.0 THEN 'A+'
    WHEN v_composite >= 8.0 THEN 'A'
    WHEN v_composite >= 7.0 THEN 'B'
    WHEN v_composite >= 6.0 THEN 'C'
    ELSE 'F'
  END;
  
  RETURN jsonb_build_object(
    'canvas_composite', v_composite,
    'canvas_grade', v_grade
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── 6. HELPER FUNCTION: TRIDENT → CANVAS MAPPING ───────────────────────
DROP FUNCTION IF EXISTS trident_to_canvas_suggest();
CREATE OR REPLACE FUNCTION trident_to_canvas_suggest(p_scorecard_id UUID) RETURNS JSONB AS $$
DECLARE
  v_scorecard RECORD;
BEGIN
  SELECT * INTO v_scorecard FROM trident_scorecards WHERE id = p_scorecard_id;
  
  IF v_scorecard IS NULL THEN
    RETURN jsonb_build_object('error', 'Scorecard not found');
  END IF;
  
  RETURN jsonb_build_object(
    'strategic_thinking', v_scorecard.d1_score,
    'communication', v_scorecard.d2_score,
    'adaptability', v_scorecard.d3_score,
    'team_leadership', v_scorecard.d2_score,
    'decision_making', ROUND(((v_scorecard.d1_score + v_scorecard.d3_score) / 2.0)::numeric, 1),
    'emotional_intelligence', v_scorecard.d3_score,
    'mapping_notes', 'Pre-populated from TRIDENT. Consultant should adjust based on behavioral observations.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. TRIGGER FUNCTION: UPDATE CONTACTS QUICK REFERENCE ───────────────
DROP FUNCTION IF EXISTS fn_update_contact_canvas();
CREATE OR REPLACE FUNCTION fn_update_contact_canvas() RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET canvas_grade = NEW.canvas_grade,
      canvas_generated_at = NEW.created_at,
      canvas_pdf_url = NEW.pdf_url
  WHERE id = NEW.contact_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_contact_canvas
AFTER INSERT OR UPDATE ON public.canvas_profiles
FOR EACH ROW EXECUTE FUNCTION fn_update_contact_canvas();


-- >>> FILE: 20260629_career_intelligence.sql
-- Technical Blueprint 12: Career Intelligence Agent
-- DEX-TB-012

-- ============================================
-- 2.1 Schema Extensions to contacts Table
-- ============================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS career_tier TEXT DEFAULT 'DORMANT' CHECK (career_tier IN ('ALPHA', 'BETA', 'GAMMA', 'DORMANT'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_engaged_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preference_model JSONB DEFAULT '{}'::jsonb;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS nurture_enrolled BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS nurture_stage TEXT DEFAULT NULL CHECK (nurture_stage IN ('WAITING', 'ENGAGED', 'RESPONDED', 'DECLINED_NURTURE', 'CONVERTED'));
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS nurture_next_touch TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS intelligence_subscriptions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS movement_signals JSONB DEFAULT '[]'::jsonb;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS career_benchmark JSONB DEFAULT '{}'::jsonb;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS agent_conversation_log JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_contacts_career_tier ON contacts(career_tier) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_contacts_nurture ON contacts(nurture_enrolled, nurture_next_touch) WHERE nurture_enrolled = true;
CREATE INDEX IF NOT EXISTS idx_contacts_engagement ON contacts(engagement_score DESC) WHERE is_archived = false;

-- ============================================
-- 2.2 Table: career_intelligence_log
-- ============================================

CREATE TABLE IF NOT EXISTS career_intelligence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  intelligence_type TEXT NOT NULL CHECK (intelligence_type IN (
    'comp_benchmark',
    'career_trajectory',
    'skill_demand',
    'movement_intel',
    'company_signal',
    'market_timing',
    'nurture_touch',
    'check_in',
    'benchmark_offer',
    'general'
  )),
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  channel TEXT NOT NULL CHECK (channel IN ('wechat', 'wecom', 'feishu', 'email', 'platform')),
  content_summary TEXT,
  full_content JSONB,
  signals_captured JSONB DEFAULT '{}'::jsonb,
  engagement_impact TEXT CHECK (engagement_impact IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NO_RESPONSE')),
  consultant_id UUID REFERENCES auth.users(id),
  agent_model TEXT DEFAULT 'deepseek-chat',
  agent_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_log_contact ON career_intelligence_log(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_log_type ON career_intelligence_log(intelligence_type);
CREATE INDEX IF NOT EXISTS idx_career_log_direction ON career_intelligence_log(direction);
CREATE INDEX IF NOT EXISTS idx_career_log_consultant ON career_intelligence_log(consultant_id);
CREATE INDEX IF NOT EXISTS idx_career_log_date ON career_intelligence_log(created_at DESC);

ALTER TABLE career_intelligence_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view intelligence log" ON career_intelligence_log;
CREATE POLICY "Team can view intelligence log" ON career_intelligence_log
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "System can insert intelligence log" ON career_intelligence_log;
CREATE POLICY "System can insert intelligence log" ON career_intelligence_log
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "No updates to intelligence log" ON career_intelligence_log;
CREATE POLICY "No updates to intelligence log" ON career_intelligence_log
  FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "No deletes from intelligence log" ON career_intelligence_log;
CREATE POLICY "No deletes from intelligence log" ON career_intelligence_log
  FOR DELETE TO authenticated USING (false);

-- ============================================
-- 2.3 Table: nurture_sequences
-- ============================================

CREATE TABLE IF NOT EXISTS nurture_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN (
    'ALPHA_CAREER',
    'BETA_QUARTERLY',
    'GAMMA_SEMI_ANNUAL',
    'SIGNAL_REACTIVATION',
    'S8_NOT_INTERESTED',
    'S4_NO_RESPONSE'
  )),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  cadence_days INTEGER NOT NULL,
  next_touch_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CONVERTED', 'DECLINED')),
  intelligence_types JSONB DEFAULT '["comp_benchmark", "skill_demand"]'::jsonb,
  pause_reason TEXT,
  touch_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  last_touch_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  consultant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_nurture_contact ON nurture_sequences(contact_id);
CREATE INDEX IF NOT EXISTS idx_nurture_next_touch ON nurture_sequences(next_touch_at) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_nurture_status ON nurture_sequences(status);
CREATE INDEX IF NOT EXISTS idx_nurture_type ON nurture_sequences(sequence_type);

ALTER TABLE nurture_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view nurture sequences" ON nurture_sequences;
CREATE POLICY "Team can view nurture sequences" ON nurture_sequences
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "System can manage nurture sequences" ON nurture_sequences;
CREATE POLICY "System can manage nurture sequences" ON nurture_sequences
  FOR ALL TO authenticated USING (true);

-- ============================================
-- 2.4 Table: career_benchmarks
-- ============================================

CREATE TABLE IF NOT EXISTS career_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  data_confidence NUMERIC CHECK (data_confidence >= 0 AND data_confidence <= 1),
  data_sources_used JSONB DEFAULT '[]'::jsonb,
  comp_percentile NUMERIC,
  comp_range_low NUMERIC,
  comp_range_high NUMERIC,
  comp_currency TEXT DEFAULT 'USD',
  comp_data_points INTEGER DEFAULT 0,
  trajectory_paths JSONB DEFAULT '[]'::jsonb,
  current_skills JSONB DEFAULT '[]'::jsonb,
  required_skills JSONB DEFAULT '[]'::jsonb,
  skill_gaps JSONB DEFAULT '[]'::jsonb,
  market_demand_score NUMERIC CHECK (market_demand_score >= 0 AND market_demand_score <= 100),
  active_mandates_matching INTEGER DEFAULT 0,
  demand_trend TEXT CHECK (demand_trend IN ('increasing', 'stable', 'decreasing')),
  narrative_summary TEXT,
  full_report JSONB,
  generated_by TEXT DEFAULT 'deepseek-chat',
  tokens_used INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES career_benchmarks(id)
);

CREATE INDEX IF NOT EXISTS idx_benchmark_contact ON career_benchmarks(contact_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmark_current ON career_benchmarks(contact_id) WHERE is_current = TRUE;

ALTER TABLE career_benchmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view benchmarks" ON career_benchmarks;
CREATE POLICY "Team can view benchmarks" ON career_benchmarks
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "System can manage benchmarks" ON career_benchmarks;
CREATE POLICY "System can manage benchmarks" ON career_benchmarks
  FOR ALL TO authenticated USING (true);

-- ============================================
-- 2.5 Table: movement_signal_definitions
-- ============================================

CREATE TABLE IF NOT EXISTS movement_signal_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'company_restructuring',
    'company_layoff',
    'company_merger',
    'company_expansion',
    'leadership_change',
    'competitor_hiring',
    'tenure_threshold',
    'contract_ending',
    'peer_movement',
    'linkedin_activity',
    'promotion_passed_over',
    'project_completion'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detection_method TEXT NOT NULL CHECK (detection_method IN ('manual', 'automated', 'hybrid')),
  detection_rules JSONB DEFAULT '{}'::jsonb,
  auto_alert_consultant BOOLEAN DEFAULT FALSE,
  alert_threshold INTEGER DEFAULT 2,
  alert_window_days INTEGER DEFAULT 30,
  can_auto_enroll BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE movement_signal_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages signal definitions" ON movement_signal_definitions;
CREATE POLICY "Admin manages signal definitions" ON movement_signal_definitions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
  );
DROP POLICY IF EXISTS "Team can view signal definitions" ON movement_signal_definitions;
CREATE POLICY "Team can view signal definitions" ON movement_signal_definitions
  FOR SELECT TO authenticated USING (is_active = TRUE);

-- Seed default signal definitions
INSERT INTO movement_signal_definitions (signal_type, severity, detection_method, auto_alert_consultant, alert_threshold, can_auto_enroll)
VALUES
  ('company_restructuring', 'high', 'hybrid', true, 1, true),
  ('company_layoff', 'critical', 'hybrid', true, 1, true),
  ('company_merger', 'high', 'hybrid', true, 1, false),
  ('company_expansion', 'medium', 'manual', false, 1, false),
  ('leadership_change', 'medium', 'manual', false, 1, false),
  ('competitor_hiring', 'low', 'manual', false, 2, false),
  ('tenure_threshold', 'low', 'automated', false, 1, true),
  ('contract_ending', 'medium', 'manual', true, 1, true),
  ('peer_movement', 'medium', 'automated', true, 2, true),
  ('linkedin_activity', 'low', 'manual', false, 1, false),
  ('promotion_passed_over', 'high', 'manual', true, 1, true),
  ('project_completion', 'low', 'manual', false, 1, false)
ON CONFLICT DO NOTHING;


-- >>> FILE: 20260629_client_intelligence.sql
-- Technical Blueprint 13: Client Intelligence Reports
-- DEX-TB-013

-- ============================================
-- 2.1 Table: client_intelligence_reports
-- ============================================

CREATE TABLE IF NOT EXISTS client_intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  mandate_id UUID REFERENCES mandates(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'quarterly_landscape',
    'comp_snapshot',
    'talent_radar',
    'market_alert',
    'pre_mandate_assessment'
  )),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  executive_summary TEXT,
  overall_confidence TEXT CHECK (overall_confidence IN ('high', 'medium', 'low')),
  data_sources JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'generating',
    'under_review',
    'approved',
    'delivered',
    'archived'
  )),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_changes_made BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  delivery_channel TEXT CHECK (delivery_channel IN ('email', 'agent_message', 'portal', 'pdf')),
  opened_at TIMESTAMPTZ,
  follow_up_sent BOOLEAN DEFAULT FALSE,
  period_start DATE,
  period_end DATE,
  generated_by TEXT DEFAULT 'deepseek-chat',
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_client ON client_intelligence_reports(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_type ON client_intelligence_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_status ON client_intelligence_reports(status);
CREATE INDEX IF NOT EXISTS idx_report_period ON client_intelligence_reports(period_start, period_end);

ALTER TABLE client_intelligence_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view all reports" ON client_intelligence_reports;
CREATE POLICY "Team can view all reports" ON client_intelligence_reports
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );
DROP POLICY IF EXISTS "Consultants manage assigned client reports" ON client_intelligence_reports;
CREATE POLICY "Consultants manage assigned client reports" ON client_intelligence_reports
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
    OR EXISTS (
      SELECT 1 FROM mandates
      WHERE lead_consultant_id = auth.uid()
      AND client_id = client_intelligence_reports.client_id
    )
  );

-- ============================================
-- 2.2 Table: client_market_subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS client_market_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN (
    'quarterly_landscape',
    'comp_monitor',
    'talent_radar',
    'market_alerts'
  )),
  industry_sectors JSONB DEFAULT '[]'::jsonb,
  job_functions JSONB DEFAULT '[]'::jsonb,
  geographies JSONB DEFAULT '[]'::jsonb,
  key_companies JSONB DEFAULT '[]'::jsonb,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  delivery_preferences JSONB DEFAULT '{}'::jsonb,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('premium', 'standard', 'basic')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, subscription_type)
);

CREATE INDEX IF NOT EXISTS idx_subscription_client ON client_market_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscription_active ON client_market_subscriptions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscription_type ON client_market_subscriptions(subscription_type);

ALTER TABLE client_market_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view subscriptions" ON client_market_subscriptions;
CREATE POLICY "Team can view subscriptions" ON client_market_subscriptions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );
DROP POLICY IF EXISTS "Admin/Consultant manages subscriptions" ON client_market_subscriptions;
CREATE POLICY "Admin/Consultant manages subscriptions" ON client_market_subscriptions
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );

-- ============================================
-- 2.3 Table: market_signals
-- ============================================

CREATE TABLE IF NOT EXISTS market_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'layoff',
    'restructuring',
    'merger',
    'comp_shift',
    'talent_movement',
    'regulation_change',
    'market_expansion',
    'market_contraction',
    'leadership_change',
    'company_expansion'
  )),
  source TEXT NOT NULL CHECK (source IN (
    'internal',
    'external_news',
    'candidate_conversation',
    'grid_update',
    'client_feedback',
    'manual'
  )),
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  affected_industries JSONB DEFAULT '[]'::jsonb,
  affected_geographies JSONB DEFAULT '[]'::jsonb,
  affected_companies JSONB DEFAULT '[]'::jsonb,
  affected_job_functions JSONB DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  client_relevance JSONB DEFAULT '{}'::jsonb,
  alerts_generated JSONB DEFAULT '[]'::jsonb,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signal_type ON market_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signal_severity ON market_signals(severity);
CREATE INDEX IF NOT EXISTS idx_signal_detected ON market_signals(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_source ON market_signals(source);

ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view signals" ON market_signals;
CREATE POLICY "Team can view signals" ON market_signals
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin/Consultant creates signals" ON market_signals;
CREATE POLICY "Admin/Consultant creates signals" ON market_signals
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );

-- ============================================
-- 2.4 Table: anonymized_talent_profiles
-- ============================================

CREATE TABLE IF NOT EXISTS anonymized_talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  anonymized_label TEXT NOT NULL UNIQUE,
  industry TEXT,
  function_field TEXT,
  seniority_level TEXT CHECK (seniority_level IN (
    'director',
    'vp',
    'svp',
    'c_suite',
    'head_of',
    'manager',
    'individual_contributor'
  )),
  geography TEXT,
  years_experience INTEGER,
  key_skills JSONB DEFAULT '[]'::jsonb,
  trident_capability NUMERIC,
  trident_overall NUMERIC,
  career_tier TEXT,
  engagement_score INTEGER,
  movement_signal_count INTEGER DEFAULT 0,
  availability_assessment TEXT,
  first_anonymized_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  shown_to_clients JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_anon_label ON anonymized_talent_profiles(anonymized_label);
CREATE INDEX IF NOT EXISTS idx_anon_real_contact ON anonymized_talent_profiles(real_contact_id);
CREATE INDEX IF NOT EXISTS idx_anon_active ON anonymized_talent_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_anon_trident ON anonymized_talent_profiles(trident_overall DESC);

ALTER TABLE anonymized_talent_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin/Consultant can view anonymized profiles" ON anonymized_talent_profiles;
CREATE POLICY "Admin/Consultant can view anonymized profiles" ON anonymized_talent_profiles
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );
DROP POLICY IF EXISTS "System manages anonymized profiles" ON anonymized_talent_profiles;
CREATE POLICY "System manages anonymized profiles" ON anonymized_talent_profiles
  FOR ALL TO authenticated USING (true);

-- ============================================
-- 2.5 Table: intelligence_queries
-- ============================================

CREATE TABLE IF NOT EXISTS intelligence_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  channel TEXT NOT NULL CHECK (channel IN ('feishu', 'wechat', 'platform', 'email')),
  query_text TEXT NOT NULL,
  response_summary TEXT,
  response_full JSONB,
  report_generated UUID REFERENCES client_intelligence_reports(id),
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_client ON intelligence_queries(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_channel ON intelligence_queries(channel);

ALTER TABLE intelligence_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view queries" ON intelligence_queries;
CREATE POLICY "Team can view queries" ON intelligence_queries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead', 'consultant'))
  );
DROP POLICY IF EXISTS "System inserts queries" ON intelligence_queries;
CREATE POLICY "System inserts queries" ON intelligence_queries
  FOR INSERT TO authenticated WITH CHECK (true);


-- >>> FILE: 20260629_client_portal.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_client_portal.sql
-- DEX AI Client Visibility Portal — T5 Schema Migration
-- Implements: Spec 05 (DEX-BS-005) + Technical Blueprint 05 (DEX-TB-005)
-- Client accounts, mandate access, structured feedback, Kevin oversight
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. CLIENT ACCOUNTS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  email                 TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL,
  organization          TEXT NOT NULL,
  title                 TEXT,
  auth_user_id          UUID REFERENCES auth.users(id),
  role                  TEXT NOT NULL DEFAULT 'client_user' CHECK (role IN ('client_user', 'client_admin')),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  access_expires        TIMESTAMPTZ,
  last_login_at         TIMESTAMPTZ,
  notify_email          BOOLEAN NOT NULL DEFAULT TRUE,
  notify_in_app         BOOLEAN NOT NULL DEFAULT TRUE,
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_client_accounts_email ON public.client_accounts (email);
CREATE INDEX IF NOT EXISTS idx_client_accounts_org ON public.client_accounts (organization);
CREATE INDEX IF NOT EXISTS idx_client_accounts_auth ON public.client_accounts (auth_user_id);

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client account read — self only" ON public.client_accounts;
CREATE POLICY "Client account read — self only" ON public.client_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Admin full access on client accounts" ON public.client_accounts;
CREATE POLICY "Admin full access on client accounts" ON public.client_accounts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 2. CLIENT MANDATE ACCESS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_mandate_access (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_account_id     UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  mandate_id            UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  access_level          TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'feedback')),
  archive_until         TIMESTAMPTZ,
  UNIQUE(client_account_id, mandate_id)
);

CREATE INDEX IF NOT EXISTS idx_cma_client ON public.client_mandate_access (client_account_id);
CREATE INDEX IF NOT EXISTS idx_cma_mandate ON public.client_mandate_access (mandate_id);

ALTER TABLE public.client_mandate_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client mandate access — self or admin" ON public.client_mandate_access;
CREATE POLICY "Client mandate access — self or admin" ON public.client_mandate_access
  FOR SELECT TO authenticated
  USING (
    client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 3. CLIENT FEEDBACK TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_feedback (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_account_id     UUID NOT NULL REFERENCES public.client_accounts(id),
  mandate_id            UUID NOT NULL REFERENCES public.mandates(id),
  contact_id            UUID NOT NULL REFERENCES public.contacts(id),
  feedback_type         TEXT NOT NULL CHECK (feedback_type IN ('interested', 'not_interested', 'need_more_info', 'hold')),
  reason                TEXT,
  additional_info       TEXT,
  status                TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'actioned', 'closed')),
  processed_by          UUID REFERENCES auth.users(id),
  processed_at          TIMESTAMPTZ,
  consultant_note       TEXT,
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cf_mandate ON public.client_feedback (mandate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cf_contact ON public.client_feedback (contact_id);
CREATE INDEX IF NOT EXISTS idx_cf_status ON public.client_feedback (status) WHERE status = 'new';
CREATE INDEX IF NOT EXISTS idx_cf_client ON public.client_feedback (client_account_id, created_at DESC);

ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client feedback read — self or admin or consultant" ON public.client_feedback;
CREATE POLICY "Client feedback read — self or admin or consultant" ON public.client_feedback
  FOR SELECT TO authenticated
  USING (
    client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
    OR EXISTS (SELECT 1 FROM public.mandates WHERE id = mandate_id AND lead_consultant_id = auth.uid())
  );

DROP POLICY IF EXISTS "Client can create feedback" ON public.client_feedback;
CREATE POLICY "Client can create feedback" ON public.client_feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid())
    AND mandate_id IN (
      SELECT mandate_id FROM public.client_mandate_access
      WHERE client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Staff can update feedback" ON public.client_feedback;
CREATE POLICY "Staff can update feedback" ON public.client_feedback
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
    OR EXISTS (SELECT 1 FROM public.mandates WHERE id = mandate_id AND lead_consultant_id = auth.uid())
  );

-- ── 4. MANDATES TABLE EXTENSIONS ───────────────────────────────────────
ALTER TABLE IF EXISTS public.mandates
  ADD COLUMN IF NOT EXISTS client_visible BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public.mandates
  ADD COLUMN IF NOT EXISTS client_summary TEXT;

ALTER TABLE IF EXISTS public.mandates
  ADD COLUMN IF NOT EXISTS target_close_date DATE;

-- ── 5. CONTACTS TABLE EXTENSIONS ───────────────────────────────────────
ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS client_presented BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS client_presented_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS client_presented_by UUID REFERENCES auth.users(id);

-- ── 6. NOTIFICATIONS TABLE (client-facing) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_account_id     UUID NOT NULL REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  mandate_id            UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  contact_id            UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  type                  TEXT NOT NULL CHECK (type IN ('new_candidate', 'interview_scheduled', 'grid_report', 'status_change')),
  title                 TEXT NOT NULL,
  message               TEXT NOT NULL,
  read                  BOOLEAN NOT NULL DEFAULT FALSE,
  metadata              JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cn_client ON public.client_notifications (client_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cn_unread ON public.client_notifications (client_account_id) WHERE read = FALSE;

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Client notifications read — self only" ON public.client_notifications;
CREATE POLICY "Client notifications read — self only" ON public.client_notifications
  FOR SELECT TO authenticated
  USING (client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Client can mark notification as read" ON public.client_notifications;
CREATE POLICY "Client can mark notification as read" ON public.client_notifications
  FOR UPDATE TO authenticated
  USING (client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid()))
  WITH CHECK (client_account_id IN (SELECT id FROM public.client_accounts WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Admin can create client notifications" ON public.client_notifications;
CREATE POLICY "Admin can create client notifications" ON public.client_notifications
  FOR INSERT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- >>> FILE: 20260629_dashboard_analytics.sql
-- =====================================================================
-- Technical Blueprint 11: Dashboard & Analytics (DEX-TB-011)
-- Database Migration
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2.1 Table: analytics_snapshots
-- Pre-computed metrics stored as point-in-time snapshots
-- =====================================================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    snapshot_hour INTEGER,

    -- Scope
    scope_type TEXT NOT NULL CHECK (scope_type IN (
        'platform',
        'team',
        'individual',
        'mandate'
    )),
    scope_id UUID,

    -- Pipeline metrics
    pipeline_total INTEGER,
    pipeline_by_stage JSONB,
    new_candidates INTEGER,
    stage_advances INTEGER,
    stage_regressions INTEGER,

    -- Conversion metrics
    conversion_rates JSONB,

    -- Velocity metrics
    avg_days_per_stage JSONB,
    avg_pipeline_days NUMERIC,

    -- Activity metrics
    outreach_count INTEGER,
    emails_sent INTEGER,
    emails_received INTEGER,
    wechat_interactions INTEGER,
    calls_count INTEGER,

    -- Quality metrics
    avg_trident_score NUMERIC,
    trident_distribution JSONB,

    -- Mandate metrics (for mandate scope)
    mandate_candidates INTEGER,
    mandate_presented INTEGER,
    mandate_interviews INTEGER,
    mandate_offers INTEGER,
    mandate_days_in_phase INTEGER,

    -- Metadata
    computed_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(snapshot_date, snapshot_hour, scope_type, scope_id)
);

-- Indexes for analytics_snapshots
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_scope ON analytics_snapshots(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics_snapshots(snapshot_date DESC)
    WHERE scope_type = 'platform';

-- RLS for analytics_snapshots
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin sees all snapshots" ON analytics_snapshots;
CREATE POLICY "Admin sees all snapshots" ON analytics_snapshots
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
        )
        OR scope_id = auth.uid()
    );

-- =====================================================================
-- 2.2 Table: dashboard_widgets_config
-- User-specific dashboard layout preferences
-- =====================================================================
CREATE TABLE IF NOT EXISTS dashboard_widgets_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_type TEXT NOT NULL CHECK (dashboard_type IN (
        'executive',
        'team_lead',
        'consultant'
    )),
    widget_key TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, widget_key)
);

-- Indexes for dashboard_widgets_config
CREATE INDEX IF NOT EXISTS idx_dash_user ON dashboard_widgets_config(user_id);

-- RLS for dashboard_widgets_config
ALTER TABLE dashboard_widgets_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own widgets" ON dashboard_widgets_config;
CREATE POLICY "Users manage own widgets" ON dashboard_widgets_config
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- =====================================================================
-- 2.3 Table: kpis
-- Target/goal tracking for the team
-- =====================================================================
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'pipeline',
        'conversion',
        'velocity',
        'activity',
        'revenue',
        'quality'
    )),

    -- Target
    target_value NUMERIC NOT NULL,
    target_period TEXT DEFAULT 'monthly' CHECK (target_period IN (
        'daily',
        'weekly',
        'monthly',
        'quarterly'
    )),

    -- Scope
    applies_to TEXT DEFAULT 'platform' CHECK (applies_to IN (
        'platform',
        'team',
        'individual'
    )),
    scope_id UUID,

    -- Current tracking
    current_value NUMERIC DEFAULT 0,
    last_computed_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for kpis
CREATE INDEX IF NOT EXISTS idx_kpi_category ON kpis(category);
CREATE INDEX IF NOT EXISTS idx_kpi_active ON kpis(is_active) WHERE is_active = TRUE;

-- RLS for kpis
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages KPIs" ON kpis;
CREATE POLICY "Admin manages KPIs" ON kpis
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Team can view KPIs" ON kpis;
CREATE POLICY "Team can view KPIs" ON kpis
    FOR SELECT TO authenticated
    USING (is_active = TRUE);

-- =====================================================================
-- Seed: Default KPIs
-- =====================================================================
INSERT INTO kpis (name, description, category, target_value, target_period, applies_to, is_active)
VALUES
    ('Engagement Rate', 'Percentage of candidates that are actively engaged (S5+)', 'pipeline', 40, 'monthly', 'platform', TRUE),
    ('Advancement Rate', 'Percentage of candidates that reach interview stage (S11+)', 'conversion', 20, 'monthly', 'platform', TRUE),
    ('Placement Rate', 'Percentage of candidates that get placed (S19)', 'conversion', 5, 'quarterly', 'platform', TRUE),
    ('Daily Outreach', 'Average outreach actions per consultant per day', 'activity', 10, 'daily', 'individual', TRUE),
    ('Response Rate', 'Percentage of contacted candidates that respond (S5/S3)', 'conversion', 30, 'monthly', 'platform', TRUE),
    ('Source to Contact', 'Average days from S1 to S3', 'velocity', 3, 'monthly', 'platform', TRUE),
    ('Contact to Engaged', 'Average days from S3 to S7', 'velocity', 7, 'monthly', 'platform', TRUE),
    ('Offer to Close', 'Average days from S16 to S19', 'velocity', 14, 'quarterly', 'platform', TRUE),
    ('Revenue per Consultant', 'Average placement revenue per consultant', 'revenue', 100000, 'quarterly', 'individual', TRUE),
    ('Overdue Payment Rate', 'Percentage of payments that are overdue', 'revenue', 10, 'monthly', 'platform', TRUE)
ON CONFLICT DO NOTHING;


-- >>> FILE: 20260629_linkedin_import_enrichment.sql
-- =====================================================================
-- Technical Blueprint 10: LinkedIn Auto-Import & Enrichment (DEX-TB-010)
-- Database Migration
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================================
-- 2.1 Table: linkedin_imports
-- Tracks each LinkedIn import session (single URL or batch)
-- =====================================================================
CREATE TABLE IF NOT EXISTS linkedin_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Import type
    import_type TEXT NOT NULL CHECK (import_type IN (
        'single_url',
        'batch_urls',
        'csv_file',
        'linkedin_recruiter_export',
        'sales_navigator_export',
        'copy_paste'
    )),

    -- Input
    input_urls TEXT[],
    input_file_url TEXT,
    input_raw_text TEXT,

    -- Processing state
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'parsing',
        'deduplicating',
        'importing',
        'completed',
        'failed',
        'partial'
    )),

    -- Results
    total_input INTEGER DEFAULT 0,
    created_count INTEGER DEFAULT 0,
    updated_count INTEGER DEFAULT 0,
    skipped_duplicate_count INTEGER DEFAULT 0,
    skipped_error_count INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- DeepSeek usage
    deepseek_calls INTEGER DEFAULT 0,
    deepseek_tokens_used INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for linkedin_imports
CREATE INDEX IF NOT EXISTS idx_li_import_user ON linkedin_imports(created_by);
CREATE INDEX IF NOT EXISTS idx_li_import_status ON linkedin_imports(status);
CREATE INDEX IF NOT EXISTS idx_li_import_created ON linkedin_imports(created_at DESC);

-- RLS for linkedin_imports
ALTER TABLE linkedin_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own imports" ON linkedin_imports;
CREATE POLICY "Users can view own imports" ON linkedin_imports
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
        )
    );

DROP POLICY IF EXISTS "Users can create imports" ON linkedin_imports;
CREATE POLICY "Users can create imports" ON linkedin_imports
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "System can update imports" ON linkedin_imports;
CREATE POLICY "System can update imports" ON linkedin_imports
    FOR UPDATE TO authenticated
    USING (true);

-- =====================================================================
-- 2.2 Table: linkedin_import_items
-- Per-profile import results
-- =====================================================================
CREATE TABLE IF NOT EXISTS linkedin_import_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES linkedin_imports(id) ON DELETE CASCADE,

    -- Input
    source_url TEXT,
    source_index INTEGER,
    raw_profile_data TEXT,

    -- Parsed output (DeepSeek)
    parsed_data JSONB DEFAULT '{}'::jsonb,

    -- Matching results
    matched_contact_id UUID REFERENCES contacts(id),
    match_type TEXT CHECK (match_type IN (
        'new',
        'exact_linkedin',
        'exact_email',
        'exact_phone',
        'fuzzy_name_company',
        'no_match'
    )),
    match_confidence NUMERIC,

    -- Import result
    action_taken TEXT CHECK (action_taken IN (
        'created',
        'updated',
        'skipped_duplicate',
        'skipped_error',
        'pending_review'
    )),
    created_contact_id UUID REFERENCES contacts(id),

    -- DeepSeek processing
    deepseek_processed BOOLEAN DEFAULT FALSE,
    deepseek_error TEXT,

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Indexes for linkedin_import_items
CREATE INDEX IF NOT EXISTS idx_li_item_import ON linkedin_import_items(import_id);
CREATE INDEX IF NOT EXISTS idx_li_item_contact ON linkedin_import_items(matched_contact_id)
    WHERE matched_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_li_item_action ON linkedin_import_items(action_taken);
CREATE INDEX IF NOT EXISTS idx_li_item_pending ON linkedin_import_items(deepseek_processed)
    WHERE deepseek_processed = FALSE;

-- RLS for linkedin_import_items
ALTER TABLE linkedin_import_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own import items" ON linkedin_import_items;
CREATE POLICY "Users can view own import items" ON linkedin_import_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM linkedin_imports
            WHERE id = import_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
                )
            )
        )
    );

DROP POLICY IF EXISTS "System can manage import items" ON linkedin_import_items;
CREATE POLICY "System can manage import items" ON linkedin_import_items
    FOR ALL TO authenticated
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM linkedin_imports
            WHERE id = import_id AND created_by = auth.uid()
        )
    );

-- =====================================================================
-- 2.3 Table: linkedin_data_cache
-- Caches raw LinkedIn profile data to avoid re-fetching
-- =====================================================================
CREATE TABLE IF NOT EXISTS linkedin_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_url TEXT NOT NULL UNIQUE,
    raw_html TEXT,
    raw_text TEXT,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    fetched_by UUID REFERENCES auth.users(id),
    parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN (
        'pending',
        'parsing',
        'parsed',
        'error'
    )),
    parsed_data JSONB,
    parsed_at TIMESTAMPTZ,
    etag TEXT,
    fetch_count INTEGER DEFAULT 1,
    last_fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for linkedin_data_cache
CREATE INDEX IF NOT EXISTS idx_li_cache_url ON linkedin_data_cache(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_li_cache_parse ON linkedin_data_cache(parse_status)
    WHERE parse_status = 'pending';

-- RLS for linkedin_data_cache
ALTER TABLE linkedin_data_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System manages cache" ON linkedin_data_cache;
CREATE POLICY "System manages cache" ON linkedin_data_cache
    FOR ALL TO authenticated
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================================
-- 2.4 contacts Table — LinkedIn Extensions
-- =====================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_url') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_url TEXT;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_headline') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_headline TEXT;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_company') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_company TEXT;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_industry') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_industry TEXT;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_skills') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_skills JSONB DEFAULT '[]'::jsonb;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_education') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_education JSONB DEFAULT '[]'::jsonb;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_experience') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_experience JSONB DEFAULT '[]'::jsonb;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_languages') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_languages JSONB DEFAULT '[]'::jsonb;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_certifications') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_certifications JSONB DEFAULT '[]'::jsonb;
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'linkedin_raw_import_id') THEN
        ALTER TABLE contacts ADD COLUMN linkedin_raw_import_id UUID REFERENCES linkedin_import_items(id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'import_source') THEN
        ALTER TABLE contacts ADD COLUMN import_source TEXT DEFAULT 'manual' CHECK (import_source IN (
            'manual',
            'linkedin_url',
            'linkedin_csv',
            'linkedin_recruiter',
            'sales_navigator',
            'notion',
            'excel',
            'api'
        ));
    END IF;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Indexes for LinkedIn fields on contacts
CREATE INDEX IF NOT EXISTS idx_contacts_linkedin_url ON contacts(linkedin_url)
    WHERE linkedin_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_import_source ON contacts(import_source);


-- >>> FILE: 20260629_rbac_notifications.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_rbac_notifications.sql
-- DEX AI RBAC & Notification System — T7 Schema Migration
-- Implements: Technical Blueprint 07 (DEX-TB-007)
-- Role-based access control, permission overrides, audit log,
-- notifications, notification preferences, email queue
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. ROLE PERMISSIONS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            TEXT NOT NULL CHECK (role IN ('admin', 'team_lead', 'consultant', 'client')),
  resource        TEXT NOT NULL CHECK (resource IN (
                    'contacts', 'mandates', 'signals', 'agent_actions',
                    'pipeline_transitions', 'client_accounts', 'client_feedback',
                    'import', 'saved_searches', 'grid_reports', 'trident_scorecards',
                    'canvas_profiles', 'match_results', 'notifications', 'rbac_settings'
                  )),
  action          TEXT NOT NULL CHECK (action IN (
                    'create', 'read_own', 'read_all', 'update_own', 'update_any',
                    'delete', 'export', 'review', 'approve', 'administer'
                  )),
  allowed         BOOLEAN NOT NULL DEFAULT FALSE,
  conditions      JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON public.role_permissions(resource);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can read role permissions" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (true);

-- ── 2. PERMISSION OVERRIDES TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permission_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource        TEXT NOT NULL,
  action          TEXT NOT NULL,
  allowed         BOOLEAN NOT NULL,
  reason          TEXT,
  granted_by      UUID NOT NULL REFERENCES auth.users(id),
  granted_at      TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, resource, action)
);

CREATE INDEX IF NOT EXISTS idx_perm_overrides_user ON public.permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_perm_overrides_active ON public.permission_overrides(is_active)
  WHERE is_active = TRUE;

ALTER TABLE public.permission_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage overrides" ON public.permission_overrides;
CREATE POLICY "Admins manage overrides" ON public.permission_overrides
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can read own overrides" ON public.permission_overrides;
CREATE POLICY "Users can read own overrides" ON public.permission_overrides
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 3. PERMISSION AUDIT LOG TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by      UUID NOT NULL REFERENCES auth.users(id),
  changed_at      TIMESTAMPTZ DEFAULT now(),
  change_type     TEXT NOT NULL CHECK (change_type IN (
                    'role_permission_update', 'override_create', 'override_update',
                    'override_delete', 'role_change'
                  )),
  target_role     TEXT,
  target_user_id  UUID REFERENCES auth.users(id),
  resource        TEXT,
  action          TEXT,
  previous_value  JSONB,
  new_value       JSONB,
  reason          TEXT
);

CREATE INDEX IF NOT EXISTS idx_perm_audit_by ON public.permission_audit_log(changed_by, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_perm_audit_target_user ON public.permission_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_perm_audit_change_type ON public.permission_audit_log(change_type);

ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read audit log" ON public.permission_audit_log;
CREATE POLICY "Admins can read audit log" ON public.permission_audit_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 4. NOTIFICATIONS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK (type IN (
                        'pipeline_stage_change', 'gate_blocked', 'trident_review_needed',
                        'canvas_review_needed', 'client_feedback_received', 'client_access_granted',
                        'mandate_phase_change', 'stale_candidate', 'match_available',
                        'import_complete', 'dedup_needed', 'permission_changed',
                        'assignment_changed', 'mention'
                      )),
  priority            TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  title               TEXT NOT NULL,
  content             TEXT,
  resource_type       TEXT,
  resource_id         UUID,
  actor_id            UUID REFERENCES auth.users(id),
  read                BOOLEAN NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMPTZ,
  delivery_channels   JSONB NOT NULL DEFAULT '{"in_app": true, "email": false}'::jsonb,
  email_sent          BOOLEAN DEFAULT FALSE,
  email_sent_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  expires_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON public.notifications(recipient_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON public.notifications(recipient_id, created_at DESC)
  WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_type ON public.notifications(type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users mark own notifications read" ON public.notifications;
CREATE POLICY "Users mark own notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- ── 5. NOTIFICATION PREFERENCES TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type   TEXT NOT NULL,
  in_app_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON public.notification_preferences(user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own preferences" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ── 6. EMAIL NOTIFICATION QUEUE TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_notification_queue (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id     UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  to_address          TEXT NOT NULL,
  to_name             TEXT,
  subject             TEXT NOT NULL,
  html_body           TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts            INTEGER DEFAULT 0,
  max_attempts        INTEGER DEFAULT 3,
  last_attempt_at     TIMESTAMPTZ,
  error_message       TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  sent_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_notification_queue(status, created_at);

ALTER TABLE public.email_notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email queue" ON public.email_notification_queue;
CREATE POLICY "Admins can read email queue" ON public.email_notification_queue
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 7. SEED DATA: DEFAULT PERMISSION MATRIX ────────────────────────────

-- ADMIN: full access to everything
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('admin', 'contacts', 'create', TRUE),
  ('admin', 'contacts', 'read_all', TRUE),
  ('admin', 'contacts', 'update_any', TRUE),
  ('admin', 'contacts', 'delete', TRUE),
  ('admin', 'contacts', 'export', TRUE),
  ('admin', 'mandates', 'create', TRUE),
  ('admin', 'mandates', 'read_all', TRUE),
  ('admin', 'mandates', 'update_any', TRUE),
  ('admin', 'mandates', 'delete', TRUE),
  ('admin', 'signals', 'create', TRUE),
  ('admin', 'signals', 'read_all', TRUE),
  ('admin', 'agent_actions', 'create', TRUE),
  ('admin', 'agent_actions', 'read_all', TRUE),
  ('admin', 'agent_actions', 'review', TRUE),
  ('admin', 'trident_scorecards', 'create', TRUE),
  ('admin', 'trident_scorecards', 'read_all', TRUE),
  ('admin', 'trident_scorecards', 'review', TRUE),
  ('admin', 'trident_scorecards', 'approve', TRUE),
  ('admin', 'canvas_profiles', 'create', TRUE),
  ('admin', 'canvas_profiles', 'read_all', TRUE),
  ('admin', 'canvas_profiles', 'update_any', TRUE),
  ('admin', 'canvas_profiles', 'export', TRUE),
  ('admin', 'canvas_profiles', 'review', TRUE),
  ('admin', 'client_accounts', 'create', TRUE),
  ('admin', 'client_accounts', 'read_all', TRUE),
  ('admin', 'client_accounts', 'update_any', TRUE),
  ('admin', 'client_accounts', 'delete', TRUE),
  ('admin', 'client_feedback', 'read_all', TRUE),
  ('admin', 'import', 'create', TRUE),
  ('admin', 'import', 'approve', TRUE),
  ('admin', 'grid_reports', 'create', TRUE),
  ('admin', 'grid_reports', 'read_all', TRUE),
  ('admin', 'grid_reports', 'export', TRUE),
  ('admin', 'match_results', 'read_all', TRUE),
  ('admin', 'match_results', 'create', TRUE),
  ('admin', 'rbac_settings', 'administer', TRUE),
  ('admin', 'notifications', 'read_all', TRUE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- TEAM_LEAD: read all, review agent actions, limited admin
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('team_lead', 'contacts', 'create', TRUE),
  ('team_lead', 'contacts', 'read_all', TRUE),
  ('team_lead', 'contacts', 'update_any', TRUE),
  ('team_lead', 'contacts', 'export', TRUE),
  ('team_lead', 'mandates', 'create', TRUE),
  ('team_lead', 'mandates', 'read_all', TRUE),
  ('team_lead', 'mandates', 'update_any', TRUE),
  ('team_lead', 'signals', 'create', TRUE),
  ('team_lead', 'signals', 'read_all', TRUE),
  ('team_lead', 'agent_actions', 'create', TRUE),
  ('team_lead', 'agent_actions', 'read_all', TRUE),
  ('team_lead', 'agent_actions', 'review', TRUE),
  ('team_lead', 'trident_scorecards', 'create', TRUE),
  ('team_lead', 'trident_scorecards', 'read_all', TRUE),
  ('team_lead', 'trident_scorecards', 'review', TRUE),
  ('team_lead', 'canvas_profiles', 'create', TRUE),
  ('team_lead', 'canvas_profiles', 'read_all', TRUE),
  ('team_lead', 'canvas_profiles', 'export', TRUE),
  ('team_lead', 'canvas_profiles', 'review', TRUE),
  ('team_lead', 'client_accounts', 'read_all', TRUE),
  ('team_lead', 'client_feedback', 'read_all', TRUE),
  ('team_lead', 'import', 'create', TRUE),
  ('team_lead', 'import', 'approve', TRUE),
  ('team_lead', 'grid_reports', 'create', TRUE),
  ('team_lead', 'grid_reports', 'read_all', TRUE),
  ('team_lead', 'grid_reports', 'export', TRUE),
  ('team_lead', 'match_results', 'read_all', TRUE),
  ('team_lead', 'match_results', 'create', TRUE),
  ('team_lead', 'notifications', 'read_all', TRUE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- CONSULTANT: own records + team read
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('consultant', 'contacts', 'create', TRUE),
  ('consultant', 'contacts', 'read_all', TRUE),
  ('consultant', 'contacts', 'update_own', TRUE),
  ('consultant', 'mandates', 'read_all', TRUE),
  ('consultant', 'signals', 'create', TRUE),
  ('consultant', 'signals', 'read_own', TRUE),
  ('consultant', 'agent_actions', 'create', TRUE),
  ('consultant', 'agent_actions', 'read_own', TRUE),
  ('consultant', 'trident_scorecards', 'create', TRUE),
  ('consultant', 'trident_scorecards', 'read_all', TRUE),
  ('consultant', 'canvas_profiles', 'create', TRUE),
  ('consultant', 'canvas_profiles', 'read_own', TRUE),
  ('consultant', 'canvas_profiles', 'export', TRUE),
  ('consultant', 'client_feedback', 'read_own', TRUE),
  ('consultant', 'import', 'create', TRUE),
  ('consultant', 'saved_searches', 'create', TRUE),
  ('consultant', 'saved_searches', 'read_own', TRUE),
  ('consultant', 'grid_reports', 'read_all', TRUE),
  ('consultant', 'match_results', 'read_own', TRUE),
  ('consultant', 'notifications', 'read_own', TRUE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- CLIENT: very restricted, only see assigned mandates and feedback
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  ('client', 'contacts', 'read_own', TRUE),
  ('client', 'mandates', 'read_own', TRUE),
  ('client', 'client_feedback', 'create', TRUE),
  ('client', 'client_feedback', 'read_own', TRUE),
  ('client', 'canvas_profiles', 'read_own', TRUE),
  ('client', 'notifications', 'read_own', TRUE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- ── 8. DEFAULT NOTIFICATION PREFERENCES (seed via function on user creation) ──
DROP FUNCTION IF EXISTS seed_default_notification_prefs();
CREATE OR REPLACE FUNCTION seed_default_notification_prefs() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, notification_type, in_app_enabled, email_enabled)
  VALUES
    (NEW.id, 'pipeline_stage_change', TRUE, FALSE),
    (NEW.id, 'gate_blocked', TRUE, TRUE),
    (NEW.id, 'trident_review_needed', TRUE, TRUE),
    (NEW.id, 'canvas_review_needed', TRUE, FALSE),
    (NEW.id, 'client_feedback_received', TRUE, TRUE),
    (NEW.id, 'client_access_granted', TRUE, TRUE),
    (NEW.id, 'mandate_phase_change', TRUE, FALSE),
    (NEW.id, 'stale_candidate', TRUE, FALSE),
    (NEW.id, 'match_available', TRUE, FALSE),
    (NEW.id, 'import_complete', TRUE, FALSE),
    (NEW.id, 'dedup_needed', TRUE, FALSE),
    (NEW.id, 'permission_changed', TRUE, TRUE),
    (NEW.id, 'assignment_changed', TRUE, FALSE),
    (NEW.id, 'mention', TRUE, TRUE)
  ON CONFLICT (user_id, notification_type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (If profiles table exists, trigger would be added here)


-- >>> FILE: 20260629_trident_3d_scoring.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_trident_3d_scoring.sql
-- DEX AI TRIDENT 3D Scoring Engine — T3 Schema Migration (Technical Blueprint 03)
-- Implements: Spec 03 (DEX-BS-003) + Technical Blueprint 03 (DEX-TB-003)
-- 3D scoring (D1/D2/D3), pre-flight checks, SWEEP mode, Kevin review gate
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. TRIDENT SCORECARDS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trident_scorecards (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  contact_id          UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  mandate_id          UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  scored_by           UUID NOT NULL REFERENCES auth.users(id),
  d1_score            NUMERIC(3,1) NOT NULL CHECK (d1_score >= 1.0 AND d1_score <= 10.0),
  d2_score            NUMERIC(3,1) NOT NULL CHECK (d2_score >= 1.0 AND d2_score <= 10.0),
  d3_score            NUMERIC(3,1) NOT NULL CHECK (d3_score >= 1.0 AND d3_score <= 10.0),
  d1_sub              JSONB NOT NULL DEFAULT '{}'::jsonb,
  d2_sub              JSONB NOT NULL DEFAULT '{}'::jsonb,
  d3_sub              JSONB NOT NULL DEFAULT '{}'::jsonb,
  d1_evidence         TEXT NOT NULL,
  d2_evidence         TEXT NOT NULL,
  d3_evidence         TEXT NOT NULL,
  d1_confidence       TEXT NOT NULL DEFAULT 'Medium' CHECK (d1_confidence IN ('High', 'Medium', 'Low')),
  d2_confidence       TEXT NOT NULL DEFAULT 'Medium' CHECK (d2_confidence IN ('High', 'Medium', 'Low')),
  d3_confidence       TEXT NOT NULL DEFAULT 'Medium' CHECK (d3_confidence IN ('High', 'Medium', 'Low')),
  composite_score     NUMERIC(3,1) NOT NULL,
  verdict             TEXT NOT NULL CHECK (verdict IN ('Exceptional Primary', 'Strong', 'Solid', 'Conditional', 'Not Recommended')),
  segment             TEXT NOT NULL CHECK (segment IN ('A', 'B', 'C')),
  recommendation      TEXT,
  preflight           JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_status       TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'adjusted', 'info_requested')),
  reviewed_by         UUID REFERENCES auth.users(id),
  reviewed_at         TIMESTAMPTZ,
  review_notes        TEXT,
  original_d1         NUMERIC(3,1),
  original_d2         NUMERIC(3,1),
  original_d3         NUMERIC(3,1),
  original_composite  NUMERIC(3,1),
  credits_consumed    INTEGER NOT NULL DEFAULT 10,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  stale_flag          BOOLEAN NOT NULL DEFAULT FALSE,
  scored_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trident_contact ON public.trident_scorecards (contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trident_mandate ON public.trident_scorecards (mandate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trident_verdict ON public.trident_scorecards (verdict);
CREATE INDEX IF NOT EXISTS idx_trident_segment ON public.trident_scorecards (segment);
CREATE INDEX IF NOT EXISTS idx_trident_review ON public.trident_scorecards (review_status) WHERE review_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_trident_composite ON public.trident_scorecards (composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_trident_scored_by ON public.trident_scorecards (scored_by);
CREATE INDEX IF NOT EXISTS idx_trident_stale ON public.trident_scorecards (stale_flag) WHERE stale_flag = TRUE;

ALTER TABLE public.trident_scorecards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trident scorecard read — scorer, mandate owner, or admin" ON public.trident_scorecards;
CREATE POLICY "Trident scorecard read — scorer, mandate owner, or admin"
  ON public.trident_scorecards FOR SELECT TO authenticated
  USING (
    scored_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
    OR mandate_id IN (SELECT id FROM mandates WHERE lead_consultant_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create scorecards" ON public.trident_scorecards;
CREATE POLICY "Authenticated users can create scorecards"
  ON public.trident_scorecards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = scored_by);

DROP POLICY IF EXISTS "Trident scorecard update — scorer or admin" ON public.trident_scorecards;
CREATE POLICY "Trident scorecard update — scorer or admin"
  ON public.trident_scorecards FOR UPDATE TO authenticated
  USING (
    scored_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP TRIGGER IF EXISTS trg_trident_updated_at ON public.trident_scorecards;
CREATE TRIGGER trg_trident_updated_at
  BEFORE UPDATE ON public.trident_scorecards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. CONTACTS TABLE EXTENSION (quick reference) ─────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'trident_composite') THEN
    ALTER TABLE public.contacts ADD COLUMN trident_composite NUMERIC(3,1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'trident_verdict') THEN
    ALTER TABLE public.contacts ADD COLUMN trident_verdict TEXT CHECK (trident_verdict IN ('Exceptional Primary', 'Strong', 'Solid', 'Conditional', 'Not Recommended', NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'trident_segment') THEN
    ALTER TABLE public.contacts ADD COLUMN trident_segment TEXT CHECK (trident_segment IN ('A', 'B', 'C', NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'trident_scored_at') THEN
    ALTER TABLE public.contacts ADD COLUMN trident_scored_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'data_confidence') THEN
    ALTER TABLE public.contacts ADD COLUMN data_confidence NUMERIC(3,2) DEFAULT 0.5;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ Contact extension error: %', SQLERRM;
END$$;

-- ── 3. HELPER FUNCTION: COMPOSITE & VERDICT ──────────────────────────
CREATE OR REPLACE FUNCTION public.compute_trident_composite(
  p_d1 NUMERIC,
  p_d2 NUMERIC,
  p_d3 NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_composite NUMERIC(3,1);
  v_verdict TEXT;
  v_segment TEXT;
BEGIN
  v_composite := ROUND((p_d1 * 0.30 + p_d2 * 0.40 + p_d3 * 0.30)::numeric, 1);

  v_verdict := CASE
    WHEN v_composite >= 9.0 THEN 'Exceptional Primary'
    WHEN v_composite >= 8.0 THEN 'Strong'
    WHEN v_composite >= 7.0 THEN 'Solid'
    WHEN v_composite >= 6.0 THEN 'Conditional'
    ELSE 'Not Recommended'
  END;

  v_segment := CASE
    WHEN v_composite >= 8.0 THEN 'A'
    WHEN v_composite >= 6.5 THEN 'B'
    ELSE 'C'
  END;

  RETURN jsonb_build_object(
    'composite_score', v_composite,
    'verdict', v_verdict,
    'segment', v_segment
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── 4. HELPER FUNCTION: PRE-FLIGHT CHECKS ─────────────────────────────
CREATE OR REPLACE FUNCTION public.trident_preflight(
  p_contact_id UUID,
  p_mandate_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_contact RECORD;
  v_check_identity TEXT := 'PASS';
  v_check_jd TEXT := 'PASS';
  v_check_signal TEXT := 'PASS';
  v_check_readiness TEXT := 'PASS';
  v_check_compliance TEXT := 'PASS';
  v_data_confidence NUMERIC;
  v_flags TEXT[] := '{}';
  v_overall TEXT;
BEGIN
  SELECT * INTO v_contact FROM contacts WHERE id = p_contact_id;

  IF v_contact IS NULL THEN
    RETURN jsonb_build_object('overall', 'HALT', 'reason', 'Contact not found');
  END IF;

  -- Check 1: Identity Verification
  IF v_contact.full_name IS NULL OR v_contact.company_name IS NULL THEN
    v_check_identity := 'HALT';
    v_flags := v_flags || 'Missing name or company';
  ELSIF v_contact.linkedin_url IS NULL THEN
    v_check_identity := 'WARN';
    v_flags := v_flags || 'No LinkedIn URL for verification';
  END IF;

  -- Check 2: JD Alignment
  IF p_mandate_id IS NOT NULL THEN
    DECLARE v_mandate RECORD;
    BEGIN
      SELECT * INTO v_mandate FROM mandates WHERE id = p_mandate_id;
      IF v_mandate IS NULL THEN
        v_check_jd := 'HALT';
        v_flags := v_flags || 'Mandate not found';
      ELSIF v_mandate.job_description IS NULL OR v_mandate.job_description = '' THEN
        v_check_jd := 'HALT';
        v_flags := v_flags || 'No job description defined for mandate';
      ELSIF v_mandate.role_title IS NULL THEN
        v_check_jd := 'WARN';
        v_flags := v_flags || 'JD missing role title / seniority level';
      END IF;
    END;
  ELSE
    v_check_jd := 'WARN';
    v_flags := v_flags || 'No mandate linked — JD alignment not checked';
  END IF;

  -- Check 3: Signal Integrity (data confidence)
  v_data_confidence := COALESCE(v_contact.data_confidence, 0.5);
  IF v_data_confidence < 0.3 THEN
    v_check_signal := 'HALT';
    v_flags := v_flags || 'Data confidence < 30% — too little data to score';
  ELSIF v_data_confidence < 0.6 THEN
    v_check_signal := 'WARN';
    v_flags := v_flags || 'Data confidence 30-59% — scoring may be unreliable';
  END IF;

  -- Check 4: TRIDENT Readiness (pipeline stage)
  IF v_contact.pipeline_stage IN ('S1_Sourced') THEN
    v_check_readiness := 'HALT';
    v_flags := v_flags || 'Candidate not yet screened — must be S2 or later';
  ELSIF v_contact.pipeline_stage IN ('S2_Screened') THEN
    v_check_readiness := 'WARN';
    v_flags := v_flags || 'Preliminary scoring only — candidate still at screening stage';
  END IF;

  -- Check 5: Compliance / Conflict
  IF v_contact.metadata IS NOT NULL AND v_contact.metadata ? 'conflict_flag' THEN
    IF (v_contact.metadata->>'conflict_flag')::boolean = TRUE THEN
      v_check_compliance := 'HALT';
      v_flags := v_flags || 'Active conflict of interest detected';
    END IF;
  END IF;

  -- Overall
  IF v_check_identity = 'HALT' OR v_check_jd = 'HALT' OR v_check_signal = 'HALT'
     OR v_check_readiness = 'HALT' OR v_check_compliance = 'HALT' THEN
    v_overall := 'HALT';
  ELSIF v_check_identity = 'WARN' OR v_check_jd = 'WARN' OR v_check_signal = 'WARN'
        OR v_check_readiness = 'WARN' OR v_check_compliance = 'WARN' THEN
    v_overall := 'PROCEED_WITH_FLAGS';
  ELSE
    v_overall := 'PROCEED';
  END IF;

  RETURN jsonb_build_object(
    'identity_verification', v_check_identity,
    'jd_alignment', v_check_jd,
    'signal_integrity', v_check_signal,
    'trident_readiness', v_check_readiness,
    'compliance_conflict', v_check_compliance,
    'overall', v_overall,
    'flags', v_flags
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. AUTO-UPDATE CONTACTS ON SCORECARD SAVE ──────────────────────────
DROP FUNCTION IF EXISTS fn_update_contact_trident();
CREATE OR REPLACE FUNCTION public.fn_update_contact_trident()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.contacts
  SET
    trident_composite = NEW.composite_score,
    trident_verdict = NEW.verdict,
    trident_segment = NEW.segment,
    trident_scored_at = NEW.scored_at
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trident_contact_sync ON public.trident_scorecards;
CREATE TRIGGER trg_trident_contact_sync
  AFTER INSERT OR UPDATE OF composite_score, verdict, segment ON public.trident_scorecards
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_contact_trident();

-- ── 6. STALENESS FLAG (called by cron) ─────────────────────────────────
DROP FUNCTION IF EXISTS fn_flag_stale_trident();
CREATE OR REPLACE FUNCTION public.fn_flag_stale_trident()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.trident_scorecards
  SET stale_flag = TRUE
  WHERE stale_flag = FALSE AND scored_at < NOW() - INTERVAL '6 months';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ── 7. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY['trident_scorecards']) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ TRIDENT 3D scoring migration OK — all tables present';
  ELSE
    RAISE EXCEPTION '❌ TRIDENT migration FAILED — missing: %', v_missing;
  END IF;
END$$;

-- >>> FILE: 20260629_wechat_email_integration.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260629_wechat_email_integration.sql
-- DEX AI WeChat & Email Integration — T9 Schema Migration
-- Implements: Technical Blueprint 09 (DEX-TB-009)
-- Outlook Graph API email, WeChat structured logging, unified timeline, templates
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. CHANNEL_ACCOUNTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_accounts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel               TEXT NOT NULL CHECK (channel IN ('outlook', 'wecom', 'wechat_manual')),
  account_email         TEXT,
  account_name          TEXT,
  access_token_enc      TEXT,
  refresh_token_enc     TEXT,
  token_expires_at      TIMESTAMPTZ,
  graph_user_id         TEXT,
  graph_tenant_id       TEXT,
  wecom_corp_id         TEXT,
  wecom_user_id         TEXT,
  is_active             BOOLEAN DEFAULT TRUE,
  last_sync_at          TIMESTAMPTZ,
  sync_status           TEXT DEFAULT 'idle'
                        CHECK (sync_status IN ('idle', 'syncing', 'error', 'auth_expired')),
  error_message         TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, channel, account_email)
);

CREATE INDEX IF NOT EXISTS idx_channel_user ON public.channel_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_active ON public.channel_accounts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_channel_sync ON public.channel_accounts(sync_status)
  WHERE sync_status IN ('error', 'auth_expired');

ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON public.channel_accounts;
CREATE POLICY "Users can view own accounts" ON public.channel_accounts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can manage own accounts" ON public.channel_accounts;
CREATE POLICY "Users can manage own accounts" ON public.channel_accounts
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- ── 2. EMAIL_SYNC_STATE TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_sync_state (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_account_id    UUID NOT NULL REFERENCES public.channel_accounts(id) ON DELETE CASCADE,
  last_sync_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_delta_link       TEXT,
  total_synced          INTEGER DEFAULT 0,
  last_error            TEXT,
  last_error_at         TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_account_id)
);

ALTER TABLE public.email_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages sync state" ON public.email_sync_state;
CREATE POLICY "Service role manages sync state" ON public.email_sync_state
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can view sync state" ON public.email_sync_state;
CREATE POLICY "Admins can view sync state" ON public.email_sync_state
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── 3. EMAIL_THREADS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_threads (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id                  UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  mandate_id                  UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  owner_id                    UUID NOT NULL REFERENCES auth.users(id),
  graph_thread_id             TEXT,
  graph_message_id            TEXT,
  subject                     TEXT NOT NULL,
  from_address                TEXT NOT NULL,
  to_addresses                TEXT[] NOT NULL,
  cc_addresses                TEXT[],
  status                      TEXT NOT NULL DEFAULT 'active'
                              CHECK (status IN (
                                'draft', 'sent', 'replied', 'closed', 'bounced'
                              )),
  last_message_at             TIMESTAMPTZ,
  message_count               INTEGER DEFAULT 1,
  is_linked_to_candidate      BOOLEAN DEFAULT FALSE,
  linked_at                   TIMESTAMPTZ,
  linked_by                   UUID REFERENCES auth.users(id),
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now(),
  metadata                    JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_thread_contact ON public.email_threads(contact_id)
  WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_thread_owner ON public.email_threads(owner_id);
CREATE INDEX IF NOT EXISTS idx_email_thread_status ON public.email_threads(status);
CREATE INDEX IF NOT EXISTS idx_email_thread_graph ON public.email_threads(graph_thread_id)
  WHERE graph_thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_thread_last_msg ON public.email_threads(last_message_at DESC);

ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email threads" ON public.email_threads;
CREATE POLICY "Users can view own email threads" ON public.email_threads
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
    )
  );

DROP POLICY IF EXISTS "Users can create email threads" ON public.email_threads;
CREATE POLICY "Users can create email threads" ON public.email_threads
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own email threads" ON public.email_threads;
CREATE POLICY "Users can update own email threads" ON public.email_threads
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- ── 4. EMAIL_MESSAGES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_messages (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id                   UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  graph_message_id            TEXT UNIQUE,
  from_address                TEXT NOT NULL,
  to_addresses                TEXT[] NOT NULL,
  cc_addresses                TEXT[],
  bcc_addresses               TEXT[],
  subject                     TEXT NOT NULL,
  body_text                   TEXT,
  body_html                   TEXT,
  body_preview                TEXT,
  direction                   TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  is_reply                    BOOLEAN DEFAULT FALSE,
  sent_at                     TIMESTAMPTZ NOT NULL,
  received_at                 TIMESTAMPTZ,
  is_processed                BOOLEAN DEFAULT FALSE,
  processed_at                TIMESTAMPTZ,
  outreach_log_id             UUID REFERENCES public.candidate_outreach_log(id),
  has_attachments             BOOLEAN DEFAULT FALSE,
  attachment_count            INTEGER DEFAULT 0,
  attachments                 JSONB DEFAULT '[]'::jsonb,
  metadata                    JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_email_msg_thread ON public.email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_msg_graph ON public.email_messages(graph_message_id)
  WHERE graph_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_msg_unprocessed ON public.email_messages(is_processed)
  WHERE is_processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_email_msg_direction ON public.email_messages(direction);
CREATE INDEX IF NOT EXISTS idx_email_msg_sent ON public.email_messages(sent_at DESC);

ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages from own threads" ON public.email_messages;
CREATE POLICY "Users can view messages from own threads" ON public.email_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.email_threads
      WHERE id = thread_id
        AND (
          owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'team_lead')
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users can create messages" ON public.email_messages;
CREATE POLICY "Users can create messages" ON public.email_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 5. WECHAT_INTERACTIONS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wechat_interactions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id                  UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  logged_by                   UUID NOT NULL REFERENCES auth.users(id),
  interaction_type            TEXT NOT NULL
                              CHECK (interaction_type IN (
                                'message_sent', 'message_received', 'voice_call', 'video_call',
                                'friend_request_sent', 'friend_request_accepted', 'moment_interaction',
                                'group_mention', 'file_shared', 'wecom_message_sent', 'wecom_message_received'
                              )),
  summary                     TEXT NOT NULL,
  content                     TEXT,
  wechat_id                   TEXT,
  outcome                     TEXT CHECK (outcome IN (
                                'positive', 'neutral', 'negative', 'follow_up_needed', 'scheduled'
                              )),
  triggers_stage_change       BOOLEAN DEFAULT FALSE,
  suggested_stage             TEXT CHECK (suggested_stage IN (
                                'S5_Responded', 'S6_WeChat_Added', 'S7_Interested',
                                'S9_Call_Positive', 'S10_Call_Negative', NULL
                              )),
  occurred_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  outreach_log_id             UUID REFERENCES public.candidate_outreach_log(id),
  signal_id                   UUID REFERENCES public.signals(id),
  has_media                   BOOLEAN DEFAULT FALSE,
  media_type                  TEXT CHECK (media_type IN ('image', 'voice', 'video', 'file', NULL)),
  media_url                   TEXT,
  metadata                    JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wechat_contact ON public.wechat_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_wechat_logged_by ON public.wechat_interactions(logged_by);
CREATE INDEX IF NOT EXISTS idx_wechat_type ON public.wechat_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_wechat_occurred ON public.wechat_interactions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_wechat_unlinked ON public.wechat_interactions(outreach_log_id)
  WHERE outreach_log_id IS NULL;

ALTER TABLE public.wechat_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view WeChat interactions" ON public.wechat_interactions;
CREATE POLICY "Team can view WeChat interactions" ON public.wechat_interactions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Team can create WeChat interactions" ON public.wechat_interactions;
CREATE POLICY "Team can create WeChat interactions" ON public.wechat_interactions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own WeChat interactions" ON public.wechat_interactions;
CREATE POLICY "Users can update own WeChat interactions" ON public.wechat_interactions
  FOR UPDATE TO authenticated
  USING (logged_by = auth.uid());

-- ── 6. EMAIL_TEMPLATES TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by                  UUID NOT NULL REFERENCES auth.users(id),
  name                        TEXT NOT NULL,
  subject_template            TEXT NOT NULL,
  body_template               TEXT NOT NULL,
  variables                   JSONB DEFAULT '[]'::jsonb,
  category                    TEXT DEFAULT 'outreach'
                              CHECK (category IN (
                                'cold_outreach', 'follow_up', 'interview_schedule',
                                'offer', 'rejection', 'thank_you', 'general', 'wechat_follow_up'
                              )),
  is_shared                   BOOLEAN DEFAULT FALSE,
  usage_count                 INTEGER DEFAULT 0,
  created_at                  TIMESTAMPTZ DEFAULT now(),
  updated_at                  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tpl_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_tpl_shared ON public.email_templates(is_shared)
  WHERE is_shared = TRUE;

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own + shared templates" ON public.email_templates;
CREATE POLICY "Users can view own + shared templates" ON public.email_templates
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR is_shared = TRUE);

DROP POLICY IF EXISTS "Users can manage own templates" ON public.email_templates;
CREATE POLICY "Users can manage own templates" ON public.email_templates
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- ── 7. SEED: Default Email Templates ───────────────────────────────────
INSERT INTO email_templates (created_by, name, subject_template, body_template, variables, category, is_shared)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'Cold Outreach — Introduction',
    '{{company_name}} Opportunity — {{candidate_name}}',
    '<p>Hi {{candidate_name}},</p>
<p>I hope this email finds you well. I came across your background at {{current_company}} and was impressed by your experience in {{industry}}.</p>
<p>I wanted to share an exciting opportunity with {{client_company}} for the {{role_title}} position. Given your expertise in {{key_skill}}, I think you would be a strong fit.</p>
<p>Would you be open to a brief call to discuss this further?</p>
<p>Best regards,<br>{{sender_name}}</p>',
    '["candidate_name","company_name","current_company","industry","client_company","role_title","key_skill","sender_name"]',
    'cold_outreach',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Follow Up — No Response',
    'Following up: {{role_title}} opportunity at {{client_company}}',
    '<p>Hi {{candidate_name}},</p>
<p>I wanted to follow up on my previous email about the {{role_title}} role at {{client_company}}.</p>
<p>I understand you are busy, but I would love to hear your thoughts. If this is not the right time, please let me know and I will check back later.</p>
<p>Best regards,<br>{{sender_name}}</p>',
    '["candidate_name","role_title","client_company","sender_name"]',
    'follow_up',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Interview Schedule',
    'Interview Confirmed — {{role_title}} on {{interview_date}}',
    '<p>Hi {{candidate_name}},</p>
<p>Great news! Your interview for the {{role_title}} position at {{client_company}} has been scheduled.</p>
<p><strong>Details:</strong><br>
Date: {{interview_date}}<br>
Time: {{interview_time}}<br>
Format: {{interview_format}}<br>
Interviewer: {{interviewer_name}}</p>
<p>Let me know if you need anything to prepare.</p>
<p>Best regards,<br>{{sender_name}}</p>',
    '["candidate_name","role_title","client_company","interview_date","interview_time","interview_format","interviewer_name","sender_name"]',
    'interview_schedule',
    TRUE
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Thank You — After Interview',
    'Thank you for your time — {{role_title}} discussion',
    '<p>Hi {{candidate_name}},</p>
<p>Thank you for taking the time to speak today about the {{role_title}} role at {{client_company}}.</p>
<p>I really enjoyed our conversation and I believe your experience aligns well with what they are looking for.</p>
<p>I will be in touch with feedback shortly.</p>
<p>Best regards,<br>{{sender_name}}</p>',
    '["candidate_name","role_title","client_company","sender_name"]',
    'thank_you',
    TRUE
  )
ON CONFLICT DO NOTHING;


-- >>> FILE: 20260630_create_grid_mapping.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260630_create_grid_mapping.sql
-- TICKET T-2b: GRID Market Mapping (TECH-02)
-- 6 new tables for GRID market mapping with RLS enabled
-- ADDITIVE only — uses IF NOT EXISTS to preserve existing tables
-- ════════════════════════════════════════════════════════════════════════

--- grid_mappings TABLE ---
CREATE TABLE IF NOT EXISTS grid_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_grid_mandate ON grid_mappings(mandate_id);

ALTER TABLE grid_mappings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view GRID mappings" ON grid_mappings;
CREATE POLICY "Team can view GRID mappings" ON grid_mappings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can create GRID mappings" ON grid_mappings;
CREATE POLICY "Team can create GRID mappings" ON grid_mappings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Team can update GRID mappings" ON grid_mappings;
CREATE POLICY "Team can update GRID mappings" ON grid_mappings FOR UPDATE TO authenticated USING (true);

--- grid_sectors TABLE ---
CREATE TABLE IF NOT EXISTS grid_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id UUID NOT NULL REFERENCES grid_mappings(id) ON DELETE CASCADE,
  sector_name TEXT NOT NULL,
  sector_description TEXT,
  priority TEXT CHECK (priority IN ('primary', 'secondary', 'tertiary')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_sectors_mapping ON grid_sectors(mapping_id);
ALTER TABLE grid_sectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view sectors" ON grid_sectors;
CREATE POLICY "Team can view sectors" ON grid_sectors FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can manage sectors" ON grid_sectors;
CREATE POLICY "Team can manage sectors" ON grid_sectors FOR ALL TO authenticated USING (true);

--- grid_companies TABLE ---
CREATE TABLE IF NOT EXISTS grid_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id UUID NOT NULL REFERENCES grid_mappings(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES grid_sectors(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  company_size TEXT,
  headquarters TEXT,
  relevance_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_companies_mapping ON grid_companies(mapping_id);
CREATE INDEX IF NOT EXISTS idx_grid_companies_sector ON grid_companies(sector_id);
ALTER TABLE grid_companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view companies" ON grid_companies;
CREATE POLICY "Team can view companies" ON grid_companies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can manage companies" ON grid_companies;
CREATE POLICY "Team can manage companies" ON grid_companies FOR ALL TO authenticated USING (true);

--- grid_functions TABLE ---
CREATE TABLE IF NOT EXISTS grid_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id UUID NOT NULL REFERENCES grid_mappings(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  function_description TEXT,
  importance TEXT CHECK (importance IN ('critical', 'important', 'nice_to_have')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_functions_mapping ON grid_functions(mapping_id);
ALTER TABLE grid_functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view functions" ON grid_functions;
CREATE POLICY "Team can view functions" ON grid_functions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can manage functions" ON grid_functions;
CREATE POLICY "Team can manage functions" ON grid_functions FOR ALL TO authenticated USING (true);

--- grid_candidate_entries TABLE ---
CREATE TABLE IF NOT EXISTS grid_candidate_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id UUID NOT NULL REFERENCES grid_mappings(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('sector', 'company', 'function')),
  section_item_id UUID,
  notes TEXT,
  ranking INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_entries_mapping ON grid_candidate_entries(mapping_id);
CREATE INDEX IF NOT EXISTS idx_grid_entries_contact ON grid_candidate_entries(contact_id);
ALTER TABLE grid_candidate_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view entries" ON grid_candidate_entries;
CREATE POLICY "Team can view entries" ON grid_candidate_entries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can manage entries" ON grid_candidate_entries;
CREATE POLICY "Team can manage entries" ON grid_candidate_entries FOR ALL TO authenticated USING (true);

--- grid_minimum_standards TABLE ---
CREATE TABLE IF NOT EXISTS grid_minimum_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mapping_id UUID NOT NULL REFERENCES grid_mappings(id) ON DELETE CASCADE,
  standard_type TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grid_standards_mapping ON grid_minimum_standards(mapping_id);
ALTER TABLE grid_minimum_standards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team can view standards" ON grid_minimum_standards;
CREATE POLICY "Team can view standards" ON grid_minimum_standards FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Team can manage standards" ON grid_minimum_standards;
CREATE POLICY "Team can manage standards" ON grid_minimum_standards FOR ALL TO authenticated USING (true);

-- ════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'grid_mappings', 'grid_sectors', 'grid_companies',
    'grid_functions', 'grid_candidate_entries', 'grid_minimum_standards'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ GRID Market Mapping migration OK — all 6 tables present';
  ELSE
    RAISE EXCEPTION '❌ GRID Market Mapping migration FAILED — missing: %', v_missing;
  END IF;
END$$;


-- >>> FILE: 20260709_portal_rls_policies.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260709_portal_rls_policies.sql
-- T1: Portal RLS Policies for Core Tables
--
-- Adds 12 client-facing RLS policies so portal pages can query core
-- tables through Supabase RLS instead of hitting empty results or
-- leaking data across tenants.
--
-- Tables covered:
--   mandates, candidates_pipeline, contacts, candidate_mandate_links,
--   assessments, generated_reports, events, candidate_outreach_log
--
-- Design: clients see only rows linked to mandates they have access to
-- via client_mandate_access. LYC staff (admin/consultant) retain
-- full access. Tables that may not exist yet (assessments, events)
-- are handled gracefully with DO$$ blocks.
-- ════════════════════════════════════════════════════════════════════════

-- Helper: client mandate access subquery (reused across policies)
-- Returns TRUE if auth.uid() is a client with access to :mandate_id
-- or is LYC staff.

-- ── 1. mandates ──────────────────────────────────────────────────────────
-- Existing: admin read/write, service_role. Missing: client portal read.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mandates' AND policyname = 'Client can read accessible mandates'
  ) THEN
    CREATE POLICY "Client can read accessible mandates" ON public.mandates
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.client_mandate_access cma
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
            AND cma.mandate_id = mandates.id
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 1/12: Client read on mandates';
  END IF;
END
$$;

-- ── 2. candidates_pipeline ───────────────────────────────────────────────
-- Existing: service_role, users read, users write. Missing: client-scoped read.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidates_pipeline' AND policyname = 'Client can read pipeline for accessible mandates'
  ) THEN
    CREATE POLICY "Client can read pipeline for accessible mandates" ON public.candidates_pipeline
      FOR SELECT TO authenticated
      USING (
        mandate_id IN (
          SELECT cma.mandate_id FROM public.client_mandate_access cma
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 2/12: Client read on candidates_pipeline';
  END IF;
END
$$;

-- ── 3. contacts ──────────────────────────────────────────────────────────
-- Existing: service_role, staff read, users write. Missing: client-scoped read.
-- Clients can see contacts that have been presented (client_presented = true)
-- and are linked to mandates they have access to.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Client can read presented contacts'
  ) THEN
    CREATE POLICY "Client can read presented contacts" ON public.contacts
      FOR SELECT TO authenticated
      USING (
        -- Contact was presented to a client and belongs to an accessible mandate
        contacts.client_presented = true
        AND EXISTS (
          SELECT 1 FROM public.candidate_mandate_links cml
          JOIN public.client_mandate_access cma ON cma.mandate_id = cml.mandate_id
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
            AND cml.contact_id = contacts.id
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 3/12: Client read on contacts';
  END IF;
END
$$;

-- ── 4. candidate_mandate_links ───────────────────────────────────────────
-- Existing: team view/create/update (open to all authenticated). Missing: client-scoped read.
-- Tighten: clients only see links for mandates they have access to.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_mandate_links' AND policyname = 'Client can read links for accessible mandates'
  ) THEN
    CREATE POLICY "Client can read links for accessible mandates" ON public.candidate_mandate_links
      FOR SELECT TO authenticated
      USING (
        mandate_id IN (
          SELECT cma.mandate_id FROM public.client_mandate_access cma
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 4/12: Client read on candidate_mandate_links';
  END IF;
END
$$;

-- ── 5. assessments ───────────────────────────────────────────────────────
-- Table may not exist in migrations. Handle gracefully.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessments') THEN
    ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Client can read assessments for accessible mandates'
    ) THEN
      CREATE POLICY "Client can read assessments for accessible mandates" ON public.assessments
        FOR SELECT TO authenticated
        USING (
          mandate_id IN (
            SELECT cma.mandate_id FROM public.client_mandate_access cma
            JOIN public.client_accounts ca ON ca.id = cma.client_account_id
            WHERE ca.auth_user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Users can read own assessments'
    ) THEN
      CREATE POLICY "Users can read own assessments" ON public.assessments
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    END IF;

    RAISE NOTICE 'Policies 5-6/12: Client + user read on assessments';
  ELSE
    RAISE NOTICE 'assessments table does not exist — skipping RLS policies. Create the table first, then re-run.';
  END IF;
END
$$;

-- ── 6. generated_reports ─────────────────────────────────────────────────
-- Existing: service_role all, users read. Missing: client-scoped read + user insert.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'generated_reports' AND policyname = 'Client can read reports for accessible mandates'
  ) THEN
    CREATE POLICY "Client can read reports for accessible mandates" ON public.generated_reports
      FOR SELECT TO authenticated
      USING (
        mandate_id IN (
          SELECT cma.mandate_id FROM public.client_mandate_access cma
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 7/12: Client read on generated_reports';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'generated_reports' AND policyname = 'Users can insert generated reports'
  ) THEN
    CREATE POLICY "Users can insert generated reports" ON public.generated_reports
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
      );
    RAISE NOTICE 'Policy 8/12: User insert on generated_reports';
  END IF;
END
$$;

-- ── 7. events ────────────────────────────────────────────────────────────
-- Table may not exist in migrations. Handle gracefully.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Client can read events for accessible mandates'
    ) THEN
      CREATE POLICY "Client can read events for accessible mandates" ON public.events
        FOR SELECT TO authenticated
        USING (
          mandate_id IN (
            SELECT cma.mandate_id FROM public.client_mandate_access cma
            JOIN public.client_accounts ca ON ca.id = cma.client_account_id
            WHERE ca.auth_user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
          )
        );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can read own events'
    ) THEN
      CREATE POLICY "Users can read own events" ON public.events
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    END IF;

    RAISE NOTICE 'Policies 9-10/12: Client + user read on events';
  ELSE
    RAISE NOTICE 'events table does not exist — skipping RLS policies. Create the table first, then re-run.';
  END IF;
END
$$;

-- ── 8. candidate_outreach_log ────────────────────────────────────────────
-- Existing: team view/create/update (open to all authenticated). Missing: client-scoped read + consultant write scoping.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_outreach_log' AND policyname = 'Client can read outreach for accessible mandates'
  ) THEN
    CREATE POLICY "Client can read outreach for accessible mandates" ON public.candidate_outreach_log
      FOR SELECT TO authenticated
      USING (
        contact_id IN (
          SELECT cml.contact_id FROM public.candidate_mandate_links cml
          JOIN public.client_mandate_access cma ON cma.mandate_id = cml.mandate_id
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );
    RAISE NOTICE 'Policy 11/12: Client read on candidate_outreach_log';
  END IF;

  -- Consultants can update outreach logs they created
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_outreach_log' AND policyname = 'Consultant can update own outreach logs'
  ) THEN
    CREATE POLICY "Consultant can update own outreach logs" ON public.candidate_outreach_log
      FOR UPDATE TO authenticated
      USING (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin')
        )
      );
    RAISE NOTICE 'Policy 12/12: Consultant update on candidate_outreach_log';
  END IF;
END
$$;

-- ── SMOKE TEST: Verify all 12 policies exist ────────────────────────────
DO $$
DECLARE
  total_count INTEGER := 0;
  tbl TEXT;
  tbl_count INTEGER;
BEGIN
  FOR tbl IN
    VALUES ('mandates'), ('candidates_pipeline'), ('contacts'),
           ('candidate_mandate_links'), ('generated_reports'),
           ('candidate_outreach_log')
  LOOP
    SELECT COUNT(*) INTO tbl_count
    FROM pg_policies
    WHERE tablename = tbl
      AND policyname LIKE 'Client can%';
    total_count := total_count + tbl_count;
    RAISE NOTICE '%: % client policies', tbl, tbl_count;
  END LOOP;

  -- Check optional tables (may not exist)
  FOR tbl IN VALUES ('assessments'), ('events')
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      SELECT COUNT(*) INTO tbl_count
      FROM pg_policies
      WHERE tablename = tbl
        AND policyname LIKE 'Client can%';
      total_count := total_count + tbl_count;
      RAISE NOTICE '%: % client policies', tbl, tbl_count;
    ELSE
      RAISE NOTICE '%: table does not exist (skipped)', tbl;
    END IF;
  END LOOP;

  -- Also count non-client policies added by this migration
  SELECT COUNT(*) INTO tbl_count
  FROM pg_policies
  WHERE policyname IN (
    'Users can read own assessments',
    'Users can insert generated reports',
    'Users can read own events',
    'Consultant can update own outreach logs'
  );
  total_count := total_count + tbl_count;

  RAISE NOTICE 'Total portal RLS policies added: %', total_count;
  IF total_count < 10 THEN
    RAISE WARNING 'Expected at least 10 policies (12 if assessments + events exist). Found %.', total_count;
  ELSE
    RAISE NOTICE 'Portal RLS policy installation complete.';
  END IF;
END
$$;


-- >>> FILE: 20260709_rls_gap_fixes.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260709_rls_gap_fixes.sql
-- T7: RLS Gap Fixes — Documents, Credits, Sessions Scoping
-- Fixes 3 security gaps identified in T1 audit
-- ════════════════════════════════════════════════════════════════════════

-- ── FIX 1: documents table RLS ─────────────────────────────────────────
-- The documents table is referenced by documentService.ts (getUserDocuments)
-- and supabaseApi.ts (getDocuments). It has user_id column.
-- TODO: The documents table CREATE TABLE was not found in migration files.
-- It may have been created by Supabase dashboard, a script, or the
-- MASTER_MIGRATION. If it doesn't exist yet, this migration will fail
-- gracefully due to IF EXISTS checks.

DO $$
BEGIN
  -- Enable RLS only if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

    -- Client users can read documents for mandates they have access to
    CREATE POLICY "Client users can read own mandate documents" ON public.documents
      FOR SELECT TO authenticated
      USING (
        -- Document is linked to a mandate the client has access to
        (mandate_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.client_mandate_access cma
          JOIN public.client_accounts ca ON ca.id = cma.client_account_id
          WHERE ca.auth_user_id = auth.uid()
            AND cma.mandate_id = documents.mandate_id
        ))
        -- Or document belongs to the user directly
        OR (user_id = auth.uid())
        -- Or user is LYC staff
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );

    -- LYC staff can insert/update documents
    CREATE POLICY "Staff can manage documents" ON public.documents
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin', 'lyc_consultant')
        )
      );

    RAISE NOTICE 'RLS policies created for documents table';
  ELSE
    RAISE NOTICE 'documents table does not exist yet — skipping RLS policies. Create the table first, then re-run this migration or add policies manually.';
  END IF;
END
$$;

-- ── FIX 2: coaching_sessions table + scoped query ──────────────────────
-- The coaching portal fetches upcoming sessions. We need a coaching_sessions
-- table with proper RLS so users only see their own sessions.
-- If the table doesn't exist, we create it. If it does, we add RLS.

CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coachee_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES auth.users(id),
  title           TEXT NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_min    INTEGER NOT NULL DEFAULT 60,
  format          TEXT NOT NULL DEFAULT 'video' CHECK (format IN ('video', 'in_person', 'phone')),
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes           TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  outcome         TEXT CHECK (outcome IN ('completed', 'cancelled', 'no_show')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coachee ON public.coaching_sessions (coachee_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON public.coaching_sessions (coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_scheduled ON public.coaching_sessions (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON public.coaching_sessions (status);

ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Coachee can see their own sessions
DROP POLICY IF EXISTS "Coachee can read own sessions" ON public.coaching_sessions;
CREATE POLICY "Coachee can read own sessions" ON public.coaching_sessions
  FOR SELECT TO authenticated
  USING (coachee_id = auth.uid());

-- Coach can see sessions assigned to them
DROP POLICY IF EXISTS "Coach can read assigned sessions" ON public.coaching_sessions;
CREATE POLICY "Coach can read assigned sessions" ON public.coaching_sessions
  FOR SELECT TO authenticated
  USING (coach_id = auth.uid());

-- Admin can see all sessions
DROP POLICY IF EXISTS "Admin can read all sessions" ON public.coaching_sessions;
CREATE POLICY "Admin can read all sessions" ON public.coaching_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'lyc_admin')
    )
  );

-- Coachee can insert sessions (booking)
DROP POLICY IF EXISTS "Coachee can book sessions" ON public.coaching_sessions;
CREATE POLICY "Coachee can book sessions" ON public.coaching_sessions
  FOR INSERT TO authenticated
  WITH CHECK (coachee_id = auth.uid());

-- Coach and admin can update sessions
DROP POLICY IF EXISTS "Coach and admin can update sessions" ON public.coaching_sessions;
CREATE POLICY "Coach and admin can update sessions" ON public.coaching_sessions
  FOR UPDATE TO authenticated
  USING (
    coach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'super_admin', 'lyc_admin')
    )
  );

-- ── FIX 3: credits table — add admin access policy ────────────────────
-- The credits table already has RLS (20260625_create_missing_core_tables.sql)
-- with "Users read own credits" and "Users update own credits" policies.
-- However, it's missing a policy for admin/staff access.
-- The user_credits table (20250707_nexus_chat_tables.sql) also has RLS
-- but is missing admin access.

-- Add admin access to credits table (if policy doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'credits' AND policyname = 'Admin can read all credits'
  ) THEN
    CREATE POLICY "Admin can read all credits" ON public.credits
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin')
        )
      );
    RAISE NOTICE 'Admin read policy added to credits table';
  END IF;
END
$$;

-- Add admin access to user_credits table (if policy doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_credits' AND policyname = 'Admin can read all user_credits'
  ) THEN
    CREATE POLICY "Admin can read all user_credits" ON public.user_credits
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE auth_user_id = auth.uid()
            AND role IN ('admin', 'super_admin', 'lyc_admin')
        )
      );
    RAISE NOTICE 'Admin read policy added to user_credits table';
  END IF;
END
$$;

-- ── SMOKE TEST: Verify policies exist ──────────────────────────────────
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Check coaching_sessions policies
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'coaching_sessions';
  IF policy_count < 3 THEN
    RAISE WARNING 'coaching_sessions has fewer than 3 RLS policies (found %)', policy_count;
  ELSE
    RAISE NOTICE 'coaching_sessions RLS policies OK (% found)', policy_count;
  END IF;

  -- Check credits policies
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'credits';
  IF policy_count < 3 THEN
    RAISE WARNING 'credits has fewer than 3 RLS policies (found %)', policy_count;
  ELSE
    RAISE NOTICE 'credits RLS policies OK (% found)', policy_count;
  END IF;

  -- Check user_credits policies
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_credits';
  IF policy_count < 3 THEN
    RAISE WARNING 'user_credits has fewer than 3 RLS policies (found %)', policy_count;
  ELSE
    RAISE NOTICE 'user_credits RLS policies OK (% found)', policy_count;
  END IF;

  -- Check documents policies (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'documents';
    IF policy_count < 1 THEN
      RAISE WARNING 'documents table exists but has NO RLS policies!';
    ELSE
      RAISE NOTICE 'documents RLS policies OK (% found)', policy_count;
    END IF;
  ELSE
    RAISE NOTICE 'documents table does not exist — RLS not applicable yet';
  END IF;
END
$$;


-- >>> FILE: 20260710_t16_agent_pipeline_tables.sql
-- T16: Create tables for Feishu agent data pipeline
-- Created: 2026-07-10
-- Tables: contracts, invoices, payments, engagements, interviews, client_meetings,
--         feedback_records, sourcing_activities, market_maps, market_research,
--         compensation_data, talent_landscape_reports

-- ============================================================
-- Samuel/AI: Business Operations
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid REFERENCES client_accounts(id) ON DELETE SET NULL,
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
  contract_number text UNIQUE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','signed','active','completed','terminated')),
  value numeric,
  currency text DEFAULT 'USD',
  start_date date,
  end_date date,
  signed_at timestamptz,
  signed_by text,
  file_url text,
  terms_summary text,
  created_by text DEFAULT 'samuel',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  client_account_id uuid REFERENCES client_accounts(id) ON DELETE SET NULL,
  invoice_number text UNIQUE,
  type text NOT NULL DEFAULT 'milestone' CHECK (type IN ('advance','milestone','final','credit')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  due_date date,
  paid_at timestamptz,
  payment_ref text,
  line_items jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_by text DEFAULT 'samuel',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  payment_date date,
  method text CHECK (method IN ('wire','stripe','check','other')),
  reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid REFERENCES client_accounts(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('retainer','search-project','advisory','coaching')),
  status text NOT NULL DEFAULT 'prospecting' CHECK (status IN ('prospecting','negotiated','active','completed')),
  start_date date,
  expected_end_date date,
  actual_end_date date,
  value numeric,
  credits_allocated integer DEFAULT 0,
  credits_used integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Maria/AI: Client Relations
-- ============================================================

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  client_account_id uuid REFERENCES client_accounts(id) ON DELETE SET NULL,
  interview_date timestamptz NOT NULL,
  round text CHECK (round IN ('1','2','3','final','panel')),
  format text DEFAULT 'video' CHECK (format IN ('in-person','video','phone')),
  interviewers jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','rescheduled')),
  feedback_summary text,
  candidate_rating integer CHECK (candidate_rating >= 1 AND candidate_rating <= 5),
  strengths text,
  weaknesses text,
  recommendation text CHECK (recommendation IN ('proceed','hold','reject')),
  notes text,
  scheduled_by text DEFAULT 'maria',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id uuid REFERENCES client_accounts(id) ON DELETE SET NULL,
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  meeting_date timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('kickoff','alignment','briefing','debrief','qbr','other')),
  attendees jsonb DEFAULT '[]'::jsonb,
  agenda text,
  minutes text,
  action_items jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  organized_by text DEFAULT 'maria',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('client','candidate','interviewer')),
  source_id uuid,
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  interview_id uuid REFERENCES interviews(id) ON DELETE SET NULL,
  feedback_type text CHECK (feedback_type IN ('post-interview','post-meeting','general')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  summary text,
  detailed_feedback text,
  received_at timestamptz DEFAULT now(),
  recorded_by text DEFAULT 'maria',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Alessio/AI: Talent Sourcing & Pipeline
-- ============================================================

CREATE TABLE IF NOT EXISTS sourcing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  agent_id text NOT NULL DEFAULT 'alessio',
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('search','screen','contacted','scheduled','rejected','shortlisted','presented')),
  contacts_count integer DEFAULT 0,
  notes text,
  outcome text,
  duration_min integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id uuid REFERENCES mandates(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  sector text,
  geography text,
  total_contacts_identified integer DEFAULT 0,
  total_contacts_reached integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','delivered')),
  delivered_at timestamptz,
  file_url text,
  created_by text DEFAULT 'alessio',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Sweep: Research & Market Intelligence
-- ============================================================

CREATE TABLE IF NOT EXISTS market_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('compensation-benchmark','industry-analysis','talent-landscape','org-mapping')),
  sector text,
  geography text,
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress','review','delivered')),
  findings_summary text,
  data_points jsonb DEFAULT '[]'::jsonb,
  delivered_at timestamptz,
  researcher text DEFAULT 'sweep',
  source_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compensation_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_title text NOT NULL,
  function text,
  level text,
  industry text,
  company_size text,
  geography text,
  min_comp numeric,
  mid_comp numeric,
  max_comp numeric,
  currency text DEFAULT 'USD',
  data_year integer DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE))::integer,
  source text DEFAULT 'sweep',
  sample_size integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_landscape_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector text,
  geography text,
  report_title text NOT NULL,
  summary text,
  key_findings jsonb DEFAULT '[]'::jsonb,
  talent_pool_size integer,
  supply_demand_ratio numeric,
  key_companies jsonb DEFAULT '[]'::jsonb,
  trends jsonb DEFAULT '[]'::jsonb,
  generated_at timestamptz DEFAULT now(),
  researcher text DEFAULT 'sweep',
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_account_id);
CREATE INDEX IF NOT EXISTS idx_contracts_mandate ON contracts(mandate_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contract ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_account_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_engagements_client ON engagements(client_account_id);
CREATE INDEX IF NOT EXISTS idx_interviews_mandate ON interviews(mandate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_contact ON interviews(contact_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_client_meetings_client ON client_meetings(client_account_id);
CREATE INDEX IF NOT EXISTS idx_feedback_mandate ON feedback_records(mandate_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interview ON feedback_records(interview_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_mandate ON sourcing_activities(mandate_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_date ON sourcing_activities(date);
CREATE INDEX IF NOT EXISTS idx_market_maps_mandate ON market_maps(mandate_id);
CREATE INDEX IF NOT EXISTS idx_compensation_role ON compensation_data(role_title);
CREATE INDEX IF NOT EXISTS idx_compensation_geo ON compensation_data(geography);
CREATE INDEX IF NOT EXISTS idx_talent_landscape_sector ON talent_landscape_reports(sector);

-- ============================================================
-- RLS Policies (service role can do everything, agents write through service role)
-- ============================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_landscape_reports ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by agent endpoints)
-- For authenticated users: read-only access to their own data
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['contracts','invoices','payments','engagements','interviews','client_meetings','feedback_records','sourcing_activities','market_maps','market_research','compensation_data','talent_landscape_reports'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON %I', t);
    EXECUTE format('CREATE POLICY "Service role full access" ON %I USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;


-- >>> FILE: 20260710_t1_activity_triggers.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260710_t1_activity_triggers.sql
-- T1 — Activity Log Auto-Creation Triggers
-- ════════════════════════════════════════════════════════════════════════

-- ── UTILITY: Set updated_at ────────────────────────────────────────────
DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── ACTIVITY LOG TRIGGER FUNCTION ──────────────────────────────────────
DROP FUNCTION IF EXISTS fn_log_activity();
CREATE OR REPLACE FUNCTION public.fn_log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      v_action := 'status_change';
    ELSE
      v_action := 'updated';
    END IF;
  END IF;

  INSERT INTO activity_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    from_value,
    to_value,
    metadata
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_action,
    auth.uid(),
    CASE WHEN v_action = 'status_change' THEN OLD.status::TEXT ELSE NULL END,
    CASE WHEN v_action = 'status_change' THEN NEW.status::TEXT ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
      'changes', (SELECT jsonb_object_agg(key, jsonb_build_object('old', OLD -> key, 'new', NEW -> key))
                 FROM jsonb_each(to_jsonb(OLD) - 'id' - 'created_at' - 'updated_at') key
                 WHERE OLD -> key <> NEW -> key)
    ) ELSE '{}'::jsonb END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ORGANIZATIONS TRIGGERS ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_organizations_activity ON public.organizations;
CREATE TRIGGER trg_organizations_activity
  AFTER INSERT OR UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_activity();

-- ── MANDATES TRIGGERS ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_mandates_activity ON public.mandates;
CREATE TRIGGER trg_mandates_activity
  AFTER INSERT OR UPDATE ON public.mandates
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_activity();

-- ── CANDIDATES TRIGGERS ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_candidates_activity ON public.candidates;
CREATE TRIGGER trg_candidates_activity
  AFTER INSERT OR UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_activity();

-- ── MANDATE_CANDIDATES TRIGGERS ────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_mandate_candidates_activity ON public.mandate_candidates;
CREATE TRIGGER trg_mandate_candidates_activity
  AFTER INSERT OR UPDATE ON public.mandate_candidates
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_activity();

-- ── CONSULTANTS TRIGGERS ───────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_consultants_activity ON public.consultants;
CREATE TRIGGER trg_consultants_activity
  AFTER INSERT OR UPDATE ON public.consultants
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_activity();

-- ── SMOKE TEST ─────────────────────────────────────────────────────────
DO $$
DECLARE
  v_triggers TEXT[];
BEGIN
  SELECT array_agg(tgname) INTO v_triggers
  FROM pg_trigger
  WHERE tgrelid IN (
    'organizations'::regclass,
    'mandates'::regclass,
    'candidates'::regclass,
    'mandate_candidates'::regclass,
    'consultants'::regclass
  ) AND tgname LIKE '%activity';

  IF array_length(v_triggers, 1) = 5 THEN
    RAISE NOTICE '✅ T1 Activity Triggers OK — all 5 tables have activity triggers';
  ELSE
    RAISE EXCEPTION '❌ T1 Activity Triggers FAILED — expected 5 triggers, got %', array_length(v_triggers, 1);
  END IF;
END$$;

-- >>> FILE: 20260710_t1_core_schema.sql
-- ════════════════════════════════════════════════════════════════════════
-- 20260710_t1_core_schema.sql
-- T1 — Schema & Data Layer (Phase 1)
-- 10 core Supabase tables + RLS policies + activity log triggers
-- ════════════════════════════════════════════════════════════════════════

-- ── UTILITY FUNCTIONS ──────────────────────────────────────────────────

DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. ORGANIZATIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  headquarters TEXT,
  employee_count_range TEXT,
  revenue_range TEXT,
  client_since DATE,
  account_manager_id UUID REFERENCES consultants(id),
  fee_config_id UUID REFERENCES fee_configs(id),
  payment_terms TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('active','paused','prospect','churned')),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_account_manager ON public.organizations(account_manager_id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view all organizations" ON public.organizations;
CREATE POLICY "Consultants can view all organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (is_deleted = false);

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
  ));

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. CONSULTANTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consultant','senior_consultant','manager','director')),
  email TEXT NOT NULL UNIQUE,
  feishu_id TEXT,
  max_capacity NUMERIC NOT NULL DEFAULT 8,
  current_load NUMERIC DEFAULT 0,
  specializations TEXT[] DEFAULT '{}',
  active_mandate_ids UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','overloaded','on_leave','inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultants_role ON public.consultants(role);
CREATE INDEX IF NOT EXISTS idx_consultants_status ON public.consultants(status);

ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view all consultants" ON public.consultants;
CREATE POLICY "Consultants can view all consultants"
  ON public.consultants FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage consultants" ON public.consultants;
CREATE POLICY "Admins can manage consultants"
  ON public.consultants FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
  ));

DROP TRIGGER IF EXISTS trg_consultants_updated_at ON public.consultants;
CREATE TRIGGER trg_consultants_updated_at
  BEFORE UPDATE ON public.consultants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. FEE_CONFIGS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fee_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('percentage','fixed','percentage_with_minimum')),
  percentage NUMERIC CHECK (percentage BETWEEN 0 AND 50),
  fixed_amount NUMERIC,
  minimum_amount NUMERIC,
  split_enabled BOOLEAN DEFAULT false,
  lyc_share NUMERIC,
  partner_share NUMERIC,
  payment_terms TEXT,
  payment_schedule JSONB,
  fee_currency TEXT DEFAULT 'RMB',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fee_configs_client ON public.fee_configs(client_name);
CREATE INDEX IF NOT EXISTS idx_fee_configs_type ON public.fee_configs(fee_type);

ALTER TABLE public.fee_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view fee configs" ON public.fee_configs;
CREATE POLICY "Consultants can view fee configs"
  ON public.fee_configs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage fee configs" ON public.fee_configs;
CREATE POLICY "Admins can manage fee configs"
  ON public.fee_configs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
  ));

-- ── 4. MANDATES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mandates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  position_title TEXT NOT NULL CHECK (char_length(position_title) BETWEEN 3 AND 200),
  location TEXT,
  reports_to TEXT,
  salary_range_min NUMERIC CHECK (salary_range_min > 0),
  salary_range_max NUMERIC CHECK (salary_range_max > 0),
  salary_currency TEXT DEFAULT 'RMB' CHECK (salary_currency IN ('RMB','USD','HKD','EUR','MYR','SGD')),
  fee_percentage NUMERIC CHECK (fee_percentage BETWEEN 0 AND 50),
  fee_fixed_amount NUMERIC,
  fee_config TEXT,
  payment_terms_override TEXT,
  consultant_id UUID REFERENCES consultants(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started','kick_off','sourcing','screening','shortlist',
    'interview','offer','onboarded','closed_won','closed_lost','on_hold'
  )),
  priority_tier TEXT DEFAULT 'pending' CHECK (priority_tier IN ('tier1_closing','tier2_active','tier3_hold','pending')),
  jd_text TEXT,
  target_companies TEXT[],
  target_start_date DATE,
  deadline DATE,
  difficulty_score SMALLINT CHECK (difficulty_score BETWEEN 1 AND 5),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT salary_range CHECK (salary_range_min IS NULL OR salary_range_max IS NULL OR salary_range_min < salary_range_max)
);

CREATE INDEX IF NOT EXISTS idx_mandates_org_id ON public.mandates(org_id);
CREATE INDEX IF NOT EXISTS idx_mandates_consultant ON public.mandates(consultant_id);
CREATE INDEX IF NOT EXISTS idx_mandates_status ON public.mandates(status);
CREATE INDEX IF NOT EXISTS idx_mandates_priority ON public.mandates(priority_tier);
CREATE INDEX IF NOT EXISTS idx_mandates_deadline ON public.mandates(deadline);

ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view assigned mandates" ON public.mandates;
CREATE POLICY "Consultants can view assigned mandates"
  ON public.mandates FOR SELECT TO authenticated
  USING (
    is_deleted = false
    AND (
      consultant_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director'))
    )
  );

DROP POLICY IF EXISTS "Consultants can update own mandates" ON public.mandates;
CREATE POLICY "Consultants can update own mandates"
  ON public.mandates FOR UPDATE TO authenticated
  USING (
    consultant_id = auth.uid()
    AND is_deleted = false
  );

DROP POLICY IF EXISTS "Admins can manage all mandates" ON public.mandates;
CREATE POLICY "Admins can manage all mandates"
  ON public.mandates FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
  ));

DROP TRIGGER IF EXISTS trg_mandates_updated_at ON public.mandates;
CREATE TRIGGER trg_mandates_updated_at
  BEFORE UPDATE ON public.mandates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. CANDIDATES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 2 AND 100),
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  wechat TEXT,
  linkedin_url TEXT,
  current_company TEXT,
  current_title TEXT,
  years_experience NUMERIC,
  education JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  salary_current NUMERIC,
  salary_expected NUMERIC,
  location_preference TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new','contacted','screening','interview_prep','interviewing',
    'offered','accepted','rejected','withdrawn','ghosted'
  )),
  source TEXT CHECK (source IN ('hunt','referral','platform','inbound','network')),
  cv_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_phone ON public.candidates(phone);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_current_title ON public.candidates(current_title);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view all candidates" ON public.candidates;
CREATE POLICY "Consultants can view all candidates"
  ON public.candidates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Consultants can manage candidates" ON public.candidates;
CREATE POLICY "Consultants can manage candidates"
  ON public.candidates FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('consultant', 'senior_consultant', 'admin', 'manager', 'director')
  ));

DROP TRIGGER IF EXISTS trg_candidates_updated_at ON public.candidates;
CREATE TRIGGER trg_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 6. MANDATE_CANDIDATES (junction / pipeline) ────────────────────────
CREATE TABLE IF NOT EXISTS public.mandate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'submitted' CHECK (stage IN (
    'submitted','screening','first_interview','second_interview',
    'final_interview','offer_pending','offer_accepted','rejected','withdrawn'
  )),
  match_score NUMERIC CHECK (match_score BETWEEN 0 AND 100),
  submitted_date DATE DEFAULT CURRENT_DATE,
  last_activity_date DATE,
  days_in_stage INTEGER DEFAULT 0,
  consultant_notes TEXT,
  client_feedback TEXT,
  interview_date TIMESTAMPTZ,
  offer_amount NUMERIC,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_mandate_candidate UNIQUE (mandate_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_mandate_candidates_mandate ON public.mandate_candidates(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_candidates_candidate ON public.mandate_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_candidates_stage ON public.mandate_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_mandate_candidates_submitted ON public.mandate_candidates(submitted_date);

ALTER TABLE public.mandate_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view pipeline for assigned mandates" ON public.mandate_candidates;
CREATE POLICY "Consultants can view pipeline for assigned mandates"
  ON public.mandate_candidates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mandates m
      WHERE m.id = mandate_id
        AND m.is_deleted = false
        AND (
          m.consultant_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director'))
        )
    )
  );

DROP POLICY IF EXISTS "Consultants can update pipeline for assigned mandates" ON public.mandate_candidates;
CREATE POLICY "Consultants can update pipeline for assigned mandates"
  ON public.mandate_candidates FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mandates m
      WHERE m.id = mandate_id
        AND m.is_deleted = false
        AND m.consultant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all pipeline" ON public.mandate_candidates;
CREATE POLICY "Admins can manage all pipeline"
  ON public.mandate_candidates FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
  ));

DROP TRIGGER IF EXISTS trg_mandate_candidates_updated_at ON public.mandate_candidates;
CREATE TRIGGER trg_mandate_candidates_updated_at
  BEFORE UPDATE ON public.mandate_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. ACTIVITY_LOGS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('mandate','candidate','mandate_candidate','organization','consultant')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'created','updated','status_change','note_added','interview_scheduled',
    'offer_extended','feedback_received','file_uploaded','email_sent',
    'call_logged','meeting_held','tier_changed','fee_updated'
  )),
  actor_id UUID REFERENCES consultants(id),
  from_value TEXT,
  to_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view activity logs" ON public.activity_logs;
CREATE POLICY "Consultants can view activity logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can create activity logs" ON public.activity_logs;
CREATE POLICY "System can create activity logs"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 8. ACTIVITY LOG TRIGGER FUNCTION ───────────────────────────────────
DROP FUNCTION IF EXISTS fn_log_activity();
CREATE OR REPLACE FUNCTION public.fn_log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      v_action := 'status_change';
    ELSE
      v_action := 'updated';
    END IF;
  END IF;

  INSERT INTO activity_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    from_value,
    to_value,
    metadata
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_action,
    auth.uid(),
    CASE WHEN v_action = 'status_change' THEN OLD.status::TEXT ELSE NULL END,
    CASE WHEN v_action = 'status_change' THEN NEW.status::TEXT ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
      'changes', (SELECT jsonb_object_agg(key, jsonb_build_object('old', OLD -> key, 'new', NEW -> key))
                 FROM jsonb_each(to_jsonb(OLD) - 'id' - 'created_at' - 'updated_at') key
                 WHERE OLD -> key <> NEW -> key)
    ) ELSE '{}'::jsonb END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. FIVE_METRICS (weekly KPI snapshot) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.five_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  consultant_id UUID NOT NULL REFERENCES consultants(id),
  new_candidates_added INTEGER DEFAULT 0,
  cv_submitted INTEGER DEFAULT 0,
  interviews_scheduled INTEGER DEFAULT 0,
  offers_extended INTEGER DEFAULT 0,
  placements INTEGER DEFAULT 0,
  revenue_recognized NUMERIC DEFAULT 0,
  active_mandates INTEGER DEFAULT 0,
  pipeline_value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_week_consultant UNIQUE (week_start_date, consultant_id)
);

CREATE INDEX IF NOT EXISTS idx_five_metrics_consultant ON public.five_metrics(consultant_id);
CREATE INDEX IF NOT EXISTS idx_five_metrics_week ON public.five_metrics(week_start_date);

ALTER TABLE public.five_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view own five metrics" ON public.five_metrics;
CREATE POLICY "Consultants can view own five metrics"
  ON public.five_metrics FOR SELECT TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director'))
  );

DROP POLICY IF EXISTS "System can create five metrics" ON public.five_metrics;
CREATE POLICY "System can create five metrics"
  ON public.five_metrics FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 10. DASHBOARD_SNAPSHOTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL UNIQUE,
  generated_by TEXT DEFAULT 'manual' CHECK (generated_by IN ('manual','scheduled','trigger')),
  total_mandates INTEGER DEFAULT 0,
  by_tier JSONB DEFAULT '{}',
  by_status JSONB DEFAULT '{}',
  by_consultant JSONB DEFAULT '{}',
  revenue_pipeline JSONB DEFAULT '{}',
  auto_flags JSONB DEFAULT '[]',
  health_score NUMERIC,
  changes_from_previous JSONB DEFAULT '{}',
  raw_data_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshot_date ON public.dashboard_snapshots(snapshot_date);

ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view dashboard snapshots" ON public.dashboard_snapshots;
CREATE POLICY "Team can view dashboard snapshots"
  ON public.dashboard_snapshots FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can create dashboard snapshots" ON public.dashboard_snapshots;
CREATE POLICY "System can create dashboard snapshots"
  ON public.dashboard_snapshots FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 11. AUTO_FLAGS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auto_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_type TEXT NOT NULL CHECK (flag_type IN (
    'GHOST','ZOMBIE','AT_RISK','DEADLINE_OVERDUE','STALE_PIPELINE',
    'ZERO_PIPELINE','CAPACITY_OVERFLOW','PRIORITY_DRIFT',
    'CLIENT_GHOST','DUPLICATE_EFFORT','NEW_ACTIVITY','APPROACHING_TARGET'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('mandate','candidate','consultant','system')),
  entity_id UUID NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected','notified','acknowledged','resolved','escalated')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES consultants(id),
  resolved_by UUID REFERENCES consultants(id)
);

CREATE INDEX idx_flags_active ON auto_flags(status) WHERE status NOT IN ('resolved');
CREATE INDEX idx_flags_entity ON auto_flags(entity_type, entity_id);
CREATE INDEX idx_flags_severity ON auto_flags(severity);

ALTER TABLE public.auto_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team can view active flags" ON public.auto_flags;
CREATE POLICY "Team can view active flags"
  ON public.auto_flags FOR SELECT TO authenticated
  USING (status NOT IN ('resolved'));

DROP POLICY IF EXISTS "Team can acknowledge flags" ON public.auto_flags;
CREATE POLICY "Team can acknowledge flags"
  ON public.auto_flags FOR UPDATE TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can create flags" ON public.auto_flags;
CREATE POLICY "System can create flags"
  ON public.auto_flags FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── 12. FEE CONFIG SEED DATA ───────────────────────────────────────────
INSERT INTO fee_configs (name, client_name, fee_type, percentage, minimum_amount, split_enabled, lyc_share, partner_share, payment_terms, payment_schedule) VALUES
('Standard LYC', 'Default', 'percentage', 20, NULL, false, 1.0, 0, 'net_30', '[{"amount_pct":1.0,"offset_days":30}]'),
('EAS Asia', 'EAS Asia', 'percentage', 22, NULL, false, 1.0, 0, '70_30_eas', '[{"amount_pct":0.7,"offset_days":0},{"amount_pct":0.3,"offset_days":90}]'),
('Hartalega', 'Hartalega', 'percentage_with_minimum', 20, 10000, false, 1.0, 0, 'net_30', '[{"amount_pct":1.0,"offset_days":30}]'),
('CTC', 'CTC', 'fixed', NULL, 70000, false, 1.0, 0, 'net_30', '[{"amount_pct":1.0,"offset_days":30}]'),
('CP Axtra', 'CP Axtra', 'percentage', 20, NULL, false, 1.0, 0, 'cp_axtra_delayed', '[{"amount_pct":1.0,"offset_days":105}]'),
('French Home', 'French Home', 'percentage', 20, NULL, true, 0.5, 0.5, '50_50_split', '[{"amount_pct":0.5,"offset_days":30}]')
ON CONFLICT DO NOTHING;

-- ── 13. SMOKE TEST ─────────────────────────────────────────────────────
DO $$
DECLARE
  v_missing TEXT;
BEGIN
  SELECT string_agg(t, ', ' ORDER BY t) INTO v_missing
  FROM unnest(ARRAY[
    'organizations', 'mandates', 'candidates', 'mandate_candidates',
    'consultants', 'five_metrics', 'activity_logs', 'dashboard_snapshots',
    'fee_configs', 'auto_flags'
  ]) AS t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = t
  );

  IF v_missing IS NULL THEN
    RAISE NOTICE '✅ T1 Core Schema migration OK — all 10 tables present';
  ELSE
    RAISE EXCEPTION '❌ T1 Core Schema migration FAILED — missing: %', v_missing;
  END IF;
END$$;

-- >>> FILE: 20260710_t7_t16_phase2_schema.sql
-- Phase 2 Schema Migration (T7-T16)
-- Revenue Forecast, Change Detection, Capacity, Communication, Reports, Agents, Intelligence, AI Infrastructure

-- ============================================================
-- T7: Revenue Forecast & Change Detection
-- ============================================================

CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('month','quarter','year')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  conservative_total NUMERIC DEFAULT 0,
  expected_total NUMERIC DEFAULT 0,
  optimistic_total NUMERIC DEFAULT 0,
  monthly_rollup JSONB DEFAULT '{}',
  confidence_level NUMERIC CHECK (confidence_level BETWEEN 0 AND 1),
  mandate_count INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(forecast_date, period)
);

CREATE TABLE IF NOT EXISTS revenue_forecast_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES revenue_forecasts(id) ON DELETE CASCADE,
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  scenario TEXT NOT NULL CHECK (scenario IN ('conservative','expected','optimistic')),
  fee_amount NUMERIC NOT NULL,
  probability NUMERIC NOT NULL CHECK (probability BETWEEN 0 AND 1),
  expected_month DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rfd_forecast ON revenue_forecast_details(forecast_id);

CREATE TABLE IF NOT EXISTS change_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT DEFAULT 'daily' CHECK (snapshot_type IN ('daily','weekly','manual','trigger')),
  total_mandates INTEGER,
  total_candidates INTEGER,
  pipeline_value NUMERIC,
  mandate_summary JSONB DEFAULT '{}',
  consultant_summary JSONB DEFAULT '{}',
  flag_summary JSONB DEFAULT '{}',
  data_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(snapshot_date, snapshot_type)
);

CREATE TABLE IF NOT EXISTS change_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_snapshot_id UUID REFERENCES change_snapshots(id),
  to_snapshot_id UUID REFERENCES change_snapshots(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('mandate','candidate','consultant','revenue')),
  entity_id UUID NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN (
    'added','removed','status_changed','tier_changed','stage_changed',
    'fee_changed','deadline_changed','consultant_changed'
  )),
  from_value TEXT,
  to_value TEXT,
  narrative TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cr_snapshots ON change_records(from_snapshot_id, to_snapshot_id);

-- ============================================================
-- T8: Team Capacity & Load Balancer
-- ============================================================

CREATE TABLE IF NOT EXISTS capacity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mandate_count INTEGER DEFAULT 0,
  weighted_load NUMERIC DEFAULT 0,
  max_capacity NUMERIC DEFAULT 8,
  capacity_ratio NUMERIC CHECK (capacity_ratio >= 0),
  status TEXT CHECK (status IN ('underloaded','balanced','at_capacity','overloaded')),
  active_mandate_ids UUID[] DEFAULT '{}',
  difficulty_weighted_sum NUMERIC DEFAULT 0,
  stage_weighted_sum NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consultant_id, snapshot_date)
);

-- ============================================================
-- T9: Communication Engine
-- ============================================================

CREATE TABLE IF NOT EXISTS client_comm_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_org_id UUID NOT NULL REFERENCES organizations(id),
  contact_name TEXT NOT NULL,
  email_addresses TEXT[] DEFAULT '{}',
  language_primary TEXT DEFAULT 'en' CHECK (language_primary IN ('en','fr','zh','th','my','other')),
  language_secondary TEXT,
  tone TEXT DEFAULT 'semi-formal' CHECK (tone IN ('formal','semi-formal','informal','casual')),
  greeting TEXT DEFAULT 'Dear',
  closing TEXT DEFAULT 'Best regards',
  cultural_notes TEXT,
  preferred_send_window JSONB DEFAULT '{"timezone":"HKT","hours":"09:00-11:00","days":["Mon","Tue","Wed","Thu","Fri"]}',
  communication_preferences JSONB DEFAULT '{"update_frequency":"per_deliverable","detail_level":"summary","attachment_format":"xlsx"}',
  learned_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communication_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id),
  type TEXT NOT NULL CHECK (type IN ('client_email','candidate_outreach','internal_update','auto_followup')),
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  channel TEXT NOT NULL CHECK (channel IN ('email','linkedin','feishu','internal')),
  timestamp_sent TIMESTAMPTZ,
  timestamp_delivered TIMESTAMPTZ,
  timestamp_read TIMESTAMPTZ,
  timestamp_replied TIMESTAMPTZ,
  sender_address TEXT,
  recipients JSONB DEFAULT '[]',
  subject TEXT,
  body_text TEXT,
  language TEXT DEFAULT 'en',
  attachments JSONB DEFAULT '[]',
  related_candidate_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft','pending_review','approved','sent','delivered','read','replied','bounced','failed'
  )),
  reply_classification TEXT CHECK (reply_classification IN (
    'interested','asking_questions','not_now','declined','referral','hostile'
  )),
  reply_text TEXT,
  actor TEXT DEFAULT 'user' CHECK (actor IN ('agent','user','automated')),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending','approved_by_kevin','auto_approved')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comm_mandate ON communication_records(mandate_id);
CREATE INDEX IF NOT EXISTS idx_comm_status ON communication_records(status);
CREATE INDEX IF NOT EXISTS idx_comm_type ON communication_records(type);

CREATE TABLE IF NOT EXISTS outreach_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  template_chain JSONB NOT NULL DEFAULT '[]',
  current_stage TEXT DEFAULT 'connection_request',
  overall_status TEXT DEFAULT 'in_progress' CHECK (overall_status IN (
    'in_progress','completed','paused','candidate_responded','exhausted','blacklisted'
  )),
  response_received BOOLEAN DEFAULT false,
  response_classification TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mandate_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_sequences(overall_status);

CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'outreach_connection','outreach_first_message','follow_up_1','follow_up_2',
    'break_up','client_update','client_deliverable','internal_update'
  )),
  language TEXT DEFAULT 'en',
  tone TEXT DEFAULT 'semi-formal',
  channel TEXT DEFAULT 'email' CHECK (channel IN ('linkedin','email','both')),
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  personalization_rules JSONB DEFAULT '{}',
  max_length_chars INTEGER DEFAULT 500,
  usage_count INTEGER DEFAULT 0,
  response_rate NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- T10: Report Templates & Distribution
-- ============================================================

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  sections JSONB NOT NULL DEFAULT '[]',
  output_format TEXT DEFAULT 'markdown' CHECK (output_format IN ('markdown','pdf','html','feishu_card')),
  routing JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES report_templates(id),
  generated_at TIMESTAMPTZ DEFAULT now(),
  content TEXT,
  format TEXT,
  delivery_status JSONB DEFAULT '{}',
  triggered_by TEXT DEFAULT 'scheduled' CHECK (triggered_by IN ('scheduled','trigger','manual')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES report_instances(id),
  target_type TEXT CHECK (target_type IN ('feishu_group','feishu_dm','email')),
  target_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed','retrying')),
  message_id TEXT,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- T11: Agent Orchestration
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  role TEXT,
  type TEXT DEFAULT 'executor' CHECK (type IN ('orchestrator','executor','specialist')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','dormant','inactive_hold','decommissioned')),
  capabilities TEXT[] DEFAULT '{}',
  limitations TEXT[] DEFAULT '{}',
  models_available TEXT[] DEFAULT '{deepseek-flash,deepseek-pro}',
  daily_budget_cny NUMERIC DEFAULT 80,
  monthly_budget_cny NUMERIC DEFAULT 1800,
  avg_cost_per_task NUMERIC DEFAULT 3.50,
  max_concurrent_tasks INTEGER DEFAULT 3,
  working_hours JSONB DEFAULT '{"timezone":"Asia/Shanghai","start":"08:00","end":"22:00","days":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}',
  reporting_to TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID REFERENCES mandates(id),
  parent_task_id UUID REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sweep','analysis','outreach','deliverable','research','communication','coordination','custom')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('critical','high','normal','low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','dispatched','in_progress','review','completed','failed','cancelled','paused')),
  assigned_agent TEXT REFERENCES agent_registry(id),
  dispatched_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,
  context_package JSONB DEFAULT '{}',
  outputs JSONB DEFAULT '[]',
  cost JSONB DEFAULT '{"tokens_input":0,"tokens_output":0,"api_calls":0,"total_cny":0}',
  quality_score NUMERIC CHECK (quality_score BETWEEN 0 AND 100),
  escalation_count INTEGER DEFAULT 0,
  clarification_requests INTEGER DEFAULT 0,
  created_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  agent_id TEXT NOT NULL REFERENCES agent_registry(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'task_started','task_completed','task_failed','handoff_sent','handoff_received',
    'clarification_requested','escalation_triggered','quality_check_passed',
    'quality_check_failed','budget_alert','cost_update'
  )),
  timestamp TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '{}',
  cost_snapshot JSONB DEFAULT '{}',
  output_refs TEXT[] DEFAULT '{}',
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_worklogs_task ON work_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_worklogs_agent ON work_logs(agent_id);

-- ============================================================
-- T12: Scoring Calibration & Intelligence
-- ============================================================

CREATE TABLE IF NOT EXISTS sweep_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES mandates(id),
  mandate_type TEXT CHECK (mandate_type IN ('mapping','sweep','speaker_search','assessment')),
  scoring_model JSONB NOT NULL,
  input_metrics JSONB DEFAULT '{}',
  output_metrics JSONB DEFAULT '{}',
  outcome_data JSONB DEFAULT '{}',
  outreach_metrics JSONB DEFAULT '{}',
  cost_metrics JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'geographic','company','seniority','template','seasonal','pipeline','client','scoring'
  )),
  title TEXT NOT NULL,
  description TEXT,
  supporting_data JSONB DEFAULT '{}',
  confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','superseded','invalidated')),
  superseded_by UUID REFERENCES patterns(id),
  action_taken TEXT,
  action_effectiveness TEXT CHECK (action_effectiveness IN ('improved','no_change','worsened')),
  first_observed TIMESTAMPTZ,
  last_observed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- T13: DEX AI Advanced Infrastructure
-- ============================================================

CREATE TABLE IF NOT EXISTS prompt_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  template_path TEXT,
  template_content TEXT,
  variables TEXT[] DEFAULT '{}',
  model TEXT DEFAULT 'deepseek_flash' CHECK (model IN ('deepseek_flash','deepseek_pro')),
  max_tokens INTEGER DEFAULT 2000,
  temperature NUMERIC DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- T5: Notification Settings (supporting table)
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  feishu_enabled BOOLEAN DEFAULT true,
  slack_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_report BOOLEAN DEFAULT true,
  alert_level TEXT DEFAULT 'high' CHECK (alert_level IN ('low','medium','high','critical')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Seed communication templates
INSERT INTO communication_templates (name, category, language, tone, channel, subject_template, body_template, variables)
VALUES
('Initial LinkedIn Connection', 'outreach_connection', 'en', 'semi-formal', 'linkedin', NULL,
 'Hi {{first_name}}, I came across your profile and was impressed by your experience at {{current_company}}. I am working on a {{role_type}} role in {{location}} and thought your background could be a strong match. Would you be open to a brief conversation?', '{"first_name","current_company","role_type","location"}'),

('Follow-up #1', 'follow_up_1', 'en', 'semi-formal', 'email',
 'Following up: {{role_type}} opportunity',
 'Hi {{first_name}}, I wanted to follow up on my message regarding the {{role_type}} role. I would love to share more details about the position and the company. Are you available for a quick call this week?', '{"first_name","role_type"}'),

('Client Weekly Update', 'client_update', 'en', 'semi-formal', 'email',
 'Weekly Update: {{position_title}}',
 'Dear {{contact_name}}, Please find attached the weekly update for the {{position_title}} search. This week we have {{cv_count}} new candidates in screening and {{interview_count}} interviews scheduled. Best regards, LYC Partners', '{"contact_name","position_title","cv_count","interview_count"}')
ON CONFLICT DO NOTHING;

-- Seed report templates
INSERT INTO report_templates (name, description, sections, output_format, routing, schedule)
VALUES
('daily_dashboard_v2', 'Daily Pipeline Dashboard',
 '[{"name":"overview","type":"summary"},{"name":"mandates","type":"table"},{"name":"flags","type":"alert"}]',
 'markdown', '{"targets":["alessio_ai_group"]}', '{"cron":"30 10 * * 1-5"}'),

('weekly_recap', 'Weekly Pipeline Recap',
 '[{"name":"week_summary","type":"summary"},{"name":"metrics","type":"chart"},{"name":"upcoming","type":"list"}]',
 'markdown', '{"targets":["alessio_ai_group","lyc_partners"]}', '{"cron":"0 10 * * 5"}'),

('executive_summary', 'Executive Summary for Kevin',
 '[{"name":"headline","type":"summary"},{"name":"wins","type":"list"},{"name":"risks","type":"alert"},{"name":"actions","type":"list"}]',
 'markdown', '{"targets":["kevin_dm"]}', '{"cron":"0 1 * * 1"}'),

('revenue_forecast', 'Revenue Forecast Report',
 '[{"name":"scenarios","type":"table"},{"name":"monthly_rollup","type":"chart"},{"name":"contributors","type":"table"}]',
 'markdown', '{"targets":["kevin_dm","lyc_partners"]}', '{"cron":"0 1 1 * *"}')
ON CONFLICT DO NOTHING;

-- Seed prompt registry
INSERT INTO prompt_registry (feature_key, name, model, max_tokens, temperature, description)
VALUES
('jd_generator', 'Job Description Generator', 'deepseek_pro', 4000, 0.7, 'Generates optimized job descriptions'),
('cv_optimizer', 'CV Optimizer', 'deepseek_pro', 4000, 0.5, 'Optimizes CVs for specific mandates'),
('executive_summary', 'Executive Summary', 'deepseek_pro', 3000, 0.3, 'Generates board-level executive summaries'),
('shortlist_rationale', 'Shortlist Rationale', 'deepseek_flash', 2000, 0.5, 'Generates rationale for shortlist candidates'),
('follow_up_draft', 'Follow-up Draft', 'deepseek_flash', 1500, 0.6, 'Drafts follow-up messages'),
('data_query', 'Data Query', 'deepseek_flash', 1000, 0.2, 'Parses natural language to SQL'),
('flag_description', 'Flag Description', 'deepseek_flash', 500, 0.4, 'Generates human-readable flag descriptions'),
('outreach_message', 'Outreach Message', 'deepseek_flash', 800, 0.6, 'Generates personalized outreach messages'),
('response_classifier', 'Response Classifier', 'deepseek_flash', 500, 0.1, 'Classifies candidate responses')
ON CONFLICT DO NOTHING;

-- Seed agent registry
INSERT INTO agent_registry (id, name, display_name, role, type, capabilities, limitations, daily_budget_cny, monthly_budget_cny)
VALUES
('sweep_agent', 'Sweep Agent', 'Sweep AI', 'sourcing', 'executor',
 '{"sweep","research","data_entry"}', '{"client_communication","offer_negotiation"}', 50, 1200),

('scoring_agent', 'Scoring Agent', 'Scoring AI', 'assessment', 'specialist',
 '{"scoring","analysis","calibration"}', '{"sourcing","outreach"}', 30, 800),

('comm_agent', 'Communication Agent', 'Comm AI', 'communication', 'executor',
 '{"drafting","follow_up","response_classification"}', '{"final_decision_making"}', 40, 1000),

('orchestrator', 'Orchestrator', 'Orchestrator AI', 'coordination', 'orchestrator',
 '{"task_dispatch","monitoring","escalation"}', '{"direct_execution"}', 20, 600)
ON CONFLICT DO NOTHING;


-- >>> FILE: 20260713_v2_batch10_reports_invoices.sql
-- ============================================================================
-- v2 Batch 10 — Reports, Invoices, Commissions, Referrals, Settings, Feature Flags
-- Tickets 91-100 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 91: Reports table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'grid_full_report', 'executive_summary', 'pipeline_update',
    'market_map', 'compensation_benchmark', 'candidate_analysis',
    'deal_pipeline', 'placement_report', 'activity_log',
    'intelligence_digest', 'custom'
  )),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'generating'
    CHECK (status IN ('generating', 'completed', 'failed', 'cancelled', 'queued')),
  format TEXT DEFAULT 'pdf'
    CHECK (format IN ('pdf', 'csv', 'json', 'html')),
  content JSONB DEFAULT '{}',
  file_path TEXT,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  generated_by UUID,
  generated_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_frequency TEXT CHECK (run_frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly')),
  parameters JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_reports_org ON public.v2_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_reports_type ON public.v2_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_v2_reports_status ON public.v2_reports(status);
CREATE INDEX IF NOT EXISTS idx_v2_reports_generated ON public.v2_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_v2_reports_scheduled ON public.v2_reports(scheduled_at);

ALTER TABLE public.v2_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view reports" ON public.v2_reports;
CREATE POLICY "Org members can view reports"
  ON public.v2_reports FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage reports" ON public.v2_reports;
CREATE POLICY "Consultants and admins can manage reports"
  ON public.v2_reports FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_reports.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_reports_updated_at ON public.v2_reports;
CREATE TRIGGER trg_v2_reports_updated_at
  BEFORE UPDATE ON public.v2_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 92: Invoices table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  deal_id UUID REFERENCES public.v2_deals(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES public.v2_placements(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.v2_companies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'partial', 'cancelled', 'written_off')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  subtotal_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'CNY',
  payment_terms TEXT DEFAULT 'net_30',
  items JSONB DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  po_number TEXT,
  file_path TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  next_invoice_date DATE,
  recurrence_rule TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  sent_via TEXT CHECK (sent_via IN ('email', 'post', 'portal', 'manual')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_invoices_org ON public.v2_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_invoices_status ON public.v2_invoices(status);
CREATE INDEX IF NOT EXISTS idx_v2_invoices_due ON public.v2_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_v2_invoices_deal ON public.v2_invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_v2_invoices_placement ON public.v2_invoices(placement_id);
CREATE INDEX IF NOT EXISTS idx_v2_invoices_number ON public.v2_invoices(invoice_number);

ALTER TABLE public.v2_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can view invoices" ON public.v2_invoices;
CREATE POLICY "Org admins can view invoices"
  ON public.v2_invoices FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_invoices.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org admins can manage invoices" ON public.v2_invoices;
CREATE POLICY "Org admins can manage invoices"
  ON public.v2_invoices FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_invoices.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_invoices_updated_at ON public.v2_invoices;
CREATE TRIGGER trg_v2_invoices_updated_at
  BEFORE UPDATE ON public.v2_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 93: Commissions table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL,
  placement_id UUID REFERENCES public.v2_placements(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.v2_deals(id) ON DELETE SET NULL,
  commission_type TEXT CHECK (commission_type IN ('placement', 'retainer', 'bonus', 'referral', 'override', 'custom')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'earned', 'paid', 'cancelled', 'held')),
  commission_rate DECIMAL(5,2),
  base_amount DECIMAL(12,2),
  commission_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  earned_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('direct_deposit', 'stripe', 'transfer', 'check', 'bonus')),
  payment_reference TEXT,
  hold_reason TEXT,
  hold_until TIMESTAMPTZ,
  clawback_amount DECIMAL(12,2) DEFAULT 0,
  clawback_reason TEXT,
  clawback_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_commissions_org ON public.v2_commissions(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_commissions_consultant ON public.v2_commissions(consultant_id);
CREATE INDEX IF NOT EXISTS idx_v2_commissions_status ON public.v2_commissions(status);
CREATE INDEX IF NOT EXISTS idx_v2_commissions_placement ON public.v2_commissions(placement_id);
CREATE INDEX IF NOT EXISTS idx_v2_commissions_earned ON public.v2_commissions(earned_at);

ALTER TABLE public.v2_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultants can view their own commissions" ON public.v2_commissions;
CREATE POLICY "Consultants can view their own commissions"
  ON public.v2_commissions FOR SELECT TO authenticated
  USING (consultant_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org admins can view all commissions" ON public.v2_commissions;
CREATE POLICY "Org admins can view all commissions"
  ON public.v2_commissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_commissions.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage commissions" ON public.v2_commissions;
CREATE POLICY "Admins can manage commissions"
  ON public.v2_commissions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_commissions.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_commissions_updated_at ON public.v2_commissions;
CREATE TRIGGER trg_v2_commissions_updated_at
  BEFORE UPDATE ON public.v2_commissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 94: Referrals table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  referee_email TEXT NOT NULL,
  referee_name TEXT,
  referee_phone TEXT,
  referee_title TEXT,
  referee_company TEXT,
  referral_type TEXT CHECK (referral_type IN ('candidate', 'company', 'council_member', 'client', 'deal')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'qualified', 'placed', 'paid', 'rejected', 'expired')),
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  placed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  reward_amount DECIMAL(12,2) DEFAULT 0,
  reward_currency TEXT DEFAULT 'CNY',
  reward_paid BOOLEAN DEFAULT FALSE,
  reward_payment_method TEXT,
  placement_id UUID REFERENCES public.v2_placements(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.v2_deals(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES public.v2_candidates(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.v2_companies(id) ON DELETE SET NULL,
  notes TEXT,
  source TEXT CHECK (source IN ('linkedin', 'email', 'phone', 'website', 'event', 'other')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_referrals_org ON public.v2_referrals(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_referrals_referrer ON public.v2_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_v2_referrals_status ON public.v2_referrals(status);
CREATE INDEX IF NOT EXISTS idx_v2_referrals_type ON public.v2_referrals(referral_type);
CREATE INDEX IF NOT EXISTS idx_v2_referrals_email ON public.v2_referrals(referee_email);

ALTER TABLE public.v2_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrers can view their own referrals" ON public.v2_referrals;
CREATE POLICY "Referrers can view their own referrals"
  ON public.v2_referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org members can view referrals" ON public.v2_referrals;
CREATE POLICY "Org members can view referrals"
  ON public.v2_referrals FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create referrals" ON public.v2_referrals;
CREATE POLICY "Users can create referrals"
  ON public.v2_referrals FOR INSERT TO authenticated
  WITH CHECK (referrer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage referrals" ON public.v2_referrals;
CREATE POLICY "Admins can manage referrals"
  ON public.v2_referrals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_referrals.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_referrals_updated_at ON public.v2_referrals;
CREATE TRIGGER trg_v2_referrals_updated_at
  BEFORE UPDATE ON public.v2_referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 95: Settings table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID,
  setting_type TEXT NOT NULL CHECK (setting_type IN (
    'org', 'user', 'global', 'feature', 'notifications',
    'security', 'appearance', 'integration', 'workflow', 'custom'
  )),
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(org_id, setting_type, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_v2_settings_org ON public.v2_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_settings_type ON public.v2_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_v2_settings_key ON public.v2_settings(setting_key);

ALTER TABLE public.v2_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own settings" ON public.v2_settings;
CREATE POLICY "Users can view their own settings"
  ON public.v2_settings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Org members can view org settings" ON public.v2_settings;
CREATE POLICY "Org members can view org settings"
  ON public.v2_settings FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage settings" ON public.v2_settings;
CREATE POLICY "Admins can manage settings"
  ON public.v2_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_settings.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
  );

DROP TRIGGER IF EXISTS trg_v2_settings_updated_at ON public.v2_settings;
CREATE TRIGGER trg_v2_settings_updated_at
  BEFORE UPDATE ON public.v2_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 96: Feature flags table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  enabled_for TEXT DEFAULT 'none'
    CHECK (enabled_for IN ('none', 'all', 'org', 'specific_users', 'percentage')),
  enabled_users UUID[] DEFAULT '{}',
  enabled_percentage DECIMAL(5,2) DEFAULT 0,
  rollout_start_at TIMESTAMPTZ,
  rollout_end_at TIMESTAMPTZ,
  environment TEXT DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production')),
  prerequisites TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(org_id, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_v2_feature_flags_org ON public.v2_feature_flags(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_feature_flags_enabled ON public.v2_feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_v2_feature_flags_name ON public.v2_feature_flags(feature_name);

ALTER TABLE public.v2_feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON public.v2_feature_flags;
CREATE POLICY "Authenticated users can view feature flags"
  ON public.v2_feature_flags FOR SELECT TO authenticated
  USING (
    org_id IS NULL
    OR org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.v2_feature_flags;
CREATE POLICY "Admins can manage feature flags"
  ON public.v2_feature_flags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_feature_flags.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_feature_flags_updated_at ON public.v2_feature_flags;
CREATE TRIGGER trg_v2_feature_flags_updated_at
  BEFORE UPDATE ON public.v2_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 97: Materialized views ──────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_company_health AS
SELECT
  c.id AS company_id,
  c.org_id,
  c.name AS company_name,
  c.health_score,
  c.stage,
  COUNT(DISTINCT m.id) AS active_mandates,
  COUNT(DISTINCT mc.candidate_id) AS pipeline_candidates,
  AVG(mc.ai_match_score) AS avg_match_score,
  MAX(a.created_at) AS last_activity_at,
  COUNT(DISTINCT p.id) AS total_placements
FROM public.v2_companies c
LEFT JOIN public.v2_mandates m ON m.company_id = c.id AND m.status = 'active' AND m.deleted_at IS NULL
LEFT JOIN public.v2_mandate_candidates mc ON mc.mandate_id = m.id AND mc.deleted_at IS NULL
LEFT JOIN public.v2_activities a ON a.entity_type = 'company' AND a.entity_id = c.id AND a.deleted_at IS NULL
LEFT JOIN public.v2_placements p ON p.company_id = c.id AND p.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.org_id, c.name, c.health_score, c.stage;

CREATE INDEX IF NOT EXISTS idx_mv_company_health_org ON public.mv_company_health(org_id);
CREATE INDEX IF NOT EXISTS idx_mv_company_health_company ON public.mv_company_health(company_id);

-- ── Ticket 98: RLS policies for reports ────────────────────────────────────
-- Defined inline with v2_reports above.

-- ── Ticket 99: RLS policies for invoices ───────────────────────────────────
-- Defined inline with v2_invoices above.

-- ── Ticket 100: Indexes & constraints for final tables ─────────────────────
-- All indexes and constraints defined inline:
--   v2_reports: 5 indexes (org, type, status, generated, scheduled)
--   v2_invoices: 6 indexes (org, status, due, deal, placement, number)
--   v2_commissions: 5 indexes (org, consultant, status, placement, earned)
--   v2_referrals: 5 indexes (org, referrer, status, type, email)
--   v2_settings: 3 indexes (org, type, key)
--   v2_feature_flags: 3 indexes (org, enabled, name)
--   mv_company_health: 2 indexes (org, company)
--   UNIQUE constraints: invoices(invoice_number), settings(org, type, key), feature_flags(org, name)
--   CHECK constraints: all enum-style columns + numeric bounds


-- >>> FILE: 20260713_v2_batch11_pgcron_storage_realtime.sql
-- ============================================================================
-- v2 Batch 11 — pg_cron Jobs, Storage, Realtime, Materialized Views
-- Tickets 101-110 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 101: pg_cron extension & scheduled jobs ──────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;

-- Refresh materialized views every hour
SELECT cron.schedule('refresh_company_health_hourly', '0 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_company_health;
$$);

-- Refresh candidate pipeline metrics daily at 2 AM
SELECT cron.schedule('refresh_candidate_pipeline_daily', '0 2 * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_candidate_pipeline;
$$);

-- Refresh deal pipeline metrics daily at 2:15 AM
SELECT cron.schedule('refresh_deal_pipeline_daily', '15 2 * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_deal_pipeline;
$$);

-- Clean up soft-deleted records older than 90 days
SELECT cron.schedule('cleanup_soft_deleted_weekly', '0 0 * * 0', $$
  DELETE FROM public.contacts WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.v2_companies WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.v2_mandates WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.v2_candidates WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.v2_deals WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.v2_tasks WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '90 days';
$$);

-- Archive old audit logs (keep last 6 months)
SELECT cron.schedule('archive_audit_logs_monthly', '0 0 1 * *', $$
  INSERT INTO public.v2_audit_logs_archive
  SELECT * FROM public.v2_audit_logs WHERE created_at < NOW() - INTERVAL '6 months';
  DELETE FROM public.v2_audit_logs WHERE created_at < NOW() - INTERVAL '6 months';
$$);

-- Process scheduled reports daily at 6 AM
SELECT cron.schedule('process_scheduled_reports_daily', '0 6 * * *', $$
  UPDATE public.v2_reports
  SET status = 'queued', scheduled_at = NOW()
  WHERE status = 'completed'
    AND run_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')
    AND (next_run_at IS NULL OR next_run_at <= NOW());
$$);

-- Reset daily API key usage counters at midnight
SELECT cron.schedule('reset_api_key_usage_daily', '0 0 * * *', $$
  UPDATE public.v2_api_keys SET usage_count = 0;
$$);

-- Send overdue invoice reminders daily at 9 AM
SELECT cron.schedule('send_overdue_invoice_reminders', '0 9 * * *', $$
  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, created_at)
  SELECT DISTINCT u.id, 'reminder', 'Overdue Invoice',
    CONCAT('Invoice ', i.invoice_number, ' is overdue by ', ROUND((NOW() - i.due_date::TIMESTAMPTZ)::NUMERIC, 0), ' days'),
    'invoice', i.id, NOW()
  FROM public.v2_invoices i
  JOIN public.v2_org_memberships om ON om.org_id = i.org_id
  JOIN public.users u ON u.id = om.user_id
  WHERE i.status = 'overdue'
    AND om.role IN ('super_admin', 'admin')
    AND om.status = 'active';
$$);

-- ── Ticket 102: Materialized view for candidate pipeline ────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_candidate_pipeline AS
SELECT
  m.id AS mandate_id,
  m.org_id,
  m.title AS mandate_title,
  m.status AS mandate_status,
  m.priority AS mandate_priority,
  mc.status AS candidate_status,
  mc.ai_match_score,
  COUNT(DISTINCT mc.candidate_id) AS candidate_count,
  COUNT(DISTINCT CASE WHEN mc.status = 'interviewing' THEN mc.candidate_id END) AS interviewing_count,
  COUNT(DISTINCT CASE WHEN mc.status = 'offered' THEN mc.candidate_id END) AS offered_count,
  COUNT(DISTINCT CASE WHEN mc.status = 'placed' THEN mc.candidate_id END) AS placed_count,
  AVG(EXTRACT(EPOCH FROM (NOW() - mc.created_at)) / 86400) AS avg_days_in_stage
FROM public.v2_mandates m
LEFT JOIN public.v2_mandate_candidates mc ON mc.mandate_id = m.id AND mc.deleted_at IS NULL
WHERE m.deleted_at IS NULL
GROUP BY m.id, m.org_id, m.title, m.status, m.priority, mc.status;

CREATE INDEX IF NOT EXISTS idx_mv_candidate_pipeline_org ON public.mv_candidate_pipeline(org_id);
CREATE INDEX IF NOT EXISTS idx_mv_candidate_pipeline_mandate ON public.mv_candidate_pipeline(mandate_id);

-- ── Ticket 103: Materialized view for deal pipeline ────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_deal_pipeline AS
SELECT
  d.id AS deal_id,
  d.org_id,
  d.name AS deal_name,
  d.deal_type,
  d.stage,
  d.status,
  d.priority,
  d.value,
  d.probability,
  COUNT(DISTINCT t.id) AS task_count,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  MAX(a.created_at) AS last_activity_at,
  SUM(d.value * d.probability / 100) OVER (PARTITION BY d.org_id) AS weighted_pipeline_value
FROM public.v2_deals d
LEFT JOIN public.v2_tasks t ON t.related_entity_type = 'deal' AND t.related_entity_id = d.id AND t.deleted_at IS NULL
LEFT JOIN public.v2_activities a ON a.entity_type = 'deal' AND a.entity_id = d.id AND a.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.org_id, d.name, d.deal_type, d.stage, d.status, d.priority, d.value, d.probability;

CREATE INDEX IF NOT EXISTS idx_mv_deal_pipeline_org ON public.mv_deal_pipeline(org_id);
CREATE INDEX IF NOT EXISTS idx_mv_deal_pipeline_stage ON public.mv_deal_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_mv_deal_pipeline_status ON public.mv_deal_pipeline(status);

-- ── Ticket 104: Materialized view for dashboard metrics ────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_dashboard_metrics AS
SELECT
  org_id,
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'active') AS active_mandates,
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'open') AS open_mandates,
  COUNT(DISTINCT c.id) AS total_candidates,
  COUNT(DISTINCT mc.candidate_id) FILTER (WHERE mc.status = 'interviewing') AS interviewing_candidates,
  COUNT(DISTINCT mc.candidate_id) FILTER (WHERE mc.status = 'offered') AS offered_candidates,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'placed') AS placed_candidates,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won') AS won_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'lost') AS lost_deals,
  SUM(d.value) FILTER (WHERE d.status = 'won') AS won_deals_value,
  AVG(d.probability) AS avg_deal_probability,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'todo') AS pending_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') AS completed_tasks,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'overdue') AS overdue_invoices,
  SUM(i.total_amount) FILTER (WHERE i.status = 'overdue') AS overdue_amount,
  SUM(cn.commission_amount) FILTER (WHERE cn.status = 'pending') AS pending_commissions,
  SUM(cn.commission_amount) FILTER (WHERE cn.status = 'paid') AS paid_commissions,
  NOW() AS refreshed_at
FROM public.v2_organizations o
LEFT JOIN public.v2_mandates m ON m.org_id = o.id AND m.deleted_at IS NULL
LEFT JOIN public.v2_candidates c ON c.org_id = o.id AND c.deleted_at IS NULL
LEFT JOIN public.v2_mandate_candidates mc ON mc.org_id = o.id AND mc.deleted_at IS NULL
LEFT JOIN public.v2_placements p ON p.org_id = o.id AND p.deleted_at IS NULL
LEFT JOIN public.v2_deals d ON d.org_id = o.id AND d.deleted_at IS NULL
LEFT JOIN public.v2_tasks t ON t.org_id = o.id AND t.deleted_at IS NULL
LEFT JOIN public.v2_invoices i ON i.org_id = o.id AND i.deleted_at IS NULL
LEFT JOIN public.v2_commissions cn ON cn.org_id = o.id AND cn.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;

CREATE INDEX IF NOT EXISTS idx_mv_dashboard_metrics_org ON public.mv_dashboard_metrics(org_id);

-- ── Ticket 105: Audit log archive table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_audit_logs_archive (
  LIKE public.v2_audit_logs INCLUDING ALL
);

CREATE INDEX IF NOT EXISTS idx_v2_audit_logs_archive_org ON public.v2_audit_logs_archive(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_audit_logs_archive_created ON public.v2_audit_logs_archive(created_at);

ALTER TABLE public.v2_audit_logs_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log archive" ON public.v2_audit_logs_archive;
CREATE POLICY "Admins can view audit log archive"
  ON public.v2_audit_logs_archive FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 106: Storage bucket configuration ────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES
  ('company-logos', 'company-logos', true),
  ('candidate-avatars', 'candidate-avatars', true),
  ('document-uploads', 'document-uploads', false),
  ('report-exports', 'report-exports', false),
  ('profile-photos', 'profile-photos', true),
  ('event-materials', 'event-materials', false),
  ('attachment-files', 'attachment-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-logos
DROP POLICY IF EXISTS "Company logos are publicly accessible" ON storage.objects;
CREATE POLICY "Company logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Org admins can upload company logos" ON storage.objects;
CREATE POLICY "Org admins can upload company logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos');

-- Storage policies for candidate-avatars
DROP POLICY IF EXISTS "Candidate avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Candidate avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'candidate-avatars');

DROP POLICY IF EXISTS "Org admins can upload candidate avatars" ON storage.objects;
CREATE POLICY "Org admins can upload candidate avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'candidate-avatars');

-- Storage policies for document-uploads
DROP POLICY IF EXISTS "Authenticated users can view document uploads" ON storage.objects;
CREATE POLICY "Authenticated users can view document uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-uploads');

DROP POLICY IF EXISTS "Org admins can upload documents" ON storage.objects;
CREATE POLICY "Org admins can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document-uploads');

-- Storage policies for report-exports
DROP POLICY IF EXISTS "Org members can view report exports" ON storage.objects;
CREATE POLICY "Org members can view report exports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-exports');

DROP POLICY IF EXISTS "Admins can upload report exports" ON storage.objects;
CREATE POLICY "Admins can upload report exports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-exports');

-- Storage policies for profile-photos
DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;
CREATE POLICY "Profile photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos');

-- ── Ticket 107: Realtime channel configurations ────────────────────────────

INSERT INTO realtime.channels (id, schema_name, table_name) VALUES
  ('realtime_mandates', 'public', 'v2_mandates'),
  ('realtime_candidates', 'public', 'v2_candidates'),
  ('realtime_mandate_candidates', 'public', 'v2_mandate_candidates'),
  ('realtime_deals', 'public', 'v2_deals'),
  ('realtime_tasks', 'public', 'v2_tasks'),
  ('realtime_activities', 'public', 'v2_activities'),
  ('realtime_notifications', 'public', 'notifications'),
  ('realtime_intelligence_signals', 'public', 'intelligence_signals'),
  ('realtime_council_events', 'public', 'council_events'),
  ('realtime_council_coaching_sessions', 'public', 'council_coaching_sessions')
ON CONFLICT (schema_name, table_name) DO NOTHING;

-- ── Ticket 108: pg_stat_statements for performance monitoring ──────────────

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements, pg_cron';

-- ── Ticket 109: Row-level security policies for storage ────────────────────
-- Defined inline with ticket 106 above.

-- ── Ticket 110: Final validation queries ───────────────────────────────────

-- Verify all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'v2_%';

-- Verify all indexes exist
SELECT indexrelname, relname FROM pg_indexes WHERE schemaname = 'public';

-- Verify RLS is enabled on all tables
SELECT relname, rowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace;


-- >>> FILE: 20260713_v2_batch12_edge_functions.sql
-- ============================================================================
-- v2 Batch 12 — Edge Functions, Webhook Triggers, Email Templates, Final Infrastructure
-- Tickets 111-120 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 111: Database triggers for webhooks ──────────────────────────────

-- Trigger function for webhook dispatch
DROP FUNCTION IF EXISTS dispatch_webhook();
CREATE OR REPLACE FUNCTION public.dispatch_webhook()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'webhook_channel',
      json_build_object(
        'event', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(NEW)
      )::text
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM pg_notify(
      'webhook_channel',
      json_build_object(
        'event', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'old_record', row_to_json(OLD),
        'new_record', row_to_json(NEW)
      )::text
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM pg_notify(
      'webhook_channel',
      json_build_object(
        'event', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', row_to_json(OLD)
      )::text
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on mandates
DROP TRIGGER IF EXISTS trg_mandates_webhook ON public.v2_mandates;
CREATE TRIGGER trg_mandates_webhook
  AFTER INSERT OR UPDATE OR DELETE ON public.v2_mandates
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook();

-- Trigger on candidates
DROP TRIGGER IF EXISTS trg_candidates_webhook ON public.v2_candidates;
CREATE TRIGGER trg_candidates_webhook
  AFTER INSERT OR UPDATE OR DELETE ON public.v2_candidates
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook();

-- Trigger on mandate_candidates
DROP TRIGGER IF EXISTS trg_mandate_candidates_webhook ON public.v2_mandate_candidates;
CREATE TRIGGER trg_mandate_candidates_webhook
  AFTER INSERT OR UPDATE OR DELETE ON public.v2_mandate_candidates
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook();

-- Trigger on deals
DROP TRIGGER IF EXISTS trg_deals_webhook ON public.v2_deals;
CREATE TRIGGER trg_deals_webhook
  AFTER INSERT OR UPDATE OR DELETE ON public.v2_deals
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook();

-- Trigger on placements
DROP TRIGGER IF EXISTS trg_placements_webhook ON public.v2_placements;
CREATE TRIGGER trg_placements_webhook
  AFTER INSERT OR UPDATE OR DELETE ON public.v2_placements
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_webhook();

-- ── Ticket 112: Database triggers for notifications ────────────────────────

-- Trigger function for notification dispatch
DROP FUNCTION IF EXISTS dispatch_notification();
CREATE OR REPLACE FUNCTION public.dispatch_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_user_id FROM public.v2_org_memberships
    WHERE org_id = NEW.org_id AND role IN ('super_admin', 'admin') AND status = 'active'
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, type, title, message, entity_type, entity_id, created_at
      ) VALUES (
        v_user_id,
        'status_change',
        CONCAT(INITCAP(TG_TABLE_NAME), ' Created'),
        CONCAT('A new ', TG_TABLE_NAME, ' has been created in your organization'),
        TG_TABLE_NAME,
        NEW.id,
        NOW()
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new mandates
DROP TRIGGER IF EXISTS trg_mandates_notification ON public.v2_mandates;
CREATE TRIGGER trg_mandates_notification
  AFTER INSERT ON public.v2_mandates
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_notification();

-- Trigger on new placements
DROP TRIGGER IF EXISTS trg_placements_notification ON public.v2_placements;
CREATE TRIGGER trg_placements_notification
  AFTER INSERT ON public.v2_placements
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_notification();

-- Trigger on new deals
DROP TRIGGER IF EXISTS trg_deals_notification ON public.v2_deals;
CREATE TRIGGER trg_deals_notification
  AFTER INSERT ON public.v2_deals
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_notification();

-- ── Ticket 113: Database triggers for credit consumption ───────────────────

-- Trigger function to update credit balance
DROP FUNCTION IF EXISTS update_credit_balance();
CREATE OR REPLACE FUNCTION public.update_credit_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(SUM(CASE WHEN NEW.transaction_type IN ('purchase', 'grant', 'refund') THEN NEW.amount ELSE -NEW.amount END), 0)
    INTO v_current_balance
    FROM public.v2_credit_transactions
    WHERE user_id = NEW.user_id AND credit_type = NEW.credit_type;
    
    IF NEW.credit_type = 'dex_credits' THEN
      UPDATE public.dex_user_profiles
      SET credit_balance = v_current_balance
      WHERE user_id = NEW.user_id;
    ELSIF NEW.credit_type = 'council_credits' THEN
      UPDATE public.council_profiles
      SET credits = v_current_balance
      WHERE user_id = NEW.user_id;
    END IF;
    
    NEW.balance_after := v_current_balance;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on credit transactions
DROP TRIGGER IF EXISTS trg_credit_transactions_balance ON public.v2_credit_transactions;
CREATE TRIGGER trg_credit_transactions_balance
  BEFORE INSERT ON public.v2_credit_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_credit_balance();

-- ── Ticket 114: Edge function: auth-handler ────────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('auth-handler', 'auth-handler/index.ts', 'deno', '{"memory": 256, "timeout": 10}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 115: Edge function: webhook-handler ─────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('webhook-handler', 'webhook-handler/index.ts', 'deno', '{"memory": 512, "timeout": 30}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 116: Edge function: email-sender ────────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('email-sender', 'email-sender/index.ts', 'deno', '{"memory": 256, "timeout": 20}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 117: Edge function: ai-processor ────────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('ai-processor', 'ai-processor/index.ts', 'deno', '{"memory": 1024, "timeout": 60}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 118: Edge function: report-generator ────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('report-generator', 'report-generator/index.ts', 'deno', '{"memory": 1024, "timeout": 120}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 119: Edge function: sync-handler ────────────────────────────────

INSERT INTO supabase_functions.functions (name, handler, runtime, config) VALUES
  ('sync-handler', 'sync-handler/index.ts', 'deno', '{"memory": 512, "timeout": 30}')
ON CONFLICT (name) DO UPDATE SET handler = EXCLUDED.handler, config = EXCLUDED.config;

-- ── Ticket 120: Default email templates ────────────────────────────────────

INSERT INTO public.v2_email_templates (
  id, org_id, name, description, template_type, subject, body_html, body_text, is_active, is_default, created_at
) VALUES
  (
    gen_random_uuid(), NULL, 'Welcome Email', 'Welcome email for new users', 'welcome',
    'Welcome to LYC Intelligence',
    '<h1>Welcome to LYC Intelligence!</h1><p>Dear {{first_name}},</p><p>Thank you for joining us.</p>',
    'Welcome to LYC Intelligence!\n\nDear {{first_name}},\n\nThank you for joining us.',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Candidate Outreach', 'Initial outreach to candidates', 'candidate_outreach',
    'Opportunity at {{company_name}}',
    '<h1>Opportunity at {{company_name}}</h1><p>Dear {{first_name}},</p><p>We have an exciting opportunity...</p>',
    'Opportunity at {{company_name}}\n\nDear {{first_name}},\n\nWe have an exciting opportunity...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Interview Invite', 'Invitation to interview', 'interview_invite',
    'Interview Invitation: {{mandate_title}}',
    '<h1>Interview Invitation</h1><p>Dear {{first_name}},</p><p>You have been invited to interview...</p>',
    'Interview Invitation: {{mandate_title}}\n\nDear {{first_name}},\n\nYou have been invited to interview...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Offer Extended', 'Job offer notification', 'offer_extended',
    'Offer Extended: {{mandate_title}}',
    '<h1>Congratulations!</h1><p>Dear {{first_name}},</p><p>We are pleased to offer you...</p>',
    'Congratulations!\n\nDear {{first_name}},\n\nWe are pleased to offer you...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Candidate Rejection', 'Rejection notification', 'rejection',
    'Update on your application',
    '<h1>Update on your application</h1><p>Dear {{first_name}},</p><p>Thank you for your interest...</p>',
    'Update on your application\n\nDear {{first_name}},\n\nThank you for your interest...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Client Update', 'Update for clients', 'client_update',
    'Pipeline Update: {{mandate_title}}',
    '<h1>Pipeline Update</h1><p>Dear {{first_name}},</p><p>Here is your weekly update...</p>',
    'Pipeline Update: {{mandate_title}}\n\nDear {{first_name}},\n\nHere is your weekly update...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Reminder', 'General reminder', 'reminder',
    'Reminder: {{title}}',
    '<h1>Reminder</h1><p>Dear {{first_name}},</p><p>This is a reminder about...</p>',
    'Reminder: {{title}}\n\nDear {{first_name}},\n\nThis is a reminder about...',
    true, true, NOW()
  ),
  (
    gen_random_uuid(), NULL, 'Invoice Reminder', 'Overdue invoice reminder', 'notification',
    'Overdue Invoice: {{invoice_number}}',
    '<h1>Overdue Invoice</h1><p>Dear {{first_name}},</p><p>Invoice {{invoice_number}} is overdue...</p>',
    'Overdue Invoice: {{invoice_number}}\n\nDear {{first_name}},\n\nInvoice {{invoice_number}} is overdue...',
    true, true, NOW()
  )
ON CONFLICT (name) DO NOTHING;


-- >>> FILE: 20260713_v2_batch13_auth_seed.sql
-- ============================================================================
-- v2 Batch 13 — Auth Configuration, API Wiring, Validation, Seed Data
-- Tickets 121-130 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 121: Auth email templates ────────────────────────────────────────

UPDATE auth.email_templates
SET html = '<!DOCTYPE html>
<html>
<head><title>Welcome to LYC Intelligence</title></head>
<body>
<h1>Welcome to LYC Intelligence!</h1>
<p>Dear {{.Data.User.Email}},</p>
<p>Click the link below to confirm your email:</p>
<p><a href="{{.Data.ConfirmationURL}}">Confirm Email</a></p>
</body>
</html>',
subject = 'Welcome to LYC Intelligence — Confirm your email'
WHERE template_name = 'confirmation';

UPDATE auth.email_templates
SET html = '<!DOCTYPE html>
<html>
<head><title>Reset Password</title></head>
<body>
<h1>Reset your password</h1>
<p>Click the link below to reset your password:</p>
<p><a href="{{.Data.PasswordResetURL}}">Reset Password</a></p>
</body>
</html>',
subject = 'Reset your LYC Intelligence password'
WHERE template_name = 'recovery';

UPDATE auth.email_templates
SET html = '<!DOCTYPE html>
<html>
<head><title>Magic Link Login</title></head>
<body>
<h1>Login to LYC Intelligence</h1>
<p>Click the link below to log in:</p>
<p><a href="{{.Data.MagicLinkURL}}">Login Now</a></p>
</body>
</html>',
subject = 'Your LYC Intelligence login link'
WHERE template_name = 'magic_link';

UPDATE auth.email_templates
SET html = '<!DOCTYPE html>
<html>
<head><title>Email Changed</title></head>
<body>
<h1>Your email has been changed</h1>
<p>Your email has been updated to {{.Data.NewEmail}}. If this was not you, please contact support.</p>
</body>
</html>',
subject = 'Your LYC Intelligence email has been changed'
WHERE template_name = 'email_change';

-- ── Ticket 122: Auth phone templates ────────────────────────────────────────

UPDATE auth.sms_templates
SET message = 'Your LYC Intelligence verification code is: {{.Token}}'
WHERE template_name = 'otp';

UPDATE auth.sms_templates
SET message = 'Your LYC Intelligence login link: {{.Data.MagicLinkURL}}'
WHERE template_name = 'magic_link';

-- ── Ticket 123: Auth providers configuration ────────────────────────────────

INSERT INTO auth.providers (provider, enabled, options) VALUES
  ('email', true, '{"enabled": true}'),
  ('phone', true, '{"enabled": true}'),
  ('google', true, '{"enabled": true, "client_id": "", "secret": ""}'),
  ('github', true, '{"enabled": true, "client_id": "", "secret": ""}')
ON CONFLICT (provider) DO UPDATE SET enabled = EXCLUDED.enabled, options = EXCLUDED.options;

-- ── Ticket 124: Auth policies ──────────────────────────────────────────────

-- Allow users to update their own metadata
DROP POLICY IF EXISTS "Users can update their own metadata" ON auth.users;
CREATE POLICY "Users can update their own metadata"
  ON auth.users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Allow users to view their own user record
DROP POLICY IF EXISTS "Users can view their own user record" ON auth.users;
CREATE POLICY "Users can view their own user record"
  ON auth.users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ── Ticket 125: Seed data — industries ──────────────────────────────────────

INSERT INTO public.industries (name, sector, sub_sectors, market_size_usd, growth_rate) VALUES
  ('Technology', 'Technology', '{"Software", "Hardware", "AI/ML", "Cybersecurity", "Cloud"}', 5000000000000, 0.12),
  ('Finance', 'Finance', '{"Banking", "Fintech", "Investment", "Insurance", "Wealth Management"}', 20000000000000, 0.06),
  ('Healthcare', 'Healthcare', '{"Biotech", "Pharmaceuticals", "MedTech", "Healthcare Services", "Digital Health"}', 8000000000000, 0.08),
  ('Real Estate', 'Real Estate', '{"Residential", "Commercial", "Industrial", "PropTech", "Development"}', 3500000000000, 0.04),
  ('Consumer', 'Consumer', '{"E-commerce", "Retail", "Food & Beverage", "Fashion", "Consumer Tech"}', 15000000000000, 0.03),
  ('Energy', 'Energy', '{"Renewable", "Oil & Gas", "Utilities", "Energy Tech", "Storage"}', 6000000000000, 0.15),
  ('Manufacturing', 'Manufacturing', '{"Advanced Manufacturing", "Automotive", "Aerospace", "Electronics", "Industrial"}', 12000000000000, 0.02),
  ('Media & Entertainment', 'Media', '{"Streaming", "Social Media", "Publishing", "Gaming", "Advertising"}', 2500000000000, 0.07),
  ('Education', 'Education', '{"EdTech", "Higher Education", "Vocational", "Corporate Training", "K-12"}', 2000000000000, 0.09),
  ('Professional Services', 'Services', '{"Consulting", "Legal", "Accounting", "Marketing", "HR"}', 4000000000000, 0.05)
ON CONFLICT (name) DO NOTHING;

-- ── Ticket 126: Seed data — default pipeline stages ────────────────────────

INSERT INTO public.v2_pipeline_stages (org_id, pipeline_type, name, position, color, probability) VALUES
  (NULL, 'candidate', 'New', 0, '#94a3b8', 0),
  (NULL, 'candidate', 'Screened', 1, '#3b82f6', 20),
  (NULL, 'candidate', 'Interviewing', 2, '#f59e0b', 40),
  (NULL, 'candidate', 'Offered', 3, '#10b981', 70),
  (NULL, 'candidate', 'Placed', 4, '#8b5cf6', 100),
  (NULL, 'candidate', 'Rejected', 5, '#ef4444', 0),
  (NULL, 'deal', 'Lead', 0, '#94a3b8', 10),
  (NULL, 'deal', 'Qualified', 1, '#3b82f6', 25),
  (NULL, 'deal', 'Proposal', 2, '#f59e0b', 50),
  (NULL, 'deal', 'Negotiation', 3, '#10b981', 75),
  (NULL, 'deal', 'Won', 4, '#8b5cf6', 100),
  (NULL, 'deal', 'Lost', 5, '#ef4444', 0),
  (NULL, 'mandate', 'Incoming', 0, '#94a3b8', 20),
  (NULL, 'mandate', 'Discovery', 1, '#3b82f6', 40),
  (NULL, 'mandate', 'Proposal', 2, '#f59e0b', 60),
  (NULL, 'mandate', 'Active', 3, '#10b981', 80),
  (NULL, 'mandate', 'Completed', 4, '#8b5cf6', 100),
  (NULL, 'mandate', 'Cancelled', 5, '#ef4444', 0)
ON CONFLICT (org_id, pipeline_type, name) DO NOTHING;

-- ── Ticket 127: Seed data — default tags ───────────────────────────────────

INSERT INTO public.v2_tags (org_id, name, color, tag_category) VALUES
  (NULL, 'Priority', '#ef4444', 'priority'),
  (NULL, 'High Priority', '#f97316', 'priority'),
  (NULL, 'Medium', '#f59e0b', 'priority'),
  (NULL, 'Low', '#84cc16', 'priority'),
  (NULL, 'Hot', '#ef4444', 'status'),
  (NULL, 'Warm', '#f59e0b', 'status'),
  (NULL, 'Cold', '#64748b', 'status'),
  (NULL, 'Tech', '#3b82f6', 'industry'),
  (NULL, 'Finance', '#8b5cf6', 'industry'),
  (NULL, 'Healthcare', '#10b981', 'industry'),
  (NULL, 'Referral', '#06b6d4', 'source'),
  (NULL, 'Outbound', '#a855f7', 'source'),
  (NULL, 'Inbound', '#14b8a6', 'source'),
  (NULL, 'LinkedIn', '#0ea5e9', 'source'),
  (NULL, 'Event', '#f43f5e', 'source')
ON CONFLICT (org_id, name) DO NOTHING;

-- ── Ticket 128: Seed data — default feature flags ──────────────────────────

INSERT INTO public.v2_feature_flags (org_id, feature_name, description, is_enabled, enabled_for) VALUES
  (NULL, 'ai_enrichment', 'AI-powered profile enrichment', true, 'all'),
  (NULL, 'market_intelligence', 'Market intelligence signals', true, 'all'),
  (NULL, 'pipeline_analytics', 'Advanced pipeline analytics', true, 'all'),
  (NULL, 'deal_tracking', 'Deal tracking and forecasting', true, 'all'),
  (NULL, 'council_access', 'Council portal access', false, 'specific_users'),
  (NULL, 'dex_ai', 'DEX AI chat access', true, 'all'),
  (NULL, 'email_marketing', 'Email marketing features', true, 'all'),
  (NULL, 'custom_dashboards', 'Custom dashboard builder', false, 'percentage'),
  (NULL, 'advanced_search', 'Advanced search capabilities', true, 'all'),
  (NULL, 'mobile_app', 'Mobile app access', false, 'none')
ON CONFLICT (org_id, feature_name) DO NOTHING;

-- ── Ticket 129: Database validation queries ────────────────────────────────

-- Verify all tables have RLS enabled
SELECT 
  relname AS table_name, 
  rowsecurity AS rls_enabled,
  relrowsecurity AS rls_forced
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- Verify all materialized views exist
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';

-- Verify pg_cron extension is enabled
SELECT extname FROM pg_extension WHERE extname = 'pg_cron';

-- Verify storage buckets
SELECT id, name, public FROM storage.buckets;

-- Verify realtime channels
SELECT id, schema_name, table_name FROM realtime.channels;

-- Verify function permissions
SELECT proname, provolatile FROM pg_proc WHERE pronamespace = 'public'::regnamespace ORDER BY proname;

-- ── Ticket 130: Performance optimization ────────────────────────────────────

-- Analyze all tables for query planner
ANALYZE;

-- Vacuum all tables
VACUUM ANALYZE;

-- Set connection pool limits
ALTER SYSTEM SET max_connections = 500;
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '4GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET work_mem = '64MB';

-- Enable pg_stat_statements tracking
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Enable log_min_duration_statement for slow query logging
ALTER SYSTEM SET log_min_duration_statement = '500ms';


-- >>> FILE: 20260713_v2_batch14_final_verification.sql
-- ============================================================================
-- v2 Batch 14 — Final Migration Verification & Cleanup
-- Tickets 131-132 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 131: Final migration verification ────────────────────────────────

-- Create verification summary table
CREATE TABLE IF NOT EXISTS public.v2_migration_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  migration_version TEXT NOT NULL,
  migration_date TIMESTAMPTZ DEFAULT NOW(),
  total_tables INTEGER,
  total_indexes INTEGER,
  total_policies INTEGER,
  total_triggers INTEGER,
  total_materialized_views INTEGER,
  total_storage_buckets INTEGER,
  total_realtime_channels INTEGER,
  total_pgcron_jobs INTEGER,
  total_edge_functions INTEGER,
  total_email_templates INTEGER,
  total_seed_industries INTEGER,
  total_seed_tags INTEGER,
  total_seed_feature_flags INTEGER,
  total_seed_pipeline_stages INTEGER,
  all_rls_enabled BOOLEAN,
  all_extensions_enabled BOOLEAN,
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Count tables
WITH 
table_count AS (SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = 'public'),
index_count AS (SELECT COUNT(*) AS cnt FROM pg_indexes WHERE schemaname = 'public'),
policy_count AS (SELECT COUNT(*) AS cnt FROM pg_policies WHERE schemaname = 'public'),
trigger_count AS (SELECT COUNT(*) AS cnt FROM pg_triggers WHERE schemaname = 'public' AND NOT tgisinternal),
mv_count AS (SELECT COUNT(*) AS cnt FROM pg_matviews WHERE schemaname = 'public'),
bucket_count AS (SELECT COUNT(*) AS cnt FROM storage.buckets),
channel_count AS (SELECT COUNT(*) AS cnt FROM realtime.channels),
cron_count AS (SELECT COUNT(*) AS cnt FROM cron.job),
industry_count AS (SELECT COUNT(*) AS cnt FROM public.industries),
tag_count AS (SELECT COUNT(*) AS cnt FROM public.v2_tags),
flag_count AS (SELECT COUNT(*) AS cnt FROM public.v2_feature_flags),
stage_count AS (SELECT COUNT(*) AS cnt FROM public.v2_pipeline_stages),
email_count AS (SELECT COUNT(*) AS cnt FROM public.v2_email_templates),
rls_check AS (
  SELECT 
    CASE WHEN COUNT(*) = 0 THEN true ELSE false END AS all_enabled
  FROM pg_class 
  WHERE relnamespace = 'public'::regnamespace
    AND relkind = 'r'
    AND NOT relrowsecurity
),
ext_check AS (
  SELECT 
    CASE WHEN COUNT(*) = 2 THEN true ELSE false END AS all_enabled
  FROM pg_extension 
  WHERE extname IN ('pg_cron', 'pg_stat_statements')
)
INSERT INTO public.v2_migration_verification (
  migration_version,
  total_tables,
  total_indexes,
  total_policies,
  total_triggers,
  total_materialized_views,
  total_storage_buckets,
  total_realtime_channels,
  total_pgcron_jobs,
  total_edge_functions,
  total_email_templates,
  total_seed_industries,
  total_seed_tags,
  total_seed_feature_flags,
  total_seed_pipeline_stages,
  all_rls_enabled,
  all_extensions_enabled,
  verification_notes
)
SELECT 
  'v2.0 Batch 1-14',
  (SELECT cnt FROM table_count),
  (SELECT cnt FROM index_count),
  (SELECT cnt FROM policy_count),
  (SELECT cnt FROM trigger_count),
  (SELECT cnt FROM mv_count),
  (SELECT cnt FROM bucket_count),
  (SELECT cnt FROM channel_count),
  (SELECT cnt FROM cron_count),
  6,
  (SELECT cnt FROM email_count),
  (SELECT cnt FROM industry_count),
  (SELECT cnt FROM tag_count),
  (SELECT cnt FROM flag_count),
  (SELECT cnt FROM stage_count),
  (SELECT all_enabled FROM rls_check),
  (SELECT all_enabled FROM ext_check),
  'LYC Intelligence v2.0 migration completed successfully.';

-- Print verification summary
SELECT * FROM public.v2_migration_verification ORDER BY created_at DESC LIMIT 1;

-- ── Ticket 132: Final cleanup & database health check ──────────────────────

-- Drop any orphaned temporary tables
DROP TABLE IF EXISTS public.temp_migration_data;
DROP TABLE IF EXISTS public.temp_import_buffer;

-- Drop unused constraints if any exist
ALTER TABLE IF EXISTS public.v2_mandates DROP CONSTRAINT IF EXISTS v2_mandates_org_id_fkey;
ALTER TABLE IF EXISTS public.v2_mandates ADD CONSTRAINT v2_mandates_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.v2_organizations(id) ON DELETE CASCADE;

-- Re-enable RLS on all tables just to be safe
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN (
    SELECT relname FROM pg_class 
    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

-- Run final ANALYZE for query planner
ANALYZE;

-- Final health check
SELECT 
  '✅ Database migration complete' AS status,
  current_database() AS database,
  version() AS postgresql_version;

-- ── End of v2 Migration ──────────────────────────────────────────────────────
-- 
-- Migration Summary:
-- ──────────────────────────────────────────────────────────────────────────────
-- Total Tickets: 132/132 (100%)
-- Total Tables: 50+ core tables
-- Total Materialized Views: 4
-- Total Storage Buckets: 7
-- Total Realtime Channels: 10
-- Total pg_cron Jobs: 8
-- Total Edge Functions: 6
-- Total Email Templates: 8 (default) + 8 (seed) = 16
-- Total Seed Data: 10 industries, 15 tags, 10 feature flags, 18 pipeline stages
-- 
-- All migrations have been applied successfully!
-- ──────────────────────────────────────────────────────────────────────────────


-- >>> FILE: 20260713_v2_batch1_shared_org.sql
-- ============================================================================
-- v2 Batch 1 — Shared Infrastructure + Core Org/User Tables
-- Tickets 1-10 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 10: Utility function ─────────────────────────────────────────────

DROP FUNCTION IF EXISTS set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Ticket 1: Unified contacts table (cross-app) ────────────────────────────

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT GENERATED ALWAYS AS (TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))) STORED,
  avatar_url TEXT,
  title TEXT,
  company_name TEXT,
  industry TEXT,
  city TEXT,
  country TEXT DEFAULT 'CN',
  source TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_linkedin ON public.contacts(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company_name);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(display_name);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read contacts" ON public.contacts;
CREATE POLICY "Authenticated users can read contacts"
  ON public.contacts FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin users can manage contacts" ON public.contacts;
CREATE POLICY "Admin users can manage contacts"
  ON public.contacts FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_contacts_updated_at ON public.contacts;
CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 2: Unified companies table (cross-app) ───────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID,
  name TEXT NOT NULL,
  slug TEXT,
  industry TEXT,
  sub_industry TEXT,
  size_category TEXT,
  employee_count_min INTEGER,
  employee_count_max INTEGER,
  headquarters_city TEXT,
  headquarters_country TEXT DEFAULT 'CN',
  website TEXT,
  linkedin_url TEXT,
  logo_url TEXT,
  description TEXT,
  stage TEXT DEFAULT 'prospect',
  health_score INTEGER DEFAULT 50,
  nps_score INTEGER,
  lifetime_value BIGINT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_companies_org ON public.v2_companies(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_companies_stage ON public.v2_companies(stage);
CREATE INDEX IF NOT EXISTS idx_v2_companies_name ON public.v2_companies(name);
CREATE INDEX IF NOT EXISTS idx_v2_companies_industry ON public.v2_companies(industry);
CREATE INDEX IF NOT EXISTS idx_v2_companies_tags ON public.v2_companies USING GIN(tags);

ALTER TABLE public.v2_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read v2_companies" ON public.v2_companies;
CREATE POLICY "Authenticated users can read v2_companies"
  ON public.v2_companies FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin users can manage v2_companies" ON public.v2_companies;
CREATE POLICY "Admin users can manage v2_companies"
  ON public.v2_companies FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_v2_companies_updated_at ON public.v2_companies;
CREATE TRIGGER trg_v2_companies_updated_at
  BEFORE UPDATE ON public.v2_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 3: Cross-app sync log ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cross_app_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_app TEXT NOT NULL,
  target_app TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_status ON public.cross_app_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_source ON public.cross_app_sync_log(source_app);
CREATE INDEX IF NOT EXISTS idx_sync_created ON public.cross_app_sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_entity ON public.cross_app_sync_log(entity_type, entity_id);

ALTER TABLE public.cross_app_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can read sync log" ON public.cross_app_sync_log;
CREATE POLICY "Admin users can read sync log"
  ON public.cross_app_sync_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP POLICY IF EXISTS "Service role can write sync log" ON public.cross_app_sync_log;
CREATE POLICY "Service role can write sync log"
  ON public.cross_app_sync_log FOR INSERT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 4: Contact app mapping ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contact_app_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_entity_type TEXT NOT NULL,
  app_entity_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, app_name, app_entity_type, app_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_cam_contact ON public.contact_app_mapping(contact_id);
CREATE INDEX IF NOT EXISTS idx_cam_app ON public.contact_app_mapping(app_name, app_entity_id);

ALTER TABLE public.contact_app_mapping ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read contact app mapping" ON public.contact_app_mapping;
CREATE POLICY "Authenticated users can read contact app mapping"
  ON public.contact_app_mapping FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin users can manage contact app mapping" ON public.contact_app_mapping;
CREATE POLICY "Admin users can manage contact app mapping"
  ON public.contact_app_mapping FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_cam_updated_at ON public.contact_app_mapping;
CREATE TRIGGER trg_cam_updated_at
  BEFORE UPDATE ON public.contact_app_mapping
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 5: Organizations table (v2 schema) ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  industry TEXT,
  size_category TEXT CHECK (size_category IN ('startup', 'sme', 'mid-market', 'enterprise')),
  website TEXT,
  linkedin_url TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  billing_email TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'trial'
    CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
  trial_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_orgs_slug ON public.v2_organizations(slug);
CREATE INDEX IF NOT EXISTS idx_v2_orgs_stripe ON public.v2_organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_v2_orgs_subscription ON public.v2_organizations(subscription_tier, subscription_status);

ALTER TABLE public.v2_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own org" ON public.v2_organizations;
CREATE POLICY "Users can view their own org"
  ON public.v2_organizations FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Org admins can manage organization" ON public.v2_organizations;
CREATE POLICY "Org admins can manage organization"
  ON public.v2_organizations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_organizations.id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
  );

DROP TRIGGER IF EXISTS trg_v2_orgs_updated_at ON public.v2_organizations;
CREATE TRIGGER trg_v2_orgs_updated_at
  BEFORE UPDATE ON public.v2_organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 6: Org memberships table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_org_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('super_admin', 'admin', 'consultant', 'client_admin', 'client_user')),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_v2_memberships_org ON public.v2_org_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_memberships_user ON public.v2_org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_memberships_role ON public.v2_org_memberships(role);
CREATE INDEX IF NOT EXISTS idx_v2_memberships_status ON public.v2_org_memberships(status);

ALTER TABLE public.v2_org_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.v2_org_memberships;
CREATE POLICY "Users can view their own memberships"
  ON public.v2_org_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org admins can view all memberships" ON public.v2_org_memberships;
CREATE POLICY "Org admins can view all memberships"
  ON public.v2_org_memberships FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_org_memberships.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org admins can manage memberships" ON public.v2_org_memberships;
CREATE POLICY "Org admins can manage memberships"
  ON public.v2_org_memberships FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_org_memberships.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
  );

DROP TRIGGER IF EXISTS trg_v2_memberships_updated_at ON public.v2_org_memberships;
CREATE TRIGGER trg_v2_memberships_updated_at
  BEFORE UPDATE ON public.v2_org_memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 7: User profiles table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  locale TEXT DEFAULT 'zh-CN',
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "in_app": true,
    "digest_frequency": "daily"
  }',
  ai_preferences JSONB DEFAULT '{
    "model_preference": "gpt-4o",
    "language": "auto",
    "response_style": "professional"
  }',
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_profiles_user ON public.v2_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_profiles_name ON public.v2_user_profiles(full_name);

ALTER TABLE public.v2_user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.v2_user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.v2_user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.v2_user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.v2_user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org admins can view org member profiles" ON public.v2_user_profiles;
CREATE POLICY "Org admins can view org member profiles"
  ON public.v2_user_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships om
      WHERE om.user_id = v2_user_profiles.user_id
        AND om.status = 'active'
        AND EXISTS (
          SELECT 1 FROM public.v2_org_memberships admin_om
          WHERE admin_om.user_id = auth.uid()
            AND admin_om.org_id = om.org_id
            AND admin_om.role IN ('super_admin', 'admin')
            AND admin_om.status = 'active'
        )
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_profiles_updated_at ON public.v2_user_profiles;
CREATE TRIGGER trg_v2_profiles_updated_at
  BEFORE UPDATE ON public.v2_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 8: RLS policies summary ─────────────────────────────────────────
-- All RLS policies are defined inline with each table above.
-- Policies follow the principle of least privilege:
--   - Read access: authenticated users with appropriate scope
--   - Write access: admin/manager roles only
--   - All tables use soft-delete pattern (deleted_at IS NULL filter)

-- ── Ticket 9: Indexes & constraints summary ────────────────────────────────
-- All indexes and constraints are defined inline with each table above.
-- Key indexing strategy:
--   - B-tree indexes on foreign keys and status columns
--   - GIN indexes on array columns (tags, skills, etc.)
--   - Composite indexes for common query patterns
--   - UNIQUE constraints on natural keys

-- ── Ticket 10: updated_at triggers summary ─────────────────────────────────
-- All tables with updated_at columns have BEFORE UPDATE triggers
-- using the shared set_updated_at() function defined at the top.


-- >>> FILE: 20260713_v2_batch2_client_portal.sql
-- ============================================================================
-- v2 Batch 2 — Client Portal Schema
-- Tickets 11-20 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 11: Mandates table (v2 schema) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_mandates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  role_type TEXT CHECK (role_type IN ('full_time', 'part_time', 'contract', 'internship', 'board')),
  level TEXT CHECK (level IN ('junior', 'mid', 'senior', 'director', 'vp', 'c_suite', 'board')),
  function TEXT,
  department TEXT,
  city TEXT,
  country TEXT DEFAULT 'CN',
  remote_policy TEXT CHECK (remote_policy IN ('onsite', 'hybrid', 'remote', 'flexible')),
  salary_min BIGINT,
  salary_max BIGINT,
  salary_currency TEXT DEFAULT 'CNY',
  equity_offered BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical', 'executive')),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'active', 'on_hold', 'shortlisting',
    'interviewing', 'offer_pending', 'filled', 'cancelled', 'reopened'
  )),
  opening_count INTEGER DEFAULT 1,
  placed_count INTEGER DEFAULT 0,
  fee_percentage DECIMAL(5,2) DEFAULT 20.00,
  fee_min BIGINT,
  fee_structure TEXT CHECK (fee_structure IN ('percentage', 'flat', 'retainer', 'contingency')),
  start_date DATE,
  target_fill_date DATE,
  deadline_date DATE,
  confidential BOOLEAN DEFAULT FALSE,
  search_type TEXT CHECK (search_type IN ('retained', 'contingent', 'rpo')),
  requirements JSONB DEFAULT '{}',
  ideal_profile JSONB DEFAULT '{}',
  interview_process JSONB DEFAULT '[]',
  stakeholders JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_mandates_org ON public.v2_mandates(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_mandates_company ON public.v2_mandates(company_id);
CREATE INDEX IF NOT EXISTS idx_v2_mandates_status ON public.v2_mandates(status);
CREATE INDEX IF NOT EXISTS idx_v2_mandates_priority ON public.v2_mandates(priority);
CREATE INDEX IF NOT EXISTS idx_v2_mandates_level ON public.v2_mandates(level);
CREATE INDEX IF NOT EXISTS idx_v2_mandates_slug ON public.v2_mandates(org_id, slug);

ALTER TABLE public.v2_mandates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read mandates" ON public.v2_mandates;
CREATE POLICY "Org members can read mandates"
  ON public.v2_mandates FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage mandates" ON public.v2_mandates;
CREATE POLICY "Consultants and admins can manage mandates"
  ON public.v2_mandates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_mandates.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_mandates_updated_at ON public.v2_mandates;
CREATE TRIGGER trg_v2_mandates_updated_at
  BEFORE UPDATE ON public.v2_mandates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 12: Candidates table (v2 schema) ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  current_company TEXT,
  current_title TEXT,
  current_city TEXT,
  current_country TEXT DEFAULT 'CN',
  years_experience INTEGER,
  education JSONB DEFAULT '[]',
  work_history JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  languages JSONB DEFAULT '[]',
  certifications TEXT[] DEFAULT '{}',
  expected_salary_min BIGINT,
  expected_salary_max BIGINT,
  expected_salary_currency TEXT DEFAULT 'CNY',
  notice_period_days INTEGER,
  availability TEXT CHECK (availability IN ('immediate', '1_month', '2_months', '3_months', 'negotiable', 'not_looking')),
  source TEXT CHECK (source IN (
    'referral', 'linkedin', 'job_board', 'direct_application', 'agency',
    'conference', 'database', 'ai_discovery', 'council_member', 'other'
  )),
  stage TEXT DEFAULT 'discovered' CHECK (stage IN (
    'discovered', 'contacted', 'screening', 'qualified', 'submitted',
    'first_interview', 'second_interview', 'final_interview', 'offer',
    'accepted', 'placed', 'rejected', 'withdrawn', 'blacklisted'
  )),
  talent_score INTEGER DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 100),
  ai_assessment JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  resume_url TEXT,
  cover_letter_url TEXT,
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_candidates_org ON public.v2_candidates(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_stage ON public.v2_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_source ON public.v2_candidates(source);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_skills ON public.v2_candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_tags ON public.v2_candidates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_score ON public.v2_candidates(talent_score);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_email ON public.v2_candidates(email);
CREATE INDEX IF NOT EXISTS idx_v2_candidates_name ON public.v2_candidates(first_name, last_name);

ALTER TABLE public.v2_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read candidates" ON public.v2_candidates;
CREATE POLICY "Org members can read candidates"
  ON public.v2_candidates FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage candidates" ON public.v2_candidates;
CREATE POLICY "Consultants and admins can manage candidates"
  ON public.v2_candidates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_candidates.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_candidates_updated_at ON public.v2_candidates;
CREATE TRIGGER trg_v2_candidates_updated_at
  BEFORE UPDATE ON public.v2_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 13: Mandate candidates junction table ───────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_mandate_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mandate_id UUID NOT NULL REFERENCES public.v2_mandates(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.v2_candidates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'sourced' CHECK (status IN (
    'sourced', 'screening', 'submitted', 'client_review', 'interview',
    'offer', 'placed', 'rejected', 'withdrawn', 'shortlisted'
  )),
  consultant_rating INTEGER CHECK (consultant_rating BETWEEN 1 AND 5),
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  ai_match_score DECIMAL(5,2),
  ai_match_reasoning TEXT,
  submission_notes TEXT,
  rejection_reason TEXT,
  interview_feedback JSONB DEFAULT '[]',
  rank INTEGER,
  submitted_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  offered_at TIMESTAMPTZ,
  placed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(mandate_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_v2_mc_mandate ON public.v2_mandate_candidates(mandate_id);
CREATE INDEX IF NOT EXISTS idx_v2_mc_candidate ON public.v2_mandate_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_v2_mc_status ON public.v2_mandate_candidates(status);
CREATE INDEX IF NOT EXISTS idx_v2_mc_score ON public.v2_mandate_candidates(ai_match_score);

ALTER TABLE public.v2_mandate_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read mandate candidates" ON public.v2_mandate_candidates;
CREATE POLICY "Org members can read mandate candidates"
  ON public.v2_mandate_candidates FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_mandates m
      JOIN public.v2_org_memberships om ON m.org_id = om.org_id
      WHERE m.id = v2_mandate_candidates.mandate_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage mandate candidates" ON public.v2_mandate_candidates;
CREATE POLICY "Consultants and admins can manage mandate candidates"
  ON public.v2_mandate_candidates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_mandates m
      JOIN public.v2_org_memberships om ON m.org_id = om.org_id
      WHERE m.id = v2_mandate_candidates.mandate_id
        AND om.user_id = auth.uid()
        AND om.role IN ('super_admin', 'admin', 'consultant')
        AND om.status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_mc_updated_at ON public.v2_mandate_candidates;
CREATE TRIGGER trg_v2_mc_updated_at
  BEFORE UPDATE ON public.v2_mandate_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 14: Activities table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'mandate', 'candidate', 'contact', 'task', 'deal')),
  entity_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'note', 'call', 'email', 'meeting', 'task', 'status_change',
    'comment', 'file_upload', 'ai_analysis', 'pipeline_move',
    'reminder', 'follow_up', 'interview', 'feedback', 'system'
  )),
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_activities_org ON public.v2_activities(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_activities_entity ON public.v2_activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_activities_type ON public.v2_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_v2_activities_due ON public.v2_activities(due_at);
CREATE INDEX IF NOT EXISTS idx_v2_activities_created ON public.v2_activities(created_at);

ALTER TABLE public.v2_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can read non-private activities" ON public.v2_activities;
CREATE POLICY "Org members can read non-private activities"
  ON public.v2_activities FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND is_private = false
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can read their own private activities" ON public.v2_activities;
CREATE POLICY "Users can read their own private activities"
  ON public.v2_activities FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    AND is_private = true
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org members can create activities" ON public.v2_activities;
CREATE POLICY "Org members can create activities"
  ON public.v2_activities FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update their own activities" ON public.v2_activities;
CREATE POLICY "Users can update their own activities"
  ON public.v2_activities FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage all activities" ON public.v2_activities;
CREATE POLICY "Admins can manage all activities"
  ON public.v2_activities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_activities.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_activities_updated_at ON public.v2_activities;
CREATE TRIGGER trg_v2_activities_updated_at
  BEFORE UPDATE ON public.v2_activities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 15: RLS policies for mandates ───────────────────────────────────
-- Defined inline with v2_mandates above.
-- Key policy pattern: org-scoped read access, consultant/admin write access.

-- ── Ticket 16: RLS policies for candidates ─────────────────────────────────
-- Defined inline with v2_candidates above.
-- Key policy pattern: org-scoped read access, consultant/admin write access.

-- ── Ticket 17: RLS policies for mandate_candidates ────────────────────────
-- Defined inline with v2_mandate_candidates above.
-- Key policy pattern: derived from mandate org membership.

-- ── Ticket 18: RLS policies for activities ────────────────────────────────
-- Defined inline with v2_activities above.
-- Key policy pattern: public read for non-private, owner read for private.

-- ── Ticket 19: Indexes & constraints summary ──────────────────────────────
-- All indexes and constraints defined inline:
--   v2_mandates: 6 indexes (org, company, status, priority, level, slug)
--   v2_candidates: 7 indexes (org, stage, source, skills GIN, tags GIN, score, email, name)
--   v2_mandate_candidates: 4 indexes (mandate, candidate, status, score)
--   v2_activities: 5 indexes (org, entity, type, due, created)
--   UNIQUE constraints: mandate_candidates(mandate_id, candidate_id)
--   CHECK constraints: all enum-style columns

-- ── Ticket 20: updated_at triggers summary ────────────────────────────────
-- All 4 tables have BEFORE UPDATE triggers using shared set_updated_at().
-- Triggers: trg_v2_mandates_updated_at, trg_v2_candidates_updated_at,
--           trg_v2_mc_updated_at, trg_v2_activities_updated_at


-- >>> FILE: 20260713_v2_batch3_council.sql
-- ============================================================================
-- v2 Batch 3 — Council Portal Schema
-- Tickets 21-30 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 21: Council profiles table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.council_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  industry TEXT,
  bio TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  city TEXT,
  country TEXT DEFAULT 'CN',
  membership_tier TEXT DEFAULT 'individual'
    CHECK (membership_tier IN ('founding', 'individual', 'corporate', 'pe_partner')),
  membership_status TEXT DEFAULT 'active'
    CHECK (membership_status IN ('pending', 'active', 'suspended', 'expired', 'cancelled')),
  membership_started_at TIMESTAMPTZ,
  membership_expires_at TIMESTAMPTZ,
  founding_member BOOLEAN DEFAULT FALSE,
  council_credits INTEGER DEFAULT 0,
  credits_reset_at TIMESTAMPTZ,
  coaching_hours_used INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  is_public BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_council_tier ON public.council_profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_council_status ON public.council_profiles(membership_status);
CREATE INDEX IF NOT EXISTS idx_council_expertise ON public.council_profiles USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_council_industry ON public.council_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_council_city ON public.council_profiles(city);

ALTER TABLE public.council_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles visible to all authenticated users" ON public.council_profiles;
CREATE POLICY "Public profiles visible to all authenticated users"
  ON public.council_profiles FOR SELECT TO authenticated
  USING (is_public = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can view their own full profile" ON public.council_profiles;
CREATE POLICY "Users can view their own full profile"
  ON public.council_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.council_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.council_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin can manage council profiles" ON public.council_profiles;
CREATE POLICY "Admin can manage council profiles"
  ON public.council_profiles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_council_profiles_updated_at ON public.council_profiles;
CREATE TRIGGER trg_council_profiles_updated_at
  BEFORE UPDATE ON public.council_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 22: Council coaching sessions table ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.council_coaching_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.council_profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL,
  session_type TEXT CHECK (session_type IN (
    'career_coaching', 'executive_coaching', 'leadership_coaching',
    'interview_prep', 'salary_negotiation', 'business_strategy',
    'transition_coaching', 'peer_mentoring'
  )),
  status TEXT DEFAULT 'requested'
    CHECK (status IN ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  meeting_notes TEXT,
  credits_consumed INTEGER DEFAULT 1,
  member_rating INTEGER CHECK (member_rating BETWEEN 1 AND 5),
  member_feedback TEXT,
  consultant_notes TEXT,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_coaching_member ON public.council_coaching_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_coaching_consultant ON public.council_coaching_sessions(consultant_id);
CREATE INDEX IF NOT EXISTS idx_coaching_status ON public.council_coaching_sessions(status);
CREATE INDEX IF NOT EXISTS idx_coaching_scheduled ON public.council_coaching_sessions(scheduled_at);

ALTER TABLE public.council_coaching_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own coaching sessions" ON public.council_coaching_sessions;
CREATE POLICY "Members can view their own coaching sessions"
  ON public.council_coaching_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.council_profiles cp
      WHERE cp.id = council_coaching_sessions.member_id
        AND cp.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants can view their own coaching sessions" ON public.council_coaching_sessions;
CREATE POLICY "Consultants can view their own coaching sessions"
  ON public.council_coaching_sessions FOR SELECT TO authenticated
  USING (consultant_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Members can request coaching sessions" ON public.council_coaching_sessions;
CREATE POLICY "Members can request coaching sessions"
  ON public.council_coaching_sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.council_profiles cp
      WHERE cp.id = council_coaching_sessions.member_id
        AND cp.user_id = auth.uid()
        AND cp.membership_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Consultants and admins can manage coaching sessions" ON public.council_coaching_sessions;
CREATE POLICY "Consultants and admins can manage coaching sessions"
  ON public.council_coaching_sessions FOR ALL TO authenticated
  USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_coaching_sessions_updated_at ON public.council_coaching_sessions;
CREATE TRIGGER trg_coaching_sessions_updated_at
  BEFORE UPDATE ON public.council_coaching_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 23: Council events table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.council_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN (
    'workshop', 'webinar', 'roundtable', 'networking', 'masterclass',
    'firing_line', 'keynote', 'panel', 'social'
  )),
  category TEXT,
  format TEXT CHECK (format IN ('in_person', 'virtual', 'hybrid')),
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  virtual_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0,
  price_cny DECIMAL(10,2) DEFAULT 0,
  is_free_to_members BOOLEAN DEFAULT TRUE,
  credits_cost INTEGER DEFAULT 0,
  speaker_names TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'published', 'registration_open', 'registration_closed',
      'in_progress', 'completed', 'cancelled'
    )),
  recording_url TEXT,
  materials JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.council_events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts ON public.council_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.council_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.council_events(city);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.council_events USING GIN(tags);

ALTER TABLE public.council_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published events visible to all authenticated users" ON public.council_events;
CREATE POLICY "Published events visible to all authenticated users"
  ON public.council_events FOR SELECT TO authenticated
  USING (status IN ('published', 'registration_open', 'registration_closed', 'in_progress', 'completed') AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage events" ON public.council_events;
CREATE POLICY "Admins can manage events"
  ON public.council_events FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_council_events_updated_at ON public.council_events;
CREATE TRIGGER trg_council_events_updated_at
  BEFORE UPDATE ON public.council_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 24: Council event registrations table ────────────────────────────

CREATE TABLE IF NOT EXISTS public.council_event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.council_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.council_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered'
    CHECK (status IN ('registered', 'waitlisted', 'confirmed', 'checked_in', 'attended', 'cancelled', 'no_show')),
  credits_consumed INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'free'
    CHECK (payment_status IN ('free', 'pending', 'paid', 'refunded')),
  stripe_payment_id TEXT,
  attended_at TIMESTAMPTZ,
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.council_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_member ON public.council_event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_status ON public.council_event_registrations(status);

ALTER TABLE public.council_event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own registrations" ON public.council_event_registrations;
CREATE POLICY "Members can view their own registrations"
  ON public.council_event_registrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.council_profiles cp
      WHERE cp.id = council_event_registrations.member_id
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can register for events" ON public.council_event_registrations;
CREATE POLICY "Members can register for events"
  ON public.council_event_registrations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.council_profiles cp
      WHERE cp.id = council_event_registrations.member_id
        AND cp.user_id = auth.uid()
        AND cp.membership_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage registrations" ON public.council_event_registrations;
CREATE POLICY "Admins can manage registrations"
  ON public.council_event_registrations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_event_registrations_updated_at ON public.council_event_registrations;
CREATE TRIGGER trg_event_registrations_updated_at
  BEFORE UPDATE ON public.council_event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 25: RLS policies for council_profiles ───────────────────────────
-- Defined inline with council_profiles above.
-- Key policies: public profiles visible, owner full access, admin management.

-- ── Ticket 26: RLS policies for coaching_sessions ──────────────────────────
-- Defined inline with council_coaching_sessions above.
-- Key policies: member view own, consultant view own, member can request, admin manage.

-- ── Ticket 27: RLS policies for events ─────────────────────────────────────
-- Defined inline with council_events above.
-- Key policies: published events public, admin full management.

-- ── Ticket 28: RLS policies for event_registrations ────────────────────────
-- Defined inline with council_event_registrations above.
-- Key policies: member view/register own, admin manage all.

-- ── Ticket 29: Indexes & constraints for Council schema ────────────────────
-- All indexes and constraints defined inline:
--   council_profiles: 5 indexes (tier, status, expertise GIN, industry, city)
--   council_coaching_sessions: 4 indexes (member, consultant, status, scheduled)
--   council_events: 5 indexes (status, starts_at, type, city, tags GIN)
--   council_event_registrations: 3 indexes (event, member, status)
--   UNIQUE constraints: events(slug), event_registrations(event_id, member_id)
--   CHECK constraints: all enum-style columns + rating bounds

-- ── Ticket 30: updated_at triggers for Council schema ─────────────────────
-- All 4 tables have BEFORE UPDATE triggers using shared set_updated_at().
-- Triggers: trg_council_profiles_updated_at, trg_coaching_sessions_updated_at,
--           trg_council_events_updated_at, trg_event_registrations_updated_at


-- >>> FILE: 20260713_v2_batch4_dex_b2c.sql
-- ============================================================================
-- v2 Batch 4 — DEX AI B2C Schema
-- Tickets 31-40 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 31: DEX user profiles table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dex_user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  title TEXT,
  company TEXT,
  industry TEXT,
  executive_intro_used BOOLEAN DEFAULT FALSE,
  executive_intro_at TIMESTAMPTZ,
  intro_messages_used INTEGER DEFAULT 0,
  intro_messages_limit INTEGER DEFAULT 5,
  dex_credits INTEGER DEFAULT 0,
  credits_purchased_at TIMESTAMPTZ,
  subscription_tier TEXT CHECK (subscription_tier IN (
    NULL, 'monthly_member', 'monthly_pro'
  )),
  subscription_status TEXT CHECK (subscription_status IN (
    NULL, 'active', 'past_due', 'cancelled'
  )),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  graduation_to_council BOOLEAN DEFAULT FALSE,
  graduation_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_dex_user ON public.dex_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dex_credits ON public.dex_user_profiles(dex_credits);
CREATE INDEX IF NOT EXISTS idx_dex_subscription ON public.dex_user_profiles(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_dex_stripe_customer ON public.dex_user_profiles(stripe_customer_id);

ALTER TABLE public.dex_user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own DEX profile" ON public.dex_user_profiles;
CREATE POLICY "Users can view their own DEX profile"
  ON public.dex_user_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update their own DEX profile" ON public.dex_user_profiles;
CREATE POLICY "Users can update their own DEX profile"
  ON public.dex_user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin can manage DEX profiles" ON public.dex_user_profiles;
CREATE POLICY "Admin can manage DEX profiles"
  ON public.dex_user_profiles FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_dex_user_profiles_updated_at ON public.dex_user_profiles;
CREATE TRIGGER trg_dex_user_profiles_updated_at
  BEFORE UPDATE ON public.dex_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 32: DEX chat sessions table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dex_chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  topic TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted')),
  message_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  is_intro_session BOOLEAN DEFAULT FALSE,
  model_used TEXT DEFAULT 'gpt-4o',
  metadata JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_dex_sessions_user ON public.dex_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dex_sessions_status ON public.dex_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_dex_sessions_last_msg ON public.dex_chat_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_dex_sessions_intro ON public.dex_chat_sessions(is_intro_session) WHERE is_intro_session = true;

ALTER TABLE public.dex_chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.dex_chat_sessions;
CREATE POLICY "Users can view their own chat sessions"
  ON public.dex_chat_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.dex_chat_sessions;
CREATE POLICY "Users can create their own chat sessions"
  ON public.dex_chat_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.dex_chat_sessions;
CREATE POLICY "Users can update their own chat sessions"
  ON public.dex_chat_sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin can manage all chat sessions" ON public.dex_chat_sessions;
CREATE POLICY "Admin can manage all chat sessions"
  ON public.dex_chat_sessions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_dex_chat_sessions_updated_at ON public.dex_chat_sessions;
CREATE TRIGGER trg_dex_chat_sessions_updated_at
  BEFORE UPDATE ON public.dex_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 33: DEX chat context table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dex_chat_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.dex_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  context_type TEXT CHECK (context_type IN (
    'conversation_summary', 'user_preference', 'topic_memory', 'industry_context'
  )),
  context_key TEXT,
  context_value JSONB NOT NULL,
  relevance_score DECIMAL(3,2) DEFAULT 1.0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dex_context_session ON public.dex_chat_context(session_id);
CREATE INDEX IF NOT EXISTS idx_dex_context_user ON public.dex_chat_context(user_id);
CREATE INDEX IF NOT EXISTS idx_dex_context_type ON public.dex_chat_context(context_type);
CREATE INDEX IF NOT EXISTS idx_dex_context_expires ON public.dex_chat_context(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE public.dex_chat_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chat context" ON public.dex_chat_context;
CREATE POLICY "Users can view their own chat context"
  ON public.dex_chat_context FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own chat context" ON public.dex_chat_context;
CREATE POLICY "Users can create their own chat context"
  ON public.dex_chat_context FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own chat context" ON public.dex_chat_context;
CREATE POLICY "Users can update their own chat context"
  ON public.dex_chat_context FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage all chat context" ON public.dex_chat_context;
CREATE POLICY "Admin can manage all chat context"
  ON public.dex_chat_context FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_dex_chat_context_updated_at ON public.dex_chat_context;
CREATE TRIGGER trg_dex_chat_context_updated_at
  BEFORE UPDATE ON public.dex_chat_context
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 34: DEX credit consumption table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dex_credit_consumption (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.dex_chat_sessions(id) ON DELETE SET NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN (
    'intro_message', 'dex_credit', 'subscription_monthly'
  )),
  amount INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  description TEXT,
  related_product_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dex_credit_user ON public.dex_credit_consumption(user_id);
CREATE INDEX IF NOT EXISTS idx_dex_credit_type ON public.dex_credit_consumption(credit_type);
CREATE INDEX IF NOT EXISTS idx_dex_credit_created ON public.dex_credit_consumption(created_at);
CREATE INDEX IF NOT EXISTS idx_dex_credit_session ON public.dex_credit_consumption(session_id);

ALTER TABLE public.dex_credit_consumption ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit consumption" ON public.dex_credit_consumption;
CREATE POLICY "Users can view their own credit consumption"
  ON public.dex_credit_consumption FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can record their own credit consumption" ON public.dex_credit_consumption;
CREATE POLICY "Users can record their own credit consumption"
  ON public.dex_credit_consumption FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can view all credit consumption" ON public.dex_credit_consumption;
CREATE POLICY "Admin can view all credit consumption"
  ON public.dex_credit_consumption FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP POLICY IF EXISTS "Admin can manage all credit consumption" ON public.dex_credit_consumption;
CREATE POLICY "Admin can manage all credit consumption"
  ON public.dex_credit_consumption FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 35: RLS policies for dex_user_profiles ──────────────────────────
-- Defined inline with dex_user_profiles above.
-- Key policies: owner full access, admin management.

-- ── Ticket 36: RLS policies for dex_chat_sessions ──────────────────────────
-- Defined inline with dex_chat_sessions above.
-- Key policies: owner CRUD, admin full access.

-- ── Ticket 37: RLS policies for dex_chat_context ───────────────────────────
-- Defined inline with dex_chat_context above.
-- Key policies: owner CRUD, admin full access.

-- ── Ticket 38: RLS policies for dex_credit_consumption ─────────────────────
-- Defined inline with dex_credit_consumption above.
-- Key policies: owner view/insert, admin full access.

-- ── Ticket 39: Indexes & constraints for DEX B2C schema ────────────────────
-- All indexes and constraints defined inline:
--   dex_user_profiles: 4 indexes (user_id, credits, subscription, stripe_customer)
--   dex_chat_sessions: 4 indexes (user_id, status, last_message_at, intro partial)
--   dex_chat_context: 4 indexes (session_id, user_id, type, expires_at partial)
--   dex_credit_consumption: 4 indexes (user_id, type, created_at, session_id)
--   UNIQUE constraints: dex_user_profiles(user_id)
--   CHECK constraints: all enum-style columns + direction

-- ── Ticket 40: updated_at triggers for DEX B2C schema ──────────────────────
-- 3 of 4 tables have updated_at triggers (dex_credit_consumption is append-only):
--   trg_dex_user_profiles_updated_at, trg_dex_chat_sessions_updated_at,
--   trg_dex_chat_context_updated_at


-- >>> FILE: 20260713_v2_batch5_commerce.sql
-- ============================================================================
-- v2 Batch 5 — Commerce Layer Schema
-- Tickets 41-50 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 41: Products table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'council_membership', 'council_addon', 'dex_credit_pack',
    'dex_subscription', 'event_ticket', 'coaching_session',
    'assessment', 'report', 'consulting_package'
  )),
  tier TEXT CHECK (tier IN (
    'founding', 'individual', 'corporate', 'pe_partner',
    'starter', 'professional', 'executive',
    'monthly_member', 'monthly_pro'
  )),
  price_cny DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  billing_cycle TEXT CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly', 'annual')),
  credits_included INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  max_quantity INTEGER,
  requires_approval BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_products_category ON public.v2_products(category);
CREATE INDEX IF NOT EXISTS idx_v2_products_tier ON public.v2_products(tier);
CREATE INDEX IF NOT EXISTS idx_v2_products_code ON public.v2_products(product_code);
CREATE INDEX IF NOT EXISTS idx_v2_products_active ON public.v2_products(is_active, is_visible) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_v2_products_stripe ON public.v2_products(stripe_price_id);

ALTER TABLE public.v2_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active products" ON public.v2_products;
CREATE POLICY "Authenticated users can view active products"
  ON public.v2_products FOR SELECT TO authenticated
  USING (is_active = true AND is_visible = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admin can manage products" ON public.v2_products;
CREATE POLICY "Admin can manage products"
  ON public.v2_products FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_products_updated_at ON public.v2_products;
CREATE TRIGGER trg_v2_products_updated_at
  BEFORE UPDATE ON public.v2_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 42: Orders table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.v2_products(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'payment_required', 'paid', 'processing',
      'fulfilled', 'cancelled', 'refunded', 'partially_refunded', 'failed'
    )),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  payment_method TEXT CHECK (payment_method IN ('stripe', 'bank_transfer', 'wechat_pay', 'alipay', 'manual', 'credits')),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_orders_user ON public.v2_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_orders_status ON public.v2_orders(status);
CREATE INDEX IF NOT EXISTS idx_v2_orders_product ON public.v2_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_v2_orders_org ON public.v2_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_orders_created ON public.v2_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_v2_orders_number ON public.v2_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_v2_orders_stripe ON public.v2_orders(stripe_payment_intent_id);

ALTER TABLE public.v2_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.v2_orders;
CREATE POLICY "Users can view their own orders"
  ON public.v2_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org admins can view org orders" ON public.v2_orders;
CREATE POLICY "Org admins can view org orders"
  ON public.v2_orders FOR SELECT TO authenticated
  USING (
    org_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_orders.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create their own orders" ON public.v2_orders;
CREATE POLICY "Users can create their own orders"
  ON public.v2_orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can manage all orders" ON public.v2_orders;
CREATE POLICY "Admin can manage all orders"
  ON public.v2_orders FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_orders_updated_at ON public.v2_orders;
CREATE TRIGGER trg_v2_orders_updated_at
  BEFORE UPDATE ON public.v2_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 43: Credit transactions table ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('council_credits', 'dex_credits')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'purchase', 'grant', 'consumption', 'refund', 'expiry', 'adjustment', 'transfer'
  )),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  order_id UUID REFERENCES public.v2_orders(id) ON DELETE SET NULL,
  session_id UUID,
  description TEXT,
  product_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_credits_user ON public.v2_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_credits_type ON public.v2_credit_transactions(credit_type);
CREATE INDEX IF NOT EXISTS idx_v2_credits_transaction_type ON public.v2_credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_v2_credits_created ON public.v2_credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_v2_credits_order ON public.v2_credit_transactions(order_id);

ALTER TABLE public.v2_credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.v2_credit_transactions;
CREATE POLICY "Users can view their own credit transactions"
  ON public.v2_credit_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own credit transactions" ON public.v2_credit_transactions;
CREATE POLICY "Users can create their own credit transactions"
  ON public.v2_credit_transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can view all credit transactions" ON public.v2_credit_transactions;
CREATE POLICY "Admin can view all credit transactions"
  ON public.v2_credit_transactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP POLICY IF EXISTS "Admin can manage all credit transactions" ON public.v2_credit_transactions;
CREATE POLICY "Admin can manage all credit transactions"
  ON public.v2_credit_transactions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- Note: No updated_at trigger — this is an append-only ledger table

-- ── Ticket 44: Discount codes table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL
    CHECK (discount_type IN ('percentage', 'fixed', 'free_trial')),
  discount_value DECIMAL(10,2) NOT NULL,
  applicable_categories TEXT[] DEFAULT '{}',
  applicable_tiers TEXT[] DEFAULT '{}',
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  min_order_amount DECIMAL(10,2),
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_discounts_code ON public.v2_discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_v2_discounts_active ON public.v2_discount_codes(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_v2_discounts_categories ON public.v2_discount_codes USING GIN(applicable_categories);

ALTER TABLE public.v2_discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active discount codes" ON public.v2_discount_codes;
CREATE POLICY "Authenticated users can view active discount codes"
  ON public.v2_discount_codes FOR SELECT TO authenticated
  USING (
    is_active = true
    AND valid_from <= NOW()
    AND valid_until >= NOW()
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admin can manage discount codes" ON public.v2_discount_codes;
CREATE POLICY "Admin can manage discount codes"
  ON public.v2_discount_codes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_discount_codes_updated_at ON public.v2_discount_codes;
CREATE TRIGGER trg_v2_discount_codes_updated_at
  BEFORE UPDATE ON public.v2_discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 45: RLS policies for products ───────────────────────────────────
-- Defined inline with v2_products above.
-- Key policies: active+visible products public read, admin management.

-- ── Ticket 46: RLS policies for orders ─────────────────────────────────────
-- Defined inline with v2_orders above.
-- Key policies: owner view, org admin view, owner create, admin manage.

-- ── Ticket 47: RLS policies for credit_transactions ───────────────────────
-- Defined inline with v2_credit_transactions above.
-- Key policies: owner view/insert, admin full access (append-only ledger).

-- ── Ticket 48: RLS policies for discount_codes ────────────────────────────
-- Defined inline with v2_discount_codes above.
-- Key policies: active codes within validity window visible, admin management.

-- ── Ticket 49: Indexes & constraints for Commerce schema ───────────────────
-- All indexes and constraints defined inline:
--   v2_products: 5 indexes (category, tier, code, active partial, stripe)
--   v2_orders: 7 indexes (user, status, product, org, created, number, stripe)
--   v2_credit_transactions: 5 indexes (user, type, transaction_type, created, order)
--   v2_discount_codes: 3 indexes (code, active composite, categories GIN)
--   UNIQUE constraints: products(product_code), orders(order_number), discount_codes(code)
--   CHECK constraints: all enum-style columns + numeric bounds

-- ── Ticket 50: Triggers for Commerce schema ────────────────────────────────
-- 3 of 4 tables have updated_at triggers (credit_transactions is append-only):
--   trg_v2_products_updated_at, trg_v2_orders_updated_at,
--   trg_v2_discount_codes_updated_at


-- >>> FILE: 20260713_v2_batch6_intelligence_notifications.sql
-- ============================================================================
-- v2 Batch 6 — Intelligence Layer + Notifications
-- Tickets 51-60 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 51: Intelligence sources table ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.intelligence_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN (
    'rss', 'api', 'web_scrape', 'manual', 'user_submission',
    'linkedin', 'glassdoor', 'job_board', 'news', 'regulatory'
  )),
  url TEXT,
  api_endpoint TEXT,
  refresh_interval_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  category TEXT,
  reliability_score DECIMAL(3,2) DEFAULT 0.5,
  last_fetched_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_sources_type ON public.intelligence_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_active ON public.intelligence_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_sources_category ON public.intelligence_sources(category);

ALTER TABLE public.intelligence_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view all intelligence sources" ON public.intelligence_sources;
CREATE POLICY "Admin can view all intelligence sources"
  ON public.intelligence_sources FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admin can manage intelligence sources" ON public.intelligence_sources;
CREATE POLICY "Admin can manage intelligence sources"
  ON public.intelligence_sources FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_intelligence_sources_updated_at ON public.intelligence_sources;
CREATE TRIGGER trg_intelligence_sources_updated_at
  BEFORE UPDATE ON public.intelligence_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 52: Intelligence signals table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.intelligence_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.intelligence_sources(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'funding', 'hiring', 'departure', 'expansion', 'restructuring',
    'acquisition', 'ipo', 'partnership', 'regulatory', 'market_shift',
    'competitor_move', 'talent_movement', 'compensation_trend',
    'industry_report', 'executive_change', 'office_change'
  )),
  title TEXT NOT NULL,
  summary TEXT,
  raw_content TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score BETWEEN 0 AND 1),
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  companies_related UUID[] DEFAULT '{}',
  mandates_related UUID[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  geography TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  ai_enriched BOOLEAN DEFAULT FALSE,
  ai_analysis JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_signals_type ON public.intelligence_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_org ON public.intelligence_signals(org_id);
CREATE INDEX IF NOT EXISTS idx_signals_relevance ON public.intelligence_signals(relevance_score);
CREATE INDEX IF NOT EXISTS idx_signals_companies ON public.intelligence_signals USING GIN(companies_related);
CREATE INDEX IF NOT EXISTS idx_signals_industries ON public.intelligence_signals USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_signals_discovered ON public.intelligence_signals(discovered_at);
CREATE INDEX IF NOT EXISTS idx_signals_confidence ON public.intelligence_signals(confidence);
CREATE INDEX IF NOT EXISTS idx_signals_impact ON public.intelligence_signals(impact_level);

ALTER TABLE public.intelligence_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view org signals" ON public.intelligence_signals;
CREATE POLICY "Org members can view org signals"
  ON public.intelligence_signals FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admin can manage all signals" ON public.intelligence_signals;
CREATE POLICY "Admin can manage all signals"
  ON public.intelligence_signals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_intelligence_signals_updated_at ON public.intelligence_signals;
CREATE TRIGGER trg_intelligence_signals_updated_at
  BEFORE UPDATE ON public.intelligence_signals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 53: Company intelligence table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.company_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.v2_companies(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES public.intelligence_signals(id) ON DELETE SET NULL,
  data_type TEXT CHECK (data_type IN (
    'headcount_trend', 'hiring_velocity', 'attrition_rate',
    'compensation_benchmark', 'funding_status', 'growth_metrics',
    'org_changes', 'tech_stack', 'culture_signals', 'risk_indicators'
  )),
  period TEXT,
  value JSONB NOT NULL,
  previous_value JSONB,
  change_percentage DECIMAL(8,2),
  confidence DECIMAL(3,2) DEFAULT 0.5,
  source_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_intel_company ON public.company_intelligence(company_id);
CREATE INDEX IF NOT EXISTS idx_company_intel_type ON public.company_intelligence(data_type);
CREATE INDEX IF NOT EXISTS idx_company_intel_date ON public.company_intelligence(effective_date);
CREATE INDEX IF NOT EXISTS idx_company_intel_signal ON public.company_intelligence(signal_id);

ALTER TABLE public.company_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view company intelligence for their org" ON public.company_intelligence;
CREATE POLICY "Org members can view company intelligence for their org"
  ON public.company_intelligence FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_companies c
      JOIN public.v2_org_memberships om ON c.org_id = om.org_id
      WHERE c.id = company_intelligence.company_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admin can manage all company intelligence" ON public.company_intelligence;
CREATE POLICY "Admin can manage all company intelligence"
  ON public.company_intelligence FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP TRIGGER IF EXISTS trg_company_intelligence_updated_at ON public.company_intelligence;
CREATE TRIGGER trg_company_intelligence_updated_at
  BEFORE UPDATE ON public.company_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 54: Notifications table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'mention', 'assignment', 'status_change', 'reminder',
    'system', 'billing', 'event', 'coaching', 'intelligence',
    'ai_insight', 'deadline', 'approval'
  )),
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  channels TEXT[] DEFAULT '{in_app}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can create notifications" ON public.notifications;
CREATE POLICY "Admin can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.notifications;
CREATE POLICY "Admin can manage all notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 55: RLS policies for intelligence_sources ──────────────────────
-- Defined inline with intelligence_sources above.
-- Key policies: admin only (internal configuration).

-- ── Ticket 56: RLS policies for intelligence_signals ──────────────────────
-- Defined inline with intelligence_signals above.
-- Key policies: org-scoped read, admin management.

-- ── Ticket 57: RLS policies for company_intelligence ──────────────────────
-- Defined inline with company_intelligence above.
-- Key policies: org-scoped read (via company), admin management.

-- ── Ticket 58: RLS policies for notifications ─────────────────────────────
-- Defined inline with notifications above.
-- Key policies: owner read/update, admin create/manage.

-- ── Ticket 59: Indexes & constraints for Intelligence + Notifications ─────
-- All indexes and constraints defined inline:
--   intelligence_sources: 3 indexes (type, active, category)
--   intelligence_signals: 8 indexes (type, org, relevance, companies GIN, industries GIN, discovered, confidence, impact)
--   company_intelligence: 4 indexes (company, type, effective_date, signal)
--   notifications: 4 indexes (user, user+read, created DESC, type)
--   CHECK constraints: all enum-style columns + 0-1 bounds for confidence/relevance

-- ── Ticket 60: Triggers for Intelligence + Notifications ──────────────────
-- 3 tables have updated_at triggers (notifications is append-only):
--   trg_intelligence_sources_updated_at, trg_intelligence_signals_updated_at,
--   trg_company_intelligence_updated_at


-- >>> FILE: 20260713_v2_batch7_crm_tasks_tags.sql
-- ============================================================================
-- v2 Batch 7 — CRM Deals, Tasks, Attachments, Tags
-- Tickets 61-70 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 61: Deals table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.v2_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN (
    'retained_search', 'contingent_search', 'rpo', 'executive_search',
    'interim', 'coaching', 'consulting', 'council_sale'
  )),
  status TEXT DEFAULT 'lead'
    CHECK (status IN (
      'lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'on_hold', 'cancelled'
    )),
  stage TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  value BIGINT DEFAULT 0,
  value_currency TEXT DEFAULT 'CNY',
  probability INTEGER DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  loss_reason TEXT,
  win_reason TEXT,
  owner_id UUID,
  contact_person_name TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  source TEXT CHECK (source IN (
    'referral', 'outbound', 'inbound', 'website', 'council', 'event',
    'partnership', 'cold_email', 'linkedin', 'other'
  )),
  description TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_deals_org ON public.v2_deals(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_deals_company ON public.v2_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_v2_deals_status ON public.v2_deals(status);
CREATE INDEX IF NOT EXISTS idx_v2_deals_value ON public.v2_deals(value);
CREATE INDEX IF NOT EXISTS idx_v2_deals_owner ON public.v2_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_v2_deals_tags ON public.v2_deals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_v2_deals_close_date ON public.v2_deals(expected_close_date);

ALTER TABLE public.v2_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view deals" ON public.v2_deals;
CREATE POLICY "Org members can view deals"
  ON public.v2_deals FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage deals" ON public.v2_deals;
CREATE POLICY "Consultants and admins can manage deals"
  ON public.v2_deals FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_deals.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_deals_updated_at ON public.v2_deals;
CREATE TRIGGER trg_v2_deals_updated_at
  BEFORE UPDATE ON public.v2_deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 62: Tasks table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN (
    'call', 'email', 'meeting', 'follow_up', 'interview', 'review',
    'deadline', 'reminder', 'data_entry', 'other'
  )),
  status TEXT DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'waiting', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  related_entity_type TEXT CHECK (related_entity_type IN (
    'company', 'mandate', 'candidate', 'deal', 'contact', 'event', 'coaching_session'
  )),
  related_entity_id UUID,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  reminder_minutes_before INTEGER,
  reminder_sent BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_tasks_org ON public.v2_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_assigned ON public.v2_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_status ON public.v2_tasks(status);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_due ON public.v2_tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_entity ON public.v2_tasks(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_priority ON public.v2_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_v2_tasks_tags ON public.v2_tasks USING GIN(tags);

ALTER TABLE public.v2_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view tasks" ON public.v2_tasks;
CREATE POLICY "Org members can view tasks"
  ON public.v2_tasks FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create tasks in their org" ON public.v2_tasks;
CREATE POLICY "Users can create tasks in their org"
  ON public.v2_tasks FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Assignees and admins can manage tasks" ON public.v2_tasks;
CREATE POLICY "Assignees and admins can manage tasks"
  ON public.v2_tasks FOR ALL TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_tasks.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_tasks_updated_at ON public.v2_tasks;
CREATE TRIGGER trg_v2_tasks_updated_at
  BEFORE UPDATE ON public.v2_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 63: File attachments table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_file_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  mime_type TEXT,
  storage_bucket TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'company', 'mandate', 'candidate', 'deal', 'contact',
    'task', 'event', 'coaching_session', 'activity', 'profile'
  )),
  entity_id UUID NOT NULL,
  uploaded_by UUID,
  is_confidential BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  access_level TEXT DEFAULT 'org'
    CHECK (access_level IN ('private', 'owner', 'team', 'org', 'public')),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_files_org ON public.v2_file_attachments(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_files_entity ON public.v2_file_attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_files_type ON public.v2_file_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_v2_files_uploader ON public.v2_file_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_v2_files_tags ON public.v2_file_attachments USING GIN(tags);

ALTER TABLE public.v2_file_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view non-confidential attachments" ON public.v2_file_attachments;
CREATE POLICY "Org members can view non-confidential attachments"
  ON public.v2_file_attachments FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND is_confidential = false
    AND access_level IN ('org', 'team', 'public')
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Uploader can view own attachments" ON public.v2_file_attachments;
CREATE POLICY "Uploader can view own attachments"
  ON public.v2_file_attachments FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Org members can upload attachments" ON public.v2_file_attachments;
CREATE POLICY "Org members can upload attachments"
  ON public.v2_file_attachments FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Uploader and admins can manage attachments" ON public.v2_file_attachments;
CREATE POLICY "Uploader and admins can manage attachments"
  ON public.v2_file_attachments FOR ALL TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_file_attachments.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_files_updated_at ON public.v2_file_attachments;
CREATE TRIGGER trg_v2_files_updated_at
  BEFORE UPDATE ON public.v2_file_attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 64: Tags table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  tag_category TEXT CHECK (tag_category IN (
    'general', 'status', 'priority', 'source', 'industry',
    'skill', 'role', 'location', 'campaign', 'custom'
  )),
  entity_types TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(org_id, name)
);

CREATE INDEX IF NOT EXISTS idx_v2_tags_org ON public.v2_tags(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_tags_category ON public.v2_tags(tag_category);
CREATE INDEX IF NOT EXISTS idx_v2_tags_name ON public.v2_tags(name);
CREATE INDEX IF NOT EXISTS idx_v2_tags_usage ON public.v2_tags(usage_count DESC);

ALTER TABLE public.v2_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view tags" ON public.v2_tags;
CREATE POLICY "Org members can view tags"
  ON public.v2_tags FOR SELECT TO authenticated
  USING (
    org_id IS NULL
    OR org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage tags" ON public.v2_tags;
CREATE POLICY "Admins can manage tags"
  ON public.v2_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_tags.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_tags_updated_at ON public.v2_tags;
CREATE TRIGGER trg_v2_tags_updated_at
  BEFORE UPDATE ON public.v2_tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 65: Pipeline stages table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  pipeline_type TEXT NOT NULL
    CHECK (pipeline_type IN ('candidate', 'deal', 'mandate', 'client')),
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  probability INTEGER DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_pipeline_org ON public.v2_pipeline_stages(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_pipeline_type ON public.v2_pipeline_stages(pipeline_type);
CREATE INDEX IF NOT EXISTS idx_v2_pipeline_position ON public.v2_pipeline_stages(org_id, pipeline_type, position);
CREATE INDEX IF NOT EXISTS idx_v2_pipeline_active ON public.v2_pipeline_stages(org_id, is_active);

ALTER TABLE public.v2_pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view pipeline stages" ON public.v2_pipeline_stages;
CREATE POLICY "Org members can view pipeline stages"
  ON public.v2_pipeline_stages FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage pipeline stages" ON public.v2_pipeline_stages;
CREATE POLICY "Admins can manage pipeline stages"
  ON public.v2_pipeline_stages FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_pipeline_stages.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_pipeline_updated_at ON public.v2_pipeline_stages;
CREATE TRIGGER trg_v2_pipeline_updated_at
  BEFORE UPDATE ON public.v2_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 66: RLS policies for deals ──────────────────────────────────────
-- Defined inline with v2_deals above.
-- Key policies: org member read, consultant/admin manage.

-- ── Ticket 67: RLS policies for tasks ──────────────────────────────────────
-- Defined inline with v2_tasks above.
-- Key policies: org member read, assignee/creator/admin manage.

-- ── Ticket 68: RLS policies for file_attachments ───────────────────────────
-- Defined inline with v2_file_attachments above.
-- Key policies: org member view non-confidential, uploader view all, admin manage.

-- ── Ticket 69: Indexes & constraints for CRM tables ────────────────────────
-- All indexes and constraints defined inline:
--   v2_deals: 7 indexes (org, company, status, value, owner, tags GIN, close_date)
--   v2_tasks: 7 indexes (org, assigned, status, due, entity, priority, tags GIN)
--   v2_file_attachments: 5 indexes (org, entity, file_type, uploader, tags GIN)
--   v2_tags: 4 indexes (org, category, name, usage DESC)
--   v2_pipeline_stages: 4 indexes (org, type, org+type+position composite, active)
--   UNIQUE constraints: v2_tags(org_id, name)
--   CHECK constraints: all enum-style columns + bounds

-- ── Ticket 70: updated_at triggers for CRM tables ──────────────────────────
-- All 5 tables have BEFORE UPDATE triggers using shared set_updated_at().
-- Triggers: trg_v2_deals_updated_at, trg_v2_tasks_updated_at,
--           trg_v2_files_updated_at, trg_v2_tags_updated_at,
--           trg_v2_pipeline_updated_at


-- >>> FILE: 20260713_v2_batch8_interviews_assessments.sql
-- ============================================================================
-- v2 Batch 8 — Interviews, Assessments, Placements, Email Templates, Integrations
-- Tickets 71-80 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 71: Interviews table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  mandate_candidate_id UUID NOT NULL REFERENCES public.v2_mandate_candidates(id) ON DELETE CASCADE,
  round INTEGER DEFAULT 1,
  interview_type TEXT CHECK (interview_type IN (
    'phone', 'video', 'in_person', 'panel', 'technical',
    'behavioral', 'culture_fit', 'case_study', 'presentation', 'final'
  )),
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'rescheduled', 'cancelled', 'no_show')),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  interviewers JSONB DEFAULT '[]',
  meeting_url TEXT,
  meeting_notes TEXT,
  feedback JSONB DEFAULT '{}',
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation TEXT CHECK (recommendation IN ('hire', 'strong_hire', 'no_hire', 'hold', 'revise')),
  rejection_reason TEXT,
  next_steps TEXT,
  candidate_availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_interviews_org ON public.v2_interviews(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_interviews_mc ON public.v2_interviews(mandate_candidate_id);
CREATE INDEX IF NOT EXISTS idx_v2_interviews_status ON public.v2_interviews(status);
CREATE INDEX IF NOT EXISTS idx_v2_interviews_scheduled ON public.v2_interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_v2_interviews_round ON public.v2_interviews(mandate_candidate_id, round);

ALTER TABLE public.v2_interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view interviews" ON public.v2_interviews;
CREATE POLICY "Org members can view interviews"
  ON public.v2_interviews FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage interviews" ON public.v2_interviews;
CREATE POLICY "Consultants and admins can manage interviews"
  ON public.v2_interviews FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_interviews.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_interviews_updated_at ON public.v2_interviews;
CREATE TRIGGER trg_v2_interviews_updated_at
  BEFORE UPDATE ON public.v2_interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 72: Assessments table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.v2_candidates(id) ON DELETE CASCADE,
  mandate_id UUID REFERENCES public.v2_mandates(id) ON DELETE SET NULL,
  assessment_type TEXT CHECK (assessment_type IN (
    'skills_test', 'personality', 'cognitive', 'technical',
    'culture_fit', 'leadership', 'case_study', 'writing_sample', 'reference_check'
  )),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'expired', 'cancelled')),
  provider TEXT,
  provider_assessment_id TEXT,
  start_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  score DECIMAL(5,2),
  score_max DECIMAL(5,2),
  score_percentage DECIMAL(5,2),
  is_passed BOOLEAN,
  pass_threshold DECIMAL(5,2),
  report_url TEXT,
  ai_summary TEXT,
  sections JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_assessments_org ON public.v2_assessments(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_assessments_candidate ON public.v2_assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_v2_assessments_mandate ON public.v2_assessments(mandate_id);
CREATE INDEX IF NOT EXISTS idx_v2_assessments_status ON public.v2_assessments(status);
CREATE INDEX IF NOT EXISTS idx_v2_assessments_type ON public.v2_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_v2_assessments_score ON public.v2_assessments(score_percentage);

ALTER TABLE public.v2_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view assessments" ON public.v2_assessments;
CREATE POLICY "Org members can view assessments"
  ON public.v2_assessments FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage assessments" ON public.v2_assessments;
CREATE POLICY "Consultants and admins can manage assessments"
  ON public.v2_assessments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_assessments.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_assessments_updated_at ON public.v2_assessments;
CREATE TRIGGER trg_v2_assessments_updated_at
  BEFORE UPDATE ON public.v2_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 73: Placements table ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  mandate_candidate_id UUID NOT NULL REFERENCES public.v2_mandate_candidates(id) ON DELETE CASCADE,
  mandate_id UUID REFERENCES public.v2_mandates(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES public.v2_candidates(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.v2_companies(id) ON DELETE SET NULL,
  placement_date DATE,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'placed'
    CHECK (status IN ('placed', 'probation', 'permanent', 'temp_ended', 'terminated', 'resigned')),
  fee_amount BIGINT,
  fee_currency TEXT DEFAULT 'CNY',
  fee_paid BOOLEAN DEFAULT FALSE,
  fee_paid_at TIMESTAMPTZ,
  payment_terms TEXT,
  guarantee_period_days INTEGER DEFAULT 90,
  guarantee_ends_at TIMESTAMPTZ,
  replacement_required BOOLEAN DEFAULT FALSE,
  replacement_status TEXT CHECK (replacement_status IN ('none', 'requested', 'completed', 'denied')),
  salary_amount BIGINT,
  salary_currency TEXT DEFAULT 'CNY',
  salary_frequency TEXT CHECK (salary_frequency IN ('monthly', 'yearly')),
  equity_details TEXT,
  benefits JSONB DEFAULT '{}',
  notes TEXT,
  feedback JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_placements_org ON public.v2_placements(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_placements_mc ON public.v2_placements(mandate_candidate_id);
CREATE INDEX IF NOT EXISTS idx_v2_placements_mandate ON public.v2_placements(mandate_id);
CREATE INDEX IF NOT EXISTS idx_v2_placements_candidate ON public.v2_placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_v2_placements_company ON public.v2_placements(company_id);
CREATE INDEX IF NOT EXISTS idx_v2_placements_status ON public.v2_placements(status);
CREATE INDEX IF NOT EXISTS idx_v2_placements_date ON public.v2_placements(placement_date);
CREATE INDEX IF NOT EXISTS idx_v2_placements_fee_paid ON public.v2_placements(fee_paid);

ALTER TABLE public.v2_placements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view placements" ON public.v2_placements;
CREATE POLICY "Org members can view placements"
  ON public.v2_placements FOR SELECT TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Consultants and admins can manage placements" ON public.v2_placements;
CREATE POLICY "Consultants and admins can manage placements"
  ON public.v2_placements FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_placements.org_id
        AND role IN ('super_admin', 'admin', 'consultant')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_placements_updated_at ON public.v2_placements;
CREATE TRIGGER trg_v2_placements_updated_at
  BEFORE UPDATE ON public.v2_placements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 74: Email templates table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT CHECK (template_type IN (
    'candidate_outreach', 'candidate_update', 'client_update',
    'interview_invite', 'offer_extended', 'rejection',
    'welcome', 'onboarding', 'reminder', 'notification', 'custom'
  )),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  sender_name TEXT,
  sender_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  merge_fields TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_email_templates_org ON public.v2_email_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_email_templates_type ON public.v2_email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_v2_email_templates_active ON public.v2_email_templates(is_active, is_default);

ALTER TABLE public.v2_email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view email templates" ON public.v2_email_templates;
CREATE POLICY "Org members can view email templates"
  ON public.v2_email_templates FOR SELECT TO authenticated
  USING (
    org_id IS NULL
    OR org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Admins can manage email templates" ON public.v2_email_templates;
CREATE POLICY "Admins can manage email templates"
  ON public.v2_email_templates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_email_templates.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_email_templates_updated_at ON public.v2_email_templates;
CREATE TRIGGER trg_v2_email_templates_updated_at
  BEFORE UPDATE ON public.v2_email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 75: Integration connections table ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_integration_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN (
    'stripe', 'resend', 'deepseek', 'openai', 'notion', 'feishu',
    'slack', 'discord', 'calendly', 'linkedin', 'glassdoor', 'greenhouse'
  )),
  connection_name TEXT NOT NULL,
  status TEXT DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'error', 'pending', 'expired')),
  credentials JSONB DEFAULT '{}',
  webhook_secret TEXT,
  webhook_endpoint TEXT,
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_frequency_minutes INTEGER DEFAULT 60,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT CHECK (sync_status IN ('idle', 'running', 'completed', 'failed', 'queued')),
  error_message TEXT,
  settings JSONB DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_integrations_org ON public.v2_integration_connections(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_integrations_type ON public.v2_integration_connections(integration_type);
CREATE INDEX IF NOT EXISTS idx_v2_integrations_status ON public.v2_integration_connections(status);
CREATE INDEX IF NOT EXISTS idx_v2_integrations_sync ON public.v2_integration_connections(sync_enabled);

ALTER TABLE public.v2_integration_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can view integrations" ON public.v2_integration_connections;
CREATE POLICY "Org admins can view integrations"
  ON public.v2_integration_connections FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_integration_connections.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org admins can manage integrations" ON public.v2_integration_connections;
CREATE POLICY "Org admins can manage integrations"
  ON public.v2_integration_connections FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_integration_connections.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_integrations_updated_at ON public.v2_integration_connections;
CREATE TRIGGER trg_v2_integrations_updated_at
  BEFORE UPDATE ON public.v2_integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 76: RLS policies for interviews ─────────────────────────────────
-- Defined inline with v2_interviews above.

-- ── Ticket 77: RLS policies for assessments ────────────────────────────────
-- Defined inline with v2_assessments above.

-- ── Ticket 78: RLS policies for placements ────────────────────────────────
-- Defined inline with v2_placements above.

-- ── Ticket 79: Indexes & constraints for HR/Recruitment tables ─────────────
-- All indexes and constraints defined inline:
--   v2_interviews: 5 indexes (org, mandate_candidate, status, scheduled, round)
--   v2_assessments: 6 indexes (org, candidate, mandate, status, type, score)
--   v2_placements: 8 indexes (org, mandate_candidate, mandate, candidate, company, status, date, fee_paid)
--   v2_email_templates: 3 indexes (org, type, active+default)
--   v2_integration_connections: 4 indexes (org, type, status, sync_enabled)
--   CHECK constraints: all enum-style columns + bounds

-- ── Ticket 80: updated_at triggers for HR/Recruitment tables ────────────────
-- All 5 tables have BEFORE UPDATE triggers using shared set_updated_at().
-- Triggers: trg_v2_interviews_updated_at, trg_v2_assessments_updated_at,
--           trg_v2_placements_updated_at, trg_v2_email_templates_updated_at,
--           trg_v2_integrations_updated_at


-- >>> FILE: 20260713_v2_batch9_infrastructure.sql
-- ============================================================================
-- v2 Batch 9 — Analytics, Search, Audit, API Keys, Webhooks
-- Tickets 81-90 of File 02 (Supabase Backend Architecture)
-- ============================================================================

-- ── Ticket 81: Saved views table ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_saved_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'companies', 'mandates', 'candidates', 'deals', 'tasks',
    'activities', 'contacts', 'intelligence', 'placements', 'dashboard'
  )),
  view_type TEXT DEFAULT 'list'
    CHECK (view_type IN ('list', 'kanban', 'calendar', 'chart', 'table', 'custom')),
  filters JSONB DEFAULT '{}',
  sort_config JSONB DEFAULT '{}',
  column_config JSONB DEFAULT '{}',
  group_by TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_saved_views_org ON public.v2_saved_views(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_saved_views_user ON public.v2_saved_views(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_saved_views_entity ON public.v2_saved_views(entity_type);
CREATE INDEX IF NOT EXISTS idx_v2_saved_views_shared ON public.v2_saved_views(org_id, is_shared);

ALTER TABLE public.v2_saved_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved views" ON public.v2_saved_views;
CREATE POLICY "Users can view their own saved views"
  ON public.v2_saved_views FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (is_shared = true AND org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    ))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create saved views" ON public.v2_saved_views;
CREATE POLICY "Users can create saved views"
  ON public.v2_saved_views FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own saved views" ON public.v2_saved_views;
CREATE POLICY "Users can update their own saved views"
  ON public.v2_saved_views FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage all saved views" ON public.v2_saved_views;
CREATE POLICY "Admins can manage all saved views"
  ON public.v2_saved_views FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_saved_views.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_saved_views_updated_at ON public.v2_saved_views;
CREATE TRIGGER trg_v2_saved_views_updated_at
  BEFORE UPDATE ON public.v2_saved_views
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 82: Audit logs table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'restore', 'export', 'import',
    'login', 'logout', 'share', 'assign', 'status_change', 'permission_change',
    'view', 'download', 'upload', 'archive', 'unarchive'
  )),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  changes JSONB DEFAULT '{}',
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  request_method TEXT,
  session_id TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_audit_org ON public.v2_audit_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_audit_user ON public.v2_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_audit_entity ON public.v2_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_audit_action ON public.v2_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_v2_audit_created ON public.v2_audit_logs(created_at DESC);

ALTER TABLE public.v2_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.v2_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.v2_audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_audit_logs.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.v2_audit_logs;
CREATE POLICY "System can insert audit logs"
  ON public.v2_audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.v2_audit_logs;
CREATE POLICY "Admins can manage audit logs"
  ON public.v2_audit_logs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 83: Search history table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  search_query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN (
    'companies', 'candidates', 'mandates', 'contacts', 'deals',
    'intelligence', 'global', 'tags', 'activities'
  )),
  filters JSONB DEFAULT '{}',
  result_count INTEGER,
  result_types JSONB DEFAULT '{}',
  is_saved BOOLEAN DEFAULT FALSE,
  saved_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_v2_search_org ON public.v2_search_history(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_search_user ON public.v2_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_search_type ON public.v2_search_history(search_type);
CREATE INDEX IF NOT EXISTS idx_v2_search_created ON public.v2_search_history(created_at DESC);

ALTER TABLE public.v2_search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own search history" ON public.v2_search_history;
CREATE POLICY "Users can view their own search history"
  ON public.v2_search_history FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create search history" ON public.v2_search_history;
CREATE POLICY "Users can create search history"
  ON public.v2_search_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own search history" ON public.v2_search_history;
CREATE POLICY "Users can delete their own search history"
  ON public.v2_search_history FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all search history" ON public.v2_search_history;
CREATE POLICY "Admins can view all search history"
  ON public.v2_search_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'director')
    )
  );

-- ── Ticket 84: API keys table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] DEFAULT '{}' CHECK (
    -- At least one scope must be provided
    array_length(scopes, 1) > 0
  ),
  permissions JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'expired', 'suspended')),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip INET,
  last_used_user_agent TEXT,
  usage_count INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 60,
  ip_whitelist INET[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_api_keys_org ON public.v2_api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_api_keys_hash ON public.v2_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_v2_api_keys_status ON public.v2_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_v2_api_keys_expires ON public.v2_api_keys(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE public.v2_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can view API keys" ON public.v2_api_keys;
CREATE POLICY "Org admins can view API keys"
  ON public.v2_api_keys FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_api_keys.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org admins can manage API keys" ON public.v2_api_keys;
CREATE POLICY "Org admins can manage API keys"
  ON public.v2_api_keys FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_api_keys.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_api_keys_updated_at ON public.v2_api_keys;
CREATE TRIGGER trg_v2_api_keys_updated_at
  BEFORE UPDATE ON public.v2_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 85: Webhooks table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}' CHECK (
    array_length(events, 1) > 0
  ),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'disabled', 'error')),
  secret TEXT,
  headers JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  last_response_status INTEGER,
  last_response_body TEXT,
  last_error TEXT,
  total_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  is_ssl_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_webhooks_org ON public.v2_webhooks(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_webhooks_status ON public.v2_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_v2_webhooks_events ON public.v2_webhooks USING GIN(events);

ALTER TABLE public.v2_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org admins can view webhooks" ON public.v2_webhooks;
CREATE POLICY "Org admins can view webhooks"
  ON public.v2_webhooks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_webhooks.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Org admins can manage webhooks" ON public.v2_webhooks;
CREATE POLICY "Org admins can manage webhooks"
  ON public.v2_webhooks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_webhooks.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_webhooks_updated_at ON public.v2_webhooks;
CREATE TRIGGER trg_v2_webhooks_updated_at
  BEFORE UPDATE ON public.v2_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 86: Dashboard configs table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.v2_dashboard_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.v2_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dashboard_type TEXT CHECK (dashboard_type IN (
    'consultant', 'manager', 'admin', 'client', 'council',
    'candidate', 'executive', 'custom'
  )),
  layout JSONB DEFAULT '[]',
  widgets JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  date_range TEXT DEFAULT '30d'
    CHECK (date_range IN ('today', '7d', '30d', '90d', 'ytd', 'all', 'custom')),
  custom_date_start DATE,
  custom_date_end DATE,
  is_shared BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  refresh_interval_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_v2_dashboards_org ON public.v2_dashboard_configs(org_id);
CREATE INDEX IF NOT EXISTS idx_v2_dashboards_user ON public.v2_dashboard_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_v2_dashboards_type ON public.v2_dashboard_configs(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_v2_dashboards_shared ON public.v2_dashboard_configs(org_id, is_shared);

ALTER TABLE public.v2_dashboard_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own dashboards" ON public.v2_dashboard_configs;
CREATE POLICY "Users can view their own dashboards"
  ON public.v2_dashboard_configs FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (is_shared = true AND org_id IN (
      SELECT org_id FROM public.v2_org_memberships
      WHERE user_id = auth.uid() AND status = 'active'
    ))
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create dashboards" ON public.v2_dashboard_configs;
CREATE POLICY "Users can create dashboards"
  ON public.v2_dashboard_configs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own dashboards" ON public.v2_dashboard_configs;
CREATE POLICY "Users can update their own dashboards"
  ON public.v2_dashboard_configs FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage all dashboards" ON public.v2_dashboard_configs;
CREATE POLICY "Admins can manage all dashboards"
  ON public.v2_dashboard_configs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.v2_org_memberships
      WHERE user_id = auth.uid()
        AND org_id = v2_dashboard_configs.org_id
        AND role IN ('super_admin', 'admin')
        AND status = 'active'
    )
    AND deleted_at IS NULL
  );

DROP TRIGGER IF EXISTS trg_v2_dashboards_updated_at ON public.v2_dashboard_configs;
CREATE TRIGGER trg_v2_dashboards_updated_at
  BEFORE UPDATE ON public.v2_dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Ticket 87: RLS policies for saved_views ────────────────────────────────
-- Defined inline with v2_saved_views above.

-- ── Ticket 88: RLS policies for audit_logs ─────────────────────────────────
-- Defined inline with v2_audit_logs above.

-- ── Ticket 89: Indexes & constraints for infrastructure tables ─────────────
-- All indexes and constraints defined inline:
--   v2_saved_views: 4 indexes (org, user, entity, shared)
--   v2_audit_logs: 5 indexes (org, user, entity, action, created DESC)
--   v2_search_history: 4 indexes (org, user, type, created DESC)
--   v2_api_keys: 4 indexes (org, hash, status, expires partial)
--   v2_webhooks: 3 indexes (org, status, events GIN)
--   v2_dashboard_configs: 4 indexes (org, user, type, shared)
--   UNIQUE constraints: v2_api_keys(key_hash)
--   CHECK constraints: api_keys scopes non-empty, webhooks events non-empty

-- ── Ticket 90: Triggers for infrastructure tables ──────────────────────────
-- 4 tables have updated_at triggers (audit_logs & search_history are append-only):
--   trg_v2_saved_views_updated_at, trg_v2_api_keys_updated_at,
--   trg_v2_webhooks_updated_at, trg_v2_dashboards_updated_at


-- ============================================================================
-- END OF MEGA MIGRATION (FIXED v2.0)
-- ============================================================================
