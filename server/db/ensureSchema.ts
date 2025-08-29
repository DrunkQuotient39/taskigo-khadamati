import { pool } from '../db';
import { log } from '../vite';

export async function ensureProvidersTable(): Promise<void> {
  // If pool isn't configured (dev with in-memory), skip
  if (!pool) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS providers (
      uid TEXT PRIMARY KEY,
      company_name TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMPTZ
    );
  `;
  await (pool as any).query(sql);
  log('db.providers_table.ready');
}


