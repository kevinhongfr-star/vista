import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return { success: false, message: 'DATABASE_URL not configured' };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require('pg');
    const client = new Client({ connectionString: databaseUrl });
    
    await client.connect();
    
    // Fetch migration SQL from GitHub
    const sqlUrl = 'https://raw.githubusercontent.com/kevinhongfr-star/vista/main/VISTA/schema_migration_v2_service_catalog.sql';
    const response = await fetch(sqlUrl);
    
    if (!response.ok) {
      await client.end();
      return { success: false, message: `Failed to fetch SQL: ${response.status}` };
    }
    
    const sql = await response.text();
    
    // Execute the migration - split by statements and run each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executed = 0;
    let errors: string[] = [];
    let created_tables: string[] = [];
    
    for (const stmt of statements) {
      try {
        const result = await client.query(stmt);
        executed++;
        // Track CREATE TABLE statements
        if (stmt.toUpperCase().includes('CREATE TABLE')) {
          const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (match) created_tables.push(match[1]);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('already exists')) {
          continue;
        }
        errors.push(msg);
      }
    }
    
    // Verify tables were created
    const checkResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'vista_service%'
      ORDER BY table_name
    `);
    
    await client.end();
    
    return { 
      success: errors.length === 0,
      message: `Migration complete: ${executed} statements executed`,
      tables_created: created_tables,
      verified_tables: checkResult.rows.map((r: {table_name: string}) => r.table_name),
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message: message };
  }
}

export async function GET() {
  const result = await runMigration();
  
  // Return both JSON and HTML for compatibility
  const html = `<!DOCTYPE html>
<html><body>
<h1>VISTA Migration V2</h1>
<pre>${JSON.stringify(result, null, 2)}</pre>
</body></html>`;
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

export async function POST() {
  const result = await runMigration();
  const status = result.success ? 200 : 500;
  return NextResponse.json(result, { status });
}
