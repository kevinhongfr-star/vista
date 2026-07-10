// Pipeline Stage enum
export const PIPELINE_STAGES = [
  'Prospect',
  'Contacted',
  'Engaged',
  'Meeting Booked',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const

export type PipelineStage = typeof PIPELINE_STAGES[number]

// Activity Type enum
export const ACTIVITY_TYPES = [
  'Email Sent',
  'Email Opened',
  'Email Replied',
  'Call',
  'Meeting',
  'Note',
  'Webinar Invite',
  'Podcast Invite',
  'Newsletter Invite',
  'Event Invite',
  'LinkedIn Message',
] as const

export type ActivityType = typeof ACTIVITY_TYPES[number]

// Signal Type enum
export const SIGNAL_TYPES = [
  'funding',
  'leadership_change',
  'ma_activity',
  'market_expansion',
  'digital_transformation',
  'partnership',
  'product_launch',
  'executive_departure',
  'team_growth',
  'crisis',
  'market_event',
] as const

export type SignalType = typeof SIGNAL_TYPES[number]

// Signal Strength enum
export const SIGNAL_STRENGTHS = ['Low', 'Medium', 'Medium-High', 'High'] as const
export type SignalStrength = typeof SIGNAL_STRENGTHS[number]

// Signal Status enum
export const SIGNAL_STATUSES = ['New', 'Analyzed', 'Acted On', 'Ignored'] as const
export type SignalStatus = typeof SIGNAL_STATUSES[number]

// Campaign Contact Status enum
export const CAMPAIGN_CONTACT_STATUSES = [
  'Invited',
  'Email Sent',
  'Email Opened',
  'Email Replied',
  'Meeting Booked',
  'Converted',
  'Declined',
] as const

export type CampaignContactStatus = typeof CAMPAIGN_CONTACT_STATUSES[number]

// Email Template Type enum
export const EMAIL_TEMPLATE_TYPES = [
  'Executive Brief',
  'Webinar Invite',
  'Podcast Invite',
  'Newsletter',
  'Event Invite',
  'Follow-up',
  'Re-engagement',
  'Custom',
] as const

export type EmailTemplateType = typeof EMAIL_TEMPLATE_TYPES[number]

// Strategic Note Category enum
export const NOTE_CATEGORIES = ['Priority', 'Insight', 'Action-Item', 'Observation'] as const
export type NoteCategory = typeof NOTE_CATEGORIES[number]

// Strategic Note Status enum
export const NOTE_STATUSES = ['Active', 'Archived'] as const
export type NoteStatus = typeof NOTE_STATUSES[number]

// Vista Contacts - Main table
export interface VistaContact {
  id: string
  name: string | null
  company: string | null
  role: string | null
  seniority: string | null
  function: string | null
  industry: string | null
  region: string | null
  country: string | null
  location: string | null
  email: string | null
  phone: string | null
  headline: string | null
  profile_url: string | null
  avatar_url: string | null
  stain_group: string | null
  stain_score: number | null
  stain_priority: string | null
  cluster_score: number | null
  signal_score: number | null
  engagement_score: number | null
  priority_score: number | null
  engagement_tier: string | null
  encirclement_level: string | null
  advisory_tier: string | null
  bd_pathway: string | null
  bd_priority: string | null
  pipeline_stage: PipelineStage | null
  funnel_stage: string | null
  status: string | null
  data_source: string | null
  notion_id: string | null
  notes: string | null
  touch_count: number | null
  last_touch_date: string | null
  last_synced_at: string | null
  last_conversation_recap: string | null
  recommended_next: string | null
  engagement_history: string | null
  conversation_category: string | null
  company_proximity: string | null
  contact_proximity: string | null
  years_experience: number | null
  created_at: string | null
  updated_at: string | null
  // New columns from migration
  score_delta: string | null
  last_score_update: string | null
  last_engagement_date: string | null
  decay_flag: boolean | null
  vista_v: number | null
  vista_i: number | null
  vista_s: number | null
  vista_t: number | null
  vista_a: number | null
  vista_composite: number | null
  density_cluster_id: string | null
  // Additional columns from new schema
  last_contact_date: string | null
  last_email_sent_date: string | null
  last_email_opened_date: string | null
  last_meeting_date: string | null
  recommended_action: string | null
  score_breakdown: ScoreBreakdown | null
}

// Score Breakdown interface
export interface ScoreBreakdown {
  value_score: number
  function_score: number
  engagement_score: number
  decay_penalty: number
  cluster_score: number
  total: number
}

// Signals
export interface Signal {
  id: string
  company: string | null
  signal_type: SignalType | null
  signal_strength: SignalStrength | null
  status: SignalStatus | null
  detected_date: string | null
  recency_weight: number | null
  score_impact: number | null
  description: string | null
  source: string | null
  source_url: string | null
  source_credibility: 'High' | 'Medium' | 'Low' | 'Unknown' | null
  impact_assessment: string | null
  recommended_action: string | null
  affected_contacts_count: number | null
  historical_signals_count: number | null
  contact_ids: string[] | null
  contact_id: string | null
  created_at: string | null
}

// Campaign Activities
export interface CampaignActivity {
  id: string
  campaign_contact_id: string | null
  activity_type: string | null
  activity_status: string | null
  campaign_type: string | null
  service_route: string | null
  message_template: string | null
  conversation_angle: string | null
  body: string | null
  outcome: string | null
  sent_date: string | null
  response_date: string | null
  activity_date: string | null
  created_at: string | null
  // New columns from schema
  target_cluster_id: string | null
  email_template_id: string | null
  message_subject: string | null
  message_body: string | null
  contacts_invited_count: number | null
  emails_sent_count: number | null
  emails_opened_count: number | null
  emails_replied_count: number | null
  meetings_booked_count: number | null
  conversion_rate: number | null
  approved_by: string | null
  approved_at: string | null
}

// Activities (new table)
export interface Activity {
  id: string
  contact_id: string | null
  campaign_id: string | null
  program_id: string | null
  activity_type: ActivityType
  activity_date: string
  subject: string | null
  content: string | null
  outcome: string | null
  duration_minutes: number | null
  notes: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

// Email Templates
export interface EmailTemplate {
  id: string
  template_name: string
  template_type: EmailTemplateType
  subject_template: string
  body_template: string
  variables: string[]
  created_at: string | null
  updated_at: string | null
}

// Campaign Contacts (individual contact status in campaigns)
export interface CampaignContact {
  id: string
  campaign_id: string
  contact_id: string
  status: CampaignContactStatus
  invitation_date: string | null
  sent_date: string | null
  opened_date: string | null
  replied_date: string | null
  meeting_date: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

// Pipeline History
export interface PipelineHistory {
  id: string
  contact_id: string
  from_stage: PipelineStage
  to_stage: PipelineStage
  changed_at: string
  changed_by: string | null
  reason: string | null
  created_at: string | null
}

// Density Clusters
export interface DensityCluster {
  cluster_id: string
  industry: string
  geography: string
  density_score: number | null
  status: string | null
  contact_count: number | null
  signal_types: string[] | null
  recommended_programs: string[] | null
  revenue_potential: number | null
  last_calculated: string | null
  created_at: string | null
  updated_at: string | null
  // New columns from schema
  top_contact_ids: string[] | null
  recommended_program_rationale: string | null
  conversion_rate: number | null
}

// Programs
export interface Program {
  program_id: string
  type: string | null
  tier: string | null
  name: string
  description: string | null
  cluster_id: string | null
  capacity: number | null
  enrolled_count: number | null
  price: number | null
  status: string | null
  start_date: string | null
  end_date: string | null
  revenue_actual: number | null
  created_at: string | null
  updated_at: string | null
}

// Program Assignments
export interface ProgramAssignment {
  assignment_id: string
  contact_id: string | null
  program_id: string | null
  status: string | null
  assigned_date: string | null
  conversion_date: string | null
  revenue_attributed: number | null
  created_at: string | null
  updated_at: string | null
}

// Strategic Notes
export interface StrategicNote {
  note_id: string
  note_type: string | null
  description: string | null
  author: string | null
  contact_id: string | null
  cluster_id: string | null
  category: NoteCategory | null
  status: NoteStatus | null
  created_at: string | null
  updated_at: string | null
  // New columns from schema
  title: string | null
  content: string | null
  linked_contact_ids: string[] | null
  linked_cluster_ids: string[] | null
  linked_campaign_ids: string[] | null
  linked_signal_ids: string[] | null
  priority: number | null
  due_date: string | null
  created_by: string | null
}

// View types
export interface Top7View {
  id: string
  name: string | null
  company: string | null
  role: string | null
  seniority: string | null
  stain_score: number | null
  cluster_score: number | null
  signal_score: number | null
  engagement_score: number | null
  priority_score: number | null
  engagement_tier: string | null
  encirclement_level: string | null
  score_delta: string | null
  vista_composite: number | null
  last_engagement_date: string | null
  decay_flag: boolean | null
  stain_group: string | null
  region: string | null
  country: string | null
}

export interface PipelineSummaryView {
  engagement_tier: string | null
  contact_count: number
  avg_score: number
  stale_count: number
}

export interface EncirclementView {
  company: string
  contact_count: number
  encirclement_level: string | null
  avg_engagement: number
  avg_priority: number
  contacts: string[] | null
}

export interface OutreachActivityView {
  activity_type: string | null
  activity_status: string | null
  count: number
  week: string | null
}

// Dashboard KPI types
export interface DashboardKPIs {
  contacts: number
  contacts_delta: number
  active_deals: number
  closed_won: number
  signals: number
  signals_delta: number
}

export const PROGRAM_TYPES = [
  'Executive Brief',
  'Roundtable',
  'Workshop',
  'Webinar',
  'Advisory',
  'Podcast',
  'Newsletter',
  'Offsite',
] as const

export const PROGRAM_STATUSES = [
  'Planned',
  'Inviting',
  'Active',
  'Completed',
  'Cancelled',
] as const

export type ProgramType = typeof PROGRAM_TYPES[number]
export type ProgramStatus = typeof PROGRAM_STATUSES[number]

export const ASSIGNMENT_STATUSES = [
  'Invited',
  'Opened',
  'Replied',
  'Meeting Booked',
  'Completed',
  'Cancelled',
] as const

export type AssignmentStatus = typeof ASSIGNMENT_STATUSES[number]

export interface ProgramMetrics {
  program_id: string
  program_name: string
  program_type: string
  invited_count: number
  opened_count: number
  replied_count: number
  meeting_booked_count: number
  conversion_rate: number
}

export interface AutomationConfig {
  frequency: 'daily' | 'weekly' | 'manual'
  last_signal_detection: string | null
  last_scoring: string | null
  last_clustering: string | null
  next_scheduled_run: string | null
}

export interface PipelineRunLog {
  id: string
  pipeline: string
  status: 'success' | 'failed' | 'running'
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  records_processed: number | null
  error_message: string | null
}

export interface AutomationDashboardData {
  config: AutomationConfig
  signals_24h: number
  signals_7d: number
  signals_30d: number
  contacts_scored: number
  clusters_updated: number
  recent_runs: PipelineRunLog[]
}

// Dashboard Intelligence Types
export interface PriorityAction {
  type: 'call' | 'follow_up' | 'signal' | 'cold_alert'
  icon: string
  title: string
  description: string
  contact_id?: string
  signal_id?: string
  cluster_id?: string
  score?: number
  days_since?: number
  priority: number
}

export interface PipelineFunnelStage {
  stage: PipelineStage
  count: number
  percentage: number
}

export interface RecentActivity {
  id: string
  activity_type: ActivityType
  activity_date: string
  subject: string | null
  contact_name: string | null
  contact_company: string | null
  outcome: string | null
}

export interface DashboardData {
  priorityActions: PriorityAction[]
  kpis: {
    contacts: number
    contacts_delta: number
    signals: number
    signals_delta: number
    clusters: number
    campaigns: number
    campaigns_draft: number
  }
  pipelineFunnel: PipelineFunnelStage[]
  recentActivity: RecentActivity[]
  top7Contacts: VistaContact[]
}

// Intelligence API Types
export interface ContactRecommendation {
  contact_id: string
  recommended_action: string
  rationale: string[]
  priority_score: number
  ai_recommendations?: Array<{
    action: string
    why: string
    impact: string
    urgency: string
    channels: string[]
  }>
}

export interface SignalImpactAnalysis {
  signal_id: string
  affected_contacts: VistaContact[]
  top_3_priority: VistaContact[]
  affected_count_by_function: Record<string, number>
  recommended_campaign_type: string
}

export interface ClusterInsights {
  cluster_id: string
  why_this_cluster: string
  top_functions: { function: string; count: number }[]
  conversion_rate: number
  avg_score: number
  revenue_potential: number
}

export interface StuckContact {
  contact_id: string
  name: string | null
  company: string | null
  pipeline_stage: PipelineStage
  days_in_stage: number
  last_contact_date: string | null
}

// API Request/Response Types
export interface CreateActivityRequest {
  contact_id: string
  activity_type: ActivityType
  activity_date: string
  subject?: string
  content?: string
  outcome?: string
  duration_minutes?: number
  notes?: string
  campaign_id?: string
  program_id?: string
}

export interface UpdatePipelineStageRequest {
  contact_id: string
  new_stage: PipelineStage
  reason?: string
}

export interface CreateCampaignRequest {
  campaign_name: string
  campaign_type: string
  target_cluster_id?: string
  contact_ids?: string[]
  email_template_id?: string
  subject?: string
  body?: string
}

export interface SendEmailRequest {
  contact_ids: string[]
  template_id?: string
  subject: string
  body: string
  campaign_id?: string
}

// ─── Wave 3: Action Engine Types ───

export interface GenerateEmailRequest {
  contact_ids: string[]
  template_type?: EmailTemplateType
  context?: string
  tone?: "formal" | "warm" | "direct"
}

export interface GeneratedEmail {
  contact_id: string
  subject: string
  body: string
  personalization: { contact_name: string; company_name: string }
}

export type CampaignChannel = "email" | "linkedin" | "phone" | "event"

export interface CampaignTouch {
  day_offset: number
  channel: CampaignChannel
  action: string
  subject?: string
  body?: string
  success_criteria: string
}

export interface GenerateCampaignRequest {
  scope: "cluster" | "contacts"
  cluster_id?: string
  contact_ids?: string[]
  objective: string
  touches?: number
  channel_mix?: CampaignChannel[]
}

export interface GeneratedCampaign {
  campaign_name: string
  objective: string
  duration_days: number
  touches: CampaignTouch[]
  target_contacts: number
}

// ─── Wave 4: Report Types ───

export interface KeyPlayer {
  name: string
  company: string
  reason: string
}

export interface ReportAction {
  action: string
  priority: "high" | "medium" | "low"
  timeline?: string
  expected_impact?: string
}

export interface ClusterIntelligenceReport {
  cluster_id: string
  cluster_name: string
  generated_at: string
  narrative: string
  key_players: KeyPlayer[]
  recommended_actions: ReportAction[]
  risks: string[]
  word_count: number
}

export interface SignalDigestHeadline {
  signal_id?: string
  title: string
  why_it_matters: string
}

export interface SignalDigestActionItem {
  contact_id?: string
  contact_name: string
  reason: string
  signal_id?: string
}

export interface SignalWatchItem {
  signal_id?: string
  title: string
  monitor_by: string
}

export interface SignalDigestReport {
  period: string
  generated_at: string
  headline: SignalDigestHeadline
  digest_markdown: string
  action_items: SignalDigestActionItem[]
  watch_list: SignalWatchItem[]
  total_signals_analyzed: number
}

export interface PipelineBottleneck {
  stage: string
  count: number
  recommendation: string
}

export interface AtRiskContact {
  id?: string
  name: string
  company: string
  reason: string
}

export interface PipelineReviewReport {
  period: string
  generated_at: string
  health_score: number
  review_markdown: string
  bottlenecks: PipelineBottleneck[]
  at_risk_contacts: AtRiskContact[]
  recommended_actions: ReportAction[]
}

export type ReportType = "cluster" | "signal-digest" | "pipeline-review" | "executive-brief"

// ─── Wave 5: Agent Bridge Types ───

export type AgentName = "LENS" | "MARIA" | "PROBE" | "CARL"

export interface AgentTriggerRequest {
  contactIds?: string[]
  clusterId?: string
  scope?: "all" | "unscored" | "decayed"
  type?: "refresh" | "specific" | "at-risk" | "strategic-review" | "cluster-analysis" | "market-scan"
  context?: string
}

export interface AgentOutput {
  id: string
  agent: AgentName
  chat_id?: string
  raw_message?: string
  parsed_data?: Record<string, unknown> | null
  triggered_by?: string
  status?: string
  created_at: string
}

export interface AgentStatus {
  agent: AgentName
  status: "online" | "idle" | "offline"
  last_output_at?: string
  last_output_summary?: string
}