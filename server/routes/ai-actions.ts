import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { processAIAction, AIActionRequest } from '../ai-actions';
import { storage } from '../storage';
// Using any for request since AuthRequest type is not exported

const router = Router();

// Middleware to validate AI action requests
const validateAIAction = [
  body('action').notEmpty().withMessage('Action is required'),
  body('parameters').isObject().withMessage('Parameters must be an object'),
  body('sessionId').notEmpty().withMessage('Session ID is required')
];

/**
 * Process an AI action
 * Some actions require authentication, others don't
 */
router.post('/action', validateAIAction, async (req: any, res: any) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }

  try {
    const { action, parameters, sessionId, confirmationToken } = req.body;
    
    // Create action request
    const actionRequest: AIActionRequest = {
      action,
      parameters,
      sessionId,
      confirmationToken
    };
    
    // Check if user is authenticated
    if (req.user?.id) {
      actionRequest.userId = req.user.id;
    }
    
    // Process the action
    const result = await processAIAction(actionRequest);
    
    // Log the action
    await storage.createSystemLog({
      level: 'info',
      category: 'ai_action',
      message: `AI action processed: ${action}`,
      userId: req.user?.id,
      metadata: {
        action,
        success: result.success,
        sessionId,
        requiresConfirmation: result.requiresConfirmation || false
      }
    });
    
    return res.json(result);
  } catch (error: any) {
    console.error('AI action endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});

/**
 * Authenticated actions
 * These endpoints require the user to be logged in
 */
router.use(firebaseAuthenticate as any);

/**
 * Get user's bookings for AI assistant
 * This helps the AI provide information about the user's bookings
 */
router.get('/bookings', async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const allBookings = await storage.getBookings();
    const bookings = allBookings.filter(b => b.clientId === userId);
    
    // Map to simplified format
    const simplifiedBookings = bookings.map((b: any) => ({
      id: b.id,
      serviceId: b.serviceId,
      serviceTitle: b.serviceTitle || 'Service',
      scheduledDate: b.scheduledDate,
      scheduledTime: b.scheduledTime,
      status: b.status,
      totalAmount: b.totalAmount,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt
    }));
    
    res.json({
      success: true,
      result: {
        bookings: simplifiedBookings
      }
    });
  } catch (error: any) {
    console.error('AI bookings fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch bookings'
    });
  }
});

export default router;
