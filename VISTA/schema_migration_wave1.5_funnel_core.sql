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

-- 1.3 Seed Tier 1 — FREE (Acquisition Layer)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, is_discountable, tier_positioning)
VALUES
    ('LinkedIn Content (3x/week)', 'Free Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['All ICP contacts'], false, 'The thought leader who gets cross-border talent'),
    ('Newsletter (weekly)', 'Free Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['All contacts'], false, 'The thought leader who gets cross-border talent'),
    ('Podcast (weekly)', 'Free Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Target guests', 'Listeners'], false, 'The thought leader who gets cross-border talent'),
    ('Webinar (monthly, 45 min)', 'Free Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Nurture list', 'Workshop leads'], false, 'The thought leader who gets cross-border talent'),
    ('Diagnostic Teaser (15 min)', 'Free Content', 1, 'Free (Acquisition)', 0, 0, 'free', ARRAY['Conversation-stage contacts'], false, 'Show them what the data looks like')
ON CONFLICT DO NOTHING;

-- 1.4 Seed Tier 2 — LOW-TICKET (Validation Layer)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Workshop (online, 2-3 hours)', 'Low-Ticket', 2, 'Low-Ticket (Validation)', 2000, 5000, 'per_session', ARRAY['HR leaders', 'L&D heads'], '2-3 hours', true, '{"max_pct": 0.15, "conditions": ["early_bird"]}', 'Practical, diagnostic-driven, not theory', '2-3x cheaper than Huthwaite/DDI'),
    ('Workshop (half-day intensive)', 'Low-Ticket', 2, 'Low-Ticket (Validation)', 5000, 8000, 'per_session', ARRAY['VPs', 'Directors'], 'half-day', true, '{"max_pct": 0.15, "conditions": ["early_bird"]}', 'Practical, diagnostic-driven, not theory', '2-3x cheaper than Huthwaite/DDI'),
    ('Insights Report (single issue)', 'Low-Ticket', 2, 'Low-Ticket (Validation)', 1500, 3000, 'per_issue', ARRAY['PE operators', 'Strategy heads'], 'one-time', true, '{"max_pct": 0.10}', 'Show intelligence quality', NULL),
    ('Talent Market Map', 'Low-Ticket', 2, 'Low-Ticket (Validation)', 3000, 8000, 'per_project', ARRAY['HR', 'Hiring managers'], '3-6 weeks', true, '{"max_pct": 0.15}', 'Demonstrate GRID capability', NULL),
    ('The Council (annual membership)', 'Low-Ticket', 2, 'Low-Ticket (Validation)', 8000, 15000, 'per_year', ARRAY['Senior leaders', 'PE partners'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('DEX AI Starter Credits', 'Platform', 7, 'Platform (DEX AI)', 500, 2000, 'one_time', ARRAY['HR teams', 'Recruiters'], 'one-time', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights')
ON CONFLICT DO NOTHING;

-- 1.5 Seed Tier 3 — MID-TICKET (Revenue Layer)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Diagnostic (comprehensive)', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 8000, 25000, 'per_project', ARRAY['CHROs', 'VPs', 'GMs'], '2-4 weeks', true, '{"max_pct": 0.50, "conditions": ["founding_client", "first_3"]}', 'Data-driven talent intelligence, not gut feel', 'Same price as SHL/Hogan, more actionable'),
    ('Executive Coaching (6 sessions)', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 18000, 36000, 'per_engagement', ARRAY['Senior directors', 'VPs'], '3 months', true, '{"max_pct": 0.15}', 'Boutique coaching with data backing', NULL),
    ('Executive Coaching (12 sessions)', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 30000, 60000, 'per_engagement', ARRAY['C-suite', 'Founders'], '6 months', true, '{"max_pct": 0.15}', 'Boutique coaching with data backing', NULL),
    ('Training Program (custom, 3 sessions)', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 15000, 30000, 'per_program', ARRAY['L&D', 'HR directors'], '1-2 months', true, '{"max_pct": 0.20}', 'Diagnostic-backed training', NULL),
    ('Syndicate Intelligence Subscription', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 30000, 60000, 'per_year', ARRAY['PE firms', 'Strategy teams'], '12 months', true, '{"max_pct": 0.15, "conditions": ["annual"]}', 'Ongoing intelligence, not point-in-time', NULL),
    ('DEX AI Pro Subscription', 'Platform', 7, 'Platform (DEX AI)', 5000, 15000, 'per_month', ARRAY['HR teams', 'Talent functions'], 'monthly', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights'),
    ('Mapping Project (full market scan)', 'Mid-Ticket', 3, 'Mid-Ticket (Revenue)', 15000, 40000, 'per_project', ARRAY['CHROs', 'PE operating partners'], '3-6 weeks', true, '{"max_pct": 0.15}', 'Comprehensive market intelligence', NULL)
ON CONFLICT DO NOTHING;

-- 1.6 Seed Tier 4 — HIGH-TICKET (Proof Layer)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Advisory Project (single product)', 'High-Ticket', 4, 'High-Ticket (Proof)', 40000, 80000, 'per_project', ARRAY['CHROs', 'CEOs'], '2-3 months', true, '{"max_pct": 0.20, "conditions": ["founding_client", "first_3"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('Advisory Project (multi-product)', 'High-Ticket', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_project', ARRAY['CEOs', 'Boards'], '4-6 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('HQ-China Alignment Program (BRIDGE full)', 'High-Ticket', 4, 'High-Ticket (Proof)', 60000, 120000, 'per_project', ARRAY['Expats', 'China GMs', 'HQ heads'], '6 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('AI Transformation Program (SPARK full)', 'High-Ticket', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_project', ARRAY['CEOs', 'CTOs', 'CHROs'], '6-9 months', true, '{"max_pct": 0.20}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('Retainer (monthly advisory)', 'High-Ticket', 4, 'High-Ticket (Proof)', 15000, 30000, 'per_month', ARRAY['CHROs', 'CEOs'], '6-12 months', true, '{"max_pct": 0.20, "conditions": ["annual_commitment", "first_3"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('PE Portfolio Talent Review (annual)', 'High-Ticket', 4, 'High-Ticket (Proof)', 80000, 150000, 'per_year', ARRAY['PE partners'], 'ongoing', true, '{"max_pct": 0.18, "conditions": ["bundle"]}', 'Boutique. Senior. Cross-border. AI-native.', '1/3 the price of McKinsey/BCG'),
    ('DEX AI Enterprise License', 'Platform', 7, 'Platform (DEX AI)', 15000, 30000, 'per_month', ARRAY['Large enterprises'], 'annual contract', false, NULL, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights')
ON CONFLICT DO NOTHING;

-- 1.7 Seed Tier 5 — SEARCH (Cash Engine)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Retained Executive Search', 'Search', 5, 'Search (Cash Engine)', 75000, 200000, 'per_role', ARRAY['CHROs', 'CEOs'], '2-4 months', false, NULL, 'Search + intelligence, not just headhunting', 'Same price as Egon Zehnder/Spencer Stuart, more data'),
    ('Contingent Search', 'Search', 5, 'Search (Cash Engine)', 50000, 150000, 'per_role', ARRAY['CHROs', 'Hiring managers'], '1-3 months', false, NULL, 'Search + intelligence, not just headhunting', 'Same price as Egon Zehnder/Spencer Stuart, more data'),
    ('Search + Diagnostic Bundle', 'Search', 5, 'Search (Cash Engine)', 90000, 215000, 'per_role', ARRAY['CHROs', 'CEOs'], '2-4 months', true, '{"max_pct": 0.10, "conditions": ["bundle"]}', 'Search + intelligence bundled', 'Same price, more comprehensive'),
    ('Mapping-to-Search Pipeline', 'Search', 5, 'Search (Cash Engine)', 15000, 40000, 'per_role', ARRAY['CHROs', 'PE operating partners'], '3-6 weeks then search', true, '{"max_pct": 0.10, "note": "mapping fee credited to search"}', 'Mapping converts to search', NULL)
ON CONFLICT DO NOTHING;

-- 1.8 Seed Tier 6 — THE COUNCIL (Recurring + Exclusivity)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, engagement_duration, is_discountable, discount_rules, tier_positioning, competitor_anchor)
VALUES
    ('Council Individual Member', 'Council', 6, 'Council (Recurring)', 12000, 12000, 'per_year', ARRAY['Senior leaders'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('Council Corporate Member', 'Council', 6, 'Council (Recurring)', 30000, 30000, 'per_year', ARRAY['CHROs', 'CEOs'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage'),
    ('Council PE Partner Member', 'Council', 6, 'Council (Recurring)', 50000, 50000, 'per_year', ARRAY['PE partners'], '12 months', true, '{"max_pct": 0.20, "conditions": ["founding_member"]}', 'The cross-border leadership circle', '1/3 the price of YPO/EO/Vistage')
ON CONFLICT DO NOTHING;

-- 1.9 Seed Tier 7 — PLATFORM (DEX AI additional products)
INSERT INTO vista_service_catalog (name, category, tier, tier_name, price_min_cny, price_max_cny, price_model, target_buyer, is_discountable, tier_positioning, competitor_anchor)
VALUES
    ('DEX AI Credit Top-Up', 'Platform', 7, 'Platform (DEX AI)', 50, 50, 'per_unit', ARRAY['HR teams', 'Recruiters'], false, 'Talent intelligence as a service', '1/5 the price of LinkedIn Talent Insights'),
    ('METRIX Assessment (standalone)', 'Platform', 7, 'Platform (DEX AI)', 200, 500, 'per_assessment', ARRAY['HR teams', 'Recruiters'], true, 'Data-driven assessment, not gut feel', NULL),
    ('Team Diagnostic (up to 10 people)', 'Platform', 7, 'Platform (DEX AI)', 3000, 8000, 'one_time', ARRAY['HR teams', 'Team leads'], true, 'Team-level intelligence', NULL)
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


