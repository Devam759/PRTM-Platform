// Simple test function to verify Vercel deployment works
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vercel serverless function is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
