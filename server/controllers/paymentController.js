const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const crypto = require('crypto');

// Apple Pay Configuration
const APPLE_PAY_CONFIG = {
  merchantId: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.com.taskego.app',
  merchantName: 'Taskego',
  countryCode: 'LB', // Lebanon
  currencyCode: 'USD',
  supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
  merchantCapabilities: ['supports3DS', 'supportsEMV', 'supportsCredit', 'supportsDebit'],
  supportedCountries: ['LB', 'US', 'CA', 'AE', 'SA']
};

// Initialize Apple Pay session
const createApplePaySession = async (req, res) => {
  try {
    const { validationURL, domain } = req.body;
    
    // Validate domain (security check)
    const allowedDomains = [
      'localhost:5000',
      'taskego.replit.app',
      process.env.FRONTEND_DOMAIN
    ].filter(Boolean);
    
    if (!allowedDomains.some(allowedDomain => domain.includes(allowedDomain))) {
      return res.status(400).json({
        message: 'Invalid domain for Apple Pay session'
      });
    }

    // In production, you would validate with Apple's servers
    // For now, we'll return a mock session for development
    const merchantSession = {
      epochTimestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      merchantSessionIdentifier: crypto.randomUUID(),
      nonce: crypto.randomBytes(16).toString('hex'),
      merchantIdentifier: APPLE_PAY_CONFIG.merchantId,
      domainName: domain,
      displayName: APPLE_PAY_CONFIG.merchantName,
      signature: 'mock_signature_for_development'
    };

    res.json({
      merchantSession,
      config: APPLE_PAY_CONFIG
    });

  } catch (error) {
    console.error('Apple Pay session creation error:', error);
    res.status(500).json({
      message: 'Failed to create Apple Pay session',
      error: error.message
    });
  }
};

// Process Apple Pay payment
const processApplePayment = async (req, res) => {
  try {
    const { 
      paymentData, 
      paymentMethod, 
      transactionIdentifier,
      bookingId,
      amount,
      currency = 'USD'
    } = req.body;
    
    const userId = req.user._id;

    // Validate booking if provided
    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      if (booking.clientId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized booking access' });
      }
    }

    // Calculate processing fee (Apple Pay typically charges 2.9% + $0.30)
    const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100;

    // Create payment record
    const payment = new Payment({
      userId,
      bookingId,
      amount,
      currency,
      paymentMethod: 'apple_pay',
      status: 'processing',
      processingFee,
      description: booking ? `Payment for booking #${booking._id}` : 'Wallet recharge',
      applePayment: {
        transactionIdentifier,
        paymentData,
        paymentMethod: {
          displayName: paymentMethod.displayName,
          network: paymentMethod.network,
          type: paymentMethod.type
        }
      },
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await payment.save();

    // In production, you would process the payment with Apple Pay
    // For now, we'll simulate successful processing
    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.processedAt = new Date();
        await payment.save();

        // Update booking status if this is a booking payment
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'accepted';
          booking.addSystemLog('payment_completed', `Apple Pay payment completed: ${payment.receiptNumber}`);
          await booking.save();
        } else {
          // This is a wallet recharge
          const wallet = await Wallet.findOne({ userId });
          if (wallet) {
            await wallet.addTransaction({
              type: 'recharge',
              amount: payment.netAmount,
              description: `Apple Pay recharge - ${payment.receiptNumber}`,
              status: 'completed',
              paymentMethod: 'apple_pay',
              externalTransactionId: payment._id
            });
          }
        }

        console.log(`Apple Pay payment completed: ${payment.receiptNumber}`);
      } catch (error) {
        console.error('Apple Pay post-processing error:', error);
        payment.status = 'failed';
        payment.failureReason = error.message;
        await payment.save();
      }
    }, 2000); // Simulate processing delay

    res.json({
      message: 'Apple Pay payment initiated successfully',
      paymentId: payment._id,
      receiptNumber: payment.receiptNumber,
      status: payment.status,
      processingFee,
      netAmount: payment.netAmount
    });

  } catch (error) {
    console.error('Apple Pay processing error:', error);
    res.status(500).json({
      message: 'Apple Pay payment failed',
      error: error.message
    });
  }
};

// Create payment intent for any payment method
const createPaymentIntent = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'USD',
      paymentMethod,
      bookingId,
      description 
    } = req.body;
    
    const userId = req.user._id;

    // Validate booking if provided
    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
      if (!booking || booking.clientId.toString() !== userId.toString()) {
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }
    }

    // Calculate processing fees based on payment method
    let processingFee = 0;
    switch (paymentMethod) {
      case 'apple_pay':
        processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100;
        break;
      case 'card':
        processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100;
        break;
      case 'bank_transfer':
        processingFee = Math.round(amount * 0.01 * 100) / 100; // 1% for bank transfers
        break;
      case 'wallet':
        processingFee = 0; // No fee for wallet payments
        break;
      default:
        processingFee = 0;
    }

    // Create payment intent
    const paymentIntent = {
      intentId: crypto.randomUUID(),
      clientSecret: crypto.randomBytes(32).toString('hex'),
      paymentProvider: paymentMethod === 'apple_pay' ? 'apple_pay' : 'stripe'
    };

    // Create payment record
    const payment = new Payment({
      userId,
      bookingId,
      amount,
      currency,
      paymentMethod,
      status: 'pending',
      processingFee,
      description: description || (booking ? `Payment for booking #${booking._id}` : 'Payment'),
      paymentIntent,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await payment.save();

    res.json({
      paymentIntentId: payment._id,
      clientSecret: paymentIntent.clientSecret,
      amount,
      currency,
      processingFee,
      netAmount: payment.netAmount,
      paymentMethod,
      applePayConfig: paymentMethod === 'apple_pay' ? APPLE_PAY_CONFIG : undefined
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, paymentMethod } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('bookingId', 'serviceId date status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: page * limit < totalCount
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId)
      .populate('bookingId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization (user can only see their own payments, or admins can see all)
    if (payment.userId._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to payment details' });
    }

    res.json({ payment });

  } catch (error) {
    console.error('Payment details error:', error);
    res.status(500).json({
      message: 'Failed to get payment details',
      error: error.message
    });
  }
};

// Request refund
const requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user._id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to payment' });
    }

    if (!payment.canBeRefunded()) {
      return res.status(400).json({ 
        message: 'Payment cannot be refunded',
        reason: 'Payment is not eligible for refund (status, time limit, or already refunded)'
      });
    }

    const refundAmount = amount || payment.getRemainingRefundAmount();
    if (refundAmount <= 0 || refundAmount > payment.getRemainingRefundAmount()) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }

    // Create refund record (in production, process with payment provider)
    payment.status = 'refunded';
    payment.refundAmount += refundAmount;
    payment.refundedAt = new Date();
    payment.metadata.refundReason = reason;
    
    await payment.save();

    // Update booking if applicable
    if (payment.bookingId) {
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded';
        booking.addSystemLog('payment_refunded', `Refund processed: $${refundAmount}`);
        await booking.save();
      }
    }

    res.json({
      message: 'Refund processed successfully',
      refundAmount,
      remainingAmount: payment.getRemainingRefundAmount()
    });

  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Get supported payment methods
const getSupportedPaymentMethods = async (req, res) => {
  try {
    const { country = 'LB', currency = 'USD' } = req.query;

    const paymentMethods = {
      apple_pay: {
        available: APPLE_PAY_CONFIG.supportedCountries.includes(country),
        config: APPLE_PAY_CONFIG,
        processingFee: '2.9% + $0.30'
      },
      card: {
        available: true,
        supportedCards: ['visa', 'mastercard', 'amex'],
        processingFee: '2.9% + $0.30'
      },
      bank_transfer: {
        available: country === 'LB',
        processingFee: '1%'
      },
      wallet: {
        available: true,
        processingFee: 'Free'
      }
    };

    res.json({
      country,
      currency,
      supportedMethods: paymentMethods
    });

  } catch (error) {
    console.error('Supported payment methods error:', error);
    res.status(500).json({
      message: 'Failed to get supported payment methods',
      error: error.message
    });
  }
};

module.exports = {
  createApplePaySession,
  processApplePayment,
  createPaymentIntent,
  getPaymentHistory,
  getPaymentDetails,
  requestRefund,
  getSupportedPaymentMethods
};