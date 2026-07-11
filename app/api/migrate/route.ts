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

    results.push('Connecting to database...');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    results.push('Connected successfully');

    // Fetch the Wave 1.6 migration SQL from GitHub
    const sqlUrl = 'https://raw.githubusercontent.com/kevinhongfr-star/vista/main/VISTA/run_this_wave1.6_migration.sql';
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

    // ============================================================
    // VERIFICATION: Wave 1.6 Tables
    // ============================================================
    const newTables = [
      'vista_service_bundles',
      'vista_discount_rules',
      'vista_cross_sell_rules',
      'vista_content_attribution',
      'vista_content_contact_interactions',
      'vista_workshops',
      'vista_workshop_attendees',
      'vista_council_members',
      'vista_dex_subscriptions',
      'vista_tier_progressions',
      'vista_contact_service_engagements',
      'vista_payment_schedules',
      'vista_proposals'
    ];

    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
      ORDER BY table_name
    `, [newTables]);
    results.push(`\n📊 New tables created: ${tableCheck.rows.length}/${newTables.length}`);
    results.push(`   ${tableCheck.rows.map((r: any) => r.table_name).join(', ')}`);
    
    const missing = newTables.filter(t => !tableCheck.rows.some((r: any) => r.table_name === t));
    if (missing.length > 0) {
      results.push(`   ❌ Missing: ${missing.join(', ')}`);
    }

    // Verify service catalog tier columns
    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'vista_service_catalog' 
      AND column_name IN ('tier', 'tier_name', 'price_min_cny', 'price_max_cny', 'price_model', 
                          'engagement_duration', 'target_buyer', 'is_discountable', 'discount_rules',
                          'tier_positioning', 'competitor_anchor')
      ORDER BY column_name
    `);
    results.push(`\n📋 Service catalog tier columns: ${colCheck.rows.length}/11`);

    // Count seeded services
    const svcCount = await client.query(`SELECT COUNT(*) as cnt FROM vista_service_catalog`);
    results.push(`📦 Total services in catalog: ${svcCount.rows[0].cnt}`);

    // Count by tier
    const tierCount = await client.query(`
      SELECT tier, tier_name, COUNT(*) as cnt 
      FROM vista_service_catalog 
      WHERE tier IS NOT NULL 
      GROUP BY tier, tier_name 
      ORDER BY tier
    `);
    results.push(`\n📊 Services by tier:`);
    tierCount.rows.forEach((r: any) => {
      results.push(`   Tier ${r.tier} (${r.tier_name}): ${r.cnt}`);
    });

    // Count bundles
    const bundleCount = await client.query(`SELECT COUNT(*) as cnt FROM vista_service_bundles`);
    results.push(`\n🎁 Bundles seeded: ${bundleCount.rows[0].cnt}`);

    // Count discount rules
    const discCount = await client.query(`SELECT COUNT(*) as cnt FROM vista_discount_rules`);
    results.push(`💰 Discount rules seeded: ${discCount.rows[0].cnt}`);

    // Count cross-sell rules
    const csCount = await client.query(`SELECT COUNT(*) as cnt FROM vista_cross_sell_rules`);
    results.push(`🔀 Cross-sell rules seeded: ${csCount.rows[0].cnt}`);

    // Verify contact columns added
    const contactColCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'vista_contacts' 
      AND column_name IN ('revenue_tier', 'lifetime_value_cny', 'tier_progression_score')
    `);
    results.push(`\n👤 Contact revenue columns: ${contactColCheck.rows.length}/3`);

    success = errors === 0 && tableCheck.rows.length === newTables.length;
    results.push(`\n${success ? '✅ WAVE 1.6 MIGRATION COMPLETE' : '⚠️ MIGRATION COMPLETE WITH ISSUES'}`);

    await client.end();
  } catch (err: any) {
    results.push(`FATAL: ${err.message}`);
  }

  return writeResultsToGitHub(results, success);
}

async function writeResultsToGitHub(results: string[], success: boolean) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const content = `# Wave 1.6 Revenue OS Migration Results\n\n**Time:** ${new Date().toISOString()}\n**Status:** ${success ? 'SUCCESS' : 'ERRORS'}\n\n## Log\n\n${results.join('\n')}\n`;
  
  const base64Content = Buffer.from(content).toString('base64');
  const fileName = `VISTA/migration_log_wave1.6_${timestamp}.md`;
  
  try {
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
            message: `chore: Wave 1.6 Revenue OS migration log ${success ? 'SUCCESS' : 'ERRORS'}`,
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
    <h1>${success ? '✅ WAVE 1.6 MIGRATION SUCCESS' : '⚠️ MIGRATION ERRORS'}</h1>
    <pre>${results.join('\n')}</pre>
  </body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
