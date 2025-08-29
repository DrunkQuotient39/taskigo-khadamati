import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { storage } from '../storage';
import { log } from './log';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next*/) => {
    // Structured log for throttling
    try { console.warn(JSON.stringify({ ts: new Date().toISOString(), level: 'warn', message: 'rate_limited', path: req.originalUrl })); } catch {}
    res.status(429).json({ message: 'Too many requests' });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === 'development',
  handler: (req, res /*, next*/) => {
    try { console.warn(JSON.stringify({ ts: new Date().toISOString(), level: 'warn', message: 'auth_rate_limited', path: req.originalUrl })); } catch {}
    res.status(429).json({ message: 'Too many authentication attempts' });
  },
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: 'Too many AI requests, please slow down.',
});

export const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 payment requests per minute
  message: 'Too many payment requests, please try again later.',
});

// Security headers configuration
export const securityHeaders = process.env.NODE_ENV === 'development'
  ? helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  : helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'", "'unsafe-eval'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https:"],
          connectSrc: ["'self'", "https:", "wss:", "ws:", "blob:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    });

// CORS configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://localhost:3000',
      'https://localhost:5000',
      /\.replit\.app$/,
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /\.onrender\.com$/,
      process.env.RENDER_EXTERNAL_URL,
      // Custom domain(s)
      'https://taskigo.net',
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
      // Comma-separated list of extra origins
      ...((process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean)),
    ].filter(Boolean as any);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      log('warn', 'cors.denied', { origin, path: 'CORS', reason: 'origin_not_allowed' });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Input validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.array().length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map(err => extractedErrors.push({ [err.type]: err.msg }));

    return res.status(422).json({
      errors: extractedErrors,
    });
  };
};

// Common validation rules
export const userValidation = {
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  password: body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  firstName: body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  lastName: body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  phone: body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
};

export const serviceValidation = {
  title: body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  description: body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
  price: body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price required'),
  categoryId: body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID required'),
};

export const bookingValidation = {
  serviceId: body('serviceId').isInt({ min: 1 }).withMessage('Valid service ID required'),
  scheduledDate: body('scheduledDate').isISO8601().withMessage('Valid date required'),
  scheduledTime: body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
  clientAddress: body('clientAddress').trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
  clientPhone: body('clientPhone').isMobilePhone('any').withMessage('Valid phone number required'),
};

export const reviewValidation = {
  rating: body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  comment: body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be max 500 characters'),
};

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize all string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// Request logging middleware
export const logRequest = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log request
  await storage.createSystemLog({
    level: 'info',
    category: 'http',
    message: `${req.method} ${req.originalUrl}`,
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9),
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log response when finished
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    await storage.createSystemLog({
      level: res.statusCode >= 400 ? 'error' : 'info',
      category: 'http',
      message: `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      metadata: {
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length'),
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });

  next();
};

// Error handling middleware
export const errorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log error
  await storage.createSystemLog({
    level: 'error',
    category: 'error',
    message: error.message || 'Unknown error occurred',
    metadata: {
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.statusCode || 500).json({
    message: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  });
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};