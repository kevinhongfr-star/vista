-- Fix fn_funnel_summary: cast funnel_stage to match VARCHAR return type
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
