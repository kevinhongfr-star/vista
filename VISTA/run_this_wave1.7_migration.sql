-- =========================================================================
-- VISTA Wave 1.7 Migration — DEX AI B2C Career Advisory Portal
-- =========================================================================
-- Version: 1.0
-- Date: 2026-07-12
-- Author: James/AI
-- Depends on: Wave 1.5 (funnel_core), V2 (service_catalog), Wave 1.6 (revenue_os)
--
-- SAFE TO RE-RUN: All CREATE TABLE use IF NOT EXISTS
--                   All ALTER TABLE use ADD COLUMN IF NOT EXISTS
--                   All INSERT use ON CONFLICT DO NOTHING where applicable
--
-- Contents:
--   1. B2C Auth & User tables (2 tables)
--   2. Credit System tables (2 tables)
--   3. Payment & Subscription tables (2 tables)
--   4. Chat Engine tables (2 tables)
--   5. Assessment tables (1 table)
--   6. Analytics & Tracking tables (3 tables)
--   7. ALTER existing tables (3 ALTERs)
--   8. Seed: Credit Packs (3 rows)
--   9. Seed: Assessment Definitions (7 rows)
--   10. Seed: B2C Service Catalog entries (7 rows)
--   11. Seed: B2C Bundle (1 row)
--   12. Seed: Cross-Sell Rules (4 rows)
--   13. Indexes & Triggers
-- =========================================================================

-- =========================================================================
-- SECTION 1: B2C Auth & User Infrastructure
-- =========================================================================

-- 1.1 B2C Users (separate from B2B vista_contacts)
CREATE TABLE IF NOT EXISTS vista_b2c_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,                          -- null if LinkedIn-only registration
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    registration_source TEXT NOT NULL DEFAULT 'email'
        CHECK (registration_source IN ('email', 'linkedin', 'referral')),
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    linkedin_profile_url TEXT,
    linkedin_connected BOOLEAN DEFAULT false,
    linkedin_connected_at TIMESTAMPTZ,
    current_role TEXT,                           -- e.g. "VP of Engineering"
    current_company TEXT,                        -- e.g. "ByteDance"
    industry TEXT,
    career_stage TEXT
        CHECK (career_stage IN ('early', 'mid', 'senior', 'executive', 'transitioning', NULL)),
    career_goals TEXT,                           -- free text, AI-extractable
    current_tier TEXT NOT NULL DEFAULT 'explorer'
        CHECK (current_tier IN ('explorer', 'credit_buyer', 'member', 'pro')),
    free_messages_used INT DEFAULT 0,
    free_message_limit INT DEFAULT 5,
    total_credits_purchased INT DEFAULT 0,
    total_credits_consumed INT DEFAULT 0,
    lifetime_value_cny NUMERIC(12,2) DEFAULT 0,
    b2b_contact_id UUID,                        -- link to vista_contacts if identified as B2B
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 B2C User Profiles (extended profile data)
CREATE TABLE IF NOT EXISTS vista_b2c_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    assessment_count INT DEFAULT 0,
    prism_completed BOOLEAN DEFAULT false,
    trident_completed BOOLEAN DEFAULT false,
    canvas_completed BOOLEAN DEFAULT false,
    market_report_count INT DEFAULT 0,
    coaching_sessions_booked INT DEFAULT 0,
    cv_audits_count INT DEFAULT 0,
    linkedin_audits_count INT DEFAULT 0,
    preferred_language TEXT DEFAULT 'zh-CN',
    referral_source TEXT,                        -- how they found us
    referral_code TEXT,                          -- their referral code for others
    referred_by_user_id UUID REFERENCES vista_b2c_users(id),
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMPTZ,
    last_assessment_at TIMESTAMPTZ,
    last_purchase_at TIMESTAMPTZ,
    nps_score INT CHECK (nps_score BETWEEN 0 AND 10),
    nps_survey_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- =========================================================================
-- SECTION 2: Credit System
-- =========================================================================

-- 2.1 Credit Ledger (every credit movement recorded)
CREATE TABLE IF NOT EXISTS vista_b2c_credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL
        CHECK (entry_type IN ('purchase', 'subscription_grant', 'consumption', 'refund', 'expiry', 'bonus', 'adjustment')),
    credit_amount INT NOT NULL,                  -- positive = credit in, negative = credit out
    balance_after INT NOT NULL,                  -- running balance after this entry
    related_payment_id UUID,                     -- link to payment if purchase
    related_subscription_id UUID,                -- link to subscription if grant
    related_assessment_id UUID,                  -- link to assessment if consumption
    related_session_id UUID,                     -- link to chat session if consumption
    description TEXT,
    admin_note TEXT,                             -- for manual adjustments
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Credit Pack Definitions
CREATE TABLE IF NOT EXISTS vista_b2c_credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    credits INT NOT NULL,
    price_cny NUMERIC(10,2) NOT NULL,
    per_credit_cny NUMERIC(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    badge_text TEXT,                             -- e.g. "Most Popular", "Best Value"
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- SECTION 3: Payments & Subscriptions
-- =========================================================================

-- 3.1 B2C Payments (credit packs + one-time purchases)
CREATE TABLE IF NOT EXISTS vista_b2c_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL
        CHECK (payment_type IN ('credit_pack', 'assessment', 'bundle', 'coaching_session')),
    amount_cny NUMERIC(10,2) NOT NULL,
    credits_granted INT DEFAULT 0,
    payment_method TEXT
        CHECK (payment_method IN ('wechat_pay', 'alipay', 'stripe', 'manual', 'subscription_renewal', NULL)),
    payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'confirmed', 'rejected', 'refunded', 'failed')),
    payment_reference TEXT,                      -- external payment ID
    receipt_url TEXT,
    proof_image_url TEXT,                        -- user-uploaded payment screenshot (MVP)
    admin_confirmed_by UUID,                     -- admin who confirmed (MVP)
    admin_confirmed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 B2C Subscriptions (Member / Pro monthly)
CREATE TABLE IF NOT EXISTS vista_b2c_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL
        CHECK (plan IN ('member', 'pro')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'past_due', 'canceled', 'expired', 'paused')),
    price_cny NUMERIC(10,2) NOT NULL,
    credits_per_cycle INT NOT NULL,
    billing_cycle_day INT NOT NULL,              -- day of month for renewal
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    credits_granted_this_cycle INT DEFAULT 0,
    credits_used_this_cycle INT DEFAULT 0,
    payment_method TEXT,
    stripe_subscription_id TEXT,                 -- future: Stripe integration
    canceled_at TIMESTAMPTZ,
    canceled_reason TEXT,
    renewal_failed_count INT DEFAULT 0,
    last_renewal_attempt TIMESTAMPTZ,
    grace_period_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- SECTION 4: Chat Engine
-- =========================================================================

-- 4.1 Chat Sessions (conversations)
CREATE TABLE IF NOT EXISTS vista_b2c_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    summary TEXT,                                -- AI-generated session summary
    message_count INT DEFAULT 0,
    is_free_session BOOLEAN DEFAULT false,       -- true if this is the free trial session
    free_messages_count INT DEFAULT 0,           -- messages counted against free limit
    credits_consumed INT DEFAULT 0,
    assessments_triggered TEXT[] DEFAULT '{}',   -- array of assessment types triggered
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'deleted')),
    ai_model_used TEXT DEFAULT 'deepseek-flash', -- which model was used
    last_message_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.2 Chat Messages
CREATE TABLE IF NOT EXISTS vista_b2c_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES vista_b2c_chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL
        CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    credits_charged INT DEFAULT 0,
    is_free_message BOOLEAN DEFAULT false,
    assessment_trigger TEXT,                     -- if this message triggered an assessment CTA
    assessment_type TEXT,                        -- PRISM, TRIDENT, etc.
    embedding vector(1536),                      -- for semantic search (future)
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- SECTION 5: Assessments
-- =========================================================================

-- 5.1 Assessment Results
CREATE TABLE IF NOT EXISTS vista_b2c_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES vista_b2c_chat_sessions(id),
    assessment_type TEXT NOT NULL
        CHECK (assessment_type IN ('PRISM', 'TRIDENT', 'CANVAS', 'market_report', 'cv_audit', 'linkedin_audit', 'coaching_session')),
    credits_consumed INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'completed', 'failed', 'expired')),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    -- Assessment-specific data
    questions JSONB DEFAULT '[]',                -- array of question objects
    answers JSONB DEFAULT '{}' ,                 -- user's answers
    -- PRISM-specific
    personality_type TEXT,
    personality_traits JSONB,
    -- TRIDENT-specific
    target_role TEXT,
    skills_matrix JSONB,
    gap_analysis JSONB,
    -- CANVAS-specific
    career_paths JSONB,
    timeline_data JSONB,
    -- Common output
    ai_report TEXT,                              -- full narrative report
    report_summary TEXT,                         -- short summary
    report_pdf_url TEXT,                         -- generated PDF URL
    score_overall INT,
    score_dimensions JSONB,                      -- {dimension_name: score}
    recommendations JSONB DEFAULT '[]',          -- array of recommendations
    follow_up_suggestions JSONB DEFAULT '[]',    -- suggested next assessments/actions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- SECTION 6: Analytics & Tracking
-- =========================================================================

-- 6.1 B2C Funnel Events (track every stage transition)
CREATE TABLE IF NOT EXISTS vista_b2c_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL
        CHECK (event_category IN ('acquisition', 'activation', 'monetization', 'upgrade', 'churn', 'engagement')),
    -- Event types by category:
    -- acquisition: registered, email_verified, linkedin_connected
    -- activation: first_chat, second_chat, fifth_chat (free limit)
    -- monetization: credit_pack_purchased, subscription_started, subscription_renewed
    -- upgrade: free_to_credit, credit_to_member, member_to_pro, pro_to_council
    -- churn: subscription_canceled, subscription_expired, inactive_30d, inactive_90d
    -- engagement: assessment_started, assessment_completed, chat_session_created
    previous_stage TEXT,
    new_stage TEXT,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6.2 B2C Upgrade Candidates (B2C users flagged for B2B upgrade)
CREATE TABLE IF NOT EXISTS vista_b2c_upgrade_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES vista_b2c_users(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL
        CHECK (trigger_type IN ('pro_3months', 'assessments_3plus', 'enterprise_signal', 'explicit_request', 'high_spend', 'manual')),
    trigger_data JSONB DEFAULT '{}',
    suggested_action TEXT
        CHECK (suggested_action IN ('council_invite', 'workshop_invite', 'diagnostic_invite', 'advisor_call', 'manual_review', NULL)),
    status TEXT NOT NULL DEFAULT 'detected'
        CHECK (status IN ('detected', 'notified', 'responded', 'converted', 'dismissed', 'expired')),
    priority TEXT DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID,                            -- team member assigned to follow up
    admin_notes TEXT,
    invitation_sent_at TIMESTAMPTZ,
    user_responded_at TIMESTAMPTZ,
    converted_to_service_id UUID,                -- if converted, which service
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6.3 B2C Cross-Sell Rules (configurable trigger → action rules)
CREATE TABLE IF NOT EXISTS vista_b2c_cross_sell_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    trigger_condition JSONB NOT NULL,             -- {type: "free_limit_hit", ...}
    action_type TEXT NOT NULL
        CHECK (action_type IN ('in_chat_prompt', 'email', 'push_notification', 'admin_alert')),
    action_content JSONB NOT NULL,                -- {message_template, cta_text, cta_url, ...}
    target_tier TEXT,                             -- which user tier this applies to
    priority INT DEFAULT 0,                       -- higher = checked first
    is_active BOOLEAN DEFAULT true,
    times_triggered INT DEFAULT 0,
    times_converted INT DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- SECTION 7: ALTER Existing Tables
-- =========================================================================

-- 7.1 Drop old CHECK constraints on vista_service_catalog (V2 had restrictive enums)
-- Category constraint: V2 only allowed Diagnostic/Development Program/Advisory/Membership/Content/Event
DO $$ BEGIN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT IF EXISTS vista_service_catalog_category_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Pricing model constraint: V2 only allowed Fixed/Retainer/Subscription/Enterprise/Custom/Free/TBD
DO $$ BEGIN
    ALTER TABLE vista_service_catalog DROP CONSTRAINT IF EXISTS vista_service_catalog_pricing_model_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7.2 Add B2C-specific columns (tier, price columns already added by Wave 1.6)
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS is_b2c BOOLEAN DEFAULT false;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS b2c_credit_cost INT;
ALTER TABLE vista_service_catalog ADD COLUMN IF NOT EXISTS slug TEXT;
-- Add unique constraint on slug (for ON CONFLICT in INSERTs)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'vista_service_catalog_slug_unique'
    ) THEN
        ALTER TABLE vista_service_catalog ADD CONSTRAINT vista_service_catalog_slug_unique UNIQUE (slug);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 7.3 Add B2C link to contacts table
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS b2c_user_id UUID;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS b2c_prospect_score NUMERIC(5,2);

-- =========================================================================
-- SECTION 8: SEED — Credit Packs
-- =========================================================================

INSERT INTO vista_b2c_credit_packs (name, slug, credits, price_cny, per_credit_cny, sort_order, badge_text, description)
VALUES
    ('Starter', 'starter', 10, 99.00, 9.90, 1, NULL, 'Perfect for trying out AI career advisory'),
    ('Professional', 'professional', 50, 399.00, 7.98, 2, 'Most Popular', 'Best for active career exploration'),
    ('Executive', 'executive', 150, 799.00, 5.33, 3, 'Best Value', 'For serious career transformation')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SECTION 9: SEED — Assessment Definitions
-- =========================================================================

-- These go into vista_service_catalog as B2C assessment products
INSERT INTO vista_service_catalog (name, slug, category, service_type, tier, tier_name, price_min_cny, price_max_cny, price_model, pricing_model, is_discountable, is_b2c, b2c_credit_cost, description, currency)
VALUES
    ('DEX AI Explorer (Free Chat)', 'dex-explorer', 'Content', 'B2C Portal', 1.5, 'B2C Portal', 0, 0, 'Free', 'Free', false, true, 0, 'Free AI career chat — 5 messages lifetime', 'CNY'),
    ('Credit Pack Starter', 'credit-pack-starter', 'Content', 'B2C Portal', 1.5, 'B2C Portal', 99, 99, 'Fixed', 'Fixed', false, true, 0, '10 credits for AI assessments and coaching', 'CNY'),
    ('Credit Pack Professional', 'credit-pack-professional', 'Content', 'B2C Portal', 1.5, 'B2C Portal', 399, 399, 'Fixed', 'Fixed', false, true, 0, '50 credits — most popular pack', 'CNY'),
    ('Credit Pack Executive', 'credit-pack-executive', 'Content', 'B2C Portal', 1.5, 'B2C Portal', 799, 799, 'Fixed', 'Fixed', false, true, 0, '150 credits — best value', 'CNY'),
    ('DEX AI Member', 'dex-member', 'Membership', 'B2C Portal', 1.5, 'B2C Portal', 99, 99, 'Subscription', 'Subscription', false, true, 0, 'Monthly subscription — 30 credits/month', 'CNY'),
    ('DEX AI Pro', 'dex-pro', 'Membership', 'B2C Portal', 1.5, 'B2C Portal', 299, 299, 'Subscription', 'Subscription', false, true, 0, 'Pro subscription — 100 credits/month', 'CNY'),
    ('PRISM Personality Assessment', 'prism-assessment', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 3, 'Career personality profile — 3 credits', 'CNY'),
    ('TRIDENT Skills Assessment', 'trident-assessment', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 5, 'Skills gap analysis — 5 credits', 'CNY'),
    ('CANVAS Career Path', 'canvas-assessment', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 8, 'Career trajectory mapping — 8 credits', 'CNY'),
    ('Market Intelligence Report', 'market-report', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 10, 'Industry talent market report — 10 credits', 'CNY'),
    ('CV Audit', 'cv-audit', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 5, 'AI-powered CV review — 5 credits', 'CNY'),
    ('LinkedIn Audit', 'linkedin-audit', 'Diagnostic', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 5, 'LinkedIn profile optimization — 5 credits', 'CNY'),
    ('Coaching Session', 'coaching-session', 'Development Program', 'B2C Assessment', 1.5, 'B2C Portal', 0, 0, 'Custom', 'Custom', false, true, 15, '1:1 coaching session — 15 credits', 'CNY')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SECTION 10: SEED — B2C Bundle
-- =========================================================================

-- Insert B2C Career Accelerator bundle into vista_service_bundles (from Wave 1.6)
INSERT INTO vista_service_bundles (bundle_name, bundle_code, component_service_names, individual_total_min_cny, individual_total_max_cny, bundle_price_min_cny, bundle_price_max_cny, discount_pct, description, positioning)
SELECT
    'B2C Career Accelerator',
    'BUNDLE_B2C_ACCELERATOR',
    ARRAY['DEX AI Pro', 'PRISM Personality Assessment', 'CANVAS Career Path', 'Coaching Session'],
    1496.00,
    1496.00,
    1200.00,
    1200.00,
    0.20,
    '3-month Pro subscription + PRISM + CANVAS + 1 coaching session — complete career transformation package',
    'From self-service to transformation: the full B2C arc'
WHERE NOT EXISTS (SELECT 1 FROM vista_service_bundles WHERE bundle_code = 'BUNDLE_B2C_ACCELERATOR');

-- =========================================================================
-- SECTION 11: SEED — Cross-Sell Rules
-- =========================================================================

INSERT INTO vista_b2c_cross_sell_rules (name, slug, description, trigger_condition, action_type, action_content, target_tier, priority)
VALUES
(
    'Free to Credits',
    'free-to-credits',
    'When user hits 5-message free limit, offer credit packs',
    '{"type": "free_limit_hit", "threshold": 5}',
    'in_chat_prompt',
    '{
        "message_template": "You''ve explored what AI career advisory can do! Unlock full access to assessments like PRISM, TRIDENT, and CANVAS with a credit pack starting at ¥99.",
        "cta_text": "Buy Credits — from ¥99",
        "cta_action": "open_credit_store",
        "show_packs": ["starter", "professional", "executive"]
    }',
    'explorer',
    100
),
(
    'Credits to Member',
    'credits-to-member',
    'When user buys 2nd pack or burns 20+ credits in 30 days, suggest subscription',
    '{"type": "usage_threshold", "condition": "second_pack_or_20cr_in_30d"}',
    'in_chat_prompt',
    '{
        "message_template": "You''re spending ¥{spent} on credits. A Member subscription gives you 30 credits/month for just ¥99 — you''d save ¥{savings}/month.",
        "cta_text": "Switch to Member — ¥99/month",
        "cta_action": "open_subscription",
        "show_comparison": true
    }',
    'credit_buyer',
    90
),
(
    'Pro to Council',
    'pro-to-council',
    'When Pro subscriber 3+ months or 3+ assessments completed, suggest Council',
    '{"type": "engagement_threshold", "condition": "pro_3months_or_3_assessments"}',
    'in_chat_prompt',
    '{
        "message_template": "You''re getting serious about your career growth. Council members get exclusive access to workshops, peer networking, and priority diagnostic slots. Founding members join at just ¥2,800/year.",
        "cta_text": "Explore Council Membership",
        "cta_action": "open_council_info",
        "show_founding_badge": true
    }',
    'pro',
    80
),
(
    'B2C to Workshop/Diagnostic',
    'b2c-to-workshop-diagnostic',
    'When CANVAS/assessment reveals team/org challenges, suggest B2B services',
    '{"type": "assessment_signal", "condition": "enterprise_signal_detected"}',
    'in_chat_prompt',
    '{
        "message_template": "Based on your {assessment_type} results, your challenges extend beyond individual career. Our {recommended_service} is designed for leaders navigating exactly this. Many professionals at your stage have found it transformative.",
        "cta_text": "Learn About {recommended_service}",
        "cta_action": "open_service_info",
        "personalize_from_assessment": true
    }',
    'pro',
    70
)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SECTION 12: INDEXES
-- =========================================================================

-- B2C Users
CREATE INDEX IF NOT EXISTS idx_b2c_users_email ON vista_b2c_users(email);
CREATE INDEX IF NOT EXISTS idx_b2c_users_tier ON vista_b2c_users(current_tier);
CREATE INDEX IF NOT EXISTS idx_b2c_users_active ON vista_b2c_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_b2c_users_b2b_link ON vista_b2c_users(b2b_contact_id) WHERE b2b_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_b2c_users_created ON vista_b2c_users(created_at DESC);

-- Credit Ledger
CREATE INDEX IF NOT EXISTS idx_b2c_credit_ledger_user ON vista_b2c_credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_credit_ledger_type ON vista_b2c_credit_ledger(user_id, entry_type);
CREATE INDEX IF NOT EXISTS idx_b2c_credit_ledger_date ON vista_b2c_credit_ledger(user_id, created_at DESC);

-- Payments
CREATE INDEX IF NOT EXISTS idx_b2c_payments_user ON vista_b2c_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_payments_status ON vista_b2c_payments(payment_status) WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_b2c_payments_date ON vista_b2c_payments(created_at DESC);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_b2c_subscriptions_user ON vista_b2c_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_subscriptions_status ON vista_b2c_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_b2c_subscriptions_active ON vista_b2c_subscriptions(status) WHERE status = 'active';

-- Chat Sessions
CREATE INDEX IF NOT EXISTS idx_b2c_chat_sessions_user ON vista_b2c_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_chat_sessions_status ON vista_b2c_chat_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_b2c_chat_sessions_last_msg ON vista_b2c_chat_sessions(last_message_at DESC);

-- Chat Messages
CREATE INDEX IF NOT EXISTS idx_b2c_chat_messages_session ON vista_b2c_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_b2c_chat_messages_user ON vista_b2c_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_chat_messages_date ON vista_b2c_chat_messages(created_at DESC);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_b2c_assessments_user ON vista_b2c_assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_assessments_type ON vista_b2c_assessment_results(user_id, assessment_type);
CREATE INDEX IF NOT EXISTS idx_b2c_assessments_status ON vista_b2c_assessment_results(status) WHERE status = 'in_progress';

-- Events
CREATE INDEX IF NOT EXISTS idx_b2c_events_user ON vista_b2c_events(user_id);
CREATE INDEX IF NOT EXISTS idx_b2c_events_type ON vista_b2c_events(event_type);
CREATE INDEX IF NOT EXISTS idx_b2c_events_date ON vista_b2c_events(created_at DESC);

-- Upgrade Candidates
CREATE INDEX IF NOT EXISTS idx_b2c_upgrade_candidates_status ON vista_b2c_upgrade_candidates(status);
CREATE INDEX IF NOT EXISTS idx_b2c_upgrade_candidates_priority ON vista_b2c_upgrade_candidates(priority DESC) WHERE status = 'detected';

-- Cross-Sell Rules
CREATE INDEX IF NOT EXISTS idx_b2c_cross_sell_active ON vista_b2c_cross_sell_rules(is_active) WHERE is_active = true;

-- =========================================================================
-- SECTION 13: TRIGGERS
-- =========================================================================

-- Auto-update updated_at on B2C user changes
CREATE OR REPLACE FUNCTION fn_b2c_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_user_updated_at ON vista_b2c_users;
CREATE TRIGGER trg_b2c_user_updated_at
    BEFORE UPDATE ON vista_b2c_users
    FOR EACH ROW EXECUTE FUNCTION fn_b2c_user_updated_at();

-- Auto-create profile when B2C user is created
CREATE OR REPLACE FUNCTION fn_b2c_create_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vista_b2c_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_create_profile ON vista_b2c_users;
CREATE TRIGGER trg_b2c_create_profile
    AFTER INSERT ON vista_b2c_users
    FOR EACH ROW EXECUTE FUNCTION fn_b2c_create_profile();

-- Track free message usage
CREATE OR REPLACE FUNCTION fn_b2c_track_free_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_free_message = true AND NEW.role = 'user' THEN
        UPDATE vista_b2c_users
        SET free_messages_used = free_messages_used + 1
        WHERE id = NEW.user_id;

        UPDATE vista_b2c_chat_sessions
        SET free_messages_count = free_messages_count + 1
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_track_free_message ON vista_b2c_chat_messages;
CREATE TRIGGER trg_b2c_track_free_message
    AFTER INSERT ON vista_b2c_chat_messages
    FOR EACH ROW EXECUTE FUNCTION fn_b2c_track_free_message();

-- Update user tier based on subscription/purchase activity
CREATE OR REPLACE FUNCTION fn_b2c_update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE vista_b2c_users
        SET current_tier = CASE
                WHEN NEW.plan = 'pro' THEN 'pro'
                WHEN NEW.plan = 'member' THEN 'member'
                ELSE current_tier
            END,
            updated_at = now()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_b2c_update_user_tier ON vista_b2c_subscriptions;
CREATE TRIGGER trg_b2c_update_user_tier
    AFTER INSERT OR UPDATE OF status ON vista_b2c_subscriptions
    FOR EACH ROW EXECUTE FUNCTION fn_b2c_update_user_tier();

-- =========================================================================
-- VERIFICATION QUERIES (run after execution)
-- =========================================================================

-- Verify tables created
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'vista_b2c%'
-- ORDER BY table_name;

-- Verify seed data
-- SELECT count(*) as credit_packs FROM vista_b2c_credit_packs;
-- SELECT count(*) as b2c_services FROM vista_service_catalog WHERE is_b2c = true;
-- SELECT count(*) as cross_sell_rules FROM vista_b2c_cross_sell_rules;
-- SELECT count(*) as bundles FROM vista_b2c_bundles WHERE slug = 'b2c-career-accelerator';

-- =========================================================================
-- END OF WAVE 1.7 MIGRATION
-- =========================================================================
-- Tables created: 13 (b2c_users, b2c_profiles, credit_ledger, credit_packs,
--   b2c_payments, b2c_subscriptions, chat_sessions, chat_messages,
--   assessment_results, b2c_events, b2c_upgrade_candidates, b2c_cross_sell_rules,
--   + auto-created b2c_profiles via trigger)
-- Seeds: 3 credit packs, 13 service catalog entries, 1 bundle, 4 cross-sell rules
-- Triggers: 4 (updated_at, create_profile, track_free_message, update_user_tier)
-- =========================================================================
