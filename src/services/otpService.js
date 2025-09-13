const crypto = require('crypto');
const smsService = require('./smsService');

class OTPService {
  constructor() {
    // Use global variable for serverless compatibility
    if (!global.otpStore) {
      global.otpStore = new Map();
    }
    this.otpStore = global.otpStore;
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTP with expiry
  storeOTP(mobileNumber, otp) {
    const expiry = Date.now() + this.otpExpiry;
    this.otpStore.set(mobileNumber, {
      otp,
      expiry,
      attempts: 0
    });
  }

  // Verify OTP
  verifyOTP(mobileNumber, inputOTP) {
    const stored = this.otpStore.get(mobileNumber);
    
    if (!stored) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiry) {
      this.otpStore.delete(mobileNumber);
      return { success: false, message: 'OTP has expired' };
    }

    // Check attempt limit
    if (stored.attempts >= 3) {
      this.otpStore.delete(mobileNumber);
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (stored.otp === inputOTP) {
      this.otpStore.delete(mobileNumber);
      return { success: true, message: 'OTP verified successfully' };
    } else {
      stored.attempts++;
      return { success: false, message: 'Invalid OTP' };
    }
  }

  // Send OTP via SMS
  async sendOTP(mobileNumber, otp) {
    try {
      // Validate mobile number
      if (!smsService.validateMobileNumber(mobileNumber)) {
        return {
          success: false,
          message: 'Invalid mobile number format'
        };
      }

      // Format OTP message
      const message = smsService.formatOTPMessage(otp);
      
      // Send SMS
      const result = await smsService.sendSMS(mobileNumber, message);
      
      if (result.success) {
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: result.messageId,
          provider: result.provider,
          // Only include OTP in development mode
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      } else {
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.'
        };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    try {
      const now = Date.now();
      for (const [mobileNumber, data] of this.otpStore.entries()) {
        if (now > data.expiry) {
          this.otpStore.delete(mobileNumber);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  // Get OTP status (for debugging)
  getOTPStatus(mobileNumber) {
    const stored = this.otpStore.get(mobileNumber);
    if (!stored) {
      return { exists: false };
    }
    
    return {
      exists: true,
      expiry: new Date(stored.expiry),
      attempts: stored.attempts,
      isExpired: Date.now() > stored.expiry
    };
  }
}

// Create singleton instance
const otpService = new OTPService();

// Clean up expired OTPs every 5 minutes (only in non-serverless environments)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  setInterval(() => {
    otpService.cleanupExpiredOTPs();
  }, 5 * 60 * 1000);
}

module.exports = otpService;
