const Medicine = require('../models/Medicine');
const ScanHistory = require('../models/ScanHistory');
const { uploadImage, processImage } = require('../services/imageService');
const { identifyMedicineFromImage } = require('../services/medicineService');

// @desc    Scan medicine image and identify medicine
// @route   POST /api/medicine/scan
// @access  Public
const scanMedicine = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Process and save image
    const imageUrl = await uploadImage(req.file);
    
    // Identify medicine from image
    const identifiedMedicine = await identifyMedicineFromImage(req.file.buffer);
    
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
};

// @desc    Scan medicine by barcode
// @route   POST /api/medicine/barcode
// @access  Public
const scanBarcode = async (req, res) => {
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
};

// @desc    Search medicines by name or keywords
// @route   GET /api/medicine/search
// @access  Public
const searchMedicines = async (req, res) => {
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
};

// @desc    Get medicine by ID
// @route   GET /api/medicine/:id
// @access  Public
const getMedicineById = async (req, res) => {
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
};

// @desc    Create new medicine
// @route   POST /api/medicine
// @access  Private (Admin only)
const createMedicine = async (req, res) => {
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
};

// @desc    Update medicine
// @route   PUT /api/medicine/:id
// @access  Private (Admin only)
const updateMedicine = async (req, res) => {
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
};

// @desc    Delete medicine (soft delete)
// @route   DELETE /api/medicine/:id
// @access  Private (Admin only)
const deleteMedicine = async (req, res) => {
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
};

// @desc    Get list of medicine categories
// @route   GET /api/medicine/categories/list
// @access  Public
const getCategories = async (req, res) => {
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
};

module.exports = {
  scanMedicine,
  scanBarcode,
  searchMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getCategories
};
