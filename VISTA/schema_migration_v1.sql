-- VISTA Component Specifications - Schema Migration
-- Version: 1.0
-- Date: 2026-07-08
-- Purpose: Full schema for interactive CRM with native intelligence

-- ============================================================================
-- 0.1 Add columns to vista_contacts
-- ============================================================================

ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'Prospect' 
  CHECK (pipeline_stage IN ('Prospect', 'Contacted', 'Engaged', 'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'));

ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_email_sent_date TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_email_opened_date TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS last_meeting_date TIMESTAMPTZ;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS recommended_action TEXT;
ALTER TABLE vista_contacts ADD COLUMN IF NOT EXISTS score_breakdown JSONB;
-- Example: {"value_score": 25, "function_score": 15, "engagement_score": 20, "decay_penalty": -5, "total": 55}

-- ============================================================================
-- 0.2 Add columns to signals
-- ============================================================================

ALTER TABLE signals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'New' 
  CHECK (status IN ('New', 'Analyzed', 'Acted On', 'Ignored'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS impact_assessment TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS recommended_action TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_credibility TEXT 
  CHECK (source_credibility IN ('High', 'Medium', 'Low', 'Unknown'));
ALTER TABLE signals ADD COLUMN IF NOT EXISTS affected_contacts_count INTEGER DEFAULT 0;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS historical_signals_count INTEGER DEFAULT 0;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS contact_ids UUID[] DEFAULT '{}';

-- ============================================================================
-- 0.3 Add columns to density_clusters
-- ============================================================================

ALTER TABLE density_clusters ADD COLUMN IF NOT EXISTS top_contact_ids UUID[] DEFAULT '{}';
ALTER TABLE density_clusters ADD COLUMN IF NOT EXISTS recommended_program_rationale TEXT;
ALTER TABLE density_clusters ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0;

-- ============================================================================
-- 0.4 Create activities table
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES vista_contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaign_activities(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'Email Sent', 'Email Opened', 'Email Replied', 'Call', 'Meeting', 'Note', 
    'Webinar Invite', 'Podcast Invite', 'Newsletter Invite', 'Event Invite', 'LinkedIn Message'
  )),
  activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subject TEXT,
  content TEXT,
  outcome TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  created_by TEXT DEFAULT 'Kevin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_campaign_id ON activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activities_program_id ON activities(program_id);

-- ============================================================================
-- 0.5 Create email_templates table
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN (
    'Executive Brief', 'Webinar Invite', 'Podcast Invite', 'Newsletter', 
    'Event Invite', 'Follow-up', 'Re-engagement', 'Custom'
  )),
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  -- Example: ['{contact_name}', '{company_name}', '{program_name}']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 0.6 Create campaign_contacts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaign_activities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES vista_contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Invited' CHECK (status IN (
    'Invited', 'Email Sent', 'Email Opened', 'Email Replied', 
    'Meeting Booked', 'Converted', 'Declined'
  )),
  invitation_date TIMESTAMPTZ,
  sent_date TIMESTAMPTZ,
  opened_date TIMESTAMPTZ,
  replied_date TIMESTAMPTZ,
  meeting_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_contact_id ON campaign_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);

-- ============================================================================
-- 0.7 Add columns to campaign_activities
-- ============================================================================

ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS target_cluster_id UUID REFERENCES density_clusters(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS email_template_id UUID REFERENCES email_templates(id);
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_subject TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS message_body TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS contacts_invited_count INTEGER DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS emails_sent_count INTEGER DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS emails_opened_count INTEGER DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS emails_replied_count INTEGER DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS meetings_booked_count INTEGER DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE campaign_activities ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ============================================================================
-- 0.8 Create strategic_notes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS strategic_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Priority', 'Insight', 'Action-Item', 'Observation')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  content TEXT NOT NULL,
  linked_contact_ids UUID[] DEFAULT '{}',
  linked_cluster_ids UUID[] DEFAULT '{}',
  linked_campaign_ids UUID[] DEFAULT '{}',
  linked_signal_ids UUID[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_by TEXT DEFAULT 'Kevin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategic_notes_category ON strategic_notes(category);
CREATE INDEX IF NOT EXISTS idx_strategic_notes_status ON strategic_notes(status);

-- ============================================================================
-- 0.9 Create pipeline_history table
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipeline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES vista_contacts(id) ON DELETE CASCADE,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT DEFAULT 'Kevin',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_history_contact_id ON pipeline_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_history_changed_at ON pipeline_history(changed_at);

-- ============================================================================
-- 0.10 Seed email templates
-- ============================================================================

INSERT INTO email_templates (template_name, template_type, subject_template, body_template, variables) VALUES
('Executive Brief Invitation', 'Executive Brief', 'Exclusive Executive Brief: {program_name}', 
'Dear {contact_name},

I would like to invite you to our exclusive executive brief on {program_name}.

Best regards,
Kevin Hong', ARRAY['{contact_name}', '{program_name}']),
('Webinar Invitation', 'Webinar Invite', 'You''re Invited: {webinar_title}', 
'Dear {contact_name},

Join us for an exclusive webinar: {webinar_title}

Date: {webinar_date}

Best regards,
Kevin Hong', ARRAY['{contact_name}', '{webinar_title}', '{webinar_date}']),
('Podcast Invitation', 'Podcast Invite', 'Podcast Guest Invitation: {podcast_name}', 
'Dear {contact_name},

I would like to invite you to be a guest on {podcast_name}.

Best regards,
Kevin Hong', ARRAY['{contact_name}', '{podcast_name}']),
('Newsletter Subscription', 'Newsletter', 'Subscribe to {newsletter_name}', 
'Dear {contact_name},

I would like to invite you to subscribe to {newsletter_name}.

Best regards,
Kevin Hong', ARRAY['{contact_name}', '{newsletter_name}']),
('Follow-up After Meeting', 'Follow-up', 'Following Up: Our Conversation', 
'Dear {contact_name},

Thank you for meeting with me. As discussed...

Best regards,
Kevin Hong', ARRAY['{contact_name}']),
('Re-engagement', 'Re-engagement', 'Catching Up', 
'Dear {contact_name},

It has been a while since we last connected. I wanted to reach out and...

Best regards,
Kevin Hong', ARRAY['{contact_name}'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 0.11 Add additional useful indexes
-- ============================================================================

-- Pipeline stage index for dashboard funnel queries
CREATE INDEX IF NOT EXISTS idx_vista_contacts_pipeline_stage ON vista_contacts(pipeline_stage);

-- Score index for Top 7 queries
CREATE INDEX IF NOT EXISTS idx_vista_contacts_score ON vista_contacts(score DESC);

-- Last contact date for "stuck" contact queries
CREATE INDEX IF NOT EXISTS idx_vista_contacts_last_contact_date ON vista_contacts(last_contact_date);

-- Signal strength for filtering
CREATE INDEX IF NOT EXISTS idx_signals_strength ON signals(signal_strength);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);

-- Cluster queries
CREATE INDEX IF NOT EXISTS idx_density_clusters_is_priority ON density_clusters(is_priority);

-- ============================================================================
-- 0.12 Update vista_contacts with computed initial values
-- ============================================================================

-- Set initial last_contact_date based on existing data (if available)
-- This would be populated by the agents in production
-- For now, we set sensible defaults

UPDATE vista_contacts 
SET 
  pipeline_stage = 'Prospect',
  last_contact_date = COALESCE(last_contact_date, created_at),
  engagement_score = COALESCE(engagement_score, 0)
WHERE pipeline_stage IS NULL;

-- ============================================================================
-- Verification queries (run after migration to confirm)
-- ============================================================================

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'vista_contacts' AND column_name IN 
-- ('pipeline_stage', 'last_contact_date', 'score_breakdown');

-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'signals' AND column_name IN 
-- ('status', 'impact_assessment', 'contact_ids');

-- SELECT COUNT(*) FROM email_templates;