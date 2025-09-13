const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Medicine = require('../models/Medicine');
const ScanHistory = require('../models/ScanHistory');
const { validateMedicine, validateScanRequest } = require('../middleware/validation');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route   POST /api/medicine/scan
// @desc    Scan medicine image and identify medicine
// @access  Public
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Process and save image
    const imageBuffer = req.file.buffer;
    const imageName = `medicine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const imagePath = path.join(uploadsDir, imageName);
    
    // Resize and optimize image
    await sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(imagePath);

    const imageUrl = `/uploads/${imageName}`;

    // Simulate AI medicine identification
    // In a real implementation, you would use computer vision APIs like:
    // - Google Vision API
    // - AWS Rekognition
    // - Azure Computer Vision
    // - Custom ML model
    
    const identifiedMedicine = await identifyMedicineFromImage(imageBuffer);
    
    if (!identifiedMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Could not identify medicine from image',
        imageUrl: imageUrl
      });
    }

    // Save scan history (if user is authenticated)
    if (req.body.userId) {
      const scanHistory = new ScanHistory({
        userId: req.body.userId,
        medicineId: identifiedMedicine._id,
        imageUrl: imageUrl,
        scanMethod: 'image_recognition',
        confidence: identifiedMedicine.confidence || 85,
        scanResult: {
          identified: true,
          medicineName: identifiedMedicine.name,
          alternativeMatches: identifiedMedicine.alternatives || []
        },
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          platform: req.body.platform || 'web'
        }
      });
      
      await scanHistory.save();
    }

    res.json({
      success: true,
      message: 'Medicine identified successfully',
      data: {
        medicine: identifiedMedicine,
        imageUrl: imageUrl,
        confidence: identifiedMedicine.confidence || 85
      }
    });

  } catch (error) {
    console.error('Medicine scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing medicine scan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/medicine/barcode
// @desc    Scan medicine by barcode
// @access  Public
router.post('/barcode', async (req, res) => {
  try {
    const { barcode, userId } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    const medicine = await Medicine.findByBarcode(barcode);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found for this barcode'
      });
    }

    // Save scan history (if user is authenticated)
    if (userId) {
      const scanHistory = new ScanHistory({
        userId: userId,
        medicineId: medicine._id,
        imageUrl: '', // No image for barcode scan
        scanMethod: 'barcode',
        confidence: 100, // Barcode scans are 100% accurate
        scanResult: {
          identified: true,
          medicineName: medicine.name
        },
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          platform: req.body.platform || 'web'
        }
      });
      
      await scanHistory.save();
    }

    res.json({
      success: true,
      message: 'Medicine found successfully',
      data: {
        medicine: medicine,
        confidence: 100
      }
    });

  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing barcode scan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/medicine/search
// @desc    Search medicines by name or keywords
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, prescription, limit = 20, skip = 0 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const options = {
      category: category,
      prescriptionRequired: prescription === 'true' ? true : prescription === 'false' ? false : undefined,
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    const medicines = await Medicine.searchMedicines(q, options);

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        medicines: medicines,
        total: medicines.length,
        query: q,
        options: options
      }
    });

  } catch (error) {
    console.error('Medicine search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medicines',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/medicine/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine retrieved successfully',
      data: {
        medicine: medicine
      }
    });

  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving medicine',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/medicine
// @desc    Create new medicine
// @access  Private (Admin only)
router.post('/', validateMedicine, async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: {
        medicine: medicine
      }
    });

  } catch (error) {
    console.error('Create medicine error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this name or barcode already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating medicine',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/medicine/:id
// @desc    Update medicine
// @access  Private (Admin only)
router.put('/:id', validateMedicine, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: {
        medicine: medicine
      }
    });

  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medicine',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/medicine/:id
// @desc    Delete medicine (soft delete)
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });

  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medicine',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/medicine/categories/list
// @desc    Get list of medicine categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = Medicine.schema.path('category').enumValues;
    
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: {
        categories: categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to simulate AI medicine identification
async function identifyMedicineFromImage(imageBuffer) {
  // This is a simulation - in a real app, you would use computer vision APIs
  // For demo purposes, we'll return a random medicine from the database
  
  try {
    const medicines = await Medicine.find({ isActive: true }).limit(10);
    
    if (medicines.length === 0) {
      return null;
    }
    
    // Return a random medicine with some confidence score
    const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
    
    return {
      _id: randomMedicine._id,
      name: randomMedicine.name,
      genericName: randomMedicine.genericName,
      brandName: randomMedicine.brandName,
      dosage: randomMedicine.dosage,
      form: randomMedicine.form,
      description: randomMedicine.description,
      uses: randomMedicine.uses,
      precautions: randomMedicine.precautions,
      dosageInstructions: randomMedicine.dosageInstructions,
      warnings: randomMedicine.warnings,
      images: randomMedicine.images,
      category: randomMedicine.category,
      prescriptionRequired: randomMedicine.prescriptionRequired,
      confidence: Math.floor(Math.random() * 20) + 80 // 80-100% confidence
    };
    
  } catch (error) {
    console.error('Error in medicine identification:', error);
    return null;
  }
}

module.exports = router;
