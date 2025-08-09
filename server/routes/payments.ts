import { Router } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, paymentLimiter } from '../middleware/security';
import { body } from 'express-validator';

const router = Router();

// Initialize Stripe (if available)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

// All payment routes require authentication and rate limiting
router.use(authenticate);
router.use(paymentLimiter);

// Create Stripe payment session
router.post('/create-stripe-session', validate([
  body('bookingId').isInt({ min: 1 }).withMessage('Valid booking ID required'),
  body('successUrl').isURL().withMessage('Valid success URL required'),
  body('cancelUrl').isURL().withMessage('Valid cancel URL required'),
]), async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured. Please add STRIPE_SECRET_KEY.' });
    }

    const { bookingId, successUrl, cancelUrl } = req.body;
    const userId = req.user!.id;

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user owns this booking
    if (booking.clientId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    // Get service for description
    const service = await storage.getService(booking.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Calculate platform fee (e.g., 10%)
    const totalAmount = parseFloat(booking.totalAmount);
    const platformFee = totalAmount * 0.1;
    const providerAmount = totalAmount - platformFee;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: service.description?.substring(0, 300),
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: booking.id.toString(),
        userId,
        serviceId: service.id.toString(),
        providerId: booking.providerId,
      },
    });

    // Create payment record
    const payment = await storage.createPayment({
      bookingId: booking.id,
      userId,
      providerId: booking.providerId,
      method: 'stripe',
      amount: totalAmount.toString(),
      currency: 'USD',
      status: 'pending',
      stripePaymentIntentId: session.payment_intent as string,
      platformFee: platformFee.toString(),
      metadata: {
        sessionId: session.id,
        providerAmount: providerAmount.toString()
      }
    });

    // Log payment initiation
    await storage.createSystemLog({
      level: 'info',
      category: 'payment',
      message: `Payment session created for booking ${bookingId}`,
      userId,
      metadata: {
        action: 'create_session',
        paymentId: payment.id,
        amount: totalAmount.toString(),
        method: 'stripe'
      }
    });

    res.json({
      sessionId: session.id,
      sessionUrl: session.url,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('Create Stripe session error:', error);
    res.status(500).json({ message: 'Failed to create payment session' });
  }
});

// Verify payment completion
router.post('/verify-payment', validate([
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID required'),
]), async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    const { paymentIntentId } = req.body;
    const userId = req.user!.id;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Find payment record
    const payments = await storage.getPayments({ userId });
    const payment = payments.find(p => p.stripePaymentIntentId === paymentIntentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update payment status
    await storage.updatePayment(payment.id, {
      status: 'paid',
      txnId: paymentIntent.id,
      metadata: {
        ...payment.metadata,
        completedAt: new Date().toISOString(),
        stripeChargeId: paymentIntent.charges?.data[0]?.id
      }
    });

    // Update booking payment status
    await storage.updateBooking(payment.bookingId, {
      paymentStatus: 'paid'
    });

    // Update provider wallet balance
    const providerAmount = parseFloat(payment.metadata?.providerAmount || '0');
    if (providerAmount > 0) {
      const wallet = await storage.getWallet(payment.providerId);
      if (wallet) {
        await storage.updateWalletBalance(payment.providerId, providerAmount);
      }
    }

    // Create notifications
    await storage.createNotification({
      userId: payment.providerId,
      title: 'Payment Received',
      message: `You've received a payment of $${providerAmount.toFixed(2)}`,
      type: 'payment',
      metadata: {
        paymentId: payment.id,
        amount: providerAmount.toString()
      }
    });

    // Log successful payment
    await storage.createSystemLog({
      level: 'info',
      category: 'payment',
      message: `Payment completed: ${payment.id}`,
      userId,
      metadata: {
        action: 'verify_success',
        paymentId: payment.id,
        amount: payment.amount,
        platformFee: payment.platformFee
      }
    });

    res.json({
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: 'paid',
        completedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// Get payment history
router.get('/history', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const payments = await storage.getPayments({ 
      userId,
      status: status as string 
    });

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedPayments = payments.slice(startIndex, startIndex + limitNum);

    // Enhance payments with booking details
    const enhancedPayments = await Promise.all(
      paginatedPayments.map(async (payment) => {
        const booking = await storage.getBooking(payment.bookingId);
        const service = booking ? await storage.getService(booking.serviceId) : null;
        
        return {
          ...payment,
          booking: booking ? {
            id: booking.id,
            scheduledDate: booking.scheduledDate,
            status: booking.status
          } : null,
          service: service ? {
            title: service.title,
            titleAr: service.titleAr
          } : null
        };
      })
    );

    res.json({
      payments: enhancedPayments,
      totalCount: payments.length,
      hasMore: startIndex + limitNum < payments.length
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to get payment history' });
  }
});

// Process refund
router.post('/refund', validate([
  body('paymentId').isInt({ min: 1 }).withMessage('Valid payment ID required'),
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Refund reason must be 10-500 characters'),
  body('amount').optional().isDecimal().withMessage('Valid amount required'),
]), async (req: AuthRequest, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    const { paymentId, reason, amount } = req.body;
    const userId = req.user!.id;

    const payment = await storage.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions (user owns payment or is admin)
    if (payment.userId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if payment can be refunded
    if (payment.status !== 'paid') {
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }

    // Calculate refund amount
    const refundAmount = amount ? parseFloat(amount) : parseFloat(payment.amount);
    const maxRefund = parseFloat(payment.amount);

    if (refundAmount > maxRefund) {
      return res.status(400).json({ message: 'Refund amount exceeds payment amount' });
    }

    // Process refund with Stripe
    let stripeRefund;
    if (payment.stripePaymentIntentId) {
      stripeRefund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          paymentId: payment.id.toString(),
          refundReason: reason
        }
      });
    }

    // Update payment record
    await storage.updatePayment(payment.id, {
      status: 'refunded',
      refundReason: reason,
      metadata: {
        ...payment.metadata,
        refundedAt: new Date().toISOString(),
        refundAmount: refundAmount.toString(),
        stripeRefundId: stripeRefund?.id
      }
    });

    // Update booking payment status
    await storage.updateBooking(payment.bookingId, {
      paymentStatus: 'refunded'
    });

    // Adjust provider wallet balance
    const providerAmount = parseFloat(payment.metadata?.providerAmount || '0');
    if (providerAmount > 0) {
      await storage.updateWalletBalance(payment.providerId, -providerAmount);
    }

    // Create notifications
    await storage.createNotification({
      userId: payment.userId,
      title: 'Refund Processed',
      message: `Your refund of $${refundAmount.toFixed(2)} has been processed`,
      type: 'payment',
      metadata: {
        paymentId: payment.id,
        refundAmount: refundAmount.toString()
      }
    });

    await storage.createNotification({
      userId: payment.providerId,
      title: 'Payment Refunded',
      message: `A payment has been refunded. Amount: $${refundAmount.toFixed(2)}`,
      type: 'payment',
      metadata: {
        paymentId: payment.id,
        refundAmount: refundAmount.toString()
      }
    });

    // Log refund
    await storage.createSystemLog({
      level: 'info',
      category: 'payment',
      message: `Refund processed: ${payment.id}`,
      userId,
      metadata: {
        action: 'refund',
        paymentId: payment.id,
        refundAmount: refundAmount.toString(),
        reason
      }
    });

    res.json({
      message: 'Refund processed successfully',
      refund: {
        paymentId: payment.id,
        refundAmount: refundAmount.toFixed(2),
        status: 'refunded',
        reason
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Apple Pay session creation
router.post('/apple-pay/session', validate([
  body('validationURL').isURL().withMessage('Valid validation URL required'),
]), async (req: AuthRequest, res) => {
  try {
    // This is a simplified Apple Pay session creation
    // In production, you would validate with Apple's servers
    const { validationURL } = req.body;
    
    // Mock Apple Pay session for development
    res.json({
      epochTimestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      merchantSessionIdentifier: `session-${Date.now()}`,
      merchantIdentifier: 'merchant.com.taskego.app',
      displayName: 'Taskego',
      domainName: req.get('host'),
      signature: 'mock-signature'
    });
  } catch (error) {
    console.error('Apple Pay session error:', error);
    res.status(500).json({ message: 'Failed to create Apple Pay session' });
  }
});

// Process Apple Pay payment
router.post('/apple-pay/process', validate([
  body('bookingId').isInt({ min: 1 }).withMessage('Valid booking ID required'),
  body('paymentData').notEmpty().withMessage('Payment data required'),
]), async (req: AuthRequest, res) => {
  try {
    const { bookingId, paymentData } = req.body;
    const userId = req.user!.id;

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.clientId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // For development, we'll create a successful payment record
    // In production, you would process the Apple Pay token
    const payment = await storage.createPayment({
      bookingId: booking.id,
      userId,
      providerId: booking.providerId,
      method: 'applepay',
      amount: booking.totalAmount,
      currency: 'USD',
      status: 'paid',
      txnId: `apple-pay-${Date.now()}`,
      platformFee: (parseFloat(booking.totalAmount) * 0.1).toString(),
      metadata: {
        paymentData: 'encrypted-apple-pay-data',
        completedAt: new Date().toISOString()
      }
    });

    // Update booking
    await storage.updateBooking(booking.id, {
      paymentStatus: 'paid'
    });

    // Log Apple Pay payment
    await storage.createSystemLog({
      level: 'info',
      category: 'payment',
      message: `Apple Pay payment processed: ${payment.id}`,
      userId,
      metadata: {
        action: 'apple_pay',
        paymentId: payment.id,
        amount: payment.amount
      }
    });

    res.json({
      message: 'Apple Pay payment processed successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Apple Pay process error:', error);
    res.status(500).json({ message: 'Failed to process Apple Pay payment' });
  }
});

export default router;