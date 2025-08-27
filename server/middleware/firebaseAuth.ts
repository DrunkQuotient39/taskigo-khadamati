import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { storage } from '../storage';
import { verifyToken } from './auth';

// Initialize Firebase Admin once
let initialized = false;
function initFirebase() {
  if (initialized) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Render/Firebase keys often use literal \n sequences; convert them to real newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET; // e.g. your-project.appspot.com

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[Auth] Firebase Admin not configured. Skipping Admin SDK init.', { projectIdSet: !!projectId, clientEmailSet: !!clientEmail, privateKeySet: !!privateKey });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    ...(storageBucket ? { storageBucket } : {}),
  });
  initialized = true;
  try {
    const appProject = (admin.app().options as any)?.projectId;
    console.log('[Auth] FirebaseAdmin initialized', { projectId: appProject });
  } catch {}
}

export interface FirebaseAuthRequest extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
  user?: { id: string; email: string; role: string };
}

export async function firebaseAuthenticate(req: FirebaseAuthRequest, res: Response, next: NextFunction) {
  initFirebase();
  const requestId = (req.headers['x-request-id'] as string) || Math.random().toString(36).slice(2, 10);
  const route = req.originalUrl;
  const method = req.method;
  const authHeader = req.headers.authorization;
  const cookieToken = (req as any)?.cookies?.admin_auth as string | undefined;

  const logEvent = async (level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, any>) => {
    try {
      await storage.createSystemLog?.({
        level,
        category: 'auth',
        message,
        metadata: { requestId, route, method, ...extra },
        userId: (req as any).user?.id || null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
      });
    } catch {}
  };

  try {
    if (!authHeader?.startsWith('Bearer ')) {
      if (cookieToken) {
        try {
          const decoded: any = verifyToken(cookieToken);
          req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
          await logEvent('info', 'Admin cookie auth accepted');
          return next();
        } catch (e) {
          await logEvent('warn', 'Admin cookie JWT invalid', { reason: (e as any)?.message });
        }
      }
      await logEvent('warn', 'Missing Authorization Bearer token');
      return res.status(401).json({ message: 'Missing auth token', requestId });
    }

    // Dev fallback gated by env
    const devDecodeEnabled = process.env.AUTH_DEV_DECODE_FALLBACK === 'true';
    if (!initialized && devDecodeEnabled) {
      try {
        const idToken = authHeader.split(' ')[1];
        const base64Payload = idToken.split('.')[1];
        const json = Buffer.from(base64Payload, 'base64').toString('utf8');
        const payload: any = JSON.parse(json);
        const uid = payload.user_id || payload.sub || 'dev-uid';
        const email = payload.email || '';
        const isAdminEmail = email.toLowerCase() === 'taskigo.khadamati@gmail.com';
        req.firebaseUser = payload;
        req.user = { id: uid, email, role: isAdminEmail ? 'admin' : 'client' };
        await logEvent('warn', 'DEV decode fallback used (unverified token)', { email, devDecodeEnabled });
        return next();
      } catch (e) {
        await logEvent('error', 'DEV decode fallback failed', { error: (e as any)?.message });
        return res.status(401).json({ message: 'Invalid auth token (dev fallback failed)', requestId });
      }
    }

    if (!initialized) {
      await logEvent('error', 'Firebase Admin not configured', { hasProjectId: !!process.env.FIREBASE_PROJECT_ID });
      return res.status(401).json({ message: 'Auth not configured', requestId });
    }

    const idToken = authHeader.split(' ')[1];
    await logEvent('info', 'Verifying Firebase token start');
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    await logEvent('info', 'Firebase token verified', { uid: decoded.uid, email: decoded.email });

    // Extract and upsert user
    const userId = decoded.uid;
    const email = decoded.email || null;
    const name = decoded.name || '';
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');
    const isAdminEmail = email && email.toLowerCase() === 'taskigo.khadamati@gmail.com';
    const desiredRole = isAdminEmail ? 'admin' : 'client';

    // Upsert in storage
    const user = await storage.upsertUser({
      id: userId,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: desiredRole,
      isVerified: true,
      isActive: true,
    } as any);
    req.user = { id: user.id, email: user.email || '', role: user.role };
    await logEvent('info', 'User upserted from Firebase token', { role: user.role });

    // Ensure admin role correction
    if (isAdminEmail && user.role !== 'admin') {
      await storage.updateUser(user.id, { role: 'admin' });
      req.user.role = 'admin';
      await logEvent('info', 'Admin role enforced for admin email');
    }

    return next();
  } catch (e: any) {
    const code = e?.code;
    const msg = e?.message;
    await logEvent('error', 'Firebase token verification failed', { code, msg });
    return res.status(401).json({ message: 'Invalid auth token', code, requestId });
  }
}

