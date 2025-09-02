import { pool } from '../db';
import { log } from '../middleware/log';

export async function ensureProvidersTable() {
  if (!pool) {
    log('info', 'db.providers_table.skipped', { message: 'Database pool not available' });
    return;
  }
  
  try {
    // 1) Create if missing with minimal required columns
    await (pool as any).query(`
      CREATE TABLE IF NOT EXISTS providers (
        uid TEXT PRIMARY KEY,
        company_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ
      );
    `);

    // 2) Add optional columns defensively (no references in defaults)
    await (pool as any).query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);
    await (pool as any).query(`ALTER TABLE providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;`);

    // 3) (Optional) backfill updated_at without referencing non-existent cols
    await (pool as any).query(`UPDATE providers SET updated_at = NOW() WHERE updated_at IS NULL;`);

    log('info', 'db.providers_table.ready', {});
  } catch (error: any) {
    log('error', 'db.providers_table.fail', {
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

export async function ensureAuditLogTable() {
  if (!pool) {
    log('info', 'db.audit_log_table.skipped', { message: 'Database pool not available' });
    return;
  }
  
  try {
    await (pool as any).query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGSERIAL PRIMARY KEY,
        at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        request_id TEXT,
        actor_uid TEXT,
        actor_email TEXT,
        action TEXT NOT NULL,
        target_uid TEXT,
        target_id TEXT,
        result_code TEXT,
        details JSONB
      );
    `);
    log('info', 'db.audit_log_table.ready', {});
  } catch (error: any) {
    log('error', 'db.audit_log_table.fail', {
      error: error.message,
      code: error.code
    });
    throw error;
  }
}


