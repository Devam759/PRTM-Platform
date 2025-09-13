// Working Vercel serverless function with simplified routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import OTP routes (we know these work)
const otpRoutes = require('../src/routes/otp');

// Import middleware
const { errorHandler, notFound } = require('../src/middleware/errorHandler');
const { requestLogger } = require('../src/middleware/logger');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      message: 'HealthCare Helper API is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint for Vercel
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'PRTM Platform API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: ['OTP', 'Health Check', 'Static Files']
  });
});

// Simplified Medicine API endpoints
app.get('/api/medicine/search', (req, res) => {
  res.json({
    success: true,
    message: 'Medicine search endpoint - simplified version',
    medicines: [
      { id: 1, name: 'Paracetamol', category: 'Pain Relief' },
      { id: 2, name: 'Ibuprofen', category: 'Anti-inflammatory' }
    ]
  });
});

app.get('/api/medicine/categories', (req, res) => {
  res.json({
    success: true,
    categories: ['Pain Relief', 'Anti-inflammatory', 'Antibiotics', 'Vitamins']
  });
});

// Simplified Doctor API endpoints
app.get('/api/doctors/search', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor search endpoint - simplified version',
    doctors: [
      { id: 1, name: 'Dr. Smith', specialization: 'General Medicine' },
      { id: 2, name: 'Dr. Johnson', specialization: 'Cardiology' }
    ]
  });
});

app.get('/api/doctors/specializations', (req, res) => {
  res.json({
    success: true,
    specializations: ['General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics']
  });
});

// OTP routes (these work)
app.use('/api/otp', otpRoutes);

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Export the Express app for Vercel
module.exports = app;
