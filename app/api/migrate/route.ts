import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  try {
    // Dynamic import to avoid TypeScript issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require('pg');
    const client = new Client({ connectionString: databaseUrl });
    
    await client.connect();
    
    // Fetch migration SQL from GitHub
    const sqlUrl = 'https://raw.githubusercontent.com/kevinhongfr-star/vista/main/VISTA/schema_migration_v2_service_catalog.sql';
    const response = await fetch(sqlUrl);
    
    if (!response.ok) {
      await client.end();
      return NextResponse.json({ error: `Failed to fetch SQL: ${response.status}` }, { status: 500 });
    }
    
    const sql = await response.text();
    
    // Execute the migration
    const result = await client.query(sql);
    
    await client.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration executed successfully',
      command: result.command,
      rowCount: result.rowCount
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: message,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to run migration',
    db_configured: !!process.env.DATABASE_URL
  });
}
