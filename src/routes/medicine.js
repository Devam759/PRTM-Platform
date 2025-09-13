const express = require('express');
const multer = require('multer');
const { validateMedicine, validateScanRequest } = require('../middleware/validation');
const {
  scanMedicine,
  scanBarcode,
  searchMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getCategories
} = require('../controllers/medicineController');
const { validateImage } = require('../services/imageService');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (validateImage(file)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
  }
});

// @route   POST /api/medicine/scan
// @desc    Scan medicine image and identify medicine
// @access  Public
router.post('/scan', upload.single('image'), scanMedicine);

// @route   POST /api/medicine/barcode
// @desc    Scan medicine by barcode
// @access  Public
router.post('/barcode', scanBarcode);

// @route   GET /api/medicine/search
// @desc    Search medicines by name or keywords
// @access  Public
router.get('/search', searchMedicines);

// @route   GET /api/medicine/categories/list
// @desc    Get list of medicine categories
// @access  Public
router.get('/categories/list', getCategories);

// @route   GET /api/medicine/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', getMedicineById);

// @route   POST /api/medicine
// @desc    Create new medicine
// @access  Private (Admin only)
router.post('/', validateMedicine, createMedicine);

// @route   PUT /api/medicine/:id
// @desc    Update medicine
// @access  Private (Admin only)
router.put('/:id', validateMedicine, updateMedicine);

// @route   DELETE /api/medicine/:id
// @desc    Delete medicine (soft delete)
// @access  Private (Admin only)
router.delete('/:id', deleteMedicine);

module.exports = router;
