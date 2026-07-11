-- ============================================================================
-- VISTA Wave 1.5 — Funnel Core: Revenue Engine
-- Migration: schema_migration_wave1.5_funnel_core.sql
-- Date: 2026-07-11
-- Author: James/AI for Kevin Hong
--
-- What this does:
--   F-01: Extends vista_contacts with funnel tracking columns (8 new columns)
--   F-02: Creates vista_outreach_sequences (every outreach touch tracked)
--   F-03: Creates vista_outreach_templates + seeds 8 templates (4 archetypes × 2)
--   F-05: Creates vista_nurture_routes (no dead end routing)
--   F-06: Extends vista_opportunities with 6-signal scoring + auto-compute trigger
--   F-07/08: No DB changes (dashboard widgets use existing + new tables)
--
-- Dependencies:
--   - vista_contacts (must exist)
--   - vista_opportunities (must exist)
--   - Migration V2 (schema_migration_v2_service_catalog.sql) — recommended but not required
--
-- Estimated tables: 3 new, 2 altered
-- Estimated lines: ~450
-- ============================================================================

BEGIN;

-- ============================================================================
-- F-01: CONTACT FUNNEL EXTENSIONS
-- Add 8 columns to vista_contacts for BD funnel tracking
-- ============================================================================

-- BD Bucket: which archetype approach
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS bd_bucket VARCHAR(20)
  CHECK (bd_bucket IN ('sniper', 'trojan_horse', 'farmer', 'weiqi'));

COMMENT ON COLUMN vista_contacts.bd_bucket IS
  'BD archetype: sniper=Top-25 high-value, trojan_horse=Podcast guests, farmer=Volume ICP, weiqi=Ecosystem players';

-- Warmth Score: 1=cold, 5=referral
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS warmth_score SMALLINT
  CHECK (warmth_score BETWEEN 1 AND 5);

COMMENT ON COLUMN vista_contacts.warmth_score IS
  '1=cold outreach, 2=linkedin engage, 3=event met, 4=mutual connection, 5=warm referral';

-- Funnel Stage: where they are in the revenue pipeline
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS funnel_stage VARCHAR(30)
  DEFAULT 'outreach'
  CHECK (funnel_stage IN ('outreach', 'conversation', 'opportunity', 'paid', 'nurture', 'closed_lost'));

COMMENT ON COLUMN vista_contacts.funnel_stage IS
  'Revenue funnel stage: outreach → conversation → opportunity → paid. Non-converters → nurture.';

-- Outreach Count: how many touches sent
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS outreach_count SMALLINT DEFAULT 0;

COMMENT ON COLUMN vista_contacts.outreach_count IS
  'Number of outreach touches sent. Max 4 before auto-routing to nurture.';

-- Last Outreach Date
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_outreach_date DATE;

-- Next Action Date: when to act next
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS next_action_date DATE;

COMMENT ON COLUMN vista_contacts.next_action_date IS
  'Next date Kevin should take action on this contact. Used for daily digest and dashboard.';

-- Next Action Type
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS next_action_type VARCHAR(30)
  CHECK (next_action_type IN (
    'send_initial', 'follow_up', 'content_engage', 'send_article',
    'meeting', 'proposal', 'reengage_nurture', 'stop'
  ));

COMMENT ON COLUMN vista_contacts.next_action_type IS
  'What Kevin should do next: send_initial, follow_up, content_engage, meeting, proposal, etc.';

-- Lead Source
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS lead_source VARCHAR(40)
  CHECK (lead_source IN (
    'network', 'sales_nav', 'podcast', 'event', 'referral',
    'content_engagement', 'inbound', 'linkedin', 'email', 'other'
  ));

COMMENT ON COLUMN vista_contacts.lead_source IS
  'Where this contact originated: network, Sales Navigator, podcast guest, event, referral, etc.';

-- Funnel stage + next action index (for daily digest queries)
CREATE INDEX IF NOT EXISTS idx_contacts_funnel_stage
  ON vista_contacts(funnel_stage, next_action_date);

CREATE INDEX IF NOT EXISTS idx_contacts_bd_bucket
  ON vista_contacts(bd_bucket, funnel_stage);

CREATE INDEX IF NOT EXISTS idx_contacts_warmth
  ON vista_contacts(warmth_score DESC, funnel_stage);


-- ============================================================================
-- F-03: OUTREACH TEMPLATES
-- The 4 BD archetypes × touch variants = 8 seed templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_outreach_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  bucket VARCHAR(20) NOT NULL
    CHECK (bucket IN ('sniper', 'trojan_horse', 'farmer', 'weiqi', 'universal')),
  touch_number SMALLINT NOT NULL CHECK (touch_number BETWEEN 1 AND 4),
  subject_line TEXT,
  body_template TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL
    CHECK (channel IN ('linkedin', 'email', 'intro', 'any')),
  send_window VARCHAR(40) DEFAULT 'Tue-Thu 9-10am Shanghai',
  variables JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE vista_outreach_templates IS
  'Outreach message templates for each BD archetype and touch number. Uses mustache-style variables.';

-- Seed 8 templates from the funnel document

INSERT INTO vista_outreach_templates (name, bucket, touch_number, subject_line, body_template, channel, send_window, variables, description) VALUES

-- Template 1: Sniper Touch 1
(
  'Sniper — Personal Intro',
  'sniper', 1,
  NULL,
  'Hi {{first_name}},

{{mutual_connection}} suggested I reach out. I noticed {{company}} is {{observation}}.

We''ve been working with {{similar_situation}} on {{specific_outcome}}.

Would a 20-minute conversation be useful? Happy to share what we''re seeing in the market — no pitch.

Best,
Kevin',
  'linkedin', 'Tue-Thu 9-10am Shanghai',
  '{"first_name": "string", "mutual_connection": "string", "company": "string", "observation": "string", "similar_situation": "string", "specific_outcome": "string"}'::jsonb,
  'High-touch personal outreach for Top-25 targets. Named referral + specific observation + relevant proof point + low-commitment ask.'
),

-- Template 2: Trojan Horse Touch 1
(
  'Trojan Horse — Podcast Invitation',
  'trojan_horse', 1,
  NULL,
  'Hi {{first_name}},

I host "Leaders in Motion" — a podcast on leadership, talent, and organizational transformation. We''ve had {{notable_guest_count}} share their plays on air.

Your work on {{their_topic}} really stood out. I''d love to have you on for a 30-minute conversation — no prep needed, just your insights.

Would you be open to it?

Best,
Kevin',
  'linkedin', 'Tue-Thu 9-10am Shanghai',
  '{"first_name": "string", "notable_guest_count": "string", "their_topic": "string"}'::jsonb,
  'Zero sales pressure. Genuine flattery + reciprocity. After the episode → business follow-up.'
),

-- Template 3: Farmer Touch 1 (Connection Request)
(
  'Farmer — LinkedIn Connect',
  'farmer', 1,
  NULL,
  'Hi {{first_name}}, I write about {{content_topics}} for senior leaders in Asia. Your profile caught my attention — would love to connect.',
  'linkedin', 'Any weekday',
  '{"first_name": "string", "content_topics": "string"}'::jsonb,
  'Volume play. Content-led connection request. After acceptance → follow-up with content share.'
),

-- Template 4: Farmer Touch 2 (Content Follow-up, Day 2-3)
(
  'Farmer — Content Follow-up',
  'farmer', 2,
  NULL,
  'Thanks for connecting, {{first_name}}.

I just published a piece on {{article_topic}}: {{article_link}}. Thought it might resonate.

Curious — is {{topic}} something you''re navigating at {{company}}?',
  'linkedin', 'Any weekday (Day 2-3 after connect)',
  '{"first_name": "string", "article_topic": "string", "article_link": "string", "topic": "string", "company": "string"}'::jsonb,
  'Gives value first. Soft question invites dialogue. If no response → content nurture loop.'
),

-- Template 5: Weiqi Touch 1
(
  'Weiqi — Ecosystem Collaboration',
  'weiqi', 1,
  'Collaboration on {{topic_area}} in Asia',
  'Hi {{first_name}},

I''m building a network of {{ecosystem_type}} who are thinking about {{topic_area}} in Asia.

We''re hosting a private roundtable on {{roundtable_topic}} in {{month}} and also produce research on {{research_area}}. Would love to explore if there''s a way to collaborate or cross-refer clients.

Open to a quick chat?

Best,
Kevin',
  'linkedin', 'Any weekday',
  '{"first_name": "string", "ecosystem_type": "string", "topic_area": "string", "roundtable_topic": "string", "month": "string", "research_area": "string"}'::jsonb,
  'Ecosystem collaboration for PE partners, coaches, board advisors, university deans. Multi-angle surround of target accounts.'
),

-- Template 6: Sniper Touch 3 (Day 7, different angle)
(
  'Sniper — Article Share (Touch 3)',
  'sniper', 3,
  NULL,
  'Hi {{first_name}},

Thought you''d find this relevant — {{article_or_insight}}.

We''re seeing {{market_insight}} across {{sector}}. Happy to share more if useful.

Best,
Kevin',
  'linkedin', 'Any weekday (Day 7)',
  '{"first_name": "string", "article_or_insight": "string", "market_insight": "string", "sector": "string"}'::jsonb,
  'Day 7 follow-up with a different angle. Share a relevant article or market insight. Creates value, not pressure.'
),

-- Template 7: Trojan Horse Touch 3 (Day 7, podcast content)
(
  'Trojan Horse — Episode Share (Touch 3)',
  'trojan_horse', 3,
  NULL,
  'Hi {{first_name}},

New episode just dropped — {{episode_title}} with {{guest_name}}. {{one_line_insight}}.

Thought of you given your work on {{their_topic}}: {{episode_link}}

Would love to have you on for a future episode if you''re open.

Best,
Kevin',
  'linkedin', 'Any weekday (Day 7)',
  '{"first_name": "string", "episode_title": "string", "guest_name": "string", "one_line_insight": "string", "their_topic": "string", "episode_link": "string"}'::jsonb,
  'Share a relevant podcast episode. Demonstrates value + credibility. Soft re-invitation to guest.'
),

-- Template 8: Universal Touch 4 (Day 14, final touch)
(
  'Universal — Final Touch (Event Invite)',
  'universal', 4,
  NULL,
  'Hi {{first_name}},

I wanted to make sure you saw this — we''re hosting {{event_type}} on {{event_topic}} in {{event_date}}.

{{one_line_why_relevant}}.

Would love to have you join: {{event_link}}

If timing isn''t right, no worries at all. I''ll keep sharing our research and insights — always useful stuff for {{their_role}}.

Best,
Kevin',
  'any', 'Any weekday (Day 14)',
  '{"first_name": "string", "event_type": "string", "event_topic": "string", "event_date": "string", "one_line_why_relevant": "string", "event_link": "string", "their_role": "string"}'::jsonb,
  'Final touch before nurture. Invite to webinar/roundtable/workshop. If no response → auto-route to nurture.'
);


-- ============================================================================
-- F-02: OUTREACH SEQUENCES
-- Track every outreach touch sent to every contact
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_outreach_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES vista_contacts(id) ON DELETE CASCADE,
  template_id UUID REFERENCES vista_outreach_templates(id) ON DELETE SET NULL,
  touch_number SMALLINT NOT NULL CHECK (touch_number BETWEEN 1 AND 4),
  channel VARCHAR(20) NOT NULL
    CHECK (channel IN ('linkedin', 'email', 'intro', 'any')),
  sent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sent', 'replied', 'no_response', 'bounced', 'cancelled')),
  response_text TEXT,
  response_sentiment VARCHAR(20)
    CHECK (response_sentiment IN ('positive', 'neutral', 'negative', 'not_interested', 'meeting_booked')),
  rendered_body TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each contact can only have one sequence per touch number
  UNIQUE(contact_id, touch_number)
);

COMMENT ON TABLE vista_outreach_sequences IS
  'Tracks every outreach touch. 4-touch cadence: Day 0 → 3 → 7 → 14. After touch 4 + no reply → nurture.';

CREATE INDEX IF NOT EXISTS idx_outreach_contact_touch
  ON vista_outreach_sequences(contact_id, touch_number);

CREATE INDEX IF NOT EXISTS idx_outreach_scheduled
  ON vista_outreach_sequences(scheduled_at, status)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_outreach_status
  ON vista_outreach_sequences(status, scheduled_at DESC);

-- Trigger: auto-update contact's outreach_count, last_outreach_date, next_action when sequence status changes
CREATE OR REPLACE FUNCTION fn_sync_outreach_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_max_touch SMALLINT;
  v_max_date TIMESTAMPTZ;
BEGIN
  -- Only fire on UPDATE (status change)
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN

    -- Update outreach_count to max touch_number with status='sent' or 'replied'
    SELECT MAX(touch_number), MAX(sent_at)
    INTO v_max_touch, v_max_date
    FROM vista_outreach_sequences
    WHERE contact_id = NEW.contact_id
      AND status IN ('sent', 'replied');

    UPDATE vista_contacts SET
      outreach_count = COALESCE(v_max_touch, 0),
      last_outreach_date = v_max_date::date,
      updated_at = NOW()
    WHERE id = NEW.contact_id;

    -- If replied with positive sentiment → advance to conversation
    IF NEW.status = 'replied' AND NEW.response_sentiment IN ('positive', 'meeting_booked') THEN
      UPDATE vista_contacts SET
        funnel_stage = 'conversation',
        next_action_type = 'meeting',
        next_action_date = CURRENT_DATE + INTERVAL '2 days',
        updated_at = NOW()
      WHERE id = NEW.contact_id;
    END IF;

    -- If this was touch 4 and no response → auto-route to nurture
    IF NEW.touch_number = 4 AND NEW.status = 'no_response' THEN
      UPDATE vista_contacts SET
        funnel_stage = 'nurture',
        next_action_type = 'reengage_nurture',
        next_action_date = CURRENT_DATE + INTERVAL '7 days',
        updated_at = NOW()
      WHERE id = NEW.contact_id;

      -- Create nurture route if not exists
      INSERT INTO vista_nurture_routes (contact_id, route_type, entered_at, entered_reason, reengage_date)
      VALUES (
        NEW.contact_id,
        'linkedin',
        NOW(),
        'max_touches',
        CURRENT_DATE + INTERVAL '7 days'
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Schedule next touch if applicable
    IF NEW.status = 'sent' AND NEW.touch_number < 4 THEN
      DECLARE
        v_next_touch SMALLINT := NEW.touch_number + 1;
        v_next_date TIMESTAMPTZ;
      BEGIN
        -- Cadence: Touch 2 = Day 3, Touch 3 = Day 7, Touch 4 = Day 14
        v_next_date = CASE v_next_touch
          WHEN 2 THEN NEW.sent_at + INTERVAL '3 days'
          WHEN 3 THEN NEW.sent_at + INTERVAL '4 days'  -- Day 7 from start
          WHEN 4 THEN NEW.sent_at + INTERVAL '7 days'  -- Day 14 from start
        END;

        -- Auto-create next touch if template exists
        INSERT INTO vista_outreach_sequences (contact_id, template_id, touch_number, channel, scheduled_at, status)
        SELECT
          NEW.contact_id,
          t.id,
          v_next_touch,
          t.channel,
          v_next_date,
          'scheduled'
        FROM vista_outreach_templates t
        WHERE t.bucket IN (
          SELECT bucket FROM vista_outreach_templates WHERE id = NEW.template_id
        )
        AND t.touch_number = v_next_touch
        AND t.is_active = true
        LIMIT 1;

      END;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_outreach_to_contact
  AFTER UPDATE ON vista_outreach_sequences
  FOR EACH ROW EXECUTE FUNCTION fn_sync_outreach_to_contact();


-- ============================================================================
-- F-05: NURTURE ROUTES
-- "No Dead End" — every non-converter gets routed to nurture
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_nurture_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES vista_contacts(id) ON DELETE CASCADE,
  route_type VARCHAR(20) NOT NULL
    CHECK (route_type IN ('newsletter', 'podcast', 'webinar', 'linkedin', 'workshop')),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  entered_reason VARCHAR(40) NOT NULL
    CHECK (entered_reason IN (
      'max_touches', 'not_interested', 'no_budget',
      'timing_off', 'low_score', 'manual'
    )),
  reengage_date DATE,
  reengage_count SMALLINT DEFAULT 0,
  last_engagement_date DATE,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'reengaged', 'converted', 'unsubscribed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One route per contact per type
  UNIQUE(contact_id, route_type)
);

COMMENT ON TABLE vista_nurture_routes IS
  'No Dead End: every non-converter gets routed to ≥1 nurture channel. Timing: Week 1 (personal note), Week 2-4 (passive), Month 2 (webinar), Month 3 (workshop), Ongoing (podcast).';

CREATE INDEX IF NOT EXISTS idx_nurture_contact
  ON vista_nurture_routes(contact_id, status);

CREATE INDEX IF NOT EXISTS idx_nurture_reengage
  ON vista_nurture_routes(reengage_date, status)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_nurture_type_status
  ON vista_nurture_routes(route_type, status);


-- ============================================================================
-- F-06: OPPORTUNITY SCORING
-- 6-signal scoring system for conversation → opportunity qualification
-- ============================================================================

-- Add scoring columns to vista_opportunities
ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_named_problem SMALLINT DEFAULT 0
  CHECK (score_named_problem BETWEEN 0 AND 3);
COMMENT ON COLUMN vista_opportunities.score_named_problem IS '+3 if they named a specific, urgent problem';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_budget_authority SMALLINT DEFAULT 0
  CHECK (score_budget_authority BETWEEN 0 AND 3);
COMMENT ON COLUMN vista_opportunities.score_budget_authority IS '+3 if they have budget authority or can get it';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_pricing_ask SMALLINT DEFAULT 0
  CHECK (score_pricing_ask BETWEEN 0 AND 2);
COMMENT ON COLUMN vista_opportunities.score_pricing_ask IS '+2 if they asked about pricing or engagement model';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_product_fit SMALLINT DEFAULT 0
  CHECK (score_product_fit BETWEEN 0 AND 2);
COMMENT ON COLUMN vista_opportunities.score_product_fit IS '+2 if problem maps to PRISM/BRIDGE/MOSAIC/SPARK/FORGE';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_timeline SMALLINT DEFAULT 0
  CHECK (score_timeline BETWEEN 0 AND 2);
COMMENT ON COLUMN vista_opportunities.score_timeline IS '+2 if timeline < 6 months';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_competitor_ref SMALLINT DEFAULT 0
  CHECK (score_competitor_ref BETWEEN 0 AND 1);
COMMENT ON COLUMN vista_opportunities.score_competitor_ref IS '+1 if they referenced a competitor or alternative';

-- Computed fields
ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS total_score SMALLINT DEFAULT 0;
COMMENT ON COLUMN vista_opportunities.total_score IS 'Sum of all scoring signals. Max 13.';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS score_tier VARCHAR(20);
COMMENT ON COLUMN vista_opportunities.score_tier IS
  'Auto-computed: opportunity (7+) / warm_nurture (4-6) / early (1-3)';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS product_recommendation VARCHAR(30);
COMMENT ON COLUMN vista_opportunities.product_recommendation IS
  'Which LYC product fits: PRISM / BRIDGE / MOSAIC / SPARK / FORGE / SHIFT_COMPOSITE / ADVISORY';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS first_step_price DECIMAL(12,2);
COMMENT ON COLUMN vista_opportunities.first_step_price IS
  'Low-risk diagnostic entry price (8K-25K RMB). The diagnostic IS the sale.';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS full_engagement_price DECIMAL(12,2);
COMMENT ON COLUMN vista_opportunities.full_engagement_price IS
  'Full service engagement price (30K-120K RMB)';

ALTER TABLE vista_opportunities ADD COLUMN IF NOT EXISTS conversation_notes TEXT;
COMMENT ON COLUMN vista_opportunities.conversation_notes IS
  'Notes from the 3-question diagnostic: biggest challenge, what they tried, magic wand fix';

-- Auto-compute trigger for total_score and score_tier
CREATE OR REPLACE FUNCTION fn_compute_opportunity_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score = COALESCE(NEW.score_named_problem, 0)
    + COALESCE(NEW.score_budget_authority, 0)
    + COALESCE(NEW.score_pricing_ask, 0)
    + COALESCE(NEW.score_product_fit, 0)
    + COALESCE(NEW.score_timeline, 0)
    + COALESCE(NEW.score_competitor_ref, 0);

  NEW.score_tier = CASE
    WHEN NEW.total_score >= 7 THEN 'opportunity'
    WHEN NEW.total_score >= 4 THEN 'warm_nurture'
    WHEN NEW.total_score >= 1 THEN 'early'
    ELSE NULL
  END;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunity_score
  BEFORE INSERT OR UPDATE OF
    score_named_problem, score_budget_authority, score_pricing_ask,
    score_product_fit, score_timeline, score_competitor_ref
  ON vista_opportunities
  FOR EACH ROW EXECUTE FUNCTION fn_compute_opportunity_score();


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Funnel summary for dashboard
CREATE OR REPLACE FUNCTION fn_funnel_summary()
RETURNS TABLE (
  stage VARCHAR(30),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT funnel_stage, COUNT(*)::BIGINT
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
    END;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_funnel_summary IS
  'Returns count of contacts at each funnel stage. Used by dashboard widget.';

-- Today's action items
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
    COALESCE(c.full_name, c.company, 'Unknown')::TEXT,
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
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_today_actions IS
  'Returns contacts needing action today, sorted by overdue days + warmth. Dashboard widget.';

-- Overdue outreaches
CREATE OR REPLACE FUNCTION fn_overdue_outreaches()
RETURNS TABLE (
  sequence_id UUID,
  contact_id UUID,
  contact_name TEXT,
  touch_number SMALLINT,
  channel VARCHAR(20),
  scheduled_at TIMESTAMPTZ,
  days_overdue INT,
  template_name VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.contact_id,
    COALESCE(c.full_name, c.company, 'Unknown')::TEXT,
    s.touch_number,
    s.channel,
    s.scheduled_at,
    (CURRENT_DATE - s.scheduled_at::date)::INT,
    t.name
  FROM vista_outreach_sequences s
  JOIN vista_contacts c ON c.id = s.contact_id
  LEFT JOIN vista_outreach_templates t ON t.id = s.template_id
  WHERE s.status = 'scheduled'
    AND s.scheduled_at < NOW()
  ORDER BY s.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Nurture re-engagement due
CREATE OR REPLACE FUNCTION fn_nurture_due_reengage()
RETURNS TABLE (
  route_id UUID,
  contact_id UUID,
  contact_name TEXT,
  route_type VARCHAR(20),
  reengage_date DATE,
  days_overdue INT,
  reengage_count SMALLINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.contact_id,
    COALESCE(c.full_name, c.company, 'Unknown')::TEXT,
    n.route_type,
    n.reengage_date,
    CASE
      WHEN n.reengage_date < CURRENT_DATE
      THEN (CURRENT_DATE - n.reengage_date)::INT
      ELSE 0
    END,
    n.reengage_count
  FROM vista_nurture_routes n
  JOIN vista_contacts c ON c.id = n.contact_id
  WHERE n.status = 'active'
    AND n.reengage_date <= CURRENT_DATE
  ORDER BY n.reengage_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Weekly stats for rhythm dashboard
CREATE OR REPLACE FUNCTION fn_weekly_outreach_stats(p_week_start DATE DEFAULT CURRENT_DATE - INTERVAL '1 day' * (EXTRACT(DOW FROM CURRENT_DATE)::INT))
RETURNS TABLE (
  week_start DATE,
  outreach_sent BIGINT,
  outreach_due BIGINT,
  conversations_started BIGINT,
  content_engagements BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_week_start,
    (SELECT COUNT(*) FROM vista_outreach_sequences
     WHERE sent_at >= p_week_start AND sent_at < p_week_start + INTERVAL '7 days'
     AND status IN ('sent', 'replied'))::BIGINT,

    (SELECT COUNT(*) FROM vista_outreach_sequences
     WHERE scheduled_at >= p_week_start AND scheduled_at < p_week_start + INTERVAL '7 days')::BIGINT,

    (SELECT COUNT(*) FROM vista_contacts
     WHERE funnel_stage = 'conversation'
     AND updated_at >= p_week_start AND updated_at < p_week_start + INTERVAL '7 days')::BIGINT,

    (SELECT COUNT(*) FROM vista_nurture_routes
     WHERE last_engagement_date >= p_week_start
     AND last_engagement_date < p_week_start + INTERVAL '7 days')::BIGINT;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  -- Verify vista_contacts columns
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'vista_contacts'
    AND column_name IN ('bd_bucket', 'warmth_score', 'funnel_stage', 'outreach_count',
                        'last_outreach_date', 'next_action_date', 'next_action_type', 'lead_source');
  RAISE NOTICE 'F-01 Contact extensions: % / 8 columns added', v_count;

  -- Verify templates seeded
  SELECT COUNT(*) INTO v_count FROM vista_outreach_templates;
  RAISE NOTICE 'F-03 Outreach templates: % templates seeded', v_count;

  -- Verify sequences table
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'vista_outreach_sequences';
  RAISE NOTICE 'F-02 Outreach sequences table: % columns', v_count;

  -- Verify nurture routes
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'vista_nurture_routes';
  RAISE NOTICE 'F-05 Nurture routes table: % columns', v_count;

  -- Verify opportunity scoring
  SELECT COUNT(*) INTO v_count FROM information_schema.columns
  WHERE table_name = 'vista_opportunities'
    AND column_name IN ('score_named_problem', 'score_budget_authority', 'score_pricing_ask',
                        'score_product_fit', 'score_timeline', 'score_competitor_ref',
                        'total_score', 'score_tier', 'product_recommendation',
                        'first_step_price', 'full_engagement_price', 'conversation_notes');
  RAISE NOTICE 'F-06 Opportunity scoring: % / 12 columns added', v_count;

  RAISE NOTICE '✅ Wave 1.5 Funnel Core migration complete';
END $$;

COMMIT;
