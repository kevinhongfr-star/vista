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
  pipeline_stage: string | null
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
}

// Signals
export interface Signal {
  id: string
  company: string | null
  signal_type: string | null
  signal_strength: string | null
  detected_date: string | null
  recency_weight: number | null
  score_impact: number | null
  description: string | null
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
  created_at: string | null
  updated_at: string | null
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
  totalHot: number
  newSignals: number
  draftsPending: number
  staleContacts: number
}