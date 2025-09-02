import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Gracefully handle missing DATABASE_URL in local/dev by allowing in-memory storage fallback
let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (!process.env.DATABASE_URL) {
  console.log("ℹ️  Using in-memory storage (DATABASE_URL not set)");
} else {
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle({ client: poolInstance as any, schema });
  try {
    // Best-effort: log and continue on pool-level errors (e.g., Neon admin restarts)
    (poolInstance as any)?.on?.('error', (err: any) => {
      // eslint-disable-next-line no-console
      console.warn('Neon pool error (non-fatal):', err?.message || err);
    });
  } catch {
    // ignore if pool doesn't support events
  }
}

export const pool = poolInstance as unknown as Pool;
export const db = dbInstance as unknown as ReturnType<typeof drizzle>;