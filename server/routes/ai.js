const express = require('express');
const { 
  chatWithAI, 
  getServiceRecommendations, 
  analyzeReviewSentiment, 
  getPricingSuggestions 
} = require('../controllers/aiController');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         response:
 *           type: string
 *         language:
 *           type: string
 *           enum: [en, ar]
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/chat-ai/message:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the AI
 *               language:
 *                 type: string
 *                 enum: [en, ar]
 *                 default: en
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 aiProvider:
 *                   type: string
 *                 language:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: AI service error
 */
router.post('/message', 
  optionalAuth,
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters'),
    body('language')
      .optional()
      .isIn(['en', 'ar'])
      .withMessage('Language must be either en or ar'),
    handleValidationErrors
  ],
  chatWithAI
);

/**
 * @swagger
 * /api/ai/recommendations:
 *   post:
 *     summary: Get AI-powered service recommendations
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language service request
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *               budget:
 *                 type: number
 *               category:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [en, ar]
 *     responses:
 *       200:
 *         description: Service recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 aiExplanation:
 *                   type: string
 *                 totalAvailable:
 *                   type: number
 *                 aiProvider:
 *                   type: string
 */
router.post('/recommendations',
  optionalAuth,
  [
    body('query')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Query must be less than 500 characters'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number'),
    body('language')
      .optional()
      .isIn(['en', 'ar'])
      .withMessage('Language must be either en or ar'),
    handleValidationErrors
  ],
  getServiceRecommendations
);

/**
 * @swagger
 * /api/ai/sentiment:
 *   post:
 *     summary: Analyze sentiment of review text
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to analyze
 *               language:
 *                 type: string
 *                 enum: [en, ar]
 *     responses:
 *       200:
 *         description: Sentiment analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sentiment:
 *                   type: string
 *                   enum: [positive, negative, neutral]
 *                 confidence:
 *                   type: number
 *                 keywords:
 *                   type: array
 *                   items:
 *                     type: string
 *                 aiProvider:
 *                   type: string
 */
router.post('/sentiment',
  auth,
  [
    body('text')
      .trim()
      .isLength({ min: 5, max: 2000 })
      .withMessage('Text must be between 5 and 2000 characters'),
    body('language')
      .optional()
      .isIn(['en', 'ar'])
      .withMessage('Language must be either en or ar'),
    handleValidationErrors
  ],
  analyzeReviewSentiment
);

/**
 * @swagger
 * /api/ai/pricing:
 *   post:
 *     summary: Get AI-powered pricing suggestions
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - subcategory
 *             properties:
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *               serviceDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pricing analysis and suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 marketAnalysis:
 *                   type: object
 *                 recommendations:
 *                   type: object
 *                 aiSuggestion:
 *                   type: string
 *                 aiProvider:
 *                   type: string
 */
router.post('/pricing',
  auth,
  [
    body('category')
      .isIn(['maintenance', 'cleaning', 'delivery', 'events', 'care', 'gardens', 'auto', 'tech', 'admin'])
      .withMessage('Invalid category'),
    body('subcategory')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subcategory must be between 2 and 100 characters'),
    body('serviceDetails')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Service details must be less than 1000 characters'),
    handleValidationErrors
  ],
  getPricingSuggestions
);

module.exports = router;