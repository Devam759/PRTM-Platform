const Doctor = require('../models/Doctor');

// @desc    Search doctors by name, specialization, or location
// @route   GET /api/doctors/search
// @access  Public
const searchDoctors = async (req, res) => {
  try {
    const {
      q,
      specialization,
      city,
      state,
      minRating = 0,
      limit = 20,
      skip = 0
    } = req.query;

    const options = {
      specialization,
      city,
      state,
      minRating: parseFloat(minRating),
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    const doctors = await Doctor.searchDoctors(q, options);

    res.json({
      success: true,
      message: 'Doctor search completed successfully',
      data: {
        doctors: doctors,
        total: doctors.length,
        query: q,
        options: options
      }
    });

  } catch (error) {
    console.error('Doctor search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Find nearby doctors by coordinates
// @route   GET /api/doctors/nearby
// @access  Public
const findNearbyDoctors = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      maxDistance = 50,
      specialization,
      minRating = 0,
      limit = 20,
      skip = 0
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const options = {
      specialization,
      minRating: parseFloat(minRating),
      limit: parseInt(limit),
      skip: parseInt(skip)
    };

    const doctors = await Doctor.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(maxDistance),
      options
    );

    res.json({
      success: true,
      message: 'Nearby doctors found successfully',
      data: {
        doctors: doctors,
        total: doctors.length,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          maxDistance: parseFloat(maxDistance)
        },
        options: options
      }
    });

  } catch (error) {
    console.error('Find nearby doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding nearby doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('reviews.patientId', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor retrieved successfully',
      data: {
        doctor: doctor
      }
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Add review for doctor
// @route   POST /api/doctors/:id/review
// @access  Private
const addDoctorReview = async (req, res) => {
  try {
    const { patientId, rating, comment } = req.body;

    if (!patientId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await doctor.addReview(patientId, rating, comment);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          rating: doctor.rating
        }
      }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get list of doctor specializations
// @route   GET /api/doctors/specializations/list
// @access  Public
const getSpecializations = async (req, res) => {
  try {
    const specializations = Doctor.schema.path('specialization').enumValues;
    
    res.json({
      success: true,
      message: 'Specializations retrieved successfully',
      data: {
        specializations: specializations
      }
    });

  } catch (error) {
    console.error('Get specializations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving specializations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        doctor: doctor
      }
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email or license number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin only)
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: {
        doctor: doctor
      }
    });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete doctor (soft delete)
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  searchDoctors,
  findNearbyDoctors,
  getDoctorById,
  addDoctorReview,
  getSpecializations,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
