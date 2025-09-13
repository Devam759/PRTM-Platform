const express = require('express');
const { validateDoctor } = require('../middleware/validation');
const {
  searchDoctors,
  findNearbyDoctors,
  getDoctorById,
  addDoctorReview,
  getSpecializations,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');

const router = express.Router();

// @route   GET /api/doctors/search
// @desc    Search doctors by name, specialization, or location
// @access  Public
router.get('/search', searchDoctors);

// @route   GET /api/doctors/nearby
// @desc    Find nearby doctors by coordinates
// @access  Public
router.get('/nearby', findNearbyDoctors);

// @route   GET /api/doctors/specializations/list
// @desc    Get list of doctor specializations
// @access  Public
router.get('/specializations/list', getSpecializations);

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', getDoctorById);

// @route   POST /api/doctors/:id/review
// @desc    Add review for doctor
// @access  Private
router.post('/:id/review', addDoctorReview);

// @route   POST /api/doctors
// @desc    Create new doctor
// @access  Private (Admin only)
router.post('/', validateDoctor, createDoctor);

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Private (Admin only)
router.put('/:id', validateDoctor, updateDoctor);

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor (soft delete)
// @access  Private (Admin only)
router.delete('/:id', deleteDoctor);

module.exports = router;
