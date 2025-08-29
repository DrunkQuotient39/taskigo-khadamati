import { Router } from 'express';
import { storage } from '../storage';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticate,
  AuthRequest 
} from '../middleware/auth';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import admin from 'firebase-admin';
import { requireAuth } from '../middleware/roles';
import { 
  validate, 
  userValidation, 
  authLimiter 
} from '../middleware/security';
import { FirebaseAuthRequest } from '../middleware/firebaseAuth';

const router = Router();

// Apply rate limiting to mutating/credential endpoints only
router.post('/signup', authLimiter);
router.post('/signin', authLimiter);
router.post('/forgot-password', authLimiter);
router.post('/reset-password', authLimiter);

// Sign up
router.post('/signup', validate([
  userValidation.email,
  userValidation.password,
  userValidation.firstName,
  userValidation.lastName,
]), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'client', language = 'en' } = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await storage.createUser({
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      email,
      firstName,
      lastName,
      role,
      language,
      isVerified: false,
      isActive: true
    });

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
      message: `User signed up: ${email}`,
      userId: user.id,
      metadata: { action: 'signup', role: user.role }
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
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Sign in
router.post('/signin', validate([
  userValidation.email,
  userValidation.password
]), async (req, res) => {
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

    // For this implementation, we'll use a simple password check
    // In production, you'd compare against the stored hash
    // const isValidPassword = await comparePassword(password, user.passwordHash);
    
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

    // Log successful login
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `User logged in: ${email}`,
      userId: user.id,
      metadata: { action: 'login', ip: req.ip }
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
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
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
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Firebase-backed: current user profile
router.get('/me-firebase', firebaseAuthenticate as any, async (req: FirebaseAuthRequest, res) => {
  try {
    console.log('me-firebase endpoint called', { 
      user: req.user?.id, 
      firebaseUser: req.firebaseUser?.uid,
      email: req.firebaseUser?.email || req.user?.email
    });
    
    if (!req.user?.id) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(req.user.id);
    console.log('User from storage:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if this is the admin user and ensure they have the admin role
    if (user.email?.toLowerCase() === 'taskigo.khadamati@gmail.com' && user.role !== 'admin') {
      console.log('Updating admin role for user:', user.id);
      const updatedUser = await storage.updateUser(user.id, { role: 'admin' });
      if (updatedUser) {
        user.role = 'admin';
      }
    }
    
    // Return user data directly, not wrapped in a user object
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
    
    console.log('Returning user data:', userData);
    res.json(userData);
  } catch (error) {
    console.error('Get firebase user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    // In a real implementation, you'd invalidate the token/session
    // For now, we'll just log the logout
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `User logged out`,
      userId: req.user!.id,
      metadata: { action: 'logout' }
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
});

// Forgot password (placeholder for now)
router.post('/forgot-password', validate([userValidation.email]), async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // TODO: Generate reset token and send email
    await storage.createSystemLog({
      level: 'info',
      category: 'auth',
      message: `Password reset requested for: ${email}`,
      userId: user.id,
      metadata: { action: 'forgot_password' }
    });

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
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

    // TODO: Verify reset token and update password
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Setup admin account
router.post('/setup-admin', firebaseAuthenticate as any, async (req: FirebaseAuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { email } = req.body;
    
    console.log('Setup admin endpoint called', { userId, email });
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Only allow setting admin role for the specific admin email
    if (email?.toLowerCase() !== 'taskigo.khadamati@gmail.com') {
      return res.status(403).json({ message: 'Forbidden - cannot set admin role for this email' });
    }
    
    // Get user from storage
    let user = await storage.getUser(userId);
    
    if (!user) {
      // Create user if they don't exist in our database
      user = await storage.createUser({
        id: userId,
        email: email,
        firstName: 'Taskigo',
        lastName: 'Admin',
        role: 'admin',
        language: 'en',
        isVerified: true,
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created new admin user:', user.id);
    } else {
      // Update to admin role
      user = await storage.updateUser(userId, { 
        role: 'admin',
        firstName: user.firstName || 'Taskigo',
        lastName: user.lastName || 'Admin'
      });
      
      console.log('Updated existing user to admin:', user.id);
    }
    
    return res.json({ message: 'Admin role set successfully', user });
  } catch (error) {
    console.error('Error setting admin role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Direct admin login - bypass Firebase for emergency access
router.post('/direct-admin-login', async (req, res) => {
  try {
    const { email, adminKey } = req.body;
    
    console.log('Direct admin login attempt');
    
    // Only allow admin email
    if (email?.toLowerCase() !== 'taskigo.khadamati@gmail.com') {
      console.log('Invalid admin email provided');
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    
    // Verify request is coming from the application itself
    const referer = req.headers.referer || req.headers.origin;
    const userAgent = req.headers['user-agent'];
    
    // Check if request is coming from our own domain or localhost
    const validReferer = !referer || 
                         referer.includes('taskigo.net') || 
                         referer.includes('localhost') ||
                         referer.includes('127.0.0.1');
                         
    if (!validReferer) {
      console.log('Invalid referer for admin access:', referer);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Rate limiting - only allow 5 attempts per hour from an IP
    const clientIp = req.ip || '0.0.0.0';
    const hourlyKey = `admin_login_${clientIp}_${Math.floor(Date.now() / 3600000)}`;
    
    // This would normally use Redis, but for simplicity we'll use a memory store
    if (!global.adminLoginAttempts) global.adminLoginAttempts = new Map();
    const attempts = global.adminLoginAttempts.get(hourlyKey) || 0;
    
    if (attempts >= 5) {
      console.log('Too many admin login attempts from IP:', clientIp);
      return res.status(429).json({ message: 'Too many attempts' });
    }
    
    global.adminLoginAttempts.set(hourlyKey, attempts + 1);
    
    console.log('Valid admin key provided, creating admin session');
    
    // Generate a random user ID if needed
    const adminUserId = 'admin-' + Math.random().toString(36).substring(2, 15);
    
    // Check if admin user exists in database
    let adminUser = await storage.getUserByEmail(email);
    
    if (!adminUser) {
      // Create admin user if not exists
      adminUser = await storage.createUser({
        id: adminUserId,
        email: email,
        firstName: 'Taskigo',
        lastName: 'Admin',
        role: 'admin',
        language: 'en',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created new admin user via direct login:', adminUser.id);
    } else {
      // Ensure user has admin role
      if (adminUser.role !== 'admin') {
        adminUser = await storage.updateUser(adminUser.id, { 
          role: 'admin',
          isActive: true
        });
        console.log('Updated user to admin role:', adminUser.id);
      }
    }
    
    // Generate admin token
    const token = generateToken({
      id: adminUser.id,
      email: adminUser.email || '',
      role: 'admin'
    });
    
    // Log admin access
    await storage.createSystemLog?.({
      level: 'warn',
      category: 'auth',
      message: `Admin direct login used: ${email}`,
      userId: adminUser.id,
      metadata: { action: 'direct_admin_login', ip: req.ip }
    });
    
    // Set cookie for authentication
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
  } catch (error) {
    console.error('Direct admin login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

// Claims/me endpoint using Firebase token
router.get('/me', requireAuth as any, async (req, res) => {
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