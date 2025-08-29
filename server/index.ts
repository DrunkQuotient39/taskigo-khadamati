import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { requestId } from './middleware/requestId';
import { accessLog, log as jsonLog } from './middleware/log';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import { ensureAuditLogTable } from './middleware/audit';
import { flush as flushExport } from './middleware/ndjsonExport';
import { ensureProvidersTable } from './db/ensureSchema';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', message: 'env.missing', name }));
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

const app = express();

// Process-level logging for unexpected errors
process.on("unhandledRejection", (reason: any) => {
  const msg = String(reason?.message || reason || '');
  if (msg.includes('terminating connection due to administrator command')) {
    // Suppress noisy Neon admin restart stack
    return;
  }
  // eslint-disable-next-line no-console
  console.error("Unhandled Promise Rejection:", reason?.stack || reason);
  void flushExport().catch(() => {});
});

process.on("uncaughtException", (error: any) => {
  const msg = String(error?.message || error || '');
  if (msg.includes('terminating connection due to administrator command')) {
    // Suppress noisy Neon admin restart stack
    return;
  }
  // eslint-disable-next-line no-console
  console.error("Uncaught Exception:", error?.stack || error);
  void flushExport().catch(() => {});
});
// Increase JSON payload limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());

// Request ID first
app.use(requestId);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      accessLog({
        requestId: (req as any).requestId,
        method: req.method,
        path,
        status: res.statusCode,
        durationMs: duration,
        user: (req as any).user || null,
      });
    }
  });

  next();
});

(async () => {
  // Fail fast when critical envs are missing
  const required = [
    'DATABASE_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_STORAGE_BUCKET',
    'JWT_SECRET',
    'ADMIN_EMAIL',
  ];
  for (const k of required) {
    try { requireEnv(k); } catch (e) { process.exit(1); }
  }

  await ensureAuditLogTable();
  try {
    await ensureProvidersTable();
  } catch (e: any) {
    jsonLog('error','db.providers_table.fail',{ error: e?.message });
    process.exit(1);
  }
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 then error handler (must be AFTER Vite/static catch-all)
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
    log(`🚀 Taskego Server with AI & Payments ready!`);
    log(`📚 API Documentation: http://localhost:${port}/docs`);
    log(`🤖 AI Features: /api/ai/* and /api/chat-ai/*`);
    log(`💳 Payment System: /api/payments/* (Apple Pay ready)`);
    jsonLog('info', 'server.start', { port, host, env: process.env.NODE_ENV });
  });
})();
