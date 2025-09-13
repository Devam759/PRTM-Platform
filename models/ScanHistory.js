const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  scanMethod: {
    type: String,
    enum: ['barcode', 'image_recognition', 'manual'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  scanResult: {
    identified: {
      type: Boolean,
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    alternativeMatches: [{
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine'
      },
      confidence: Number,
      name: String
    }]
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  feedback: {
    wasHelpful: {
      type: Boolean
    },
    comment: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
scanHistorySchema.index({ userId: 1, createdAt: -1 });
scanHistorySchema.index({ medicineId: 1 });
scanHistorySchema.index({ 'location.coordinates': '2dsphere' });
scanHistorySchema.index({ scanMethod: 1 });
scanHistorySchema.index({ 'scanResult.identified': 1 });

// Static method to get user scan history
scanHistorySchema.statics.getUserHistory = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    startDate,
    endDate
  } = options;
  
  let query = {
    userId: userId,
    isActive: true
  };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('medicineId', 'name genericName brandName dosage form description images category')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get scan statistics
scanHistorySchema.statics.getScanStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        successfulScans: {
          $sum: {
            $cond: [{ $eq: ['$scanResult.identified', true] }, 1, 0]
          }
        },
        averageConfidence: { $avg: '$confidence' },
        scanMethods: {
          $push: '$scanMethod'
        }
      }
    },
    {
      $project: {
        totalScans: 1,
        successfulScans: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successfulScans', '$totalScans'] },
            100
          ]
        },
        averageConfidence: { $round: ['$averageConfidence', 2] },
        methodBreakdown: {
          $reduce: {
            input: '$scanMethods',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{
                      k: '$$this',
                      v: {
                        $add: [
                          { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                          1
                        ]
                      }
                    }]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Method to add feedback
scanHistorySchema.methods.addFeedback = function(wasHelpful, comment = '') {
  this.feedback = {
    wasHelpful: wasHelpful,
    comment: comment,
    submittedAt: new Date()
  };
  
  return this.save();
};

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
