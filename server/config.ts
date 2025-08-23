// Centralized runtime configuration with safe defaults; environment variables override when present.

export const NODE_ENV = process.env.NODE_ENV ?? "production";

// App / ports
export const PORT = Number(process.env.PORT ?? 5000);

// URLs (AI, DB, etc.) — in-code defaults; envs override if set
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://165.22.64.21:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b-instruct";

// Database URL — keep empty string to mean "DB disabled" in local/dev
export const DATABASE_URL = process.env.DATABASE_URL ?? "";

// JWT/session — non-secret defaults for development; override in production
export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-jwt";
export const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-insecure-session";

// Allowed origins (CSV). If empty, the CORS middleware may apply reasonable defaults elsewhere.
export const ALLOWED_ORIGINS = (process.env.ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);


