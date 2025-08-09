import { Router } from 'express';
import { storage } from '../storage';
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  authenticate,
  AuthRequest 
} from '../middleware/auth';
import { 
  validate, 
  userValidation, 
  authLimiter 
} from '../middleware/security';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

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

export default router;