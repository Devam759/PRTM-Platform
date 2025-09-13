# OTP (One-Time Password) Setup Guide

This guide explains how to set up and configure OTP functionality for the MediScan application.

## Features

- ✅ Send OTP via SMS
- ✅ Verify OTP with attempt limiting
- ✅ Resend OTP functionality
- ✅ Rate limiting for security
- ✅ Multiple SMS provider support
- ✅ Development mode with console logging

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install express-validator
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Test OTP in development mode:**
   - Open the app and go to Login/Signup
   - Click "Continue with Mobile"
   - Enter your mobile number
   - Check the console for the OTP code
   - Enter the OTP to verify

## SMS Provider Configuration

### Development Mode (Default)
The app runs in development mode by default, which logs OTPs to the console instead of sending real SMS.

### Production SMS Providers

#### Option 1: Twilio
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID, Auth Token, and Phone Number
3. Set environment variables:
   ```bash
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

#### Option 2: AWS SNS
1. Set up AWS account and get credentials
2. Set environment variables:
   ```bash
   SMS_PROVIDER=aws
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```
3. Install AWS SDK:
   ```bash
   npm install aws-sdk
   ```

## API Endpoints

### Send OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "countryCode": "+1",
  "mobileNumber": "1234567890"
}
```

### Verify OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "countryCode": "+1",
  "mobileNumber": "1234567890",
  "otp": "123456"
}
```

### Resend OTP
```http
POST /api/otp/resend
Content-Type: application/json

{
  "countryCode": "+1",
  "mobileNumber": "1234567890"
}
```

## Security Features

- **Rate Limiting**: 5 OTP requests per 15 minutes per IP
- **Attempt Limiting**: Maximum 3 failed attempts per OTP
- **OTP Expiry**: OTPs expire after 5 minutes
- **Input Validation**: Mobile number and OTP format validation

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# SMS Configuration
SMS_PROVIDER=console  # console, twilio, aws
NODE_ENV=development  # development, production

# Twilio (if using Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# AWS (if using AWS SNS)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## Testing

### Manual Testing
1. Start the server: `npm start`
2. Open browser: `http://localhost:3000`
3. Go to Login/Signup page
4. Click "Continue with Mobile"
5. Enter mobile number (e.g., 1234567890)
6. Check console for OTP
7. Enter OTP to verify

### API Testing with curl
```bash
# Send OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"countryCode": "+1", "mobileNumber": "1234567890"}'

# Verify OTP
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"countryCode": "+1", "mobileNumber": "1234567890", "otp": "123456"}'
```

## Troubleshooting

### Common Issues

1. **OTP not received in development mode**
   - Check console logs for the OTP code
   - Ensure you're in development mode (`NODE_ENV=development`)

2. **Rate limiting errors**
   - Wait 15 minutes or restart the server
   - Check rate limit configuration

3. **SMS provider errors**
   - Verify API credentials
   - Check provider-specific logs
   - Ensure sufficient credits/balance

4. **Mobile number validation errors**
   - Ensure mobile number is 10-15 digits
   - Check country code format (+1, +91, etc.)

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will:
- Log OTPs to console
- Include OTP in API responses
- Show detailed error messages

## Production Considerations

1. **Use Redis for OTP storage** instead of in-memory Map
2. **Implement proper logging** and monitoring
3. **Set up SMS provider** with production credentials
4. **Configure rate limiting** based on your needs
5. **Add database persistence** for OTP records
6. **Implement proper error handling** and retry logic

## Support

For issues or questions:
1. Check the console logs
2. Verify environment configuration
3. Test with different mobile numbers
4. Check SMS provider status
