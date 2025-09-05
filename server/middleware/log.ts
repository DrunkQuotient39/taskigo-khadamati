import fs from 'fs';
import path from 'path';
import { ndjsonAppend } from './ndjsonExport';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set(['password', 'token', 'authorization', 'cookie', 'cookies']);

function redact(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return value.length > 3 ? value.slice(0, 3) + '***' : '***';
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const obj: any = value as any;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '***';
      } else {
        out[k] = redact(obj[k]);
      }
    }
    return out;
  }
  return value;
}

function ensureDevLogFile(): string | null {
  if (process.env.NODE_ENV !== 'development') return null;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const fileName = `logs-dev-${date}.ndjson`;
  const full = path.resolve(process.cwd(), fileName);
  return full;
}

export function log(level: LogLevel, message: string, extra: Record<string, unknown> = {}) {
  const line: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(typeof extra === 'object' && extra !== null ? redact(extra) as object : {}),
  } as Record<string, unknown>;

  const json = JSON.stringify(line);
  // Always stdout
  // eslint-disable-next-line no-console
  console.log(json);

  // Also append to file in dev
  const file = ensureDevLogFile();
  if (file) {
    try {
      fs.appendFileSync(file, json + '\n', { encoding: 'utf8' });
    } catch {
      // ignore file append errors in dev
    }
  }

  // Optionally buffer for NDJSON export (forensics)
  ndjsonAppend(json);
}

export function accessLog(params: {
  requestId?: string;
  method: string;
  path: string;
  originalUrl?: string;
  route?: string;
  baseUrl?: string;
  status: number;
  durationMs: number;
  user?: { id?: string; email?: string } | null;
}) {
  const { requestId, method, path: p, originalUrl, route, baseUrl, status, durationMs, user } = params;
  log('info', 'http.access', {
    requestId,
    method,
    path: p,
    originalUrl,
    route,
    baseUrl,
    status,
    durationMs,
    userId: user?.id,
    userEmail: user?.email,
  });
}


