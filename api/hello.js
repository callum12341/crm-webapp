// Create this file at: api/hello.js
// This is a simple test to verify Vercel Functions work

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  return res.status(200).json({
    success: true,
    message: 'Hello from Vercel API!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}