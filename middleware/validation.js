const Joi = require('joi');

// Medicine validation schema
const medicineSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  genericName: Joi.string().required().trim().min(2).max(100),
  brandName: Joi.string().trim().max(100).allow(''),
  dosage: Joi.string().required().trim().min(1).max(50),
  form: Joi.string().valid(
    'tablet', 'capsule', 'syrup', 'injection', 'cream', 
    'ointment', 'drops', 'inhaler', 'patch', 'other'
  ).required(),
  description: Joi.string().required().trim().min(10).max(1000),
  uses: Joi.array().items(Joi.string().trim().min(5).max(200)).min(1).required(),
  precautions: Joi.array().items(Joi.string().trim().min(5).max(200)).min(1).required(),
  sideEffects: Joi.array().items(Joi.string().trim().min(5).max(200)).default([]),
  dosageInstructions: Joi.string().required().trim().min(10).max(500),
  warnings: Joi.array().items(Joi.string().trim().min(5).max(200)).default([]),
  contraindications: Joi.array().items(Joi.string().trim().min(5).max(200)).default([]),
  drugInteractions: Joi.array().items(Joi.string().trim().min(5).max(200)).default([]),
  pregnancyCategory: Joi.string().valid('A', 'B', 'C', 'D', 'X', 'Unknown').default('Unknown'),
  storageInstructions: Joi.string().trim().max(200).allow(''),
  expiryDate: Joi.date().allow(null),
  manufacturer: Joi.string().trim().max(100).allow(''),
  barcode: Joi.string().trim().max(50).allow(''),
  keywords: Joi.array().items(Joi.string().trim().min(2).max(50)).default([]),
  category: Joi.string().valid(
    'analgesic', 'antibiotic', 'antihistamine', 'antacid', 'vitamin',
    'supplement', 'cardiovascular', 'respiratory', 'gastrointestinal',
    'neurological', 'dermatological', 'ophthalmic', 'other'
  ).required(),
  prescriptionRequired: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
});

// Doctor validation schema
const doctorSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().required().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
  specialization: Joi.string().valid(
    'cardiology', 'dermatology', 'neurology', 'orthopedics', 'pediatrics',
    'psychiatry', 'general', 'internal medicine', 'surgery', 'gynecology',
    'ophthalmology', 'otolaryngology', 'radiology', 'anesthesiology',
    'emergency medicine', 'family medicine', 'other'
  ).required(),
  licenseNumber: Joi.string().required().trim().min(5).max(50),
  experience: Joi.number().integer().min(0).max(50).required(),
  education: Joi.array().items(
    Joi.object({
      degree: Joi.string().required().trim().min(2).max(100),
      institution: Joi.string().required().trim().min(2).max(200),
      year: Joi.number().integer().min(1950).max(new Date().getFullYear()).required()
    })
  ).min(1).required(),
  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(2).max(100),
      issuingOrganization: Joi.string().required().trim().min(2).max(200),
      date: Joi.date().max('now').required()
    })
  ).default([]),
  address: Joi.object({
    street: Joi.string().required().trim().min(5).max(200),
    city: Joi.string().required().trim().min(2).max(100),
    state: Joi.string().required().trim().min(2).max(100),
    zipCode: Joi.string().required().trim().min(5).max(10),
    country: Joi.string().default('USA').trim().max(100),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional()
  }).required(),
  clinic: Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    phone: Joi.string().required().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    website: Joi.string().uri().allow('')
  }).required(),
  availability: Joi.object({
    monday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(true)
    }),
    tuesday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(true)
    }),
    wednesday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(true)
    }),
    thursday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(true)
    }),
    friday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(true)
    }),
    saturday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(false)
    }),
    sunday: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      isAvailable: Joi.boolean().default(false)
    })
  }).required(),
  consultationFee: Joi.number().min(0).max(10000).required(),
  languages: Joi.array().items(Joi.string().trim().min(2).max(50)).default(['English']),
  photo: Joi.string().uri().allow(''),
  isOnline: Joi.boolean().default(false),
  isVerified: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  bio: Joi.string().trim().max(1000).allow(''),
  services: Joi.array().items(Joi.string().trim().min(2).max(100)).default([]),
  insuranceAccepted: Joi.array().items(Joi.string().trim().min(2).max(100)).default([])
});

// Scan request validation schema
const scanRequestSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  platform: Joi.string().valid('web', 'mobile', 'tablet').default('web'),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }).optional()
});

// Validation middleware
const validateMedicine = (req, res, next) => {
  const { error, value } = medicineSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors
    });
  }
  
  req.body = value;
  next();
};

const validateDoctor = (req, res, next) => {
  const { error, value } = doctorSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors
    });
  }
  
  req.body = value;
  next();
};

const validateScanRequest = (req, res, next) => {
  const { error, value } = scanRequestSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors
    });
  }
  
  req.body = { ...req.body, ...value };
  next();
};

module.exports = {
  validateMedicine,
  validateDoctor,
  validateScanRequest
};
