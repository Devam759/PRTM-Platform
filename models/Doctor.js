const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    enum: [
      'cardiology',
      'dermatology',
      'neurology',
      'orthopedics',
      'pediatrics',
      'psychiatry',
      'general',
      'internal medicine',
      'surgery',
      'gynecology',
      'ophthalmology',
      'otolaryngology',
      'radiology',
      'anesthesiology',
      'emergency medicine',
      'family medicine',
      'other'
    ],
    default: 'general'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'USA'
    },
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    }
  },
  clinic: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    website: {
      type: String
    }
  },
  availability: {
    monday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    },
    tuesday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    },
    wednesday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    },
    thursday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    },
    friday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: true }
    },
    saturday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: false }
    },
    sunday: {
      start: String,
      end: String,
      isAvailable: { type: Boolean, default: false }
    }
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
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
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  languages: {
    type: [String],
    default: ['English']
  },
  photo: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    trim: true
  },
  services: {
    type: [String],
    default: []
  },
  insuranceAccepted: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'address.city': 1, 'address.state': 1 });
doctorSchema.index({ isActive: 1, isVerified: 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ name: 'text', specialization: 'text' });

// Virtual for full address
doctorSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Method to update rating
doctorSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Method to add review
doctorSchema.methods.addReview = function(patientId, rating, comment = '') {
  this.reviews.push({
    patientId: patientId,
    rating: rating,
    comment: comment
  });
  
  return this.updateRating();
};

// Static method to find nearby doctors
doctorSchema.statics.findNearby = function(latitude, longitude, maxDistance = 50, options = {}) {
  const {
    specialization,
    minRating = 0,
    limit = 20,
    skip = 0
  } = options;
  
  let query = {
    isActive: true,
    isVerified: true,
    'address.coordinates.latitude': { $exists: true },
    'address.coordinates.longitude': { $exists: true },
    'rating.average': { $gte: minRating }
  };
  
  if (specialization) {
    query.specialization = specialization;
  }
  
  return this.find(query)
    .select('name specialization address clinic consultationFee rating photo isOnline bio services')
    .limit(limit)
    .skip(skip);
};

// Static method to search doctors
doctorSchema.statics.searchDoctors = function(searchQuery, options = {}) {
  const {
    specialization,
    city,
    state,
    minRating = 0,
    limit = 20,
    skip = 0
  } = options;
  
  let query = {
    isActive: true,
    isVerified: true,
    'rating.average': { $gte: minRating }
  };
  
  if (specialization) {
    query.specialization = specialization;
  }
  
  if (city) {
    query['address.city'] = new RegExp(city, 'i');
  }
  
  if (state) {
    query['address.state'] = new RegExp(state, 'i');
  }
  
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  
  return this.find(query)
    .select('name specialization address clinic consultationFee rating photo isOnline bio services')
    .sort({ 'rating.average': -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Doctor', doctorSchema);
