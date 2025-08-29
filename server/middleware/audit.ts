import { pool } from '../db';

export async function ensureAuditLogTable(): Promise<void> {
  if (!pool) return;
  const sql = `
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
  );`;
  try {
    await pool.query(sql as any);
  } catch {
    // ignore in dev without database
  }
}

type AuditParams = {
  requestId?: string;
  actorUid?: string | null;
  actorEmail?: string | null;
  action: string; // e.g., 'provider.apply'
  targetUid?: string | null;
  targetId?: string | number | null;
  resultCode?: 'ok' | 'fail' | 'already_provider' | string;
  details?: Record<string, unknown>;
};

export async function audit(params: AuditParams): Promise<void> {
  if (!pool) return;
  const {
    requestId,
    actorUid,
    actorEmail,
    action,
    targetUid,
    targetId,
    resultCode,
    details,
  } = params;

  try {
    await pool.query(
      `INSERT INTO audit_log (request_id, actor_uid, actor_email, action, target_uid, target_id, result_code, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)` as any,
      [
        requestId || null,
        actorUid || null,
        actorEmail || null,
        action,
        targetUid || null,
        targetId != null ? String(targetId) : null,
        resultCode || null,
        details ? JSON.stringify(details) : null,
      ] as any
    );
  } catch {
    // swallow audit failures in dev
  }
}


