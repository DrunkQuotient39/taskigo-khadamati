const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['apple_pay', 'card', 'bank_transfer', 'wallet'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // Apple Pay specific fields
  applePayData: {
    merchantIdentifier: String,
    paymentPass: {
      primaryAccountIdentifier: String,
      primaryAccountNumberSuffix: String,
      deviceAccountIdentifier: String,
      deviceAccountNumberSuffix: String
    }
  },
  // Card specific fields
  cardData: {
    last4: String,
    brand: String, // visa, mastercard, amex
    expiryMonth: Number,
    expiryYear: Number,
    fingerprint: String
  },
  // Bank transfer fields
  bankData: {
    accountNumber: String,
    routingNumber: String,
    accountHolderName: String,
    bankName: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  walletTransactionId: {
    type: mongoose.Schema.Types.ObjectId
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'LBP', 'EUR']
  },
  paymentMethod: {
    type: String,
    enum: ['apple_pay', 'card', 'bank_transfer', 'wallet', 'cash'],
    required: true
  },
  paymentMethodDetails: paymentMethodSchema,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentIntent: {
    // For Apple Pay and card payments
    intentId: String,
    clientSecret: String,
    paymentProvider: {
      type: String,
      enum: ['stripe', 'apple_pay', 'paypal', 'local_bank']
    }
  },
  applePayment: {
    // Apple Pay specific transaction data
    transactionIdentifier: String,
    paymentData: mongoose.Schema.Types.Mixed, // Encrypted payment data from Apple
    paymentMethod: {
      displayName: String,
      network: String, // Visa, Mastercard, etc.
      type: String // debit, credit
    },
    merchantSession: mongoose.Schema.Types.Mixed
  },
  processingFee: {
    type: Number,
    default: 0
  },
  netAmount: Number, // amount - processingFee
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  failureReason: String,
  processedAt: Date,
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  },
  // Commission tracking
  platformCommission: {
    rate: {
      type: Number,
      default: 0.05 // 5% default
    },
    amount: Number
  },
  providerEarnings: Number,
  // Receipt and invoice
  receiptNumber: {
    type: String,
    unique: true
  },
  invoiceUrl: String,
  receiptUrl: String
}, {
  timestamps: true
});

// Generate unique receipt number
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `TGO-${timestamp}-${random}`;
  }
  
  // Calculate net amount and provider earnings
  if (this.amount && this.processingFee !== undefined) {
    this.netAmount = this.amount - this.processingFee;
    
    if (this.platformCommission.rate) {
      this.platformCommission.amount = this.netAmount * this.platformCommission.rate;
      this.providerEarnings = this.netAmount - this.platformCommission.amount;
    }
  }
  
  next();
});

// Indexes for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ receiptNumber: 1 });
paymentSchema.index({ 'applePayment.transactionIdentifier': 1 });

// Instance methods
paymentSchema.methods.canBeRefunded = function() {
  const refundableStatuses = ['completed'];
  const maxRefundDays = 30;
  const daysSincePayment = (Date.now() - this.processedAt) / (1000 * 60 * 60 * 24);
  
  return refundableStatuses.includes(this.status) && 
         daysSincePayment <= maxRefundDays &&
         this.refundAmount < this.amount;
};

paymentSchema.methods.getRemainingRefundAmount = function() {
  return Math.max(0, this.amount - this.refundAmount);
};

// Static methods
paymentSchema.statics.findByReceiptNumber = function(receiptNumber) {
  return this.findOne({ receiptNumber });
};

paymentSchema.statics.getUserPaymentHistory = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
    .populate('bookingId', 'serviceId date status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Payment', paymentSchema);