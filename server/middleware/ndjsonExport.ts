import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

let buffer: string[] = [];

export function ndjsonAppend(line: string) {
  if (process.env.NODE_ENV !== 'development' && process.env.LOG_EXPORT_ENABLED !== 'true') return;
  buffer.push(line.trimEnd());
  if (buffer.length > 500) {
    void flush().catch(() => {});
  }
}

export async function flush(): Promise<void> {
  if (buffer.length === 0) return;
  const lines = buffer.join('\n') + '\n';
  buffer = [];

  try {
    // Always write a local dev file for inspection
    const dir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${new Date().toISOString().slice(0, 10)}.ndjson`);
    fs.appendFileSync(file, lines, { encoding: 'utf8' });
  } catch {
    // ignore local write errors
  }

  // Optionally upload to Firebase Storage
  if (process.env.LOG_EXPORT_ENABLED === 'true') {
    try {
      const bucket = admin.storage().bucket();
      const date = new Date();
      const ymd = date.toISOString().slice(0, 10);
      const hour = String(date.getUTCHours()).padStart(2, '0');
      const key = `logs/${ymd}/app-${ymd.replace(/-/g, '')}-${hour}.ndjson.gz`;
      const gzipped = zlib.gzipSync(Buffer.from(lines, 'utf8'));
      const tmp = path.join(process.cwd(), `.tmp-${Date.now()}.ndjson.gz`);
      fs.writeFileSync(tmp, gzipped);
      await bucket.upload(tmp, { destination: key, contentType: 'application/gzip' });
      fs.unlinkSync(tmp);
    } catch {
      // ignore upload errors
    }
  }
}


