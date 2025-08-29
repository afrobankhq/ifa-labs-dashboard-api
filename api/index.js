// Vercel serverless function handler
// Import the compiled JavaScript from the dist folder
try {
  const app = require('../dist/index.js').default;
  
  // Export the Express app for Vercel serverless functions
  // Vercel will automatically handle the request/response cycle
  module.exports = app;
} catch (error) {
  console.error('Error loading Express app:', error);
  
  // Fallback: create a basic error handler
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use((req, res) => {
    res.status(500).json({
      error: 'Failed to load application',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  
  module.exports = fallbackApp;
}
