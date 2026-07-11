// @ts-nocheck
/* eslint-disable */
const { Client } = require('pg');

export async function GET() {
  const results: string[] = [];
  let success = false;

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      results.push('ERROR: DATABASE_URL not set');
      return writeResultsToGitHub(results, false);
    }

    results.push(`Connecting to database...`);
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    results.push('Connected successfully');

    // Fetch the migration SQL from GitHub
    const sqlUrl = 'https://raw.githubusercontent.com/kevinhongfr-star/vista/main/VISTA/schema_migration_wave1.5_funnel_core.sql';
    results.push(`Fetching SQL from: ${sqlUrl}`);
    
    const sqlResponse = await fetch(sqlUrl);
    if (!sqlResponse.ok) {
      results.push(`ERROR: Failed to fetch SQL: ${sqlResponse.status}`);
      await client.end();
      return writeResultsToGitHub(results, false);
    }
    
    const sqlText = await sqlResponse.text();
    results.push(`SQL fetched: ${sqlText.length} chars`);

    // Split by semicolons, filter empty
    const statements = sqlText
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'));

    results.push(`Parsed ${statements.length} statements`);

    // Execute each statement
    let executed = 0;
    let errors = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      try {
        await client.query(stmt);
        executed++;
      } catch (err: any) {
        const msg = err.message || 'unknown error';
        if (msg.includes('already exists')) {
          results.push(`[SKIP] Statement ${i + 1}: already exists`);
          executed++;
        } else {
          results.push(`[ERROR] Statement ${i + 1}: ${msg.substring(0, 200)}`);
          errors++;
        }
      }
    }

    results.push(`\nExecuted: ${executed}, Errors: ${errors}`);

    // Verify tables created
    const verifyQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vista_outreach_templates', 'vista_outreach_sequences', 'vista_nurture_routes')
      ORDER BY table_name
    `;
    const verifyResult = await client.query(verifyQuery);
    results.push(`\nNew tables created: ${verifyResult.rows.map((r: any) => r.table_name).join(', ') || 'NONE'}`);

    // Verify contact columns
    const colQuery = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'vista_contacts' 
      AND column_name IN ('bd_bucket', 'warmth_score', 'funnel_stage', 'outreach_count', 
                          'last_outreach_date', 'next_action_date', 'next_action_type', 'lead_source')
      ORDER BY column_name
    `;
    const colResult = await client.query(colQuery);
    results.push(`Contact columns added: ${colResult.rows.length}/8 — ${colResult.rows.map((r: any) => r.column_name).join(', ') || 'NONE'}`);

    // Verify opportunity scoring columns
    const scoreQuery = `
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'vista_opportunities' 
      AND column_name IN ('score_named_problem', 'score_budget_authority', 'score_pricing_ask',
                          'score_product_fit', 'score_timeline', 'score_competitor_ref',
                          'total_score', 'score_tier', 'product_recommendation',
                          'first_step_price', 'full_engagement_price', 'conversation_notes')
      ORDER BY column_name
    `;
    const scoreResult = await client.query(scoreQuery);
    results.push(`Opportunity scoring columns: ${scoreResult.rows.length}/12 — ${scoreResult.rows.map((r: any) => r.column_name).join(', ') || 'NONE'}`);

    // Verify templates seeded
    const tmplQuery = `SELECT COUNT(*) as cnt FROM vista_outreach_templates`;
    const tmplResult = await client.query(tmplQuery);
    results.push(`Templates seeded: ${tmplResult.rows[0].cnt}`);

    // Verify functions
    const funcQuery = `
      SELECT routine_name FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('fn_funnel_summary', 'fn_today_actions', 'fn_overdue_outreaches', 
                           'fn_nurture_due_reengage', 'fn_weekly_outreach_stats', 
                           'fn_compute_opportunity_score', 'fn_sync_outreach_to_contact')
      ORDER BY routine_name
    `;
    const funcResult = await client.query(funcQuery);
    results.push(`Functions created: ${funcResult.rows.length}/7 — ${funcResult.rows.map((r: any) => r.routine_name).join(', ') || 'NONE'}`);

    success = errors === 0;
    results.push(`\n${success ? '✅ MIGRATION COMPLETE' : '⚠️ MIGRATION COMPLETE WITH ERRORS'}`);

    await client.end();
  } catch (err: any) {
    results.push(`FATAL: ${err.message}`);
  }

  return writeResultsToGitHub(results, success);
}

async function writeResultsToGitHub(results: string[], success: boolean) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const content = `# Wave 1.5 Migration Results\n\n**Time:** ${new Date().toISOString()}\n**Status:** ${success ? 'SUCCESS' : 'ERRORS'}\n\n## Log\n\n${results.join('\n')}\n`;
  
  const base64Content = Buffer.from(content).toString('base64');
  const fileName = `VISTA/migration_log_wave1.5_${timestamp}.md`;
  
  try {
    // Use GitHub token from env var (set in Vercel)
    const ghToken = process.env.GITHUB_PAT;
    if (!ghToken) {
      results.push('\n⚠️ GITHUB_PAT not set — cannot write results to repo');
    } else {
      const response = await fetch(
        'https://api.github.com/repos/kevinhongfr-star/vista/contents/' + fileName,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${ghToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            message: `chore: Wave 1.5 migration log ${success ? 'SUCCESS' : 'ERRORS'}`,
            content: base64Content,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json() as any;
        results.push(`\n📄 Results committed to GitHub: ${fileName}`);
      } else {
        const errText = await response.text();
        results.push(`\nGitHub write failed: ${response.status}`);
      }
    }
  } catch (ghErr: any) {
    results.push(`\nGitHub write error: ${ghErr.message}`);
  }

  const html = `<!DOCTYPE html><html><body>
    <h1>${success ? '✅ MIGRATION SUCCESS' : '⚠️ MIGRATION ERRORS'}</h1>
    <pre>${results.join('\n')}</pre>
  </body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
// redeploy for pooler DB connection - 20260711-120134
// pooler retry 120653
