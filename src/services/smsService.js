// SMS Service for OTP delivery
// This service can be configured with different SMS providers

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'console'; // console, twilio, aws, etc.
    this.twilioClient = null;
    
    // Initialize provider
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'twilio':
        this.initializeTwilio();
        break;
      case 'aws':
        this.initializeAWS();
        break;
      case 'console':
      default:
        console.log('📱 SMS Service: Using console logging (development mode)');
        break;
    }
  }

  initializeTwilio() {
    try {
      const twilio = require('twilio');
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!accountSid || !authToken) {
        console.warn('⚠️ Twilio credentials not found. Using console logging.');
        this.provider = 'console';
        return;
      }
      
      this.twilioClient = twilio(accountSid, authToken);
      console.log('✅ Twilio SMS service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Twilio:', error.message);
      this.provider = 'console';
    }
  }

  initializeAWS() {
    try {
      const AWS = require('aws-sdk');
      
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn('⚠️ AWS credentials not found. Using console logging.');
        this.provider = 'console';
        return;
      }
      
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      
      this.sns = new AWS.SNS();
      console.log('✅ AWS SNS service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AWS SNS:', error.message);
      this.provider = 'console';
    }
  }

  async sendSMS(mobileNumber, message) {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(mobileNumber, message);
        case 'aws':
          return await this.sendViaAWS(mobileNumber, message);
        case 'console':
        default:
          return await this.sendViaConsole(mobileNumber, message);
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendViaTwilio(mobileNumber, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobileNumber
      });
      
      console.log(`📱 SMS sent via Twilio to ${mobileNumber}: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio'
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw error;
    }
  }

  async sendViaAWS(mobileNumber, message) {
    try {
      const params = {
        Message: message,
        PhoneNumber: mobileNumber
      };
      
      const result = await this.sns.publish(params).promise();
      
      console.log(`📱 SMS sent via AWS SNS to ${mobileNumber}: ${result.MessageId}`);
      return {
        success: true,
        messageId: result.MessageId,
        provider: 'aws'
      };
    } catch (error) {
      console.error('AWS SNS error:', error);
      throw error;
    }
  }

  async sendViaConsole(mobileNumber, message) {
    // Development mode - just log to console
    console.log('📱 SMS (Development Mode)');
    console.log(`   To: ${mobileNumber}`);
    console.log(`   Message: ${message}`);
    console.log('   ⚠️ In production, configure a real SMS provider');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `dev_${Date.now()}`,
      provider: 'console'
    };
  }

  // Format OTP message
  formatOTPMessage(otp, appName = 'MediScan') {
    return `Your ${appName} verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  }

  // Validate mobile number format
  validateMobileNumber(mobileNumber) {
    // Basic validation - can be enhanced based on requirements
    const cleaned = mobileNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}

module.exports = new SMSService();
