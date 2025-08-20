import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Gracefully handle missing DATABASE_URL in local/dev by allowing in-memory storage fallback
let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Falling back to in-memory storage. Database features will be disabled.");
} else {
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle({ client: poolInstance as any, schema });
}

export const pool = poolInstance as unknown as Pool;
export const db = dbInstance as unknown as ReturnType<typeof drizzle>;