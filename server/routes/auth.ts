import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { storage } from '../storage';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticate,
} from '../middleware/auth';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import admin from 'firebase-admin';
import { requireAuth } from '../middleware/roles';
import { 
  validate, 
  userValidation, 
  authLimiter 
} from '../middleware/security';
import { log } from '../middleware/log';
import { InsertUser, User } from '../../shared/schema';

// Define request body types
interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  language?: string;
}

interface AdminBody {
  email: string;
}

// Define custom request types
interface AuthRequest extends Request {
  user: {
    id: string;
    email: string | null;
    role: string;
  };
}

interface FirebaseAuthRequest extends Request {
  user: {
    id: string;
    email: string | null;
    role: string;
  };
}

const router = Router();

// Apply rate limiting to mutating/credential endpoints only
router.post('/signup', authLimiter);
router.post('/signin', authLimiter);
router.post('/forgot-password', authLimiter);
router.post('/reset-password', authLimiter);

// Sign up
const signupHandler: RequestHandler<ParamsDictionary, any, SignupBody> = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'client', language = 'en' } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with proper type
    const userData: InsertUser = {
      email,
      firstName,
      lastName,
      role,
      language,
      isVerified: false,
      isActive: true
    };

    const user = await storage.createUser(userData);
    
    // Note: local password storage is not used; Firebase handles auth. Keeping hash unused.

    // Create wallet for user
    await storage.createWallet({
      userId: user.id,
      balance: "0.00",
      currency: "USD",
      isActive: true
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email || '',
      role: user.role
    });

    // Log successful signup
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `User signed up`,
      userId: user.id,
      metadata: { action: 'signup', role: user.role, email: user.email }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language
      },
      token
    });
  } catch (error: any) {
    next(error);
  }
};

router.post('/signup', validate([
  userValidation.email,
  userValidation.password,
  userValidation.firstName,
  userValidation.lastName,
]), signupHandler);

// Sign in
router.post('/signin', validate([
  userValidation.email,
  userValidation.password
]), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is disabled' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email || '',
      role: user.role
    });

    // Create user session
    await storage.createUserSession({
      userId: user.id,
      token: token,
      deviceInfo: { userAgent: req.get('User-Agent') },
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true
    });

    // Log successful login (system log)
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `User logged in`,
      userId: user.id,
      metadata: { action: 'login', email: user.email, ip: req.ip }
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language
      },
      token
    });
  } catch (error: any) {
    log('error', 'auth.signin.fail', { error: error?.message });
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
});

// Get current user
const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const user = await storage.getUser(authReq.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      language: user.language,
      isVerified: user.isVerified,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error: any) {
    next(error);
  }
};

const getCurrentUserHandler: RequestHandler = (req, res, next) => {
  return getCurrentUser(req, res, next);
};

router.get('/me', authenticate, getCurrentUserHandler);

// Debug endpoint to check Firebase configuration
router.get('/debug-firebase', async (req, res) => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  // Test Firebase initialization
  let firebaseTest = 'not attempted';
  try {
    const admin = await import('firebase-admin');
    if (!admin.default.apps.length) {
      // Clean up the private key
      let cleanPrivateKey = privateKey;
      if (cleanPrivateKey) {
        cleanPrivateKey = cleanPrivateKey.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
      }
      admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId,
          clientEmail,
          privateKey: cleanPrivateKey as string
        }),
        storageBucket
      });
    }
    firebaseTest = 'success';
    await storage.createSystemLog({
      level: 'info',
      category: 'firebase',
      message: 'Firebase debug check',
      metadata: { result: firebaseTest, hasProjectId: !!projectId, hasClientEmail: !!clientEmail, hasStorageBucket: !!storageBucket }
    });
  } catch (error: any) {
    firebaseTest = 'error';
    log('warn', 'auth.debug_firebase.fail', { error: error?.message });
  }
  
  res.json({
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    hasStorageBucket: !!storageBucket,
    firebaseTest
  });
});

// Firebase-backed: current user profile
router.get('/me-firebase', firebaseAuthenticate as any, async (req: Request, res: Response) => {
  try {
    const fbReq = req as FirebaseAuthRequest;
    if (!fbReq.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(fbReq.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure admin role for configured admin email
    if (user.email?.toLowerCase() === 'taskigo.khadamati@gmail.com' && user.role !== 'admin') {
      await storage.updateUser(user.id, { role: 'admin' });
    }
    
    // Log firebase profile access
    await storage.createSystemLog({
      level: 'info',
      category: 'firebase',
      message: 'me-firebase accessed',
      userId: user.id,
      metadata: { email: user.email }
    });
    
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      language: user.language,
      isVerified: user.isVerified,
      profileImageUrl: user.profileImageUrl
    };
    res.json(userData);
  } catch (error: any) {
    log('error', 'auth.me_firebase.fail', { error: error?.message });
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `User logged out`,
      userId: (req as unknown as AuthRequest).user!.id,
      metadata: { action: 'logout' }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    log('error', 'auth.logout.fail', { error: error?.message });
    res.status(500).json({ message: 'Failed to logout' });
  }
});

// Forgot password (placeholder for now)
router.post('/forgot-password', validate([userValidation.email]), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `Password reset requested`,
      userId: user.id,
      metadata: { action: 'forgot_password', email }
    });

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error: any) {
    log('error', 'auth.forgot_password.fail', { error: error?.message });
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// Reset password (placeholder for now)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    log('error', 'auth.reset_password.fail', { error: error?.message });
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Setup admin account
const setupAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firebaseReq = req as FirebaseAuthRequest;
    const { email } = req.body;
    const userId = firebaseReq.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (email?.toLowerCase() !== 'taskigo.khadamati@gmail.com') {
      return res.status(403).json({ message: 'Forbidden - cannot set admin role for this email' });
    }
    
    let user = await storage.getUser(userId);
    
    if (!user) {
      const adminData: InsertUser = {
        email,
        firstName: 'Taskigo',
        lastName: 'Admin',
        role: 'admin',
        language: 'en',
        isVerified: true,
        isActive: true
      };
      user = await storage.createUser(adminData);
    } else if (user.role !== 'admin') {
      user = await storage.updateUser(userId, { 
        role: 'admin',
        firstName: user.firstName || 'Taskigo',
        lastName: user.lastName || 'Admin'
      });
    }
    
    await storage.createSystemLog({
      level: 'warn',
      category: 'auth',
      message: 'setup-admin used',
      userId,
      metadata: { email }
    });
    
    return res.json({ message: 'Admin role set successfully', user });
  } catch (error: any) {
    next(error);
  }
};

const setupAdminHandler: RequestHandler = (req, res, next) => {
  return setupAdmin(req, res, next);
};

router.post('/setup-admin', firebaseAuthenticate as any, setupAdminHandler);

// Direct admin login - bypass Firebase for emergency access
const directAdminLogin: RequestHandler<ParamsDictionary, any, AdminBody> = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Only allow admin email
    if (email?.toLowerCase() !== 'taskigo.khadamati@gmail.com') {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Verify referer is from our app domain or localhost
    const referer = req.headers.referer || req.headers.origin;
    const validReferer = !referer || 
      referer.includes('taskigo.net') || 
      referer.includes('localhost') ||
      referer.includes('127.0.0.1');
    if (!validReferer) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Rate limiting via simple in-memory map
    const clientIp = req.ip || '0.0.0.0';
    const hourlyKey = `admin_login_${clientIp}_${Math.floor(Date.now() / 3600000)}`;
    if (!(global as any).adminLoginAttempts) (global as any).adminLoginAttempts = new Map();
    const attempts = (global as any).adminLoginAttempts.get(hourlyKey) || 0;
    if (attempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts' });
    }
    (global as any).adminLoginAttempts.set(hourlyKey, attempts + 1);
    
    // Check or create admin user
    let adminUser = await storage.getUserByEmail(email);
    if (!adminUser) {
      const adminData: InsertUser = {
        email,
        firstName: 'Taskigo',
        lastName: 'Admin',
        role: 'admin',
        language: 'en',
        isVerified: true,
        isActive: true
      };
      adminUser = await storage.createUser(adminData);
      if (!adminUser) {
        return res.status(500).json({ message: 'Failed to create admin user' });
      }
    } else if (adminUser.role !== 'admin') {
      adminUser = await storage.updateUser(adminUser.id, { 
        role: 'admin',
        isActive: true
      });
      if (!adminUser) {
        return res.status(500).json({ message: 'Failed to update admin user' });
      }
    }
    
    // Generate admin token
    const token = generateToken({
      id: adminUser.id,
      email: adminUser.email || '',
      role: 'admin'
    });
    
    // Log admin direct login usage
    await storage.createSystemLog({
      level: 'warn',
      category: 'auth',
      message: `Admin direct login used`,
      userId: adminUser.id,
      metadata: { email, ip: req.ip }
    });
    
    res.cookie('admin_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return res.json({
      message: 'Admin access granted',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName || 'Taskigo',
        lastName: adminUser.lastName || 'Admin',
        role: 'admin'
      },
      token
    });
  } catch (error: any) {
    next(error);
  }
};

router.post('/direct-admin-login', directAdminLogin);

export default router;

// Claims/me endpoint using Firebase token
router.get('/claims', requireAuth as any, async (req: Request, res: Response) => {
  try {
    const u: any = (req as any).user;
    return res.json({
      uid: u.uid,
      email: u.email,
      claims: {
        admin: !!u.admin,
        provider: !!u.provider
      }
    });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to get auth info' });
  }
});

// Admin approval endpoint to set provider claim
router.post('/applications/:uid/approve', requireAuth as any, async (req, res) => {
  try {
    const caller: any = (req as any).user;
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const isAdminEmail = caller?.email && caller.email.toLowerCase() === adminEmail;
    if (!isAdminEmail) return res.status(403).json({ error: 'Forbidden' });
    const { uid } = req.params;
    await admin.auth().setCustomUserClaims(uid, { provider: true });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to approve application' });
  }
});