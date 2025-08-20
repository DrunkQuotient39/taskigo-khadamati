import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { storage } from '../storage';

// Initialize Firebase Admin once
let initialized = false;
function initFirebase() {
  if (initialized) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET; // e.g. your-project.appspot.com

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin not configured. Skipping Firebase auth.');
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
}

export interface FirebaseAuthRequest extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
  user?: { id: string; email: string; role: string };
}

export async function firebaseAuthenticate(req: FirebaseAuthRequest, res: Response, next: NextFunction) {
  initFirebase();
  if (!initialized) return res.status(401).json({ message: 'Auth not configured' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token' });
  }

  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    // Upsert/load user in our DB and attach to req.user
    const userId = decoded.uid;
    const email = decoded.email || null;
    const name = decoded.name || '';
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');
    const user = await storage.upsertUser({
      id: userId,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: 'client',
      isVerified: true,
      isActive: true,
    } as any);
    req.user = { id: user.id, email: user.email || '', role: user.role };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }
}

