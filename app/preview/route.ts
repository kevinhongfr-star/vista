import { NextResponse } from "next/server"

export const dynamic = "force-static"

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VISTA — BD Intelligence Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; border-color:#e5e7eb; }
  body { font-family:'Inter',system-ui,sans-serif; background:#f8f9fa; color:#333; }
  
  /* Sidebar */
  .sidebar { position:fixed; left:0; top:0; width:256px; height:100vh; background:#1a2332; color:#fff; display:flex; flex-direction:column; z-index:40; }
  .sidebar-header { height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; }
  .sidebar-logo { font-size:20px; font-weight:700; color:#C108AB; text-decoration:none; letter-spacing:1px; }
  .sidebar-toggle { background:none; border:none; color:#fff; cursor:pointer; font-size:18px; opacity:0.7; }
  .sidebar-sep { height:1px; background:rgba(255,255,255,0.2); margin:0; }
  .sidebar-nav { flex:1; padding:16px 8px; }
  .sidebar-nav ul { list-style:none; }
  .sidebar-nav li { margin-bottom:4px; }
  .sidebar-nav a { display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:8px; font-size:14px; font-weight:500; color:rgba(255,255,255,0.8); text-decoration:none; transition:all 0.15s; }
  .sidebar-nav a:hover { background:rgba(255,255,255,0.1); color:#fff; }
  .sidebar-nav a.active { background:#C108AB; color:#1a2332; }
  .sidebar-nav .icon { width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .sidebar-bottom { padding:8px; }
  
  /* Header */
  .header { position:fixed; top:0; left:256px; right:0; height:64px; background:#fff; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; padding:0 24px; z-index:30; }
  .search-box { position:relative; max-width:400px; flex:1; }
  .search-box input { width:100%; padding:8px 12px 8px 36px; border:1px solid #e5e7eb; border-radius:8px; font-size:14px; outline:none; background:#f9fafb; }
  .search-box input:focus { border-color:#C108AB; box-shadow:0 0 0 2px rgba(201,169,97,0.1); }
  .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:14px; }
  .header-right { display:flex; align-items:center; gap:8px; }
  .header-btn { background:none; border:none; cursor:pointer; padding:8px; border-radius:8px; color:#6b7280; position:relative; }
  .header-btn:hover { background:#f3f4f6; }
  .notif-badge { position:absolute; top:2px; right:2px; background:#ef4444; color:#fff; font-size:10px; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
  .header-sep { width:1px; height:24px; background:#e5e7eb; margin:0 4px; }
  .user-avatar { width:32px; height:32px; border-radius:50%; background:#1a2332; color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:500; }
  .user-name { font-size:14px; font-weight:500; margin-left:4px; }
  
  /* Main Content */
  .main { margin-left:256px; padding:88px 24px 24px; max-width:1400px; }
  
  /* Agent Status Bar */
  .agent-bar { display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
  .agent-chip { display:flex; align-items:center; gap:8px; padding:8px 16px; background:#fff; border-radius:8px; border:1px solid #e5e7eb; font-size:13px; }
  .agent-dot { width:8px; height:8px; border-radius:50%; }
  .agent-dot.dormant { background:#94a3b8; }
  .agent-dot.ready { background:#22c55e; }
  .agent-name { font-weight:600; }
  .agent-role { color:#9ca3af; font-size:12px; }
  
  /* KPI Cards */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .kpi-card { background:#fff; border-radius:12px; padding:20px; border:1px solid #e5e7eb; }
  .kpi-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .kpi-title { font-size:13px; font-weight:500; color:#9ca3af; }
  .kpi-icon { font-size:20px; }
  .kpi-value { font-size:28px; font-weight:700; }
  .kpi-subtitle { font-size:12px; color:#9ca3af; margin-top:4px; }
  .kpi-card.success .kpi-value, .kpi-card.success .kpi-icon { color:#22c55e; }
  .kpi-card.success { background:rgba(34,197,94,0.03); }
  .kpi-card.info .kpi-value, .kpi-card.info .kpi-icon { color:#3b82f6; }
  .kpi-card.info { background:rgba(59,130,246,0.03); }
  .kpi-card.warning .kpi-value, .kpi-card.warning .kpi-icon { color:#eab308; }
  .kpi-card.warning { background:rgba(234,179,8,0.03); }
  .kpi-card.error .kpi-value, .kpi-card.error .kpi-icon { color:#ef4444; }
  .kpi-card.error { background:rgba(239,68,68,0.03); }
  
  /* Content Grid */
  .content-grid { display:grid; grid-template-columns:2fr 1fr; gap:24px; }
  
  /* Cards */
  .card { background:#fff; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:24px; }
  .card-header { padding:16px 20px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; }
  .card-title { font-size:15px; font-weight:600; }
  .card-subtitle { font-size:12px; color:#9ca3af; }
  .card-content { padding:20px; }
  .card-empty { text-align:center; padding:32px; color:#9ca3af; font-size:14px; }
  
  /* Pipeline Chart (CSS mockup) */
  .pipeline-chart { display:flex; flex-direction:column; gap:12px; padding:8px 0; }
  .pipeline-row { display:flex; align-items:center; gap:12px; }
  .pipeline-label { width:80px; font-size:13px; font-weight:500; text-align:right; }
  .pipeline-bar { height:32px; border-radius:4px; display:flex; align-items:center; padding:0 12px; font-size:13px; font-weight:600; color:#fff; min-width:40px; transition:width 0.3s; }
  .pipeline-bar .count { margin-left:8px; }
  .bar-cold { background:#94a3b8; }
  .bar-warm { background:#3b82f6; }
  .bar-engaged { background:#22c55e; }
  .bar-hot { background:#f97316; }
  .bar-committed { background:#ef4444; }
  
  /* Top 7 Table */
  .ranking-table { width:100%; border-collapse:collapse; }
  .ranking-table th { text-align:left; padding:8px 12px; font-size:12px; font-weight:500; color:#9ca3af; border-bottom:1px solid #e5e7eb; }
  .ranking-table td { padding:10px 12px; font-size:13px; border-bottom:1px solid #f3f4f6; }
  .ranking-table tr:hover { background:rgba(0,0,0,0.02); }
  .ranking-table tr.top { background:rgba(201,169,97,0.05); }
  .contact-name { font-weight:500; color:#1a2332; }
  .contact-role { font-size:11px; color:#9ca3af; }
  
  /* Score Gauge (mini) */
  .score-gauge { width:40px; height:40px; position:relative; display:inline-flex; align-items:center; justify-content:center; }
  .score-gauge svg { transform:rotate(-90deg); }
  .score-gauge .value { position:absolute; font-size:11px; font-weight:700; color:#1a2332; }
  
  /* Badges */
  .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:500; }
  .badge-cold { background:#f1f5f9; color:#64748b; }
  .badge-warm { background:#eff6ff; color:#2563eb; }
  .badge-engaged { background:#f0fdf4; color:#16a34a; }
  .badge-hot { background:#fff7ed; color:#ea580c; }
  .badge-committed { background:#fef2f2; color:#dc2626; }
  .badge-scout { background:#f1f5f9; color:#64748b; }
  .badge-patrol { background:#eff6ff; color:#2563eb; }
  .badge-encirclement { background:#faf5ff; color:#9333ea; }
  .badge-siege { background:#fff7ed; color:#ea580c; }
  .badge-occupation { background:#fef2f2; color:#dc2626; }
  .delta-up { color:#22c55e; font-size:12px; font-weight:500; }
  .delta-down { color:#ef4444; font-size:12px; font-weight:500; }
  
  /* Quick Actions */
  .action-btn { display:flex; align-items:flex-start; gap:12px; padding:12px 16px; border-radius:8px; border:none; cursor:pointer; width:100%; text-align:left; transition:all 0.15s; margin-bottom:8px; }
  .action-btn .action-icon { margin-top:2px; font-size:20px; }
  .action-btn .action-label { font-size:14px; font-weight:500; }
  .action-btn .action-desc { font-size:12px; opacity:0.8; }
  .action-lens { background:rgba(59,130,246,0.1); color:#3b82f6; }
  .action-lens:hover { background:rgba(59,130,246,0.2); }
  .action-maria { background:rgba(34,197,94,0.1); color:#22c55e; }
  .action-maria:hover { background:rgba(34,197,94,0.2); }
  .action-probe { background:rgba(201,169,97,0.1); color:#C108AB; }
  .action-probe:hover { background:rgba(201,169,97,0.2); }
  
  /* Alert Feed */
  .alert-section { margin-bottom:16px; }
  .alert-header { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; margin-bottom:8px; }
  .alert-header.warning { background:rgba(234,179,8,0.1); }
  .alert-header.success { background:rgba(34,197,94,0.1); }
  .alert-header.info { background:rgba(59,130,246,0.1); }
  .alert-icon { font-size:16px; }
  .alert-label { font-size:13px; font-weight:500; }
  .alert-count { margin-left:auto; background:#f3f4f6; padding:2px 8px; border-radius:9999px; font-size:12px; font-weight:500; color:#6b7280; }
  .alert-items { margin-left:16px; }
  .alert-item { display:flex; align-items:center; gap:8px; font-size:12px; color:#9ca3af; padding:2px 0; }
  .alert-item .name { font-weight:500; color:#6b7280; }
  .alert-item .days { margin-left:auto; color:#eab308; font-weight:500; }
  
  @media (max-width:1024px) {
    .kpi-grid { grid-template-columns:repeat(2,1fr); }
    .content-grid { grid-template-columns:1fr; }
  }
</style>
</head>
<body>

<!-- Sidebar -->
<aside class="sidebar">
  <div class="sidebar-header">
    <a href="#" class="sidebar-logo">VISTA</a>
    <button class="sidebar-toggle">◀</button>
  </div>
  <div class="sidebar-sep"></div>
  <nav class="sidebar-nav">
    <ul>
      <li><a href="#" class="active"><span class="icon">📊</span> Dashboard</a></li>
      <li><a href="#"><span class="icon">👥</span> Contacts</a></li>
      <li><a href="#"><span class="icon">📡</span> Signals</a></li>
      <li><a href="#"><span class="icon">✉️</span> Campaigns</a></li>
      <li><a href="#"><span class="icon">🗺️</span> Clusters</a></li>
      <li><a href="#"><span class="icon">📅</span> Programs</a></li>
      <li><a href="#"><span class="icon">💡</span> Strategy</a></li>
    </ul>
  </nav>
  <div class="sidebar-sep"></div>
  <div class="sidebar-bottom">
    <ul style="list-style:none;">
      <li style="margin-top:4px;"><a href="#" style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:8px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.8);text-decoration:none;"><span class="icon">⚙️</span> Settings</a></li>
    </ul>
  </div>
</aside>

<!-- Header -->
<header class="header">
  <div class="search-box">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search contacts, companies...">
  </div>
  <div class="header-right">
    <button class="header-btn" style="position:relative;">
      🔔
      <span class="notif-badge">3</span>
    </button>
    <button class="header-btn">🌙</button>
    <div class="header-sep"></div>
    <div class="user-avatar">K</div>
    <span class="user-name">Kevin</span>
  </div>
</header>

<!-- Main Content -->
<main class="main">
  
  <!-- Agent Status Bar -->
  <div class="agent-bar">
    <div class="agent-chip">
      <span class="agent-dot ready"></span>
      <span class="agent-name">LENS</span>
      <span class="agent-role">Scoring Engine</span>
      <span style="font-size:11px;color:#22c55e;">● Idle</span>
    </div>
    <div class="agent-chip">
      <span class="agent-dot ready"></span>
      <span class="agent-name">MARIA</span>
      <span class="agent-role">Outreach</span>
      <span style="font-size:11px;color:#22c55e;">● Idle</span>
    </div>
    <div class="agent-chip">
      <span class="agent-dot ready"></span>
      <span class="agent-name">PROBE</span>
      <span class="agent-role">Analytics</span>
      <span style="font-size:11px;color:#22c55e;">● Idle</span>
    </div>
    <div class="agent-chip">
      <span class="agent-dot dormant"></span>
      <span class="agent-name">CARL</span>
      <span class="agent-role">Strategy Advisor</span>
      <span style="font-size:11px;color:#94a3b8;">● Dormant</span>
    </div>
  </div>
  
  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card success">
      <div class="kpi-header">
        <span class="kpi-title">Hot Contacts</span>
        <span class="kpi-icon">👥</span>
      </div>
      <div class="kpi-value">0</div>
      <div class="kpi-subtitle">Engagement tier: Hot or Committed</div>
    </div>
    <div class="kpi-card info">
      <div class="kpi-header">
        <span class="kpi-title">New Signals</span>
        <span class="kpi-icon">📡</span>
      </div>
      <div class="kpi-value">0</div>
      <div class="kpi-subtitle">Last 7 days</div>
    </div>
    <div class="kpi-card warning">
      <div class="kpi-header">
        <span class="kpi-title">Drafts Pending</span>
        <span class="kpi-icon">✉️</span>
      </div>
      <div class="kpi-value">0</div>
      <div class="kpi-subtitle">Awaiting approval</div>
    </div>
    <div class="kpi-card error">
      <div class="kpi-header">
        <span class="kpi-title">Stale Contacts</span>
        <span class="kpi-icon">🕐</span>
      </div>
      <div class="kpi-value" style="font-size:24px;">17,359</div>
      <div class="kpi-subtitle">30+ days no engagement</div>
    </div>
  </div>
  
  <!-- Content Grid -->
  <div class="content-grid">
    
    <!-- Left Column -->
    <div>
      
      <!-- Pipeline Summary -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Pipeline Summary</span>
          <button style="background:none;border:none;cursor:pointer;color:#9ca3af;">🔄</button>
        </div>
        <div class="card-content">
          <div class="pipeline-chart">
            <div class="pipeline-row">
              <span class="pipeline-label">Cold</span>
              <div class="pipeline-bar bar-cold" style="width:95%;">
                17,359 <span class="count">contacts</span>
              </div>
            </div>
            <div class="pipeline-row">
              <span class="pipeline-label">Warm</span>
              <div class="pipeline-bar bar-warm" style="width:3%;">0</div>
            </div>
            <div class="pipeline-row">
              <span class="pipeline-label">Engaged</span>
              <div class="pipeline-bar bar-engaged" style="width:3%;">0</div>
            </div>
            <div class="pipeline-row">
              <span class="pipeline-label">Hot</span>
              <div class="pipeline-bar bar-hot" style="width:3%;">0</div>
            </div>
            <div class="pipeline-row">
              <span class="pipeline-label">Committed</span>
              <div class="pipeline-bar bar-committed" style="width:3%;">0</div>
            </div>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:13px;margin-top:12px;">All contacts currently Cold — scores were reset. Run LENS scoring to repopulate.</p>
        </div>
      </div>
      
      <!-- Top 7 Ranking -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Top 7 Contacts This Week</span>
          <span class="card-subtitle">Priority Score ≥ 40</span>
        </div>
        <div class="card-content">
          <p style="text-align:center;color:#9ca3af;font-size:14px;padding:24px 0;">No top contacts found. Run LENS scoring to populate.</p>
        </div>
      </div>
      
      <!-- Recent Score Changes -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent Score Changes</span>
        </div>
        <div class="card-content">
          <p style="text-align:center;color:#9ca3af;font-size:14px;padding:16px 0;">No recent score changes.</p>
        </div>
      </div>
      
    </div>
    
    <!-- Right Column -->
    <div>
      
      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Quick Actions</span>
        </div>
        <div class="card-content">
          <button class="action-btn action-lens">
            <span class="action-icon">📊</span>
            <div>
              <div class="action-label">Run LENS Scoring</div>
              <div class="action-desc">Recalculate all contact scores</div>
            </div>
          </button>
          <button class="action-btn action-maria">
            <span class="action-icon">✉️</span>
            <div>
              <div class="action-label">Draft Outreach</div>
              <div class="action-desc">Generate MARIA drafts for hot contacts</div>
            </div>
          </button>
          <button class="action-btn action-probe">
            <span class="action-icon">📈</span>
            <div>
              <div class="action-label">Refresh Pipeline</div>
              <div class="action-desc">Update PROBE dashboard data</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Alerts -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Alerts</span>
        </div>
        <div class="card-content">
          <div class="alert-section">
            <div class="alert-header warning">
              <span class="alert-icon">🕐</span>
              <span class="alert-label">Stale Contacts</span>
              <span class="alert-count">17,359</span>
            </div>
            <div class="alert-items">
              <div class="alert-item">
                <span class="name">Bartosz Kolasa</span><span>•</span><span>Acme Corp</span>
                <span class="days">Never</span>
              </div>
              <div class="alert-item">
                <span class="name">Marie Dubois</span><span>•</span><span>Partners Group</span>
                <span class="days">Never</span>
              </div>
              <div class="alert-item">
                <span class="name">James Chen</span><span>•</span><span>Goldman Sachs</span>
                <span class="days">Never</span>
              </div>
              <div class="alert-item" style="color:#9ca3af;font-size:11px;margin-top:4px;">+17,356 more</div>
            </div>
          </div>
          
          <div class="alert-section">
            <div class="alert-header success">
              <span class="alert-icon">📈</span>
              <span class="alert-label">Threshold Crossings</span>
              <span class="alert-count">0</span>
            </div>
          </div>
          
          <div class="alert-section">
            <div class="alert-header info">
              <span class="alert-icon">🔔</span>
              <span class="alert-label">New Signals</span>
              <span class="alert-count">0</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
  
</main>

</body>
</html>
`

export async function GET() {
  return new NextResponse(HTML_CONTENT, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
