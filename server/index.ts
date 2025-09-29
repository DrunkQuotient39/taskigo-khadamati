import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { requestId } from './middleware/requestId';
import { log, accessLog } from './middleware/log';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import { ensureAuditLogTable, ensureProvidersTable, ensureCoreTables } from './db/ensureSchema';
import { getFirestore } from './storage/firestore';
import admin from 'firebase-admin';

// Load environment variables
config();

// Environment validation - make optional for development
const requiredEnvVars = [
  'ADMIN_EMAIL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  log('error', 'startup.env.fail', { 
    missing: missingVars,
    message: 'Required environment variables are missing'
  });
  process.exit(1);
}

// Set defaults for development
if (!process.env.ADMIN_EMAIL) {
  process.env.ADMIN_EMAIL = 'admin@taskigo.com';
}

// Validate Firebase private key format only if provided
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  log('error', 'startup.env.fail', { 
    message: 'FIREBASE_PRIVATE_KEY must be properly formatted with newlines'
  });
  process.exit(1);
}

log('info', 'startup.env.ok', {});

// Firebase Admin initialization (optional for development)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    
    // Test Firebase Admin connectivity
    const firestore = getFirestore();
    if (firestore) {
      // Lightweight health check - try to list collections
      try {
        firestore.listCollections().then(() => {
          log('info', 'firebase.admin.ok', {});
        }).catch((err: any) => {
          log('warn', 'firebase.admin.health_check_fail', { error: err?.message || err });
        });
      } catch (err: any) {
        log('warn', 'firebase.admin.health_check_fail', { error: err?.message || err });
      }
    } else {
      log('warn', 'firebase.admin.firestore_unavailable', {});
    }
  } catch (error: any) {
    log('warn', 'firebase.admin.fail', { 
      error: error.message,
      code: error.code 
    });
  }
} else {
  log('info', 'firebase.admin.skipped', { message: 'Firebase credentials not provided, using in-memory storage' });
}

// Database schema validation (optional for development)
if (process.env.DATABASE_URL) {
  ensureAuditLogTable()
    .then(() => ensureCoreTables())
    .then(() => ensureProvidersTable())
    .then(() => {
      log('info', 'startup.schema.ok', {});
    })
    .catch((error: any) => {
      log('error', 'startup.schema.fail', { 
        error: error.message,
        code: error.code 
      });
      process.exit(1);
    });
} else {
  log('info', 'startup.schema.skipped', { message: 'DATABASE_URL not provided, using in-memory storage' });
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5173', 'http://localhost:3000']
      : [process.env.CLIENT_URL || 'https://yourdomain.com'],
    credentials: true
  }
});

// Global middleware
app.use(requestId);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com", 
        "https://firebase.googleapis.com",
        "https://firestore.googleapis.com",
        "https://storage.googleapis.com",
        "https://*.googleapis.com",
        "wss://*.firebaseio.com",
        "https://*.firebaseio.com"
      ],
      scriptSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "'unsafe-inline'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3000']
    : [process.env.CLIENT_URL || 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
};

app.use(cors(corsOptions));

// Rate limiting (disabled in development)
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// Health check endpoint
app.get('/readyz', async (req, res) => {
  const requestId = (req as any).requestId;
  try {
    // Firebase Admin check (optional in development)
    const firestore = getFirestore();
    let firebaseStatus: 'ok' | 'skipped' | 'unavailable' = 'ok';
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      firebaseStatus = 'skipped';
    } else if (!firestore) {
      firebaseStatus = 'unavailable';
    } else {
      try {
        await firestore.listCollections();
      } catch (err: any) {
        log('warn', 'readyz.firebase.health_check_fail', { requestId, error: err?.message || err });
      }
    }

    // Neon database check only if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      log('info', 'readyz.ok.dev_no_db', { requestId, firebase: firebaseStatus, neon: 'skipped' });
      return res.json({ status: 'healthy', firebase: firebaseStatus, neon: 'skipped', timestamp: new Date().toISOString() });
    }

    // ESM-safe import of pool from our db module
    const { pool } = await import('./db');
    if (!pool) {
      log('error', 'readyz.neon.fail', { requestId });
      return res.status(503).json({ status: 'unhealthy', neon: 'unavailable' });
    }

    try {
      await (pool as any).query('SELECT 1');
    } catch (e: any) {
      log('warn', 'readyz.neon.query_fail', { requestId, error: e?.message });
      return res.json({ status: 'degraded', firebase: firebaseStatus, neon: 'unavailable', timestamp: new Date().toISOString() });
    }

    log('info', 'readyz.ok', { requestId });
    res.json({ status: 'healthy', firebase: firebaseStatus, neon: 'ok', timestamp: new Date().toISOString() });
  } catch (error: any) {
    log('error', 'readyz.fail', { requestId, error: error.message });
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Debug: list registered routes
app.get('/__debug/routes', (req, res) => {
  const routes: Array<{ method: string; path: string }> = [];
  app._router?.stack?.forEach((layer: any) => {
    if (layer?.route?.path) {
      const methods = Object.keys(layer.route.methods || {}).filter(Boolean);
      methods.forEach(m => routes.push({ method: m.toUpperCase(), path: layer.route.path }));
    } else if (layer?.name === 'router' && layer?.handle?.stack) {
      layer.handle.stack.forEach((sub: any) => {
        const p = sub?.route?.path;
        const methods = Object.keys(sub?.route?.methods || {}).filter(Boolean);
        methods.forEach(m => routes.push({ method: m.toUpperCase(), path: p }));
      });
    }
  });
  res.json({ routes });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    accessLog({
      requestId: (req as any).requestId,
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      baseUrl: (req as any).baseUrl,
      route: (req as any).route?.path,
      status: res.statusCode,
      durationMs: duration,
      user: (req as any).user
    });
  });
  next();
});

// API routes
import authRouter from './routes/auth';
import providersRouter from './routes/providers';
import adminRouter from './routes/admin';
import paymentsRouter from './routes/payments';
import aiRouter from './routes/ai';
import servicesRouter from './routes/services';
import bookingsRouter from './routes/bookings';
import uploadsRouter from './routes/uploads';
import aiActionsRouter from './routes/ai-actions';
import notificationsRouter from './routes/notifications';

app.use('/api/auth', authRouter);
app.use('/api/providers', providersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/ai-actions', aiActionsRouter);
app.use('/api/notifications', notificationsRouter);

// API 404 safeguard: ensure unknown /api routes return JSON (before static fallback)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Not Found', path: req.originalUrl });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible paths for the built frontend
  // The frontend is built to dist/public relative to project root
  const possiblePaths = [
    join(__dirname, '../dist/public'),  // Most likely path: server/../dist/public
    join(__dirname, '../../dist/public'), // Alternative: server/../../dist/public
    join(__dirname, '../client/dist'),   // Legacy path
    join(__dirname, '../public'),        // Simple public path
    join(__dirname, '../../client/dist'), // Alternative client path
    join(__dirname, '../../../dist/public'), // Deep alternative
    join(__dirname, '../../../client/dist')  // Deep client alternative
  ];
  
  // Log current directory structure for debugging
  log('info', 'static.files.search.start', { 
    __dirname,
    cwd: process.cwd(),
    searchedPaths: possiblePaths
  });
  
  // List directory contents for debugging
  try {
    const parentDir = dirname(__dirname);
    const grandparentDir = dirname(parentDir);
    
    log('info', 'static.files.debug', {
      parentDir: parentDir,
      grandparentDir: grandparentDir,
      parentContents: fs.existsSync(parentDir) ? fs.readdirSync(parentDir) : 'not found',
      grandparentContents: fs.existsSync(grandparentDir) ? fs.readdirSync(grandparentDir) : 'not found'
    });
  } catch (e: any) {
    log('warn', 'static.files.debug.failed', { error: e.message });
  }

  let staticPath: string | null = null;
  for (const searchPath of possiblePaths) 
    try {
      const indexPath = join(searchPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        staticPath = searchPath;
        log('info', 'static.files.found', { 
          path: staticPath,
          indexPath: indexPath
        });
        break;
      } else {
        log('debug', 'static.files.path_not_found', { 
          path: searchPath,
          indexPath: indexPath,
          exists: fs.existsSync(searchPath)
        });
      }
    } catch (e) {
      log('debug', 'static.files.path_error', { 
        path: searchPath,
        error: e instanceof Error ? e.message : String(e)
      });
    }
  if (staticPath) {
    app.use(express.static(staticPath));

    app.get('*', (req, res) => {
      if (staticPath) {
        return res.sendFile(join(staticPath, 'index.html'));
      }
      res.status(500).send('Static path not found');
    });
  } else {
    log('warn', 'static.files.not_found', {
      searchedPaths: possiblePaths,
      message: 'No frontend files found in any expected location'
    });

    // Fallback: serve a simple message if no static files found
    app.get('*', (req, res) => {
      res.status(404).json({
        error: 'Frontend files not found',
        message: 'The application is running but frontend files are not available',
        searchedPaths: possiblePaths,
        __dirname: __dirname,
        cwd: process.cwd()
      });
    });
  }
}

// In development, provide a friendly root message instead of 404
if ((process.env.NODE_ENV as string) === 'development') {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Taskigo API (dev) running',
      health: '/readyz',
      routesDebug: '/__debug/routes',
      frontend: 'http://localhost:5173',
      note: 'In development the frontend is served by Vite on port 5173. API is under /api/*.'
    });
  });
}

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Process error handlers
process.on('unhandledRejection', async (reason, promise) => {
  log('error', 'process.unhandled_rejection', { 
    reason: reason instanceof Error ? reason.message : String(reason),
    promise: promise.toString()
  });
  
  // Flush any pending log exports
  try {
    const { flush } = await import('./middleware/ndjsonExport.ts');
    await flush();
  } catch {}
  
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', async (error) => {
  log('error', 'process.unhandled_exception', { 
    name: error.name,
    message: error.message,
    stack: error.stack
  });
  
  // Flush any pending log exports
  try {
    const { flush } = await import('./middleware/ndjsonExport.ts');
    await flush();
  } catch {}
  
  // Exit in all cases for uncaught exceptions
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('info', 'process.shutdown.start', { signal: 'SIGTERM' });
  
  try {
    const { flush } = await import('./middleware/ndjsonExport');
    await flush();
  } catch {}
  
  server.close(() => {
    log('info', 'process.shutdown.complete', {});
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  log('info', 'server.start', { 
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
  
  console.log(`🚀 Taskego Server with AI & Payments ready!`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🤖 AI Features: /api/ai/* and /api/chat-ai/*`);
  console.log(`💳 Payment System: /api/payments/* (Apple Pay ready)`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/readyz`);
});

export { app, io };

