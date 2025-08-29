// Vercel serverless function handler
const app = require('../dist/index.js').default;

// Export the Express app for Vercel serverless functions
// Vercel will automatically handle the request/response cycle
module.exports = app;
