const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true // e.g., '10:00'
  },
  duration: {
    type: Number, // in hours
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'cash'],
    default: 'wallet'
  },
  notes: String,
  clientNotes: String,
  providerNotes: String,
  cancellationReason: String,
  cancellationDate: Date,
  completionDate: Date,
  systemLogs: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  location: {
    address: String,
    coordinates: [Number]
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ clientId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, createdAt: -1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1, time: 1 });

// Add system log entry
bookingSchema.methods.addSystemLog = function(action, details) {
  this.systemLogs.push({
    action,
    details,
    timestamp: new Date()
  });
};

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
  
  return hoursDifference > 24 && ['pending', 'accepted'].includes(this.status);
};

module.exports = mongoose.model('Booking', bookingSchema);