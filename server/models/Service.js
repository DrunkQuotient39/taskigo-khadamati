const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  title_ar: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  description_ar: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: [
      'maintenance', 'cleaning', 'delivery', 'events', 
      'care', 'gardens', 'auto', 'tech', 'admin'
    ]
  },
  subcategory: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceType: {
    type: String,
    enum: ['fixed', 'hourly', 'per_item'],
    default: 'fixed'
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  location: {
    city: {
      type: String,
      required: true
    },
    area: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: [{
    date: Date,
    timeSlots: [String] // e.g., ['09:00', '10:00', '14:00']
  }],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for location-based searches
serviceSchema.index({ 'location.coordinates': '2dsphere' });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ rating: -1 });

// Update rating when reviews change
serviceSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ serviceId: this._id });
  
  if (reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / reviews.length;
    this.rating.count = reviews.length;
  }
  
  await this.save();
};

module.exports = mongoose.model('Service', serviceSchema);