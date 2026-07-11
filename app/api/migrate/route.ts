import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    
    // Fetch migration SQL from GitHub
    const sqlUrl = 'https://raw.githubusercontent.com/kevinhongfr-star/vista/main/VISTA/schema_migration_v2_service_catalog.sql';
    const response = await fetch(sqlUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch SQL: ${response.status}` }, { status: 500 });
    }
    
    const sql = await response.text();
    
    // Execute the migration
    const result = await client.query(sql);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration executed successfully',
      command: result.command,
      rowCount: result.rowCount
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      detail: error.toString()
    }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to run migration',
    db_configured: !!process.env.DATABASE_URL
  });
}
