const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');
const { body, validationResult } = require('express-validator');

// Rate limiting for OTP endpoints
const otpLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateMobileNumber = [
  body('mobileNumber')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 digits')
    .isNumeric()
    .withMessage('Mobile number must contain only digits'),
  body('countryCode')
    .isLength({ min: 1, max: 5 })
    .withMessage('Country code is required')
    .matches(/^\+\d+$/)
    .withMessage('Country code must start with + followed by digits')
];

const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
  body('mobileNumber')
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 digits')
    .isNumeric()
    .withMessage('Mobile number must contain only digits')
];

// Send OTP endpoint
router.post('/send', otpLimiter, validateMobileNumber, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobileNumber, countryCode } = req.body;
    const fullMobileNumber = `${countryCode}${mobileNumber}`;

    // Generate OTP
    const otp = otpService.generateOTP();
    
    // Store OTP
    otpService.storeOTP(fullMobileNumber, otp);

    // Send OTP via SMS
    const smsResult = await otpService.sendOTP(fullMobileNumber, otp);

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        mobileNumber: fullMobileNumber,
        // Remove OTP from response in production
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } else {
      res.status(500).json({
        success: false,
        message: smsResult.message
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP endpoint
router.post('/verify', validateOTP, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobileNumber, countryCode, otp } = req.body;
    const fullMobileNumber = `${countryCode}${mobileNumber}`;

    // Verify OTP
    const result = otpService.verifyOTP(fullMobileNumber, otp);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP verified successfully',
        mobileNumber: fullMobileNumber
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend OTP endpoint
router.post('/resend', otpLimiter, validateMobileNumber, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobileNumber, countryCode } = req.body;
    const fullMobileNumber = `${countryCode}${mobileNumber}`;

    // Generate new OTP
    const otp = otpService.generateOTP();
    
    // Store new OTP
    otpService.storeOTP(fullMobileNumber, otp);

    // Send OTP via SMS
    const smsResult = await otpService.sendOTP(fullMobileNumber, otp);

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP resent successfully',
        mobileNumber: fullMobileNumber,
        // Remove OTP from response in production
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } else {
      res.status(500).json({
        success: false,
        message: smsResult.message
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get OTP status (for debugging)
router.get('/status/:mobileNumber', (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const status = otpService.getOTPStatus(mobileNumber);
    
    res.json({
      success: true,
      mobileNumber,
      status
    });
  } catch (error) {
    console.error('Get OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
