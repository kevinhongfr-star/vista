import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return { error: 'DATABASE_URL not configured' };
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
      return { error: `Failed to fetch SQL: ${response.status}` };
    }
    
    const sql = await response.text();
    
    // Execute the migration - split by statements and run each
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executed = 0;
    let errors: string[] = [];
    
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        executed++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // Skip "already exists" errors
        if (msg.includes('already exists')) {
          continue;
        }
        errors.push(msg);
      }
    }
    
    await client.end();
    
    return { 
      success: true, 
      message: `Migration executed: ${executed} statements`,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

export async function POST() {
  const result = await runMigration();
  const status = result.error ? 500 : 200;
  return NextResponse.json(result, { status });
}

export async function GET() {
  const result = await runMigration();
  const status = result.error ? 500 : 200;
  return NextResponse.json(result, { status });
}
