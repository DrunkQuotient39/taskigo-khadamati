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
  // Fallback path: accept admin_auth cookie (JWT) when present
  const cookieToken = (req as any)?.cookies?.admin_auth as string | undefined;
  const authHeader = req.headers.authorization;

  // If we have a Firebase Bearer token, validate it first (primary path)
  if (!initialized && !cookieToken) {
    console.error('Firebase auth not configured');
    return res.status(401).json({ message: 'Auth not configured' });
  }

  if (!authHeader?.startsWith('Bearer ')) {
    if (cookieToken) {
      try {
        const decoded: any = verifyToken(cookieToken);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        return next();
      } catch (e) {
        // fallthrough to 401 below if cookie invalid
      }
    }
    console.log('No Bearer token in authorization header');
    return res.status(401).json({ message: 'Missing auth token' });
  }

  const idToken = authHeader.split(' ')[1];
  try {
    console.log('Verifying Firebase token...');
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('Firebase token verified for user:', decoded.uid);
    req.firebaseUser = decoded;
    
    // Extract user details from token
    const userId = decoded.uid;
    const email = decoded.email || null;
    const name = decoded.name || '';
    const [firstName, ...rest] = name.split(' ');
    const lastName = rest.join(' ');
    
    // Check for admin user
    const isAdminEmail = email && email.toLowerCase() === 'taskigo.khadamati@gmail.com';
    if (isAdminEmail) {
      console.log('Admin email detected in Firebase auth:', email);
    }
    
    // Determine appropriate role
    const desiredRole = isAdminEmail ? 'admin' : 'client';
    
    // Special handling for the admin user - force specific settings
    if (isAdminEmail) {
      console.log('Setting up admin user in database');
      
      // Check if user exists in database first
      const existingUser = await storage.getUser(userId);
      if (existingUser) {
        console.log('Found existing admin user in database:', existingUser.id);
        
        // Force update the role and other fields for the admin user
        const updatedUser = await storage.updateUser(userId, {
          role: 'admin',
          firstName: 'Taskigo',
          lastName: 'Admin',
          isVerified: true,
          isActive: true
        });
        
        if (updatedUser && updatedUser.role === 'admin') {
          console.log('Admin role successfully updated for user:', userId);
        } else {
          console.warn('Failed to update admin role for user:', userId);
        }
        
        req.user = { 
          id: existingUser.id, 
          email: existingUser.email || '', 
          role: 'admin' // Force admin role regardless of what's in the database
        };
        
        await storage.createSystemLog?.({
          level: 'info',
          category: 'auth',
          message: `Admin user authenticated: ${email}`,
          userId: existingUser.id,
          metadata: { action: 'admin_login', ip: req.ip, forced: true }
        });
        
        return next();
      }
    }
    
    // Standard user handling for non-admin or new admin
    console.log('Upserting user in database:', { userId, email, role: desiredRole });
    const user = await storage.upsertUser({
      id: userId,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: desiredRole,
      isVerified: true,
      isActive: true,
    } as any);
    
    // Log admin login
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
    console.error('Firebase token verification failed:', e);
    return res.status(401).json({ message: 'Invalid auth token' });
  }
}

