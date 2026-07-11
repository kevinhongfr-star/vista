# VISTA V5 — Complete Backend Wiring, Service Catalog & Schema Gap Analysis

**Author:** James/AI (PM) | **Date:** 2026-07-11 | **Status:** Kevin Review Required
**Trigger:** Kevin asked: "Have you properly specced all the wiring to backend and Supabase? What about design? What about objectives/incentivization? Are they wired to our services, products, offerings, pricing from Notion?"

---

## Honest Assessment: What V4 Got Right vs What's Missing

### What V4 Spec'd (✅)
- 89 functional features across 8 capability areas
- 3 new DB tables: `vista_signal_intelligence`, `vista_contact_briefs`, `vista_lens_recommendations`
- Conceptual design for gamification, kanban, auto-logging, shareable outputs

### What V4 MISSED (❌) — The Gaps This Document Addresses

| Gap | Severity | What's Missing |
|-----|----------|---------------|
| **1. Service/Product Catalog** | 🔴 CRITICAL | No table for services, products, offerings, pricing. Templates are email-only. No link between AI recommendations and actual LYC offerings |
| **2. Gamification Schema** | 🔴 CRITICAL | No tables for goals, daily targets, streaks, achievements, reward rules |
| **3. Action Taxonomy Schema** | 🔴 CRITICAL | `activities` table has basic types but no purpose/outcome/next-step fields |
| **4. Inbound Signal Tracking** | 🔴 CRITICAL | No table for webinar attendance, newsletter reads, workshop requests, podcast invitations, coaching requests from Wave platform |
| **5. Kanban State Storage** | 🟡 HIGH | No tables for board configurations, card positions, view preferences |
| **6. Funnel Stage Alerts** | 🟡 HIGH | No alert rules table, no stage duration tracking beyond basic dates |
| **7. Shareable Output Infrastructure** | 🟡 HIGH | No public token tables, no report URL generation system |
| **8. Layout Configuration** | 🟡 HIGH | No user layout preferences, no saved layout storage |
| **9. Task Tracker / Deadline Engine** | 🟡 HIGH | No task table with deadlines, no deadline alert system |
| **10. Design System Spec** | 🟡 MEDIUM | No V4 design spec for gamification UI, kanban boards, priority feed, nudges |
| **11. Notion Integration** | 🔴 CRITICAL | App has ZERO connection to Notion service catalog, templates, workflows, pricing |
| **12. Cross-Platform Data Flow** | 🟡 HIGH | No spec for how Wave platform data flows into VISTA Supabase |

---

## Gap 1: Service/Product Catalog (CRITICAL — BLOCKS AI RECOMMENDATIONS)

### Current State
- `programs` table exists: type (Webinar/Podcast/Newsletter/Roundtable/Coaching/Advisory/Market Insights) + tier (Free/Paid) + name + price
- `email_templates` table exists: 6 basic templates with placeholder variables
- **THAT'S IT. No service catalog. No product catalog. No offerings. No pricing matrix.**

### Why This Blocks Everything
When LENS says "recommend a product" or AI generates "Company X needs Product Y" — there's no catalog to pull from. The AI is making up recommendations because there's nothing to reference.

### What Kevin's Notion Contains (INACCESSIBLE — needs sharing)
- Full service catalog with descriptions
- Product offerings with pricing
- Advisory packages
- Templates and workflows
- Process definitions for recommendations

### Required New Schema

```sql
-- ============================================================================
-- SERVICES & PRODUCTS CATALOG
-- ============================================================================

-- Master catalog of everything LYC Partners offers
CREATE TABLE IF NOT EXISTS vista_service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  category text NOT NULL CHECK (category IN (
    'Advisory', 'Assessment', 'Coaching', 'Event', 'Content', 'Tool', 'Training'
  )),
  service_type text NOT NULL,  -- e.g., 'Executive Advisory', 'Market Assessment', 'Leadership Coaching'
  subtype text,                -- e.g., 'Digital Transformation', 'Market Entry', 'Talent Strategy'
  
  -- Details
  name text NOT NULL,
  description text,
  long_description text,       -- Full service description for AI context
  value_proposition text,      -- What makes this service unique
  target_audience text[],      -- e.g., ['CHRO', 'CEO', 'Head of Talent']
  industries text[],           -- e.g., ['Financial Services', 'Technology', 'Healthcare']
  geographies text[],          -- e.g., ['APAC', 'EMEA', 'Americas']
  
  -- Pricing
  pricing_model text CHECK (pricing_model IN ('Fixed', 'Retainer', 'Per-Session', 'Custom', 'Free', 'Subscription')),
  price_from decimal(10,2),   -- Starting price
  price_to decimal(10,2),     -- Max price (for ranges)
  currency text DEFAULT 'USD',
  pricing_notes text,
  
  -- Delivery
  delivery_format text[] CHECK (
    array_length(delivery_format, 1) IS NULL OR
    delivery_format <@ ARRAY['In-Person', 'Virtual', 'Hybrid', 'Self-Paced', 'On-Demand']
  ),
  duration_text text,          -- e.g., '3 months', '2 hours', '1 day'
  duration_hours integer,      -- For calculations
  capacity integer,            -- Max participants (for events)
  
  -- Status
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Retired', 'Coming Soon', 'Internal')),
  launch_date date,
  
  -- AI Wiring
  signal_triggers jsonb,       -- Signals that should recommend this service
  -- e.g., [{"signal_type": "leadership_change", "relevance": "high", "reason": "New leadership often needs advisory support"}]
  ideal_contact_profile jsonb, -- What kind of contact this service is best for
  -- e.g., {"seniority": ["C-Suite", "VP"], "functions": ["HR", "Strategy"]}
  cross_sell_with uuid[],      -- Other services that pair well
  upsell_to uuid[],            -- Higher-tier services this leads to
  
  -- Metadata
  notion_page_id text,         -- Link to Notion page for this service
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Which contacts have been offered/engaged with which services
CREATE TABLE IF NOT EXISTS vista_contact_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES vista_contacts(id) ON DELETE CASCADE,
  service_id uuid REFERENCES vista_service_catalog(id),
  
  -- Status
  status text DEFAULT 'Identified' CHECK (status IN (
    'Identified', 'Recommended', 'Proposal Sent', 'In Discussion', 'Engaged', 'Completed', 'Declined'
  )),
  
  -- Context
  recommended_by text,         -- 'AI', 'Kevin', 'Agent name'
  recommendation_reason text,  -- Why this service was recommended
  recommended_at timestamptz,
  
  -- Outcome
  engaged_at timestamptz,
  completed_at timestamptz,
  revenue_attributed decimal(10,2),
  
  -- History
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  UNIQUE(contact_id, service_id)
);

-- Campaign-to-service mapping (which campaigns promote which services)
CREATE TABLE IF NOT EXISTS vista_campaign_services (
  campaign_id uuid REFERENCES campaign_activities(id) ON DELETE CASCADE,
  service_id uuid REFERENCES vista_service_catalog(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  PRIMARY KEY (campaign_id, service_id)
);

-- Templates linked to services (not just email templates — full content templates)
CREATE TABLE IF NOT EXISTS vista_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES vista_service_catalog(id) ON DELETE CASCADE,
  
  template_type text NOT NULL CHECK (template_type IN (
    'Email', 'Proposal', 'Presentation', 'Invitation', 'Follow-Up', 
    'Webinar Script', 'Podcast Brief', 'Newsletter Blurb', 'LinkedIn Post',
    'Meeting Agenda', 'Scope of Work', 'Case Study'
  )),
  
  name text NOT NULL,
  subject text,               -- For emails
  body text NOT NULL,          -- Full template content (markdown)
  variables text[] DEFAULT '{}',
  
  -- When to use
  use_case text,              -- "Use when contacting C-suite about digital transformation"
  signal_match text[],        -- Signal types that trigger this template
  
  -- Performance tracking
  times_used integer DEFAULT 0,
  response_rate decimal(5,2), -- Percentage that got responses
  conversion_rate decimal(5,2),
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

### What This Enables
1. LENS can recommend ACTUAL services: "Based on their signals, recommend Executive Advisory — Digital Transformation track"
2. AI can generate proposals referencing real offerings with real pricing
3. Campaign builder knows which services to promote
4. Template recommender knows which templates go with which services
5. Contact-service relationship tracking (who was offered what, what converted)

### BLOCKER: Need Notion Content
Cannot populate this table without Kevin's service catalog from Notion. The page at `https://app.notion.com/p/lyc-partners/9b6980dc1f714daa832263647fd22d` returns authentication error.

---

## Gap 2: Gamification & Incentivization Schema (CRITICAL)

### Current State
- `programs` table tracks programs (Webinar/Podcast etc.)
- NO goals, NO streaks, NO achievements, NO daily targets

### Required New Schema

```sql
-- ============================================================================
-- GAMIFICATION ENGINE
-- ============================================================================

-- User's BD goals
CREATE TABLE IF NOT EXISTS vista_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  goal_type text NOT NULL CHECK (goal_type IN (
    'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Custom'
  )),
  
  -- What to achieve
  contacts_to_reach integer,        -- e.g., 10 contacts per day
  emails_to_send integer,           -- e.g., 5 emails per day
  meetings_to_book integer,         -- e.g., 2 per week
  signals_to_act_on integer,        -- e.g., 3 per day
  campaigns_to_advance integer,     -- e.g., 1 per week
  proposals_to_send integer,
  
  -- Timeframe
  period_start date,
  period_end date,
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Daily activity log (tracks what was done each day)
CREATE TABLE IF NOT EXISTS vista_daily_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Counts
  contacts_reached integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_replied integer DEFAULT 0,
  meetings_booked integer DEFAULT 0,
  meetings_completed integer DEFAULT 0,
  signals_acted_on integer DEFAULT 0,
  campaigns_advanced integer DEFAULT 0,
  proposals_sent integer DEFAULT 0,
  follow_ups_completed integer DEFAULT 0,
  
  -- Streak tracking
  current_streak integer DEFAULT 0,  -- Consecutive days meeting all goals
  longest_streak integer DEFAULT 0,
  
  -- Engagement
  last_activity_at timestamptz,
  goals_met boolean DEFAULT false,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  UNIQUE(user_id, log_date)
);

-- Achievements / badges
CREATE TABLE IF NOT EXISTS vista_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  achievement_type text NOT NULL CHECK (achievement_type IN (
    -- Streak achievements
    'streak_7', 'streak_30', 'streak_100', 'streak_365',
    -- Volume achievements
    'first_10_contacts', 'first_50', 'first_100', 'first_500', 'first_1000',
    'emails_100_sent', 'emails_500_sent', 'emails_1000_sent',
    'meetings_10_booked', 'meetings_50_booked', 'meetings_100_booked',
    -- Quality achievements
    'first_conversion', 'conversion_10', 'conversion_50',
    'perfect_week',  -- All goals met for full week
    -- Milestone achievements
    'first_signal_to_revenue', 'signal_to_revenue_10',
    'first_campaign_created', 'campaigns_10_created',
    'first_cluster', 'clusters_10',
    -- Special
    'speed_demon',      -- 5 actions in 1 hour
    'night_owl',        -- Working late
    'early_bird',       -- Starting early
    'multi_channel',    -- Used email + LinkedIn + phone for same contact
    'full_funnel',      -- Have contacts in every pipeline stage
    're_engager',       -- Successfully re-engaged 10 cold contacts
    'cross_sell_master' -- Successfully cross-sold services
  )),
  
  unlocked_at timestamptz DEFAULT NOW(),
  recognized boolean DEFAULT false,  -- Has the user seen this achievement?
  
  created_at timestamptz DEFAULT NOW()
);

-- Nudge/notification history (what nudges were shown)
CREATE TABLE IF NOT EXISTS vista_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  nudge_type text NOT NULL CHECK (nudge_type IN (
    'daily_goal_reminder', 'streak_protection', 'follow_up_overdue',
    'signal_action_needed', 'cluster_attention', 'campaign_stalled',
    'funnel_thin_alert', 'achievement_unlocked', 'encouragement',
    'priority_change', 'meeting_prep_reminder', 'end_of_day_summary'
  )),
  
  title text NOT NULL,
  message text NOT NULL,
  priority integer DEFAULT 0,       -- 0=info, 1=important, 2=urgent
  
  -- Context
  related_contact_id uuid,
  related_cluster_id uuid,
  related_campaign_id uuid,
  related_signal_id uuid,
  
  -- State
  shown_at timestamptz DEFAULT NOW(),
  dismissed_at timestamptz,
  acted_at timestamptz,
  action_taken text,
  
  created_at timestamptz DEFAULT NOW()
);
```

---

## Gap 3: Action Taxonomy Schema (CRITICAL)

### Current State
- `activities` table has: activity_type (Email Sent, Call, Meeting, etc.)
- BUT: no purpose category, no outcome tracking, no next-step field, no template linkage

### Required Schema Extensions

```sql
-- ============================================================================
-- ACTION TAXONOMY — Extend activities table
-- ============================================================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS purpose text CHECK (purpose IN (
  'Exploratory Call', 'Podcast Invite', 'Webinar Invite', 'Newsletter Invite',
  'Event Invite', 'Follow-Up', 'Re-Engagement', 'Introduction',
  'Proposal Sent', 'Nurture', 'Thank You', 'Cross-Sell', 'Up-Sell',
  'Feedback Request', 'Closing', 'Internal Note', 'Meeting Follow-Up',
  'Signal Response', 'Cluster Outreach', 'Campaign Touch'
));

ALTER TABLE activities ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN (
  'No Response', 'Positive Reply', 'Negative Reply', 'Meeting Booked',
  'Meeting Completed', 'Proposal Accepted', 'Proposal Declined',
  'Referred to Someone Else', 'Closed Won', 'Closed Lost',
  'Scheduled', 'In Progress', 'Cancelled', 'Deferred'
));

ALTER TABLE activities ADD COLUMN IF NOT EXISTS next_step text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS next_step_due_date date;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS template_used_id uuid REFERENCES email_templates(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES vista_service_catalog(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS signal_id uuid REFERENCES signals(id);

-- Action chain: link activities together
ALTER TABLE activities ADD COLUMN IF NOT EXISTS parent_activity_id uuid REFERENCES activities(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS chain_position integer;

-- Contact that owns the relationship for this activity
ALTER TABLE activities ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS cluster_id uuid REFERENCES density_clusters(cluster_id);

-- Outcome tracking
ALTER TABLE activities ADD COLUMN IF NOT EXISTS response_received boolean DEFAULT false;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS response_time_hours integer;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS conversion_value decimal(10,2);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_activities_purpose ON activities(purpose) WHERE purpose IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_outcome ON activities(outcome) WHERE outcome IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_next_step_due ON activities(next_step_due_date) WHERE next_step_due_date IS NOT NULL AND outcome NOT IN ('Meeting Completed', 'Closed Won', 'Closed Lost');
```

---

## Gap 4: Inbound Signal Tracking (CRITICAL — Three-Platform Architecture)

### Current State
- `signals` table exists for market signals (funding, leadership change, M&A, etc.)
- NO tracking of inbound engagement signals: webinar attendance, newsletter reads, workshop requests, podcast invitations, coaching requests

### Why This Is Critical
Kevin explicitly said: "information will be documented in supabase so can be retrieved and pushed to vista app" — the inbound activity from contacts (their engagement with LYC's marketing) is a key signal source that doesn't exist.

### Required New Schema

```sql
-- ============================================================================
-- INBOUND SIGNAL TRACKING (from Wave platform → VISTA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_inbound_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  signal_source text NOT NULL CHECK (signal_source IN (
    'Webinar Registration', 'Webinar Attendance', 'Webinar No-Show',
    'Newsletter Subscription', 'Newsletter Open', 'Newsletter Click',
    'Workshop Request', 'Workshop Registration', 'Workshop Attendance',
    'Podcast Invitation Sent', 'Podcast Accepted', 'Podcast Declined', 'Podcast Completed',
    'Coaching Request', 'Coaching Scheduled', 'Coaching Completed',
    'Content Download', 'Event Registration', 'Event Attendance',
    'Website Visit', 'LinkedIn Engagement', 'Referral Received',
    'Direct Inquiry', 'Form Submission', 'Proposal Request'
  )),
  
  -- Who
  contact_id uuid REFERENCES vista_contacts(id),
  company_name text,
  email text,  -- For unregistered contacts
  
  -- What
  program_id uuid REFERENCES programs(program_id),  -- Which webinar/podcast/workshop
  service_id uuid REFERENCES vista_service_catalog(id),  -- Which service they're interested in
  campaign_id uuid REFERENCES campaign_activities(id),
  
  -- When
  occurred_at timestamptz NOT NULL DEFAULT NOW(),
  detected_at timestamptz DEFAULT NOW(),
  
  -- Quality
  engagement_score_impact integer DEFAULT 0,
  signal_value text CHECK (signal_value IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- State
  status text DEFAULT 'New' CHECK (status IN ('New', 'Acknowledged', 'Acted On', 'Nurture', 'Ignored')),
  acted_on_at timestamptz,
  action_taken text,
  
  -- Wave platform sync
  wave_sync_id text,  -- ID from Wave platform
  wave_last_synced timestamptz,
  
  -- Metadata
  notes text,
  raw_data jsonb,     -- Any additional data from source
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_inbound_contact ON vista_inbound_signals(contact_id);
CREATE INDEX IF NOT EXISTS idx_inbound_source ON vista_inbound_signals(signal_source);
CREATE INDEX IF NOT EXISTS idx_inbound_status ON vista_inbound_signals(status);
CREATE INDEX IF NOT EXISTS idx_inbound_occurred ON vista_inbound_signals(occurred_at DESC);

-- RLS
ALTER TABLE vista_inbound_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read inbound" ON vista_inbound_signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full inbound" ON vista_inbound_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE vista_inbound_signals;
```

### Integration Point
Wave platform writes to this table when contacts engage with marketing activities. VISTA reads from it as signals for contact scoring, LENS recommendations, and action pushing.

---

## Gap 5: Kanban State Storage (HIGH)

```sql
-- ============================================================================
-- KANBAN STATE
-- ============================================================================

-- Saved board configurations
CREATE TABLE IF NOT EXISTS vista_kanban_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  board_name text NOT NULL,           -- e.g., 'Contacts Pipeline', 'Campaign Status'
  board_type text NOT NULL CHECK (board_type IN (
    'contacts_pipeline', 'contacts_tier', 'signal_actionability',
    'campaign_status', 'cluster_health', 'action_queue',
    'mandate_lifecycle', 'meeting_status', 'service_engagement'
  )),
  
  -- Column definitions (what stages/columns to show)
  columns jsonb NOT NULL DEFAULT '[]',
  -- e.g., [{"id": "prospect", "label": "Prospect", "color": "#gray", "filter": "pipeline_stage = 'Prospect'"}, ...]
  
  -- Card display
  card_fields text[] DEFAULT '{name, company, engagement_tier, priority_score}',
  card_detail_fields text[] DEFAULT '{}',
  
  -- Default filters
  default_filters jsonb DEFAULT '{}',
  
  -- Position
  sort_order integer DEFAULT 0,
  is_default boolean DEFAULT false,  -- Default board for this type
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Card positions (for manual drag-to-reorder)
CREATE TABLE IF NOT EXISTS vista_kanban_card_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES vista_kanban_boards(id) ON DELETE CASCADE,
  
  -- What entity this card represents
  entity_type text NOT NULL CHECK (entity_type IN ('contact', 'signal', 'campaign', 'cluster', 'mandate', 'action')),
  entity_id uuid NOT NULL,
  
  -- Position
  column_id text NOT NULL,
  position_in_column integer DEFAULT 0,
  
  -- Override (user moved card manually)
  manual_column text,  -- If different from computed column
  manual_position integer,
  
  UNIQUE(board_id, entity_type, entity_id)
);
```

---

## Gap 6: Task Tracker & Deadline Engine (HIGH)

```sql
-- ============================================================================
-- TASK TRACKER (for action deadlines and follow-ups)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  -- What
  title text NOT NULL,
  description text,
  task_type text CHECK (task_type IN (
    'Follow-Up', 'Proposal Due', 'Meeting Prep', 'Signal Response',
    'Campaign Action', 'Cluster Review', 'Contact Nurture',
    'Deadline', 'Reminder', 'Milestone', 'Custom'
  )),
  
  -- Priority
  priority integer DEFAULT 1 CHECK (priority IN (0, 1, 2, 3, 4)),
  -- 0=None, 1=Low, 2=Medium, 3=High, 4=Urgent
  
  -- When
  due_date date,
  due_time time,
  reminder_before interval DEFAULT '1 day',
  
  -- Related entities
  contact_id uuid REFERENCES vista_contacts(id),
  company_name text,
  cluster_id uuid REFERENCES density_clusters(cluster_id),
  campaign_id uuid REFERENCES campaign_activities(id),
  signal_id uuid REFERENCES signals(id),
  activity_id uuid REFERENCES activities(id),
  
  -- State
  status text DEFAULT 'Open' CHECK (status IN (
    'Open', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue'
  )),
  completed_at timestamptz,
  
  -- Auto-generated
  auto_generated boolean DEFAULT false,
  generated_by text,  -- Which agent or rule created this task
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON vista_tasks(status) WHERE status IN ('Open', 'In Progress', 'Waiting', 'Overdue');
CREATE INDEX IF NOT EXISTS idx_tasks_due ON vista_tasks(due_date) WHERE status IN ('Open', 'In Progress', 'Waiting');
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON vista_tasks(priority DESC) WHERE status NOT IN ('Completed', 'Cancelled');
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON vista_tasks(contact_id);

-- RLS
ALTER TABLE vista_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tasks" ON vista_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role full tasks" ON vista_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## Gap 7: Shareable Output Infrastructure (HIGH)

```sql
-- ============================================================================
-- SHAREABLE OUTPUTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What's being shared
  report_type text NOT NULL CHECK (report_type IN (
    'Contact Brief', 'Cluster Report', 'Signal Digest', 'Pipeline Report',
    'Campaign Summary', 'Weekly Status', 'Custom Report'
  )),
  
  -- Content
  title text NOT NULL,
  content jsonb NOT NULL,      -- Full report data
  content_html text,           -- Pre-rendered HTML for sharing
  content_pdf bytea,           -- Pre-rendered PDF (optional)
  
  -- Access
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public boolean DEFAULT false,
  password_hash text,
  expires_at timestamptz,
  max_views integer,
  view_count integer DEFAULT 0,
  
  -- Metadata
  source_entity_type text,     -- 'contact', 'cluster', 'campaign'
  source_entity_id uuid,
  generated_by text DEFAULT 'Kevin',
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_token ON vista_shared_reports(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_source ON vista_shared_reports(source_entity_type, source_entity_id);
```

---

## Gap 8: Layout Configuration (HIGH)

```sql
-- ============================================================================
-- LAYOUT PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_layout_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  page_name text NOT NULL,      -- 'dashboard', 'contacts', 'signals', etc.
  layout_name text NOT NULL,    -- 'Default', 'Action View', 'Analytics'
  
  -- Layout data
  widgets jsonb NOT NULL,       -- Which widgets to show and where
  -- e.g., [{"id": "kpi_cards", "x": 0, "y": 0, "w": 12, "h": 2, "visible": true}, ...]
  
  view_mode text DEFAULT 'grid' CHECK (view_mode IN ('grid', 'kanban', 'list', 'compact')),
  sort_config jsonb DEFAULT '{}',
  filter_config jsonb DEFAULT '{}',
  
  -- State
  is_default boolean DEFAULT false,
  last_used_at timestamptz,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  
  UNIQUE(user_id, page_name, layout_name)
);
```

---

## Gap 9: Stalled Action Alerts & Funnel Monitoring

```sql
-- ============================================================================
-- ALERT RULES (configurable alert conditions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vista_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text DEFAULT 'Kevin',
  
  rule_type text NOT NULL CHECK (rule_type IN (
    'stage_duration',        -- Contact stuck in stage too long
    'no_response',           -- No response after X days
    'follow_up_overdue',     -- Follow-up date passed
    'signal_fresh',          -- New signal needs action
    'funnel_thin',           -- Pipeline too thin at stage
    'goal_at_risk',          -- Daily goal not on track
    'streak_at_risk',        -- Streak about to break
    'campaign_stalled',      -- Campaign not progressing
    'cluster_neglect',       -- Cluster not getting attention
    'contact_decay',         -- Contact engagement dropping
    'proposal_overdue',      -- Proposal not sent by deadline
    'meeting_no_prep'        -- Meeting tomorrow but no prep done
  )),
  
  -- Thresholds
  threshold_value integer,     -- e.g., 14 (days)
  threshold_unit text DEFAULT 'days' CHECK (threshold_unit IN ('hours', 'days', 'weeks')),
  
  -- State
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Alert instances (fired alerts)
CREATE TABLE IF NOT EXISTS vista_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES vista_alert_rules(id),
  
  alert_type text NOT NULL,
  severity text DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  
  -- Related entity
  contact_id uuid,
  company_name text,
  cluster_id uuid,
  campaign_id uuid,
  
  -- State
  status text DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved', 'acted_on')),
  resolved_at timestamptz,
  action_taken text,
  
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON vista_alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON vista_alerts(severity) WHERE status = 'active';
```

---

## Gap 10: Design System Spec (MEDIUM — needs dedicated document)

### What's Missing
| Design Area | Status | What's Needed |
|-------------|--------|---------------|
| Gamification UI | ❌ | Daily goal progress bar, streak fire animation, achievement badge design, nudge toast design, celebration confetti |
| Kanban Board | ❌ | Card design, column headers, drag-drop visual, card detail popover, mobile responsive |
| Priority Feed | ❌ | Nudge card design, action button styles, urgency indicators, time-based visual cues |
| Signal Intelligence Brief | ❌ | Intelligence card layout, narrative display, action button grouping |
| LENS Recommendation | ❌ | Recommendation card with WHO/WHY/HOW/WHAT sections, email draft preview |
| Funnel Health | ❌ | Funnel visualization, bottleneck highlight, velocity chart |
| Task Tracker | ❌ | Task card design, deadline indicators, priority color coding |
| Shareable Reports | ❌ | Public view design (no auth), report template styling |
| Layout Builder | ❌ | Drag-and-drop widget editor, resize handles |
| Responsive/Kanban Mobile | ❌ | Mobile Kanban, swipe gestures |

### Recommendation
A dedicated `VISTA_V5_DESIGN_SYSTEM_SPEC.md` is needed before Wave 3 (which introduces Kanban + Intelligence UIs). This should cover all component designs with Figma-equivalent specs.

---

## Gap 11: Notion Service Catalog Integration (CRITICAL — BLOCKER)

### The Core Problem
VISTA's AI (LENS, MARIA, PROBE, CARL) generates recommendations, email drafts, proposals, and action suggestions. But **what are they recommending FROM?**

Currently: The AI is generating generic recommendations because there's no catalog of actual LYC Partners services, products, offerings, and pricing.

### What Needs to Happen
1. **Export Notion service catalog** → structured data (services, products, pricing, templates)
2. **Create `vista_service_catalog`** table (schema above)
3. **Populate with real offerings** from Notion
4. **Wire AI agents** to reference this catalog when generating recommendations
5. **Set up sync** between Notion and Supabase (one-way: Notion → Supabase)

### What I Need From Kevin
The Notion page at `https://app.notion.com/p/lyc-partners/9b6980dc1f714daa832263647fd22d` returns an authentication error. I need one of:
1. Make the page public/shareable
2. Export the page content (Notion → Export → Markdown)
3. Paste the service list directly
4. Give me a different link that works

Without this, V4's "Signal-to-Product Narrative" (T-304), "Template Recommender" (T-298), and all AI-generated proposals/emails will reference nothing real.

---

## Gap 12: Cross-Platform Data Flow (HIGH)

### Current State
V3 mentioned "VISTA ↔ Wave ↔ DEX AI" sync but there's ZERO implementation. No sync tables, no webhook endpoints, no API contracts.

### Required Integration Points

```
Wave Platform (Marketing)          VISTA (CRM/Intelligence)
├── Webinar registrations    ──→   vista_inbound_signals
├── Newsletter opens/clicks  ──→   vista_inbound_signals
├── Workshop requests        ──→   vista_inbound_signals
├── Podcast responses        ──→   vista_inbound_signals
├── Coaching requests        ──→   vista_inbound_signals
└── Campaign performance     ──→   vista_campaign_sync

VISTA (CRM/Intelligence)           DEX AI (ATS/Project Mgmt)
├── Contact engagement       ──→   Contact interaction history
├── Meeting transcripts      ──→   Meeting notes in DEX
├── Service engagements      ──→   Project assignments
├── Proposal status          ──→   Candidate/client status
└── Signal intelligence      ──→   Market context in DEX
```

### Required Schema (sync tracking)

```sql
CREATE TABLE IF NOT EXISTS vista_platform_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_platform text NOT NULL CHECK (source_platform IN ('Wave', 'DEX', 'Notion')),
  target_platform text NOT NULL CHECK (target_platform IN ('Wave', 'DEX', 'Notion', 'VISTA')),
  
  entity_type text NOT NULL,
  entity_id text NOT NULL,        -- Source platform entity ID
  vista_entity_type text,         -- What it maps to in VISTA
  vista_entity_id uuid,           -- The VISTA record
  
  sync_status text DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'synced', 'conflict', 'error'
  )),
  last_synced_at timestamptz,
  sync_error text,
  
  payload jsonb,                  -- The data being synced
  
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);
```

---

## Summary: Total New Tables Required

| Table | Gap # | Priority | Blocks |
|-------|-------|----------|--------|
| `vista_service_catalog` | 1 | 🔴 P0 | All AI recommendations, proposals, emails |
| `vista_contact_services` | 1 | 🔴 P0 | Service engagement tracking |
| `vista_campaign_services` | 1 | 🟡 P1 | Campaign-to-service mapping |
| `vista_service_templates` | 1 | 🔴 P0 | Template recommender, email generation |
| `vista_goals` | 2 | 🔴 P0 | Gamification engine |
| `vista_daily_log` | 2 | 🔴 P0 | Streaks, daily targets |
| `vista_achievements` | 2 | 🟡 P1 | Achievement/badge system |
| `vista_nudges` | 2 | 🔴 P0 | Action-pushing notifications |
| `vista_inbound_signals` | 4 | 🔴 P0 | Three-platform architecture |
| `vista_kanban_boards` | 5 | 🟡 P1 | Kanban-first UX |
| `vista_kanban_card_positions` | 5 | 🟡 P1 | Manual card ordering |
| `vista_tasks` | 6 | 🔴 P0 | Task tracker, deadlines |
| `vista_shared_reports` | 7 | 🟡 P1 | Shareable outputs |
| `vista_layout_config` | 8 | 🟡 P1 | Editable layouts |
| `vista_alert_rules` | 9 | 🟡 P1 | Stalled action monitoring |
| `vista_alerts` | 9 | 🔴 P0 | Active alert feed |
| `vista_platform_sync` | 12 | 🟡 P1 | Three-platform sync |

**Also requires:** Extending `activities` table with 10 new columns (Gap 3)

**Total: 17 new tables + 1 major table extension**

---

## What This Means for Execution Waves

### Wave 3 (current plan: Qualitative Intelligence + Kanban-First) MUST BECOME:

**Wave 3A: Foundation (BLOCKS everything else)**
- Create all 17 new tables
- Extend activities table
- Populate vista_service_catalog (requires Notion content)
- Seed initial gamification goals, alert rules, email templates linked to services
- **Est: 5 dev-days**

**Wave 3B: Qualitative Intelligence + Kanban-First (original plan)**
- QI-01 to QI-15
- KB-01 to KB-15
- **Est: 20 dev-days**

### Critical Path Blockers

| Blocker | Who Unblocks | Impact |
|---------|-------------|--------|
| Notion service catalog | Kevin | Blocks ALL AI recommendations |
| Wave platform webhook contract | Kevin + Wave team | Blocks inbound signal tracking |
| DEX AI integration contract | Kevin + DEX team | Blocks three-platform sync |
| Design spec for gamification/Kanban | James/AI | Blocks Wave 3B frontend |

---

## Action Required From Kevin

1. **Share the Notion service catalog** — I cannot wire AI recommendations without knowing what LYC Partners actually offers
2. **Confirm the 17 new tables** — Should I write the full migration SQL ready to run?
3. **Prioritize: Do we do Wave 3A (schema foundation) first, or batch it into Wave 3?**
4. **Wave platform sync** — Is there an API/webhook, or are we doing manual CSV imports initially?
