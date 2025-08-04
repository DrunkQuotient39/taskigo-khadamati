const express = require('express');
const {
  createApplePaySession,
  processApplePayment,
  createPaymentIntent,
  getPaymentHistory,
  getPaymentDetails,
  requestRefund,
  getSupportedPaymentMethods
} = require('../controllers/paymentController');
const { auth, authorize } = require('../middleware/auth');
const { body, param, query, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [USD, LBP, EUR]
 *         paymentMethod:
 *           type: string
 *           enum: [apple_pay, card, bank_transfer, wallet, cash]
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded]
 *         receiptNumber:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/payments/apple-pay/session:
 *   post:
 *     summary: Create Apple Pay merchant session
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - validationURL
 *               - domain
 *             properties:
 *               validationURL:
 *                 type: string
 *                 description: Apple Pay validation URL
 *               domain:
 *                 type: string
 *                 description: Merchant domain
 *     responses:
 *       200:
 *         description: Apple Pay session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 merchantSession:
 *                   type: object
 *                 config:
 *                   type: object
 *       400:
 *         description: Invalid domain or validation error
 */
router.post('/apple-pay/session',
  [
    body('validationURL')
      .isURL()
      .withMessage('Valid Apple Pay validation URL is required'),
    body('domain')
      .isLength({ min: 3, max: 100 })
      .withMessage('Valid domain is required'),
    handleValidationErrors
  ],
  createApplePaySession
);

/**
 * @swagger
 * /api/payments/apple-pay/process:
 *   post:
 *     summary: Process Apple Pay payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentData
 *               - paymentMethod
 *               - transactionIdentifier
 *               - amount
 *             properties:
 *               paymentData:
 *                 type: object
 *                 description: Encrypted Apple Pay payment data
 *               paymentMethod:
 *                 type: object
 *                 properties:
 *                   displayName:
 *                     type: string
 *                   network:
 *                     type: string
 *                   type:
 *                     type: string
 *               transactionIdentifier:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 default: USD
 *               bookingId:
 *                 type: string
 *                 description: Optional booking ID for service payments
 *     responses:
 *       200:
 *         description: Apple Pay payment processed successfully
 *       400:
 *         description: Invalid payment data
 *       404:
 *         description: Booking not found
 */
router.post('/apple-pay/process',
  auth,
  [
    body('paymentData')
      .notEmpty()
      .withMessage('Apple Pay payment data is required'),
    body('paymentMethod')
      .isObject()
      .withMessage('Apple Pay payment method is required'),
    body('transactionIdentifier')
      .isLength({ min: 10, max: 100 })
      .withMessage('Valid transaction identifier is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 100000 })
      .withMessage('Amount must be between $0.01 and $100,000'),
    body('currency')
      .optional()
      .isIn(['USD', 'LBP', 'EUR'])
      .withMessage('Currency must be USD, LBP, or EUR'),
    body('bookingId')
      .optional()
      .isMongoId()
      .withMessage('Valid booking ID is required'),
    handleValidationErrors
  ],
  processApplePayment
);

/**
 * @swagger
 * /api/payments/intent:
 *   post:
 *     summary: Create payment intent for any payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 default: USD
 *               paymentMethod:
 *                 type: string
 *                 enum: [apple_pay, card, bank_transfer, wallet]
 *               bookingId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/intent',
  auth,
  [
    body('amount')
      .isFloat({ min: 0.01, max: 100000 })
      .withMessage('Amount must be between $0.01 and $100,000'),
    body('paymentMethod')
      .isIn(['apple_pay', 'card', 'bank_transfer', 'wallet'])
      .withMessage('Invalid payment method'),
    body('currency')
      .optional()
      .isIn(['USD', 'LBP', 'EUR'])
      .withMessage('Currency must be USD, LBP, or EUR'),
    body('bookingId')
      .optional()
      .isMongoId()
      .withMessage('Valid booking ID is required'),
    body('description')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Description must be less than 200 characters'),
    handleValidationErrors
  ],
  createPaymentIntent
);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [apple_pay, card, bank_transfer, wallet, cash]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   type: object
 */
router.get('/history',
  auth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
      .withMessage('Invalid status filter'),
    query('paymentMethod')
      .optional()
      .isIn(['apple_pay', 'card', 'bank_transfer', 'wallet', 'cash'])
      .withMessage('Invalid payment method filter'),
    handleValidationErrors
  ],
  getPaymentHistory
);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       404:
 *         description: Payment not found
 *       403:
 *         description: Unauthorized access
 */
router.get('/:paymentId',
  auth,
  [
    param('paymentId')
      .isMongoId()
      .withMessage('Valid payment ID is required'),
    handleValidationErrors
  ],
  getPaymentDetails
);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Request payment refund
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Partial refund amount (optional, defaults to full refund)
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Invalid refund request
 *       404:
 *         description: Payment not found
 */
router.post('/:paymentId/refund',
  auth,
  [
    param('paymentId')
      .isMongoId()
      .withMessage('Valid payment ID is required'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Refund amount must be positive'),
    body('reason')
      .isLength({ min: 10, max: 500 })
      .withMessage('Refund reason must be between 10 and 500 characters'),
    handleValidationErrors
  ],
  requestRefund
);

/**
 * @swagger
 * /api/payments/methods/supported:
 *   get:
 *     summary: Get supported payment methods
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *           default: LB
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: USD
 *     responses:
 *       200:
 *         description: Supported payment methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 country:
 *                   type: string
 *                 currency:
 *                   type: string
 *                 supportedMethods:
 *                   type: object
 */
router.get('/methods/supported',
  [
    query('country')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Country must be a 2-letter country code'),
    query('currency')
      .optional()
      .isIn(['USD', 'LBP', 'EUR'])
      .withMessage('Currency must be USD, LBP, or EUR'),
    handleValidationErrors
  ],
  getSupportedPaymentMethods
);

module.exports = router;