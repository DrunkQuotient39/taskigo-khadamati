const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['recharge', 'payment', 'refund', 'withdrawal', 'commission'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'wallet']
  },
  externalTransactionId: String, // For payment gateway integration
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingBalance: {
    type: Number,
    default: 0 // Money pending from completed services
  },
  totalEarnings: {
    type: Number,
    default: 0 // For providers
  },
  totalSpent: {
    type: Number,
    default: 0 // For clients
  },
  transactionHistory: [transactionSchema],
  lastTransactionAt: Date,
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed'],
    default: 'none'
  },
  paymentStatus: {
    type: String,
    enum: ['active', 'suspended', 'under_review'],
    default: 'active'
  },
  autoWithdraw: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number,
      default: 100
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      accountHolderName: String
    }
  }
}, {
  timestamps: true
});

// Add transaction to wallet
walletSchema.methods.addTransaction = async function(transactionData) {
  const transaction = {
    ...transactionData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.transactionHistory.push(transaction);
  this.lastTransactionAt = new Date();
  
  // Update balance based on transaction type
  if (transaction.status === 'completed') {
    switch (transaction.type) {
      case 'recharge':
        this.balance += transaction.amount;
        break;
      case 'payment':
        this.balance -= transaction.amount;
        this.totalSpent += transaction.amount;
        break;
      case 'refund':
        this.balance += transaction.amount;
        break;
      case 'withdrawal':
        this.balance -= transaction.amount;
        break;
      case 'commission':
        this.balance += transaction.amount;
        this.totalEarnings += transaction.amount;
        break;
    }
  }
  
  await this.save();
  return transaction;
};

// Check if user has sufficient balance
walletSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount;
};

// Get transaction history with pagination
walletSchema.methods.getTransactionHistory = function(page = 1, limit = 20) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    transactions: this.transactionHistory
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(startIndex, endIndex),
    totalCount: this.transactionHistory.length,
    hasMore: endIndex < this.transactionHistory.length
  };
};

module.exports = mongoose.model('Wallet', walletSchema);