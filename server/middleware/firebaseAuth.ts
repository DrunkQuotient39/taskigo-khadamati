import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { storage } from '../storage';

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
    // Determine role: special admin email gets admin role
    const isAdminEmail = email && email.toLowerCase() === 'taskigo.khadamati@gmail.com';
    const desiredRole = isAdminEmail ? 'admin' : 'client';
    
    const user = await storage.upsertUser({
      id: userId,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: desiredRole, // Set admin role for the special admin email
      isVerified: true,
      isActive: true,
    } as any);
    
    // Create a system log for admin login
    if (isAdminEmail) {
      await storage.createSystemLog?.({
        level: 'info',
        category: 'auth',
        message: `Admin logged in: ${email}`,
        userId: user.id,
        metadata: { action: 'admin_login', ip: req.ip }
      });
    }
    req.user = { id: user.id, email: user.email || '', role: user.role };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }
}

