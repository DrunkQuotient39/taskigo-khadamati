const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['client', 'provider'])
    .withMessage('Role must be either client or provider'),
  body('language')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Language must be either en or ar')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateNewPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Service validation rules
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('category')
    .isIn(['maintenance', 'cleaning', 'delivery', 'events', 'care', 'gardens', 'auto', 'tech', 'admin'])
    .withMessage('Invalid category'),
  body('subcategory')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subcategory must be between 2 and 50 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('location.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required and must be between 2 and 50 characters')
];

// Booking validation rules
const validateBooking = [
  body('serviceId')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Valid date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format required (HH:MM)'),
  body('duration')
    .optional()
    .isFloat({ min: 0.5, max: 12 })
    .withMessage('Duration must be between 0.5 and 12 hours')
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('text')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review text must be between 10 and 1000 characters'),
  body('bookingId')
    .isMongoId()
    .withMessage('Valid booking ID is required')
];

// Wallet validation rules
const validateWalletRecharge = [
  body('amount')
    .isFloat({ min: 10, max: 10000 })
    .withMessage('Amount must be between 10 and 10000'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer'])
    .withMessage('Invalid payment method')
];

// Query parameter validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateServiceFilters = [
  query('category')
    .optional()
    .isIn(['maintenance', 'cleaning', 'delivery', 'events', 'care', 'gardens', 'auto', 'tech', 'admin'])
    .withMessage('Invalid category'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be non-negative'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be non-negative'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  query('sortBy')
    .optional()
    .isIn(['price', 'rating', 'distance', 'newest'])
    .withMessage('Invalid sort option')
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  validateService,
  validateBooking,
  validateReview,
  validateWalletRecharge,
  validatePagination,
  validateServiceFilters,
  validateObjectId
};