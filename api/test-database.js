// api/test-database.js - Simple test endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  return res.status(200).json({
    success: true,
    message: 'Test API is working perfectly!',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      dbVars: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || key.includes('POSTGRES')
      )
    }
  });
}