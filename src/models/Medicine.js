const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    required: true,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  form: {
    type: String,
    required: true,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'other'],
    default: 'tablet'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  uses: {
    type: [String],
    required: true,
    default: []
  },
  precautions: {
    type: [String],
    required: true,
    default: []
  },
  sideEffects: {
    type: [String],
    default: []
  },
  dosageInstructions: {
    type: String,
    required: true,
    trim: true
  },
  warnings: {
    type: [String],
    default: []
  },
  contraindications: {
    type: [String],
    default: []
  },
  drugInteractions: {
    type: [String],
    default: []
  },
  pregnancyCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'X', 'Unknown'],
    default: 'Unknown'
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  manufacturer: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  keywords: {
    type: [String],
    default: [],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'analgesic',
      'antibiotic',
      'antihistamine',
      'antacid',
      'vitamin',
      'supplement',
      'cardiovascular',
      'respiratory',
      'gastrointestinal',
      'neurological',
      'dermatological',
      'ophthalmic',
      'other'
    ],
    default: 'other'
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better search performance
medicineSchema.index({ name: 'text', genericName: 'text', brandName: 'text', keywords: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ isActive: 1 });
medicineSchema.index({ barcode: 1 });

// Virtual for full medicine name
medicineSchema.virtual('fullName').get(function() {
  if (this.brandName && this.brandName !== this.name) {
    return `${this.brandName} (${this.genericName})`;
  }
  return this.name;
});

// Method to get primary image
medicineSchema.methods.getPrimaryImage = function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage || this.images[0] || null;
};

// Method to add image
medicineSchema.methods.addImage = function(imageUrl, alt = '', isPrimary = false) {
  if (isPrimary) {
    // Remove primary flag from other images
    this.images.forEach(img => img.isPrimary = false);
  }
  
  this.images.push({
    url: imageUrl,
    alt: alt,
    isPrimary: isPrimary
  });
  
  return this.save();
};

// Static method to search medicines
medicineSchema.statics.searchMedicines = function(query, options = {}) {
  const {
    category,
    prescriptionRequired,
    limit = 20,
    skip = 0
  } = options;
  
  let searchQuery = {
    isActive: true,
    $text: { $search: query }
  };
  
  if (category) {
    searchQuery.category = category;
  }
  
  if (prescriptionRequired !== undefined) {
    searchQuery.prescriptionRequired = prescriptionRequired;
  }
  
  return this.find(searchQuery)
    .select('name genericName brandName dosage form description uses precautions dosageInstructions images category prescriptionRequired')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);
};

// Static method to find medicine by barcode
medicineSchema.statics.findByBarcode = function(barcode) {
  return this.findOne({ barcode: barcode, isActive: true });
};

// Pre-save middleware to update lastUpdated
medicineSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);
