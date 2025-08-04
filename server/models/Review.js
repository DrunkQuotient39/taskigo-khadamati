const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  text_ar: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  images: [String], // URLs to review images
  isVerified: {
    type: Boolean,
    default: false // Verified if user actually used the service
  },
  isHidden: {
    type: Boolean,
    default: false // For admin moderation
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  aiAnalysis: {
    keywords: [String],
    topics: [String],
    confidence: Number
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ serviceId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ providerId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isHidden: 1 });

// Ensure one review per booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

// Update service rating after saving review
reviewSchema.post('save', async function() {
  const Service = mongoose.model('Service');
  const service = await Service.findById(this.serviceId);
  if (service) {
    await service.updateRating();
  }
});

// Update service rating after removing review
reviewSchema.post('remove', async function() {
  const Service = mongoose.model('Service');
  const service = await Service.findById(this.serviceId);
  if (service) {
    await service.updateRating();
  }
});

module.exports = mongoose.model('Review', reviewSchema);