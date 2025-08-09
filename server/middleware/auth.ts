import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// JWT token generation
export const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer token
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token) as any;
    
    // Get user from database to ensure they still exist
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is disabled' });
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions', 
        required: allowedRoles,
        current: req.user.role 
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        const decoded = verifyToken(token) as any;
        const user = await storage.getUser(decoded.id);
        
        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email || '',
            role: user.role
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Extract user ID from request
export const getUserId = (req: AuthRequest): string | null => {
  return req.user?.id || null;
};

// Check if user has role
export const hasRole = (req: AuthRequest, role: string): boolean => {
  return req.user?.role === role;
};

// Check if user is admin
export const isAdmin = (req: AuthRequest): boolean => {
  return hasRole(req, 'admin');
};

// Check if user is provider
export const isProvider = (req: AuthRequest): boolean => {
  return hasRole(req, 'provider');
};

// Check if user is client
export const isClient = (req: AuthRequest): boolean => {
  return hasRole(req, 'client');
};