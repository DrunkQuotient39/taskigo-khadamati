import { pool } from '../db';
import { log } from '../middleware/log';

export async function ensureAuditLogTable() {
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
    
    // Create index for performance
    await (pool as any).query(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
      CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_uid);
      CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_uid);
      CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log(at);
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

export async function ensureProvidersTable() {
  try {
    await (pool as any).query(`
      CREATE TABLE IF NOT EXISTS providers (
        uid TEXT PRIMARY KEY,
        company_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Create indexes for performance
    await (pool as any).query(`
      CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
      CREATE INDEX IF NOT EXISTS idx_providers_approved_at ON providers(approved_at);
    `);
    
    log('info', 'db.providers_table.ready', {});
  } catch (error: any) {
    log('error', 'db.providers_table.fail', { 
      error: error.message,
      code: error.code 
    });
    throw error;
  }
}


