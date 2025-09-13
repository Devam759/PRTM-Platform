// Minimal Vercel serverless function to test step by step
const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal serverless function is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health check passed',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PRTM Platform API',
    endpoints: ['/api/test', '/api/health']
  });
});

module.exports = app;
