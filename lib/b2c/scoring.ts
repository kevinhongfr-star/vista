export const DEFAULT_WEIGHTS = {
  title_seniority: {
    max: 25,
    tiers: { "c-suite": 25, vp: 20, director: 15, manager: 5, other: 0 },
  },
  company_size: {
    max: 20,
    tiers: { 500: 20, 100: 15, 50: 10, 20: 5, 0: 0 },
  },
  industry_fit: {
    max: 15,
    targets: ["technology", "finance", "manufacturing", "healthcare"],
    adjacent: 8,
    other: 0,
  },
  spend_level: {
    max: 15,
    tiers: { 2000: 15, 500: 10, 100: 5, 0: 0 },
  },
  assessment_depth: {
    max: 10,
    scores: { CANVAS: 10, TRIDENT: 7, PRISM: 5 },
  },
  engagement_tier: {
    max: 10,
    scores: { pro: 10, member: 5, starter: 3, free: 0 },
  },
  coaching_booked: {
    max: 5,
    yes: 5,
    no: 0,
  },
}

export type ScoringWeights = typeof DEFAULT_WEIGHTS

export interface B2CLead {
  id?: string
  b2c_user_id?: string
  email?: string | null
  name?: string | null
  linkedin_url?: string | null
  title?: string | null
  company?: string | null
  company_size?: number | null
  industry?: string | null
  location?: string | null
  current_tier?: string | null
  total_credits_purchased?: number | null
  total_credits_consumed?: number | null
  total_spend_cny?: number | null
  assessments_completed?: string[] | null
  coaching_booked?: boolean | null
  linkedin_verified?: boolean | null
  b2b_potential_score?: number | null
  b2b_score_label?: string | null
  b2b_score_breakdown?: Record<string, number> | null
  b2b_score_history?: Array<{
    date: string
    score: number
    label: string
    breakdown: Record<string, number>
  }> | null
  pipeline_stage?: string | null
  linked_contact_id?: string | null
  linked_contact_matched_via?: string | null
  bd_notes?: string | null
  b2c_signup_date?: string | null
  last_event_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

function normalizeTitle(title: string | null | undefined): string {
  if (!title) return "other"
  const t = title.toLowerCase()
  if (t.includes("ceo") || t.includes("cfo") || t.includes("cto") || t.includes("coo") || t.includes("chief") || t.includes("founder") || t.includes("president")) {
    return "c-suite"
  }
  if (t.includes("vp") || t.includes("vice president")) return "vp"
  if (t.includes("director")) return "director"
  if (t.includes("manager") || t.includes("head of")) return "manager"
  return "other"
}

function scoreTitle(title: string | null | undefined, weights = DEFAULT_WEIGHTS): number {
  const normalized = normalizeTitle(title)
  const tiers = weights.title_seniority.tiers as Record<string, number>
  return tiers[normalized] ?? tiers["other"] ?? 0
}

function scoreCompanySize(size: number | null | undefined, weights = DEFAULT_WEIGHTS): number {
  if (!size) return 0
  const tiers = weights.company_size.tiers as Record<string, number>
  if (size >= 500) return tiers["500"] ?? 20
  if (size >= 100) return tiers["100"] ?? 15
  if (size >= 50) return tiers["50"] ?? 10
  if (size >= 20) return tiers["20"] ?? 5
  return tiers["0"] ?? 0
}

function scoreIndustry(industry: string | null | undefined, weights = DEFAULT_WEIGHTS): number {
  if (!industry) return weights.industry_fit.other ?? 0
  const ind = industry.toLowerCase()
  const targets = weights.industry_fit.targets as string[]
  if (targets.some((t) => ind.includes(t))) return weights.industry_fit.max ?? 15
  return weights.industry_fit.adjacent ?? 8
}

function scoreSpend(spend: number | null | undefined, weights = DEFAULT_WEIGHTS): number {
  if (!spend) return 0
  const tiers = weights.spend_level.tiers as Record<string, number>
  if (spend >= 2000) return tiers["2000"] ?? 15
  if (spend >= 500) return tiers["500"] ?? 10
  if (spend >= 100) return tiers["100"] ?? 5
  return tiers["0"] ?? 0
}

function scoreAssessments(assessments: string[] | null | undefined, weights = DEFAULT_WEIGHTS): number {
  if (!assessments || assessments.length === 0) return 0
  const scores = weights.assessment_depth.scores as Record<string, number>
  let total = 0
  for (const a of assessments) {
    const key = a.toUpperCase()
    total += scores[key] ?? 0
  }
  return Math.min(total, weights.assessment_depth.max)
}

function scoreEngagementTier(tier: string | null | undefined, weights = DEFAULT_WEIGHTS): number {
  if (!tier) return 0
  const scores = weights.engagement_tier.scores as Record<string, number>
  return scores[tier.toLowerCase()] ?? 0
}

function scoreCoaching(coaching: boolean | null | undefined, weights = DEFAULT_WEIGHTS): number {
  return coaching ? weights.coaching_booked.yes : weights.coaching_booked.no
}

export function computeB2BScore(
  lead: Partial<B2CLead>,
  weights = DEFAULT_WEIGHTS
): {
  score: number
  breakdown: Record<string, number>
  label: string
} {
  const breakdown: Record<string, number> = {
    title_seniority: scoreTitle(lead.title, weights),
    company_size: scoreCompanySize(lead.company_size, weights),
    industry_fit: scoreIndustry(lead.industry, weights),
    spend_level: scoreSpend(lead.total_spend_cny, weights),
    assessment_depth: scoreAssessments(lead.assessments_completed, weights),
    engagement_tier: scoreEngagementTier(lead.current_tier, weights),
    coaching_booked: scoreCoaching(lead.coaching_booked, weights),
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)
  const score = Math.min(total, 100)

  let label = "low"
  if (score >= 80) label = "high_priority"
  else if (score >= 60) label = "watch"
  else if (score >= 40) label = "monitor"

  return { score, breakdown, label }
}

export function determinePipelineStage(score: number, label: string, currentStage?: string | null): string {
  if (currentStage === "promoted") return "promoted"
  if (label === "high_priority") return "flagged"
  if (label === "watch") return "monitoring"
  return currentStage || "b2c_user"
}
